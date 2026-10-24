import base64
import json
import math
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

from . import ai, ask, comps, crs, db, live, playbook  # noqa: E402
from . import vin as vin_  # noqa: E402
from .checks import CHECKS, LOCAL_RADIUS_MI, reopen_exception, run_checks  # noqa: E402
from .letter import build_evidence, template_letter  # noqa: E402
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


def _agent(cid: str, name: str, status: str, text: str, at: Optional[str] = None):
    """Record one agent step for the work-in-the-open feed (and SpacetimeDB when it is on)."""
    db.step(cid, name, status, text, at)
    live.agent(cid, name, status, text)


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

    started = db.now()
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
    v = claim["vehicle"]
    pages = fitz.open(stream=pdf, filetype="pdf").page_count
    _agent(cid, "Reader", "working", f"Opened the report: {pages} page{'s' if pages != 1 else ''}", at=started)
    _agent(cid, "Reader", "done", f"Read the report ({by}): {v['year']} {v['make']} {v['model']}, "
                                      f"{len(claim['comparables'])} comparables, offer ${claim['offer']['total']:,.2f}")
    db.log(cid, "extracted", {"by": by, "comparables": len(claim["comparables"])})
    return {"id": cid, "claim": claim, "extracted_by": by, "sample": sample}


@app.get("/api/claims/{cid}/steps")
def agent_steps(cid: str):
    _claim(cid)
    return db.steps(cid)


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


class Situation(BaseModel):
    injured: bool
    fault_disputed: bool
    rideshare_or_commercial: bool
    other_at_fault_drivers: bool


