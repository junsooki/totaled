import base64
import asyncio
import hashlib
import json
import logging
import math
import os
import re
import secrets
import uuid
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import List, Optional

import fitz
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field

load_dotenv()

from . import ai, ask, call_audio, call_routes, cartesia, comps, crs, db, demo_cache, documents, live, moss_voice, playbook, story  # noqa: E402
from . import vin as vin_  # noqa: E402
from .checks import CHECKS, LOCAL_RADIUS_MI, reopen_exception, run_checks  # noqa: E402
from .letter import build_evidence, template_letter  # noqa: E402
from .letter_pdf import build_letter_pdf  # noqa: E402
from .schemas import Claim  # noqa: E402
from .valuation import bridge, comparable_listings, counteroffer, fair_value  # noqa: E402

FIXTURES = Path(__file__).resolve().parent / "fixtures"
REOPEN_DAYS = 35

app = FastAPI(title="Toto")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def protect_claim_api(request: Request, call_next):
    """Claim APIs require the per-claim secret returned at creation; tracker data stays separate."""
    if request.method != "OPTIONS":
        parts = request.url.path.strip("/").split("/")
        if len(parts) >= 3 and parts[:2] == ["api", "claims"] and parts[2] != "":
            cid = parts[2]
            try:
                data = db.get(cid)
            except KeyError:
                return Response(status_code=404, content="Claim not found")
            token = request.headers.get("x-claim-token", "")
            digest = hashlib.sha256(token.encode()).hexdigest() if token else ""
            if not data.get("access_token_hash") or not secrets.compare_digest(digest, data["access_token_hash"]):
                return Response(status_code=401, content="Claim access token is missing or invalid")
    return await call_next(request)


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
        "moss": "ready" if moss_voice.available() else "missing",
        "cartesia": "live" if cartesia.available() else "missing",
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
        if len(files) > 20:
            raise HTTPException(413, "Upload at most 20 report pages at a time")
        blobs = []
        total_bytes = 0
        for f in files:
            blob = await f.read(20 * 1024 * 1024 + 1)
            total_bytes += len(blob)
            if len(blob) > 20 * 1024 * 1024 or total_bytes > 20 * 1024 * 1024:
                raise HTTPException(413, "The report must be smaller than 20 MB")
            blobs.append(blob)
        pdfs = [b for b, f in zip(blobs, files) if f.content_type == "application/pdf"]
        if pdfs and len(files) > 1:
            raise HTTPException(400, "Upload one PDF, or photos of the pages, not both")
        pdf, sample = (pdfs[0] if pdfs else _photos_to_pdf(blobs)), False
    else:
        pdf, sample = (FIXTURES / "sample_report.pdf").read_bytes(), True

    started = db.now()
    try:
        doc = fitz.open(stream=pdf, filetype="pdf")
        page_count = doc.page_count
        doc.close()
        if page_count > 20:
            raise HTTPException(413, "The report can contain at most 20 pages")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(415, "Could not read the uploaded PDF")

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

    access_token = secrets.token_urlsafe(32)
    cid = db.create({"pdf": base64.b64encode(pdf).decode(), "sample": sample, "claim": claim,
                     "access_token_hash": hashlib.sha256(access_token.encode()).hexdigest(),
                     "extracted_by": by, "created_at": db.now()})
    v = claim["vehicle"]
    _agent(cid, "Reader", "working", f"Opened the report: {page_count} page{'s' if page_count != 1 else ''}", at=started)
    _agent(cid, "Reader", "done", f"Read the report ({by}): {v['year']} {v['make']} {v['model']}, "
                                      f"{len(claim['comparables'])} comparables, offer ${claim['offer']['total']:,.2f}")
    db.log(cid, "extracted", {"by": by, "comparables": len(claim["comparables"])})
    return {"id": cid, "access_token": access_token, "claim": claim, "extracted_by": by, "sample": sample}


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
    return dict(decoded, odometer=read.odometer, plate=read.plate)


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


class Story(BaseModel):
    text: str = Field(min_length=3, max_length=story.MAX_CHARS)


