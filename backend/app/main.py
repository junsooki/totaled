import base64
import json
import os
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import List, Optional

import fitz
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

load_dotenv()

from . import ai, comps, crs, db  # noqa: E402
from . import vin as vin_  # noqa: E402
from .checks import CHECKS, LOCAL_RADIUS_MI, reopen_exception, run_checks  # noqa: E402
from .letter import build_evidence, template_letter  # noqa: E402
from .schemas import Claim  # noqa: E402
from .valuation import comparable_listings, counteroffer, fair_value  # noqa: E402

FIXTURES = Path(__file__).resolve().parent / "fixtures"
REOPEN_DAYS = 35

app = FastAPI(title="Totaled")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


def _claim(cid: str) -> dict:
    try:
        return db.get(cid)
    except KeyError:
        raise HTTPException(404, "Claim not found")


@app.get("/api/status")
def status():
    return {
        "apify": "demo" if comps.demo_mode() else ("live" if os.environ.get("APIFY_TOKEN") else "missing"),
        "claude": "live" if ai.available() else "missing",
        "crs": "demo" if crs.demo_mode() else ("live" if crs.available() else "missing"),
        "database": "postgres" if db.DATABASE_URL else "sqlite",
        "checks": [{"check": n, "name": name, "rule": sec} for n, name, sec in CHECKS],
        "personas": [{k: p[k] for k in ("id", "name", "profile", "decision")} for p in crs.PERSONAS],
    }


# --- 1. Upload ---------------------------------------------------------------

def _photos_to_pdf(photos: List[bytes]) -> bytes:
    """One PDF page per photo, so photos flow through the same reader and page viewer as a PDF."""
    doc = fitz.open()
    for img in photos:
        try:
            src = fitz.open(stream=img)
        except Exception:
            raise HTTPException(415, "Unsupported image. Use JPEG or PNG (iPhone uploads convert HEIC to JPEG).")
        rect = src[0].rect
        doc.new_page(width=rect.width, height=rect.height).insert_image(rect, stream=img)
    return doc.tobytes()


@app.post("/api/claims")
async def create_claim(files: Optional[List[UploadFile]] = File(None)):
    """Upload the valuation report as a PDF or as photos of its pages; send nothing to load the sample report."""
    if files:
        blobs = [await f.read() for f in files]
        pdfs = [b for b, f in zip(blobs, files) if f.content_type == "application/pdf"]
        if pdfs and len(files) > 1:
            raise HTTPException(400, "Upload one PDF, or photos of the pages, not both")
        pdf, sample = (pdfs[0] if pdfs else _photos_to_pdf(blobs)), False
    else:
        pdf, sample = (FIXTURES / "sample_report.pdf").read_bytes(), True

    if ai.available():
        try:
            claim, by = ai.extract_claim(pdf).model_dump(), "claude"
        except Exception as e:
            raise HTTPException(502, f"Claude could not read the report: {e}")
    elif sample:
        claim, by = json.loads((FIXTURES / "sample_claim.json").read_text()), "sample fixture (Claude not configured)"
    else:
        raise HTTPException(503, "Reading a report or photos needs ANTHROPIC_API_KEY. Load the sample report or add the key.")

    cid = db.create({"pdf": base64.b64encode(pdf).decode(), "sample": sample, "claim": claim,
                     "extracted_by": by, "created_at": db.now()})
    db.log(cid, "extracted", {"by": by, "comparables": len(claim["comparables"])})
    return {"id": cid, "claim": claim, "extracted_by": by, "sample": sample}


@app.get("/api/vin/{vin}")
def decode_vin(vin: str):
    try:
        return vin_.decode(vin)
    except ValueError as e:
        raise HTTPException(422, str(e))
    except Exception as e:
        raise HTTPException(502, f"VIN lookup failed: {e}")


IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@app.post("/api/vin/scan")
async def scan_vin(photo: UploadFile = File(...)):
    """Photo of a VIN plate, door sticker, registration or dashboard → VIN (decoded) and odometer."""
    if not ai.available():
        raise HTTPException(503, "Reading photos needs ANTHROPIC_API_KEY. Type the VIN instead; it still auto-fills.")
    if photo.content_type not in IMAGE_TYPES:
        raise HTTPException(415, "Use a JPEG or PNG photo")
    try:
        read = ai.read_vin(await photo.read(), photo.content_type)
    except Exception as e:
        raise HTTPException(502, f"Claude could not read the photo: {e}")
    if not read.vin:
        raise HTTPException(422, "No readable VIN in the photo. Try closer, with less glare.")
    try:
        decoded = vin_.decode(read.vin)
    except ValueError as e:
        decoded = {"vin": read.vin, "warning": str(e)}
    return dict(decoded, odometer=read.odometer)


@app.put("/api/claims/{cid}/claim")
def confirm_claim(cid: str, claim: Claim):
    _claim(cid)
    db.update(cid, claim=claim.model_dump(), confirmed_at=db.now())
    db.log(cid, "confirmed", {})
    return {"ok": True}


