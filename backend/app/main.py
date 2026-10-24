import base64
import json
import math
import os
import re
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

from . import ai, comps, crs, db, demo_cache, live  # noqa: E402
from . import vin as vin_  # noqa: E402
from .checks import CHECKS, LOCAL_RADIUS_MI, reopen_exception, run_checks  # noqa: E402
from .letter import build_evidence, template_letter  # noqa: E402
from .letter_pdf import build_letter_pdf  # noqa: E402
from .schemas import Claim  # noqa: E402
from .valuation import bridge, comparable_listings, counteroffer, fair_value  # noqa: E402

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

    saved = demo_cache.extraction(pdf)  # a saved real Claude read of this exact report works without a key too
    if saved:
        claim, by = saved, "claude (saved demo run)"
    elif ai.available():
        try:
            claim, by = ai.extract_claim(pdf).model_dump(), "claude"
        except Exception as e:
            raise HTTPException(502, f"Claude could not read the report: {e}")
    elif sample:
        claim, by = json.loads((FIXTURES / "sample_claim.json").read_text()), "sample fixture (Claude not configured)"
    else:
        raise HTTPException(503, "Reading a report or photos needs ANTHROPIC_API_KEY. Load the sample report or add the key.")

    if sample and not claim.get("owner_zip"):
        claim["owner_zip"] = "94704"  # the sample report prints no ZIP; 94704 is what the sample fixture and saved demo data use

    cid = db.create({"pdf": base64.b64encode(pdf).decode(), "sample": sample, "claim": claim,
                     "extracted_by": by, "created_at": db.now()})
    v = claim["vehicle"]
    live.agent(cid, "Reader", "done", f"Read the report ({by}): {v['year']} {v['make']} {v['model']}, "
                                      f"{len(claim['comparables'])} comparables, offer ${claim['offer']['total']:,.2f}")
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
    return dict(decoded, odometer=read.odometer, plate=read.plate)


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

def _failed_checks(rows) -> int:
    """Number of distinct checks with at least one failed row."""
    return len({r["check"] for r in rows if r["status"] == "fail"})


@app.post("/api/claims/{cid}/audit")
def audit(cid: str):
    data = _claim(cid)
    claim = Claim(**data["claim"])
    v = claim.vehicle
    checks = run_checks(claim)
    failed = _failed_checks(checks)
    live.agent(cid, "Appraiser", "working", f"Ran the 10 checks under 10 CCR § 2695.8: {failed} failed. "
                                            f"Pulling live {v.year} {v.make} {v.model} listings near {claim.owner_zip[:3]}xx")
    try:
        market = comps.search(v.make, v.model, v.year, v.year, claim.owner_zip, LOCAL_RADIUS_MI)
    except Exception as e:
        live.agent(cid, "Appraiser", "error", f"Market search failed: {e}")
        raise HTTPException(502, f"Could not fetch market listings: {e}")

    matches = comparable_listings(market["listings"], v)
    fv = fair_value(matches, v.mileage)
    co = counteroffer(claim, fv["estimate"]) if fv else None
    recomputed_base = round(sum(c.adjusted_value if c.adjusted_value is not None else c.list_price
                                for c in claim.comparables) / max(len(claim.comparables), 1), 2)
    deadline = date.fromisoformat(claim.offer.offer_date) + timedelta(days=REOPEN_DAYS)
    result = {
        "checks": checks,
        "failed": failed,
        "recomputed_base": recomputed_base,
        "market": {"source": market["source"], "fetched_at": market["fetched_at"], "listings": matches, "fair_value": fv, "searched": len(market["listings"])},
        "counteroffer": co,
        "bridge": bridge(claim, recomputed_base, fv["estimate"], co) if co else [],
        "insurer_comps": [{"id": c.id, "odometer": c.odometer, "adjusted_value": c.adjusted_value, "trim": c.trim,
                           "year": c.year} for c in claim.comparables],
        "deadline": {"date": deadline.isoformat(), "days_left": (deadline - date.today()).days,
                     "insurer_exception_may_apply": reopen_exception(claim)},
    }
    db.update(cid, audit=result)
    live.agent(cid, "Appraiser", "done",
               f"{len(matches)} true comparables of {len(market['listings'])} listings ({market['source']}); "
               + (f"market value ${fv['estimate']:,} vs insurer base ${claim.offer.base_value:,.0f}; gap ${co['gap']:,.0f}"
                  if co else "no matching listings"))
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
    live.agent(cid, "Negotiator", "working", f"Drafting the counteroffer from {len(evidence)} pieces of evidence")
    saved = demo_cache.letter(evidence)  # a saved real Claude letter for exactly this evidence works without a key too
    if saved:
        letter, by = ai.Letter(**saved), "claude (saved demo run)"
    elif ai.available():
        try:
            letter, by = ai.draft_letter(evidence), "claude"
        except Exception as e:
            raise HTTPException(502, f"Claude could not draft the letter: {e}")
    else:
        letter, by = template_letter(claim, evidence), "template (Claude not configured)"
    sentences = ai.citation_check(letter, evidence)
    db.update(cid, evidence=evidence, letter={"sentences": sentences, "drafted_by": by, "drafted_at": db.now()})
    rejected = sum(1 for s in sentences if not s["ok"])
    live.agent(cid, "Negotiator", "done", f"Draft ready ({by}): {len(sentences)} sentences, "
                                          f"{rejected} rejected by the citation check. Waiting for your approval")
    db.log(cid, "letter_drafted", {"by": by, "rejected": rejected})
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


