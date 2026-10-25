"""Find the printed line on the insurer's report that proves a check, so "show the line" highlights the right place.

Code searches the PDF text itself; nothing is guessed. When no matching line exists, the check keeps its old source.
"""
import re
from typing import List, Optional

import fitz

from .schemas import Claim


def _lines(pdf: bytes) -> List[tuple]:
    """Every printed line as (page number, text), in reading order."""
    doc = fitz.open(stream=pdf, filetype="pdf")
    return [(n, t.strip()) for n, page in enumerate(doc, start=1) for t in page.get_text("text").splitlines() if t.strip()]


def _findable(pdf: bytes, page: int, text: str) -> bool:
    return bool(fitz.open(stream=pdf, filetype="pdf")[page - 1].search_for(text))


def line_with(pdf: bytes, *needles: str) -> Optional[dict]:
    """The first printed line holding every needle: {"page": 1-indexed, "quote": the line}, or None."""
    for page, text in _lines(pdf):
        if all(n.lower() in text.lower() for n in needles) and _findable(pdf, page, text):
            return {"page": page, "quote": text}
    return None


def _block(lines: List[tuple], header: dict) -> List[str]:
    """The lines printed under a comparable's header line, up to the next comparable."""
    out, inside = [], False
    for page, text in lines:
        if inside:
            if re.match(r"C\d+:", text):
                break
            out.append(text)
        elif page == header["page"] and " ".join(text.split()) == " ".join(header["quote"].split()):
            inside = True  # the report pads some lines with extra spaces
    return out


def point_at_lines(checks: List[dict], claim: Claim, pdf: bytes) -> None:
    """Re-aim checks at the printed line that proves them: base value for 8, the fee line for 9, and for the
    comparable checks 3 to 6 the line under the car's header that holds the distance, seller, odometer or adjustments."""
    o = claim.offer
    wanted = {
        8: line_with(pdf, "base value", f"{o.base_value:,.2f}"),
        9: line_with(pdf, "title and transfer fees") if o.title_fees else None,
    }
    lines = _lines(pdf)
    for r in checks:
        if wanted.get(r["check"]):
            r["source"] = wanted[r["check"]]
        elif r.get("comparable") and r.get("source"):
            block = _block(lines, r["source"])
            pick = {
                3: lambda b: next((x for x in b if x.startswith("Listed")), None),
                4: lambda b: next((x for x in b if x.startswith("Seller:")), None),
                5: lambda b: next((x for x in b if x.startswith("Listed")), None)
                if "trim" not in r["detail"] and " mi vs " in r["detail"] else None,
                6: lambda b: next((x for x in b if "adjustment" in x.lower()), None),
            }.get(r["check"])
            text = pick(block) if pick else None
            if text and _findable(pdf, r["source"]["page"], text):
                r["source"] = {"page": r["source"]["page"], "quote": text}