@app.get("/api/claims/{cid}/page/{page}.png")
def page_image(cid: str, page: int, quote: Optional[str] = None):
    """Render a report page, highlighting the quoted line (click to source)."""
    doc = fitz.open(stream=base64.b64decode(_claim(cid)["pdf"]), filetype="pdf")
    if not 1 <= page <= doc.page_count:
        raise HTTPException(404, "No such page")
    p = doc[page - 1]
    if quote:
        for rect in p.search_for(quote):
            p.add_highlight_annot(rect)
    return Response(p.get_pixmap(dpi=110).tobytes("png"), media_type="image/png")


# --- 2. Audit ----------------------------------------------------------------

@app.post("/api/claims/{cid}/audit")
def audit(cid: str):
    data = _claim(cid)
    claim = Claim(**data["claim"])
    v = claim.vehicle
    checks = run_checks(claim)
    try:
        market = comps.search(v.make, v.model, v.year, v.year, claim.owner_zip, LOCAL_RADIUS_MI)
    except Exception as e:
        raise HTTPException(502, f"Could not fetch market listings: {e}")

    matches = comparable_listings(market["listings"], v)
    fv = fair_value(matches, v.mileage)
    co = counteroffer(claim, fv["estimate"]) if fv else None
    recomputed_base = round(sum(c.adjusted_value if c.adjusted_value is not None else c.list_price
                                for c in claim.comparables) / max(len(claim.comparables), 1), 2)
    deadline = date.fromisoformat(claim.offer.offer_date) + timedelta(days=REOPEN_DAYS)
    result = {
        "checks": checks,
        "failed": sum(1 for r in checks if r["status"] == "fail"),
        "recomputed_base": recomputed_base,
        "market": {"source": market["source"], "fetched_at": market["fetched_at"], "listings": matches, "fair_value": fv, "searched": len(market["listings"])},
        "counteroffer": co,
        "deadline": {"date": deadline.isoformat(), "days_left": (deadline - date.today()).days,
                     "insurer_exception_may_apply": reopen_exception(claim)},
    }
    db.update(cid, audit=result)
    db.log(cid, "audited", {"failed": result["failed"], "market_source": market["source"],
                            "gap": co["gap"] if co else None})
    return result


# --- 3. Counteroffer ---------------------------------------------------------

@app.post("/api/claims/{cid}/letter")
def draft(cid: str):
    data = _claim(cid)
    if "audit" not in data:
        raise HTTPException(400, "Run the audit first")
    claim = Claim(**data["claim"])
    evidence = build_evidence(claim, data["audit"])
    if ai.available():
        try:
            letter, by = ai.draft_letter(evidence), "claude"
        except Exception as e:
            raise HTTPException(502, f"Claude could not draft the letter: {e}")
    else:
        letter, by = template_letter(claim, evidence), "template (Claude not configured)"
    sentences = ai.citation_check(letter, evidence)
    db.update(cid, evidence=evidence, letter={"sentences": sentences, "drafted_by": by, "drafted_at": db.now()})
    db.log(cid, "letter_drafted", {"by": by, "rejected": sum(1 for s in sentences if not s["ok"])})
    return {"sentences": sentences, "evidence": evidence, "drafted_by": by}


class Approval(BaseModel):
    sentences: List[ai.Sentence]  # the user's edited text, citations kept


@app.post("/api/claims/{cid}/letter/approve")
def approve(cid: str, body: Approval):
    data = _claim(cid)
    checked = ai.citation_check(ai.Letter(sentences=body.sentences), data.get("evidence", []))
    bad = [s for s in checked if not s["ok"]]
    if bad:
        raise HTTPException(422, {"message": "Some sentences fail the citation check", "sentences": checked})
    letter = dict(data["letter"], sentences=checked, approved_at=db.now())
    db.update(cid, letter=letter)
    db.log(cid, "letter_approved", {"sentences": len(checked)})
    return {"ok": True, "approved_at": letter["approved_at"]}


# --- 4. Net payout -----------------------------------------------------------

class PayoutRequest(BaseModel):
    persona: str = "P01"
    loan_balance: Optional[float] = None
    has_gap: Optional[bool] = None


def _require_crs():
    if not crs.demo_mode() and not crs.available():
        raise HTTPException(503, "CRS sandbox credentials missing: set CRS_USERNAME and CRS_PASSWORD (or DEMO_MODE=1)")


