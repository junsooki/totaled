"""Claude reads the report and drafts the letter. It never computes a dollar amount."""
import base64
import json
import os
import re
from typing import List, Optional

import anthropic
from pydantic import BaseModel

from .schemas import Claim

MODEL = "claude-opus-5-5"
# Server-side refusal fallback: on a policy decline the API reruns the request on a fallback model.
FALLBACK = dict(betas=["server-side-fallback-2026-07-01"], fallbacks="default")


def available() -> bool:
    return bool(os.environ.get("ANTHROPIC_API_KEY"))


EXTRACT_PROMPT = """This is an insurer's total loss valuation report and offer letter for a car in California,
either as a PDF or as phone photos of the pages (one photo per page; read them even if tilted or shadowed).
Extract the claim as JSON. Rules:
- Copy numbers exactly as printed. Do not compute, round or fill in anything that is not printed.
- Leave a field null when the report does not state it (for example a missing VIN or seller contact).
- For vehicle.trim and each comparable's trim, give only the trim level as the manufacturer names it
  (for example "EX", "EX-L", "Sport"), without body style (sedan, coupe, 4D) or drivetrain.
- Adjustments are signed: amounts that lower the comparable's value are negative.
- condition.deduction is the positive dollar amount deducted for condition; documented is true only if
  inspection notes or photos support a below-average grade.
- offer.written_explanation is true if the letter explains how the value was calculated.
- For every comparable, the condition and the offer, set source.page (1-indexed) and source.quote to one
  line copied verbatim from that page that identifies it, so it can be highlighted.

Reply with ONLY one JSON object that matches this JSON Schema, no prose, no code fences. Fields the report
does not print are null.
{schema}"""


def extract_claim(pdf: bytes) -> Claim:
    """The Claim schema is too large for constrained decoding, so ask for JSON and validate it ourselves."""
    client = anthropic.Anthropic()
    schema = json.dumps(Claim.model_json_schema(), separators=(",", ":"))
    messages = [{
        "role": "user",
        "content": [
            {"type": "document", "source": {"type": "base64", "media_type": "application/pdf",
                                            "data": base64.b64encode(pdf).decode()}},
            {"type": "text", "text": EXTRACT_PROMPT.replace("{schema}", schema)},
        ],
    }]
    error = None
    for attempt in range(2):
        response = client.beta.messages.create(
            model=MODEL,
            max_tokens=16000,
            output_config={"effort": "medium"},
            messages=messages,
            **FALLBACK,
        )
        if response.stop_reason == "refusal":
            raise RuntimeError(f"Claude could not read the report (stop_reason={response.stop_reason})")
        text = "".join(b.text for b in response.content if b.type == "text").strip()
        text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text)
        try:
            return Claim.model_validate_json(text)
        except ValueError as e:  # pydantic's ValidationError is a ValueError
            error = e
            messages = messages + [
                {"role": "assistant", "content": text},
                {"role": "user", "content": f"That JSON was invalid:\n{e}\nReply with ONLY the corrected JSON object."},
            ]
    raise RuntimeError(f"Claude could not read the report (invalid JSON: {str(error)[:200]})")


class VinPhoto(BaseModel):
    vin: Optional[str] = None
    odometer: Optional[int] = None


def read_vin(image: bytes, media_type: str) -> VinPhoto:
    """Read the VIN (and odometer, if visible) from a photo of a VIN plate, door sticker, registration or dashboard."""
    client = anthropic.Anthropic()
    response = client.beta.messages.parse(
        model=MODEL,
        max_tokens=2000,
        output_config={"effort": "low"},
        output_format=VinPhoto,
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": media_type,
                                             "data": base64.b64encode(image).decode()}},
                {"type": "text", "text": "Read the 17-character VIN in this photo exactly as printed, and the odometer "
                                         "reading in miles if one is visible. Leave a field null if it is not clearly "
                                         "readable; never guess characters."},
            ],
        }],
        **FALLBACK,
    )
    if response.stop_reason == "refusal" or response.parsed_output is None:
        raise RuntimeError(f"Claude could not read the photo (stop_reason={response.stop_reason})")
    return response.parsed_output


class Sentence(BaseModel):
    text: str
    citations: List[str]  # ids from the evidence list, e.g. "check:7", "comp:C2", "listing:1HG..."


class Letter(BaseModel):
    sentences: List[Sentence]


LETTER_PROMPT = """Draft a firm, polite counteroffer letter from the policyholder to their insurer about a
total loss valuation in California. Use only the evidence below.
- Every sentence must cite at least one evidence id in its citations list (greeting and sign-off may cite "claim").
- Use only dollar amounts that appear in the evidence, written exactly as given. Never compute new amounts.
- Quote the rule section for each failed check. Do not give legal conclusions or threaten litigation.
- Ask for a revised offer of the counteroffer total and a written response.

Evidence (id: fact):
{evidence}"""


def draft_letter(evidence: List[dict]) -> Letter:
    client = anthropic.Anthropic()
    lines = "\n".join(f"{e['id']}: {e['fact']}" for e in evidence)
    response = client.beta.messages.parse(
        model=MODEL,
        max_tokens=16000,
        output_config={"effort": "medium"},
        output_format=Letter,
        messages=[{"role": "user", "content": LETTER_PROMPT.format(evidence=lines)}],
        **FALLBACK,
    )
    if response.stop_reason == "refusal" or response.parsed_output is None:
        raise RuntimeError(f"Claude could not draft the letter (stop_reason={response.stop_reason})")
    return response.parsed_output


DOLLARS = re.compile(r"\$\s?([\d,]+(?:\.\d{1,2})?)")


def citation_check(letter: Letter, evidence: List[dict]) -> List[dict]:
    """Reject sentences that cite nothing real or use a dollar amount not in the evidence."""
    ids = {e["id"] for e in evidence} | {"claim"}
    amounts = {round(a) for e in evidence for a in e.get("amounts", [])}
    out = []
    for s in letter.sentences:
        problems = []
        bad_ids = [c for c in s.citations if c not in ids]
        if not s.citations:
            problems.append("cites no evidence")
        if bad_ids:
            problems.append("unknown citation " + ", ".join(bad_ids))
        for m in DOLLARS.findall(s.text):
            if round(float(m.replace(",", ""))) not in amounts:
                problems.append(f"${m} is not in the evidence")
        out.append({"text": s.text, "citations": s.citations, "ok": not problems, "problems": problems})
    return out


class Answer(BaseModel):
    found: bool  # false when the sources do not answer the question
    sentences: List[Sentence]


ASK_PROMPT = """Answer the owner's question about their total loss claim using only the sources below.
- Every sentence must cite at least one source id in its citations list.
- Use only dollar amounts that appear in the sources, written exactly as given. Never compute new amounts.
- If the sources do not answer the question, set found to false and return no sentences.
- Plain words, at most 4 sentences. Do not give legal advice, rate the case or predict an outcome.

Sources (id: fact):
{sources}

Question: {question}"""


def answer_question(question: str, sources: List[dict]) -> Answer:
    client = anthropic.Anthropic()
    lines = "\n".join(f"{s['id']}: {s['fact']}" for s in sources)
    response = client.beta.messages.parse(
        model=MODEL,
        max_tokens=4000,
        output_config={"effort": "low"},
        output_format=Answer,
        messages=[{"role": "user", "content": ASK_PROMPT.format(sources=lines, question=question)}],
        **FALLBACK,
    )
    if response.stop_reason == "refusal" or response.parsed_output is None:
        raise RuntimeError(f"Claude could not answer (stop_reason={response.stop_reason})")
    return response.parsed_output