@app.get("/api/claims/{cid}/letter.pdf")
def letter_pdf(cid: str):
    data = _claim(cid)
    letter = data.get("letter") or {}
    if not letter.get("approved_at"):
        raise HTTPException(409, "Approve the letter first")
    date_text = datetime.fromisoformat(letter["approved_at"]).strftime("%B %d, %Y").replace(" 0", " ")
    pdf = build_letter_pdf(data["claim"], letter, date_text)
    name = re.sub(r"[^A-Za-z0-9_-]", "-", str(data["claim"].get("claim_number") or cid))
    db.log(cid, "letter_downloaded", {})
    return Response(pdf, media_type="application/pdf",
                    headers={"Content-Disposition": f'attachment; filename="counteroffer-letter-{name}.pdf"'})


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
    np_ = result["at_counteroffer"] or result["at_offer"]
    live.agent(cid, "Shopper", "done", f"CRS ({credit['source']}): {len(credit['auto_loans'])} auto loan(s); walk away with "
                                       f"${np_['walk_away']:,.0f}; financing {np_['prequal']['decision'].lower()}")
    db.log(cid, "payout", {"persona": body.persona, "source": credit["source"]})
    return result


# --- 5a. Rental --------------------------------------------------------------

def _rental_options() -> list:
    return json.loads((FIXTURES / "demo_rentals.json").read_text())["options"]


class RentalRequest(BaseModel):
    days: int = 14


@app.post("/api/claims/{cid}/rentals")
def rentals(cid: str, body: RentalRequest):
    _claim(cid)
    if not 1 <= body.days <= 90:
        raise HTTPException(422, "Days must be between 1 and 90")
    options = [dict(o, total=round(o["daily_rate"] * body.days, 2)) for o in _rental_options()]
    db.log(cid, "rentals", {"days": body.days, "count": len(options)})
    return {"days": body.days, "options": options, "source": "demo"}


class RentalCheckout(BaseModel):
    rental_id: str
    days: int
    deposit: float
    spending_cap: float
    consent: bool


@app.post("/api/claims/{cid}/rental-checkout")
def rental_checkout(cid: str, body: RentalCheckout):
    """Simulated Visa hold for a rental car. No real payment is made."""
    data = _claim(cid)
    opt = next((o for o in _rental_options() if o["id"] == body.rental_id), None)
    if not opt:
        raise HTTPException(400, "Pick a rental from the options")
    if not 1 <= body.days <= 90:
        raise HTTPException(422, "Days must be between 1 and 90")
    receipt = _simulated_receipt(
        data, "purchase", body.deposit, body.spending_cap, body.consent,
        "Refundable rental hold",
        "A card hold, released when the car is returned. The rental cost is paid at the counter.",
        rental={"agency": opt["agency"], "car_class": opt["car_class"], "example_car": opt["example_car"],
                "daily_rate": opt["daily_rate"], "days": body.days,
                "estimated_total": round(opt["daily_rate"] * body.days, 2)})
    db.update(cid, rental=receipt)
    db.log(cid, "rental_hold", {"rental_id": body.rental_id, "days": body.days, "amount": body.deposit, "simulated": True})
    return receipt


# --- 5b. Replace -------------------------------------------------------------

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
    live.agent(cid, "Shopper", "done", f"{len(ranked)} cars under the ${result['budget']:,.0f} budget, ranked by value")
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


def _simulated_receipt(data: dict, other_key: str, deposit: float, spending_cap: float, consent: bool,
                       label: str, why: str, **extra) -> dict:
    """Shared consent and spending-cap rules for the rental hold and the car deposit.
    The cap covers both holds, so the other purchase's total counts against it."""
    if not consent:
        raise HTTPException(400, "The user must approve the charge on the consent screen")
    if not (math.isfinite(deposit) and math.isfinite(spending_cap)):
        raise HTTPException(400, "Deposit and spending cap must be real numbers")
    if deposit <= 0:
        raise HTTPException(400, "Deposit must be positive")
    other = float((data.get(other_key) or {}).get("total") or 0)
    if deposit + other > spending_cap:
        if other:
            raise HTTPException(400, f"Deposit ${deposit:,.2f} plus ${other:,.2f} already held is "
                                     f"${deposit + other:,.2f}, over your spending cap ${spending_cap:,.2f}")
        raise HTTPException(400, f"Deposit ${deposit:,.2f} is over your spending cap ${spending_cap:,.2f}")
    return {
        "id": "SIM-" + datetime.now().strftime("%Y%m%d%H%M%S"),
        "simulated": True,
        "network": "Visa (simulated)",
        **extra,
        "lines": [
            {"label": label, "amount": deposit, "why": why},
            {"label": "Processing fee", "amount": 0.0, "why": "Simulated checkout: no fee is charged."},
        ],
        "total": deposit,
        "spending_cap": spending_cap,
        "remaining_under_cap": round(spending_cap - deposit - other, 2),
        "at": db.now(),
    }


