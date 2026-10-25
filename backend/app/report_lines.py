"""Find the printed line on the insurer's report that proves a check, so "show the line" highlights the right place.

Code searches the PDF text itself; nothing is guessed. When no matching line exists, the check keeps its old source.
"""
from typing import List, Optional

import fitz

from .schemas import Claim


def line_with(pdf: bytes, *needles: str) -> Optional[dict]:
    """The first printed line holding every needle: {"page": 1-indexed, "quote": the line}, or None."""
    doc = fitz.open(stream=pdf, filetype="pdf")
    for number, page in enumerate(doc, start=1):
        for line in page.get_text("text").splitlines():
            text = line.strip()
            if text and all(n.lower() in text.lower() for n in needles) and page.search_for(text):
                return {"page": number, "quote": text}
    return None


def point_at_lines(checks: List[dict], claim: Claim, pdf: bytes) -> None:
    """Check 8 cites the base value line, check 9 the fee line where the missing item would be listed."""
    o = claim.offer
    wanted = {
        8: line_with(pdf, "base value", f"{o.base_value:,.2f}"),
        9: line_with(pdf, "title and transfer fees") if o.title_fees else None,
    }
    for r in checks:
        if wanted.get(r["check"]):
            r["source"] = wanted[r["check"]]