@app.post("/api/claims/{cid}/payout")
def payout(cid: str, body: PayoutRequest):
    data = _claim(cid)
    _require_crs()
    claim = Claim(**data["claim"])
    try:
        credit = crs.credit_summary(body.persona, crs.demo_mode())
    except Exception as e:
        raise HTTPException(502, f"CRS credit report failed: {e}")
    co = (data.get("audit") or {}).get("counteroffer")
    result = {
        "credit": credit,
        "at_offer": crs.net_payout(claim.offer.total, credit, body.loan_balance, body.has_gap),
        "at_counteroffer": crs.net_payout(co["total"], credit, body.loan_balance, body.has_gap) if co else None,
    }
    db.update(cid, payout=result)
    db.log(cid, "payout", {"persona": body.persona, "source": credit["source"]})
    return result


# --- 5. Replace --------------------------------------------------------------

@app.post("/api/claims/{cid}/replace")
def replace(cid: str):
    data = _claim(cid)
    if "payout" not in data:
        raise HTTPException(400, "Compute the net payout first")
    claim, p = Claim(**data["claim"]), data["payout"]
    np_ = p["at_counteroffer"] or p["at_offer"]
    budget = max(np_["walk_away"], 0) + np_["prequal"]["max_amount"]
    v = claim.vehicle
    try:
        market = comps.search(v.make, v.model, v.year, v.year + 2, claim.owner_zip, LOCAL_RADIUS_MI)
    except Exception as e:
        raise HTTPException(502, f"Could not fetch replacement listings: {e}")
    within = [l for l in market["listings"] if l.get("price") and l["price"] <= budget]
    for l in within:
        l["value_gap"] = (l.get("expected_price") or l["price"]) - l["price"]
    ranked = sorted(within, key=lambda l: (-l["value_gap"], l.get("mileage") or 0))[:8]
    result = {"budget": round(budget, 2), "walk_away": np_["walk_away"], "financing": np_["prequal"],
              "source": market["source"], "shortlist": ranked}
    db.update(cid, replace=result)
    db.log(cid, "shortlist", {"budget": result["budget"], "count": len(ranked)})
    return result


class SellerCheck(BaseModel):
    vin: str
    persona: str = "P01"  # sandbox identity standing in for the seller


@app.post("/api/claims/{cid}/seller-check")
def seller_check(cid: str, body: SellerCheck):
    _claim(cid)
    _require_crs()
    try:
        result = crs.seller_check(body.persona, crs.demo_mode())
    except Exception as e:
        raise HTTPException(502, f"CRS seller check failed: {e}")
    result["vin"] = body.vin
    db.log(cid, "seller_check", {"vin": body.vin, "persona": body.persona, "verdict": result["verdict"]})
    return result


class Checkout(BaseModel):
    vin: str
    deposit: float
    spending_cap: float
    consent: bool


@app.post("/api/claims/{cid}/checkout")
def checkout(cid: str, body: Checkout):
    """Simulated Visa checkout for a refundable hold deposit. No real payment is made."""
    data = _claim(cid)
    if not body.consent:
        raise HTTPException(400, "The user must approve the charge on the consent screen")
    if body.deposit <= 0:
        raise HTTPException(400, "Deposit must be positive")
    if body.deposit > body.spending_cap:
        raise HTTPException(400, f"Deposit ${body.deposit:,.2f} is over your spending cap ${body.spending_cap:,.2f}")
    car = next((l for l in (data.get("replace") or {}).get("shortlist", []) if l["vin"] == body.vin), None)
    if not car:
        raise HTTPException(400, "Pick a car from the shortlist")
    receipt = {
        "id": "SIM-" + datetime.now().strftime("%Y%m%d%H%M%S"),
        "simulated": True,
        "network": "Visa (simulated)",
        "car": {k: car.get(k) for k in ("vin", "year", "make", "model", "trim", "price", "seller_name")},
        "lines": [
            {"label": "Refundable hold deposit", "amount": body.deposit,
             "why": "Holds the car for 48 hours; applied to the price if you buy, refunded if you don't."},
            {"label": "Processing fee", "amount": 0.0, "why": "Simulated checkout: no fee is charged."},
        ],
        "total": body.deposit,
        "spending_cap": body.spending_cap,
        "remaining_under_cap": round(body.spending_cap - body.deposit, 2),
        "at": db.now(),
    }
    db.update(cid, purchase=receipt)
    db.log(cid, "deposit", {"vin": body.vin, "amount": body.deposit, "simulated": True})
    return receipt


# --- Results -----------------------------------------------------------------

@app.get("/api/claims/{cid}/results")
def results(cid: str):
    data = _claim(cid)
    audit_ = data.get("audit") or {}
    letter = data.get("letter") or {}
    minutes = None
    if letter.get("approved_at"):
        start = datetime.fromisoformat(data["created_at"])
        minutes = round((datetime.fromisoformat(letter["approved_at"]) - start).total_seconds() / 60, 1)
    co = audit_.get("counteroffer")
    return {
        "dollars_at_stake": co["gap"] if co else None,
        "checks_failed": audit_.get("failed"),
        "minutes_to_letter": minutes,
        "letter_approved": bool(letter.get("approved_at")),
        "purchase": data.get("purchase"),
        "events": db.events(cid),
    }