@app.post("/api/claims/{cid}/checkout")
def checkout(cid: str, body: Checkout):
    """Simulated Visa checkout for a refundable hold deposit. No real payment is made."""
    data = _claim(cid)
    if not body.consent:
        raise HTTPException(400, "The user must approve the charge on the consent screen")
    if body.deposit <= 0:
        raise HTTPException(400, "Deposit must be positive")
    car = next((l for l in (data.get("replace") or {}).get("shortlist", []) if l["vin"] == body.vin), None)
    win = data.get("auction_win")
    if not car and win and win["vin"] == body.vin:
        car = win
    if not car:
        raise HTTPException(400, "Pick a car from the shortlist or the auction")
    receipt = _simulated_receipt(
        data, "rental", body.deposit, body.spending_cap, body.consent,
        "Refundable hold deposit", "Holds the car for 48 hours; applied to the price if you buy, refunded if you don't.",
        car={k: car.get(k) for k in ("vin", "car", "year", "make", "model", "trim", "price", "seller_name")})

    db.update(cid, purchase=receipt)
    db.log(cid, "deposit", {"vin": body.vin, "amount": body.deposit, "simulated": True})
    return receipt


# --- Reverse auction (SpacetimeDB) -------------------------------------------

class AuctionRequest(BaseModel):
    duration_secs: int = 180


def _require_live():
    if not live.enabled():
        raise HTTPException(503, "The live auction needs SpacetimeDB: set SPACETIME_DB and SPACETIME_TOKEN")


@app.post("/api/claims/{cid}/auction")
def open_auction(cid: str, body: AuctionRequest):
    """Dealers compete live to sell the replacement car to this verified, prequalified buyer."""
    data = _claim(cid)
    _require_live()
    if "payout" not in data:
        raise HTTPException(400, "Compute the net payout first")
    claim, p = Claim(**data["claim"]), data["payout"]
    np_ = p["at_counteroffer"] or p["at_offer"]
    budget = round(max(np_["walk_away"], 0) + np_["prequal"]["max_amount"], 2)
    v = claim.vehicle
    wanted = f"{v.year}–{v.year + 2} {v.make} {v.model}"
    duration = max(60, min(body.duration_secs, 1800))
    try:
        live.open_auction(cid, wanted, budget, True, float(np_["prequal"]["max_amount"]), claim.owner_zip[:3], duration)
    except RuntimeError as e:
        raise HTTPException(502, str(e))
    live.agent(cid, "Shopper", "working", f"Opened a {duration // 60}-minute reverse auction: dealers compete to sell a "
                                          f"{wanted} under the verified ${budget:,.0f} budget")
    db.log(cid, "auction_opened", {"budget": budget, "duration_secs": duration})
    return {"auction_id": cid, "wanted": wanted, "budget": budget, "duration_secs": duration}


class AwardRequest(BaseModel):
    bid_id: int


@app.post("/api/claims/{cid}/auction/award")
def award(cid: str, body: AwardRequest):
    """The buyer picks a bid. Its price is read back from SpacetimeDB, never trusted from the browser."""
    data = _claim(cid)
    _require_live()
    rows = live.sql(f"SELECT * FROM bid WHERE id = {int(body.bid_id)}")
    if not rows or rows[0]["auction_id"] != cid:
        raise HTTPException(404, "No such bid in this auction")
    b = rows[0]
    try:
        live.award(cid, int(body.bid_id))
    except RuntimeError as e:
        raise HTTPException(502, str(e))
    win = {"vin": b["vin"] or f"BID-{body.bid_id}", "car": b["car"], "price": b["price"], "mileage": b["mileage"],
           "seller_name": b["dealer_name"], "seller_type": "DEALER", "bid_id": int(body.bid_id),
           "year": None, "make": None, "model": None, "trim": None}
    db.update(cid, auction_win=win)
    live.agent(cid, "Shopper", "done", f"You chose {b['dealer_name']}: {b['car']} for ${b['price']:,.0f}")
    db.log(cid, "auction_awarded", {"bid_id": int(body.bid_id), "price": b["price"]})
    return win


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
        "checks_failed": _failed_checks(audit_["checks"]) if audit_.get("checks") else audit_.get("failed"),
        "minutes_to_letter": minutes,
        "letter_approved": bool(letter.get("approved_at")),
        "purchase": data.get("purchase"),
        "rental": data.get("rental"),
        "events": db.events(cid),
    }
