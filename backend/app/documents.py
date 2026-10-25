"""The owner's policy and the insurer's letters, read field by field and cross-checked against the valuation report.

Every field must quote a line that code finds on the cited page; anything else is dropped. The cross-checks are
plain code comparisons; they never judge the case.
"""
import json
import re
from pathlib import Path
from typing import List, Optional

import fitz

from . import ai
from .schemas import Claim

FIXTURES = Path(__file__).resolve().parent / "fixtures"
SAMPLES = {"policy": "sample_policy.pdf", "letter": "sample_insurer_letter.pdf"}
KINDS = set(SAMPLES)
FIELDS = {"policy": {"insurer", "policy_number", "collision_deductible", "rental_daily_limit", "rental_max_total",
                     "gap_coverage", "appraisal_clause"},
          "letter": {"insurer", "letter_date", "claim_number", "offer_total", "deductible"}}


def sample(kind: str) -> bytes:
    return (FIXTURES / SAMPLES[kind]).read_bytes()


def read(pdf: bytes, kind: str, is_sample: bool) -> dict:
    """Fields with their page and quote, keeping only quotes code can find on that page."""
    if ai.available():
        fields, by = [f.model_dump() for f in ai.read_document(pdf, kind).fields], "claude"
    elif is_sample:
        fields, by = json.loads((FIXTURES / "sample_documents.json").read_text())[kind], "sample fixture (Claude not configured)"
    else:
        raise RuntimeError("Reading a document needs ANTHROPIC_API_KEY. Try the sample instead.")
    doc = fitz.open(stream=pdf, filetype="pdf")
    kept = [f for f in fields if f["key"] in FIELDS[kind] and 1 <= f["page"] <= doc.page_count
            and f["quote"].strip() and doc[f["page"] - 1].search_for(f["quote"])]
    return {"fields": kept, "dropped": len(fields) - len(kept), "by": by, "pages": doc.page_count}


def _num(v: Optional[str]) -> Optional[float]:
    m = re.search(r"-?[\d,]+(?:\.\d+)?", v or "")
    return float(m.group().replace(",", "")) if m else None


def _field(docs: List[dict], kind: str, key: str) -> Optional[dict]:
    for d in docs:
        if d["kind"] == kind:
            for f in d["fields"]:
                if f["key"] == key:
                    return dict(f, doc=d["id"], name=d["name"])
    return None


def _usd(x: float) -> str:
    return f"${x:,.2f}"


def crosscheck(claim: Claim, docs: List[dict]) -> List[dict]:
    """Each check: name, status (match | mismatch | found | not_found | needs_document), detail, sources."""
    o = claim.offer
    has = {d["kind"] for d in docs}
    out = []

    def add(name, status, detail, *fields):
        out.append({"name": name, "status": status, "detail": detail, "sources": [f for f in fields if f]})

    if "policy" not in has:
        add("Policy", "needs_document", "Upload your policy to check the deductible, the appraisal clause and rental coverage.")
    else:
        ded = _field(docs, "policy", "collision_deductible")
        if ded and _num(ded["value"]) is not None:
            p = _num(ded["value"])
            if abs(p - o.deductible) < 0.5:
                add("Deductible", "match", f"The offer subtracts {_usd(o.deductible)}, the same as your policy's collision deductible.", ded)
            else:
                add("Deductible", "mismatch", f"The offer subtracts {_usd(o.deductible)}, but your policy's collision deductible "
                    f"is {_usd(p)}. Ask the insurer to explain the difference of {_usd(abs(o.deductible - p))}.", ded)
        else:
            add("Deductible", "not_found", "We could not find a collision deductible in the policy you uploaded.")
        appr = _field(docs, "policy", "appraisal_clause")
        add("Appraisal clause", "found" if appr else "not_found",
            "Your policy has an appraisal clause: if you and the insurer disagree on the amount, either side can demand "
            "an appraisal." if appr else "We did not find an appraisal clause in the policy you uploaded.", appr)
        daily, cap = _field(docs, "policy", "rental_daily_limit"), _field(docs, "policy", "rental_max_total")
        if daily:
            add("Rental coverage", "found", f"Your policy pays for a rental up to {_usd(_num(daily['value']) or 0)} a day"
                + (f", up to {_usd(_num(cap['value']) or 0)} per loss." if cap else "."), daily, cap)
        gap = _field(docs, "policy", "gap_coverage")
        if gap:
            add("GAP coverage", "found", "Your policy " + ("includes" if gap["value"].lower().startswith("y") else "does not include")
                + " loan/lease GAP coverage.", gap)

    if "letter" not in has:
        add("Insurer's letter", "needs_document", "Upload the insurer's letter to check its amount, date and claim number.")
    else:
        amt = _field(docs, "letter", "offer_total")
        if amt and _num(amt["value"]) is not None:
            a = _num(amt["value"])
            add("Offer amount", "match" if abs(a - o.total) < 1 else "mismatch",
                f"The letter's offer of {_usd(a)} " + ("matches the valuation report." if abs(a - o.total) < 1
                                                       else f"differs from the report's {_usd(o.total)}."), amt)
        num = _field(docs, "letter", "claim_number")
        if num and claim.claim_number:
            same = re.sub(r"\W", "", num["value"]).lower() == re.sub(r"\W", "", claim.claim_number).lower()
            add("Claim number", "match" if same else "mismatch",
                f"The letter's claim number {num['value']} " + ("matches the report." if same else f"differs from the report's {claim.claim_number}."), num)
        dt = _field(docs, "letter", "letter_date")
        if dt:
            same = dt["value"] == o.offer_date
            add("Letter date", "match" if same else "mismatch",
                f"The letter is dated {dt['value']}" + (", the same as the offer in the report." if same else
                f"; the report's offer is dated {o.offer_date}. The 35-day window runs from when you received the final offer."), dt)
    return out
