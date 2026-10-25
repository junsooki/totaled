"""The owner's own account of the accident, read into a timeline and the four yes/no answers.

Private: it goes into the attorney case package, never to the insurer. Every item Claude returns must quote the
owner's exact words; code drops anything whose quote is not in the account.
"""
import re

from . import ai
from .escalate import QUESTIONS

MAX_CHARS = 4000


def _norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()


def read(text: str) -> dict:
    if not ai.available():
        return {"timeline": [], "answers": [], "letter_note": None, "dropped": 0,
                "by": "not read (Claude not configured)"}
    r = ai.read_story(text)
    said = _norm(text)
    heard = lambda q: bool(_norm(q)) and _norm(q) in said  # noqa: E731
    timeline = [e.model_dump() for e in r.timeline if heard(e.quote)]
    answers = [a.model_dump() for a in r.answers if a.key in QUESTIONS and heard(a.quote)]
    dropped = len(r.timeline) + len(r.answers) - len(timeline) - len(answers)
    return {"timeline": timeline, "answers": answers, "letter_note": r.letter_note, "dropped": dropped, "by": "claude"}
