"""Render the approved counteroffer letter as a PDF."""
import io
from html import escape

import fitz

PAGE = fitz.paper_rect("letter")
MARGIN = 72  # 1 inch
FOOTER = "Prepared with Toto. Not legal advice."
CSS = "body { font-family: serif; font-size: 11pt; line-height: 1.35; } p { margin: 0 0 11pt 0; }"


def _split(texts: list) -> tuple:
    """Greeting, middle sentences, closing lines ("Sincerely," and the line after it)."""
    closing_at = next((i for i in range(len(texts) - 1, 0, -1) if texts[i].strip().lower() == "sincerely,"), None)
    end = len(texts) if closing_at is None else closing_at
    return texts[:1], texts[1:end], texts[end:end + 2]


def _lines(*lines: str) -> str:
    return "<p>" + "<br/>".join(escape(x) for x in lines) + "</p>"


def build_letter_pdf(claim: dict, letter: dict, date_text: str) -> bytes:
    texts = [s["text"].strip() for s in letter["sentences"] if s.get("text", "").strip()]
    greeting, middle, closing = _split(texts)

    head = [claim["policyholder_name"]] if claim.get("policyholder_name") else []
    html = _lines(*head, date_text)
    if claim.get("insurer_name"):
        html += _lines(claim["insurer_name"])
    if greeting:
        html += _lines(*greeting)
    for i in range(0, len(middle), 3):
        html += "<p>" + " ".join(escape(x) for x in middle[i:i + 3]) + "</p>"
    if closing:
        html += _lines(*closing)

    story = fitz.Story(html=html, user_css=CSS)
    body = fitz.Rect(PAGE.x0 + MARGIN, PAGE.y0 + MARGIN, PAGE.x1 - MARGIN, PAGE.y1 - MARGIN)
    out = io.BytesIO()
    writer = fitz.DocumentWriter(out)
    more = True
    while more:
        dev = writer.begin_page(PAGE)
        more, _ = story.place(body)
        story.draw(dev)
        writer.end_page()
    writer.close()
    doc = fitz.open(stream=out.getvalue(), filetype="pdf")
    for page in doc:
        page.insert_textbox(
            fitz.Rect(MARGIN, PAGE.height - 50, PAGE.width - MARGIN, PAGE.height - 30),
            FOOTER, fontname="tiro", fontsize=8, color=(0.45, 0.45, 0.45), align=fitz.TEXT_ALIGN_CENTER,
        )
    return doc.tobytes()