@app.post("/api/claims/{cid}/story")
def read_story(cid: str, body: Story):
    """The owner's spoken or typed account: a timeline and answers, each tied to their exact words. Kept private."""
    _claim(cid)
    words = len(body.text.split())
    _agent(cid, "Reader", "working", f"Reading your account of what happened ({words} words)")
    try:
        result = story.read(body.text)
    except Exception as e:
        _agent(cid, "Reader", "error", "Could not read your account")
        raise HTTPException(502, f"Claude could not read your account: {e}")
    _agent(cid, "Reader", "done", f"Found {len(result['timeline'])} events and {len(result['answers'])} answers in your words"
                                  + (f"; dropped {result['dropped']} that did not match what you said" if result["dropped"] else ""))
    db.mutate(cid, lambda d: dict(d, story={"text": body.text, **result, "at": db.now()}),
              ("story", {"events": len(result["timeline"]), "answers": len(result["answers"]), "by": result["by"]}))
    return result


MAX_DOCUMENTS = 6


def _public_doc(d: dict) -> dict:
    return {k: v for k, v in d.items() if k != "pdf"}


@app.post("/api/claims/{cid}/documents")
async def add_document(cid: str, kind: str = Form(...), file: Optional[UploadFile] = File(None)):
    """The owner's policy or an insurer's letter (PDF); send no file to use the matching sample."""
    data = _claim(cid)
    if kind not in documents.KINDS:
        raise HTTPException(422, "kind must be policy or letter")
    if len(data.get("documents") or []) >= MAX_DOCUMENTS:
        raise HTTPException(413, f"Upload at most {MAX_DOCUMENTS} documents")
    if file:
        if file.content_type != "application/pdf":
            raise HTTPException(415, "Upload the document as a PDF")
        pdf, name, is_sample = await file.read(20 * 1024 * 1024 + 1), file.filename or kind, False
        if len(pdf) > 20 * 1024 * 1024:
            raise HTTPException(413, "The document must be smaller than 20 MB")
    else:
        pdf, name, is_sample = documents.sample(kind), f"Sample {'policy' if kind == 'policy' else 'insurer letter'}", True
    _agent(cid, "Reader", "working", f"Reading your {'policy' if kind == 'policy' else 'insurer letter'}")
    try:
        result = await asyncio.to_thread(documents.read, pdf, kind, is_sample)
    except Exception as e:
        _agent(cid, "Reader", "error", "Could not read the document")
        raise HTTPException(502, f"Could not read the document: {e}")
    doc = {"id": uuid.uuid4().hex[:8], "kind": kind, "name": name, "sample": is_sample,
           "pdf": base64.b64encode(pdf).decode(), "at": db.now(), **result}
    _agent(cid, "Reader", "done", f"Found {len(result['fields'])} fields in {name}, each matched to a line on its page"
                                  + (f"; dropped {result['dropped']} that did not match" if result["dropped"] else ""))
    db.mutate(cid, lambda d: dict(d, documents=(d.get("documents") or []) + [doc]),
              ("document", {"kind": kind, "fields": len(result["fields"]), "by": result["by"]}))
    return _public_doc(doc)


@app.get("/api/claims/{cid}/documents")
def list_documents(cid: str):
    data = _claim(cid)
    docs = data.get("documents") or []
    return {"documents": [_public_doc(d) for d in docs], "checks": documents.crosscheck(Claim(**data["claim"]), docs)}


@app.get("/api/claims/{cid}/documents/{doc_id}/page/{page}.png")
def document_page(cid: str, doc_id: str, page: int, quote: Optional[str] = None):
    doc = next((d for d in _claim(cid).get("documents") or [] if d["id"] == doc_id), None)
    if not doc:
        raise HTTPException(404, "No such document")
    pdf = fitz.open(stream=base64.b64decode(doc["pdf"]), filetype="pdf")
    if not 1 <= page <= pdf.page_count:
        raise HTTPException(404, "No such page")
    p = pdf[page - 1]
    if quote:
        for rect in p.search_for(quote):
            p.add_highlight_annot(rect)
    return Response(p.get_pixmap(dpi=110).tobytes("png"), media_type="image/png")


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


def _search_variants(text: str) -> List[str]:
    """The text itself, plus the comma-grouped and plain forms of a number (search_for matches substrings)."""
    out = [text]
    try:
        n = abs(float(text.replace(",", "").replace("$", "")))
    except (ValueError, OverflowError):
        return out
    if not math.isfinite(n) or sum(c.isdigit() for c in text) < 3:
        return out
    whole = n == int(n)
    plain = str(int(n)) if whole else f"{n:.2f}"
    grouped = f"{int(n):,}" if whole else f"{n:,.2f}"
    if whole and 1900 <= n <= 2100:
        grouped = plain  # a year, not money
    for v in (grouped, plain):
        if v not in out:
            out.append(v)
    return out