@app.put("/api/claims/{cid}/situation")
def set_situation(cid: str, body: Situation):
    _claim(cid)
    db.update(cid, situation=body.model_dump())
    db.log(cid, "situation", {"yes": sum(body.model_dump().values())})
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
    _agent(cid, "Appraiser", "working", "Checking the report against the 10 rules in 10 CCR § 2695.8")
    checks = run_checks(claim)
    failed = _failed_checks(checks)
    _agent(cid, "Appraiser", "working", f"{failed} of 10 checks failed")
    _agent(cid, "Appraiser", "working", f"Searching listings: {v.year} {v.make} {v.model} within "
                                        f"{LOCAL_RADIUS_MI} mi of {claim.owner_zip[:3]}xx")
    try:
        market = comps.search(v.make, v.model, v.year, v.year, claim.owner_zip, LOCAL_RADIUS_MI)
    except Exception as e:
        _agent(cid, "Appraiser", "error", f"Market search failed: {e}")
        raise HTTPException(502, f"Could not fetch market listings: {e}")

    _agent(cid, "Appraiser", "working", f"Found {len(market['listings'])} listings ({market['source']})")
    matches = comparable_listings(market["listings"], v)
    _agent(cid, "Appraiser", "working", f"Kept {len(matches)} with the same year and trim")
    fv = fair_value(matches, v.mileage)
    if fv:
        _agent(cid, "Appraiser", "working", f"Fit price against mileage: ${fv['estimate']:,} at {v.mileage:,} mi")
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
    _agent(cid, "Appraiser", "done",
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
    _agent(cid, "Negotiator", "working", f"Collected {len(evidence)} facts from the audit as evidence")
    _agent(cid, "Negotiator", "working", "Writing the draft with Claude" if ai.available() else "Writing the draft from the template")
    if ai.available():
        try:
            letter, by = ai.draft_letter(evidence), "claude"
        except Exception as e:
            raise HTTPException(502, f"Claude could not draft the letter: {e}")
    else:
        letter, by = template_letter(claim, evidence), "template (Claude not configured)"
    _agent(cid, "Negotiator", "working", "Checking every dollar amount against the evidence")
    sentences = ai.citation_check(letter, evidence)
    db.update(cid, evidence=evidence, letter={"sentences": sentences, "drafted_by": by, "drafted_at": db.now()})
    rejected = sum(1 for s in sentences if not s["ok"])
    _agent(cid, "Negotiator", "done", f"Draft ready ({by}): {len(sentences)} sentences, "
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


class Question(BaseModel):
    question: str


@app.post("/api/claims/{cid}/ask")
def ask_case(cid: str, body: Question):
    """Ask about your case. Answers come only from the case file and the rule text, each sentence cited."""
    data = _claim(cid)
    if "audit" not in data:
        raise HTTPException(400, "Run the audit first")
    q = body.question.strip()
    if not 3 <= len(q) <= 500:
        raise HTTPException(422, "Ask a question between 3 and 500 characters")
    try:
        result = ask.answer(q, data)
    except Exception as e:
        raise HTTPException(502, f"Could not answer: {e}")
    db.log(cid, "asked", {"found": result["found"], "by": result["by"]})
    return result


def _require_approved(cid: str) -> dict:
    data = _claim(cid)
    if not (data.get("letter") or {}).get("approved_at"):
        raise HTTPException(400, "Approve the counteroffer letter first")
    return data


@app.get("/api/claims/{cid}/if-no")
def if_they_say_no(cid: str):
    return playbook.if_no(_require_approved(cid))


@app.get("/api/claims/{cid}/case-package.md")
def case_package(cid: str):
    md = playbook.case_package(_require_approved(cid), db.events(cid))
    return Response(md, media_type="text/markdown",
                    headers={"Content-Disposition": f'attachment; filename="totaled-case-{cid}.md"'})


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
    _agent(cid, "Banker", "working", "Pulling the CRS credit report for the test profile")
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
    _agent(cid, "Banker", "done", f"CRS ({credit['source']}): {len(credit['auto_loans'])} auto loan(s); walk away with "
                                       f"${np_['walk_away']:,.0f}; financing {np_['prequal']['decision'].lower()}")
    db.log(cid, "payout", {"persona": body.persona, "source": credit["source"]})
    return result


# --- 5. Next car ------------------------------------------------------------

MANDATE_HOURS = 48
# Visa test card numbers from payment providers' test modes. No real card is ever accepted.
VISA_TEST_CARDS = {"4242424242424242", "4000056655665556", "4111111111111111"}


def _market_value(l: dict, listings: list) -> tuple:
    """A listing's market value from the same valuation code as the audit, when 3+ same-year listings exist."""
    same = [x for x in listings if x.get("year") == l.get("year") and x.get("price") and x.get("mileage") is not None]
    if len(same) >= 3 and l.get("mileage") is not None:
        fv = fair_value(same, l["mileage"])
        return fv["estimate"], f"our estimate from {fv['n_comps']} {l['year']} listings"
    if l.get("expected_price"):
        return l["expected_price"], "CarGurus expected price"
    return l["price"], "no market estimate"


def _why(rank: int, l: dict) -> str:
    gap = l["value_gap"]
    value = f"${gap:,.0f} under market" if gap > 0 else f"${-gap:,.0f} above market" if gap < 0 else "at market price"
    miles = f", {l['mileage']:,} miles" if l.get("mileage") is not None else ""
    away = f", {l['distance_mi']:g} miles away" if l.get("distance_mi") is not None else ""
    return f"Ranked {rank} because it is {value}{miles}{away}"


@app.post("/api/claims/{cid}/replace")
def replace(cid: str):
    data = _claim(cid)
    if "payout" not in data:
        raise HTTPException(400, "Compute the net payout first")
    claim, p = Claim(**data["claim"]), data["payout"]
    np_ = p["at_counteroffer"] or p["at_offer"]
    budget = max(np_["walk_away"], 0) + np_["prequal"]["max_amount"]
    v = claim.vehicle
    _agent(cid, "Shopper", "working", f"Searching listings: {v.year}–{v.year + 2} {v.make} {v.model} near "
                                      f"{claim.owner_zip[:3]}xx")
    try:
        market = comps.search(v.make, v.model, v.year, v.year + 2, claim.owner_zip, LOCAL_RADIUS_MI)
    except Exception as e:
        raise HTTPException(502, f"Could not fetch replacement listings: {e}")
    within = [l for l in market["listings"] if l.get("price") and l["price"] <= budget]
    _agent(cid, "Shopper", "working", f"{len(within)} of {len(market['listings'])} listings fit the ${budget:,.0f} budget")
    for l in within:
        l["market_value"], l["market_basis"] = _market_value(l, market["listings"])
        l["value_gap"] = round(l["market_value"] - l["price"])
    ranked = sorted(within, key=lambda l: (-l["value_gap"], l.get("mileage") or 0))[:8]
    for i, l in enumerate(ranked, 1):
        l["why"] = _why(i, l)
    result = {"budget": round(budget, 2), "walk_away": np_["walk_away"], "financing": np_["prequal"],
              "source": market["source"], "fetched_at": market["fetched_at"], "shortlist": ranked}
    db.update(cid, replace=result)
    _agent(cid, "Shopper", "done", f"{len(ranked)} cars under the ${result['budget']:,.0f} budget, ranked by value")
    db.log(cid, "shortlist", {"budget": result["budget"], "count": len(ranked)})
    return result


class SellerCheck(BaseModel):
    vin: str
    persona: str = "P01"  # sandbox identity standing in for the seller


@app.post("/api/claims/{cid}/seller-check")
def seller_check(cid: str, body: SellerCheck):
    data = _claim(cid)
    _require_crs()
    seller = (_shortlisted(data, body.vin) or {}).get("seller_name") or "the seller"
    _agent(cid, "Shopper", "working", f"Checking {seller}'s identity and liens with CRS")
    try:
        result = crs.seller_check(body.persona, crs.demo_mode())
    except Exception as e:
        raise HTTPException(502, f"CRS seller check failed: {e}")
    result.update(vin=body.vin, clean=not result["flags"], at=db.now())
    _agent(cid, "Shopper", "done", f"{seller}: " + ("passed, deposit unlocked" if result["clean"] else "deposit locked"))
    db.update(cid, seller_checks=dict(data.get("seller_checks") or {}, **{body.vin: result}))
    db.log(cid, "seller_check", {"vin": body.vin, "persona": body.persona, "verdict": result["verdict"]})
    return result


def _shortlisted(data: dict, vin: str) -> Optional[dict]:
    return next((l for l in (data.get("replace") or {}).get("shortlist", []) if l["vin"] == vin), None)


class MandateRequest(BaseModel):
    spending_cap: float


@app.post("/api/claims/{cid}/mandate")
def grant_mandate(cid: str, body: MandateRequest):
    """What the agent may spend, with whom and until when. Checkout refuses anything outside it."""
    data = _claim(cid)
    rep = data.get("replace")
    if not rep:
        raise HTTPException(400, "Find cars first")
    if not math.isfinite(body.spending_cap) or body.spending_cap <= 0:
        raise HTTPException(400, "The spending cap must be more than $0")
    if body.spending_cap > rep["budget"]:
        raise HTTPException(400, f"The spending cap can't be more than your ${rep['budget']:,.0f} budget")
    sellers = []
    for vin, chk in (data.get("seller_checks") or {}).items():
        car = _shortlisted(data, vin)
        if car and chk["clean"]:
            sellers.append({"vin": vin, "seller_name": car.get("seller_name"), "price": car["price"],
                            "car": f"{car['year']} {car['make']} {car['model']} {car.get('trim') or ''}".strip()})
    if not sellers:
        raise HTTPException(400, "No seller has passed the check yet. Only sellers that pass can be in the mandate.")
    granted = datetime.now().astimezone()
    mandate = {
        "id": "MND-" + granted.strftime("%Y%m%d%H%M%S"),
        "budget": rep["budget"],
        "spending_cap": round(body.spending_cap, 2),
        "sellers": sellers,
        "granted_at": granted.isoformat(),
        "expires_at": (granted + timedelta(hours=MANDATE_HOURS)).isoformat(),
        "can": [f"Place one refundable hold deposit of up to ${body.spending_cap:,.2f}",
                "Pay only a seller listed here, after the seller check passed",
                f"Hold only a car priced inside your ${rep['budget']:,.0f} budget"],
        "cannot": ["Charge more than the spending cap",
                   "Pay a seller that failed or skipped the check",
                   "Buy the car, sign a contract or take out a loan",
                   "Charge your card without your approval on the next screen",
                   f"Act after the mandate expires in {MANDATE_HOURS} hours"],
    }
    db.update(cid, mandate=mandate)
    db.log(cid, "mandate", {"cap": mandate["spending_cap"], "sellers": len(sellers)})
    return mandate


def _luhn(n: str) -> bool:
    digits = [int(d) for d in n][::-1]
    return sum(d if i % 2 == 0 else (d * 2 - 9 if d > 4 else d * 2) for i, d in enumerate(digits)) % 10 == 0


class Checkout(BaseModel):
    vin: str
    deposit: float
    consent: bool
    card_number: str


@app.post("/api/claims/{cid}/checkout")
def checkout(cid: str, body: Checkout):
    """Test-mode checkout for a refundable hold deposit, inside the mandate. Only Visa test card numbers work."""
    data = _claim(cid)
    if not body.consent:
        raise HTTPException(400, "The user must approve the charge on the consent screen")
    if not math.isfinite(body.deposit) or body.deposit <= 0:
        raise HTTPException(400, "Deposit must be more than $0")
    car = _shortlisted(data, body.vin)
    if not car:
        raise HTTPException(400, "Pick a car from the shortlist")
    chk = (data.get("seller_checks") or {}).get(body.vin)
    if not chk:
        raise HTTPException(400, "The deposit is locked: check the seller first")
    if not chk["clean"]:
        raise HTTPException(400, "The deposit is locked. " + " ".join(chk["flags"]))
    m = data.get("mandate")
    if not m:
        raise HTTPException(400, "Grant a spending mandate first")
    if datetime.now().astimezone() > datetime.fromisoformat(m["expires_at"]):
        raise HTTPException(400, "The mandate has expired. Grant a new one")
    if body.vin not in {s["vin"] for s in m["sellers"]}:
        raise HTTPException(400, "This seller is not in your mandate. Update the mandate to add it")
    if car["price"] > m["budget"]:
        raise HTTPException(400, f"The car's ${car['price']:,.0f} price is over your ${m['budget']:,.0f} budget")
    held = float((data.get("purchase") or {}).get("total") or 0)
    if body.deposit + held > m["spending_cap"]:
        raise HTTPException(400, f"Blocked by your spending cap: a ${body.deposit:,.2f} deposit"
                                 + (f" plus ${held:,.2f} already held" if held else "")
                                 + f" is over your ${m['spending_cap']:,.2f} cap")
    card = "".join(c for c in body.card_number if c.isdigit())
    if card not in VISA_TEST_CARDS or not _luhn(card):
        raise HTTPException(400, "Test mode accepts Visa test card numbers only, such as 4242 4242 4242 4242")

    fin = data["replace"]["financing"]
    receipt = {
        "id": "TEST-" + datetime.now().strftime("%Y%m%d%H%M%S"),
        "test_mode": True,
        "network": "Visa test card",
        "card_last4": card[-4:],
        "mandate_id": m["id"],
        "car": {k: car.get(k) for k in ("vin", "year", "make", "model", "trim", "price", "seller_name")},
        "lines": [
            {"label": "Refundable hold deposit", "amount": body.deposit,
             "why": "Holds the car for 48 hours; applied to the price if you buy, refunded if you don't."},
            {"label": "Processing fee", "amount": 0.0, "why": "Test mode: no fee and no real charge."},
        ],
        "total": round(body.deposit + held, 2),
        "spending_cap": m["spending_cap"],
        "remaining_under_cap": round(m["spending_cap"] - body.deposit - held, 2),
        "within_mandate": [
            f"Deposit ${body.deposit:,.2f} is within the ${m['spending_cap']:,.2f} spending cap",
            f"{car.get('seller_name') or 'The seller'} passed the CRS seller check ({chk['source']})",
            f"Car price ${car['price']:,.0f} is inside the ${m['budget']:,.0f} budget",
            f"Placed before the mandate expires ({m['expires_at'][:16].replace('T', ' ')})",
        ],
        "verified_buyer": f"The seller gets a buyer whose budget (${m['budget']:,.0f}) and financing"
                          + (f" (prequalified up to ${fin['max_amount']:,.0f})" if fin.get("max_amount") else "")
                          + " are already verified.",
        "at": db.now(),
    }
    db.update(cid, purchase=receipt)
    db.log(cid, "deposit", {"vin": body.vin, "amount": body.deposit, "test_mode": True})
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
    _agent(cid, "Shopper", "working", f"Opened a {duration // 60}-minute reverse auction: dealers compete to sell a "
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
    _agent(cid, "Shopper", "done", f"You chose {b['dealer_name']}: {b['car']} for ${b['price']:,.0f}")
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
        "mandate": data.get("mandate"),
        "events": db.events(cid),
    }