@app.get("/api/claims/{cid}/locate")
def locate(cid: str, text: str = ""):
    """Find where a value appears on the report PDF (fractions of the page size)."""
    pdf = _claim(cid).get("pdf")
    if not pdf:
        return {"page_count": 0, "matches": []}
    doc = fitz.open(stream=base64.b64decode(pdf), filetype="pdf")
    text = text.strip()
    if text:
        for variant in _search_variants(text):
            matches = []
            for i, p in enumerate(doc):
                w, h = p.rect.width, p.rect.height
                for r in p.search_for(variant):
                    matches.append({"page": i + 1, "x": r.x0 / w, "y": r.y0 / h, "w": r.width / w, "h": r.height / h})
            if matches:
                return {"page_count": doc.page_count, "matches": matches}
    return {"page_count": doc.page_count, "matches": []}


@app.get("/api/zip")
def zip_from_location(lat: float, lon: float):
    """Reverse-geocode a browser location to a US ZIP (OpenStreetMap Nominatim). Coordinates are not logged."""
    if not (math.isfinite(lat) and math.isfinite(lon) and -90 <= lat <= 90 and -180 <= lon <= 180):
        raise HTTPException(422, "lat must be in [-90, 90] and lon in [-180, 180]")
    try:
        r = requests.get("https://nominatim.openstreetmap.org/reverse",
                         params={"format": "jsonv2", "addressdetails": 1, "zoom": 18, "lat": lat, "lon": lon},
                         headers={"User-Agent": "totaled-app"}, timeout=5)
        r.raise_for_status()
        postcode = (r.json().get("address") or {}).get("postcode") or ""
    except (requests.RequestException, ValueError):
        raise HTTPException(502, "The location service is not available right now.")
    m = re.match(r"\d{5}", postcode)
    if not m:
        raise HTTPException(404, "No US ZIP found for that location.")
    return {"zip": m.group(0)}


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

    _agent(cid, "Appraiser", "working", f"Found {len(market['listings'])} listings: "
           + ", ".join(f"{x['name']} {x['count']} ({x['source']})" for x in market["sources"])
           + "".join(f"; {u.split(':')[0]} unavailable" for u in market["unavailable"]))
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
        "market": {"source": market["source"], "fetched_at": market["fetched_at"], "listings": matches, "fair_value": fv,
                   "searched": len(market["listings"]), "sources": market["sources"], "unavailable": market["unavailable"]},
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
    saved = demo_cache.letter(evidence)  # a saved real Claude letter for exactly this evidence works without a key too
    _agent(cid, "Negotiator", "working", "Using Claude's saved draft for this evidence" if saved else
           "Writing the draft with Claude" if ai.available() else "Writing the draft from the template")
    if saved:
        letter, by = ai.Letter(**saved), "claude (saved demo run)"
    elif ai.available():
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


class Question(BaseModel):
    question: str


@app.post("/api/claims/{cid}/ask")
async def ask_case(cid: str, body: Question):
    """Ask about your case, typed or spoken. Answers come only from the case file, the rule text and Moss's
    matching public guidance, each sentence cited. Claim facts are never sent to Moss."""
    data = _claim(cid)
    if "audit" not in data:
        raise HTTPException(400, "Run the audit first")
    q = body.question.strip()
    if not 3 <= len(q) <= 500:
        raise HTTPException(422, "Ask a question between 3 and 500 characters")
    guidance = []
    if moss_voice.available():
        try:
            guidance = (await moss_voice.search(q))["docs"][:3]
        except Exception as e:  # guidance is a bonus; the case file still answers
            logging.warning("Moss search failed: %s", e)
    try:
        result = await asyncio.to_thread(ask.answer, q, data, guidance)
    except Exception as e:
        raise HTTPException(502, f"Could not answer: {e}")
    result["guidance_searched"] = len(guidance)
    db.log(cid, "asked", {"found": result["found"], "by": result["by"]})
    return result


def _require_approved(cid: str) -> dict:
    data = _claim(cid)
    if not (data.get("letter") or {}).get("approved_at"):
        raise HTTPException(400, "Approve the counteroffer letter first")
    return data


app.include_router(call_routes.build(_require_approved))


@app.get("/api/claims/{cid}/if-no")
def if_they_say_no(cid: str):
    return playbook.if_no(_require_approved(cid))


@app.get("/api/claims/{cid}/case-package.md")
def case_package(cid: str):
    md = playbook.case_package(_require_approved(cid), db.events(cid))
    return Response(md, media_type="text/markdown",
                    headers={"Content-Disposition": f'attachment; filename="toto-case-{cid}.md"'})


@app.get("/api/claims/{cid}/briefing")
def briefing_script(cid: str):
    """The spoken briefing's script, for the owner to read before any audio is made."""
    script = playbook.briefing(_require_approved(cid))
    return {"script": script, "voice": cartesia.available() or call_audio.saved("briefing", script) is not None}


@app.get("/api/claims/{cid}/briefing.mp3")
def briefing_audio(cid: str):
    """The same script read aloud by Cartesia in a stock, labeled AI voice."""
    script = playbook.briefing(_require_approved(cid))
    audio = call_audio.saved("briefing", script)  # a saved reading of this exact script works without a key too
    if audio is None:
        if not cartesia.available():
            raise HTTPException(503, "Spoken briefings need CARTESIA_API_KEY")
        try:
            audio = cartesia.speak(script)
        except Exception as e:
            raise HTTPException(502, f"Could not make the audio: {e}")
    db.log(cid, "briefing_audio", {})
    return Response(audio, media_type="audio/mpeg",
                    headers={"Content-Disposition": 'attachment; filename="toto-case-briefing.mp3"'})


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
              "source": market["source"], "fetched_at": market["fetched_at"], "sources": market["sources"],
              "shortlist": ranked}
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
    db.mutate(cid, lambda d: dict(d, seller_checks=dict(d.get("seller_checks") or {}, **{body.vin: result})),
              ("seller_check", {"persona": body.persona, "verdict": result["verdict"]}))
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
        "id": "MND-" + uuid.uuid4().hex[:12].upper(),
        "budget": rep["budget"],
        "spending_cap": round(body.spending_cap, 2),
        "sellers": sellers,
        "granted_at": granted.isoformat(),
        "expires_at": (granted + timedelta(hours=MANDATE_HOURS)).isoformat(),
        "can": [f"Place one refundable hold deposit on a car priced up to ${body.spending_cap:,.2f}",
                "Pay only a seller listed here, after the seller check passed",
                f"Hold only a car priced inside your ${rep['budget']:,.0f} budget"],
        "cannot": ["Hold a car priced over the spending cap",
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
    if car["price"] > m["spending_cap"]:
        raise HTTPException(400, f"Blocked by your spending cap: the car's ${car['price']:,.0f} price is over your "
                                 f"${m['spending_cap']:,.2f} cap. Raise the cap in the mandate to hold this car")
    card = "".join(c for c in body.card_number if c.isdigit())
    if card not in VISA_TEST_CARDS or not _luhn(card):
        raise HTTPException(400, "Test mode accepts Visa test card numbers only, such as 4242 4242 4242 4242")
    fin = data["replace"]["financing"]

    def hold(d):  # inside one transaction, so two deposits cannot both slip under the cap
        held = float((d.get("purchase") or {}).get("total") or 0)
        if body.deposit + held > m["spending_cap"]:
            raise HTTPException(400, f"Blocked by your spending cap: a ${body.deposit:,.2f} deposit"
                                     + (f" plus ${held:,.2f} already held" if held else "")
                                     + f" is over your ${m['spending_cap']:,.2f} cap")
        d["purchase"] = {
            "id": "TEST-" + uuid.uuid4().hex[:12].upper(),
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
            "remaining_under_cap": round(m["spending_cap"] - car["price"], 2),
            "within_mandate": [
                f"Car price ${car['price']:,.0f} and deposit ${body.deposit:,.2f} are within the ${m['spending_cap']:,.2f} spending cap",
                f"{car.get('seller_name') or 'The seller'} passed the CRS seller check ({chk['source']})",
                f"Car price ${car['price']:,.0f} is inside the ${m['budget']:,.0f} budget",
                f"Placed before the mandate expires ({m['expires_at'][:16].replace('T', ' ')})",
            ],
            "verified_buyer": f"The seller gets a buyer whose budget (${m['budget']:,.0f}) and financing"
                              + (f" (prequalified up to ${fin['max_amount']:,.0f})" if fin.get("max_amount") else "")
                              + " are already verified.",
            "at": db.now(),
        }
        return d
    return db.mutate(cid, hold, ("deposit", {"vin": body.vin, "amount": body.deposit, "test_mode": True}))["purchase"]


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
