"""Two simulated phone calls between the owner and an insurance adjuster, written in code from the case file.

Every dollar and date comes from the audit; no AI writes the script and none of it rates the case. The adjuster is a
made-up person and no real insurer is called. Used for a transcript and for saved speech (see call_audio.py).
"""
from typing import List

from . import call_audio, documents
from .playbook import REPLY_DAYS, _failed, _usd
from .schemas import Claim


def _turns(lines: List[tuple]) -> List[dict]:
    return [{"speaker": who, "text": text, "key": call_audio.key(who, text)} for who, text in lines]


def build(data: dict) -> List[dict]:
    """The calls for a claim whose letter is approved; empty when there is no counteroffer to talk about."""
    claim, audit = Claim(**data["claim"]), data["audit"]
    co = audit.get("counteroffer")
    if not co:
        return []
    offer = _usd(claim.offer.total)
    ask = _usd(co["total"])
    gap = _usd(co["gap"])
    failed = len(_failed(audit))
    name = claim.policyholder_name
    num = f"claim number {claim.claim_number}" if claim.claim_number else "my total loss claim"
    hello = f"Hi Dana, this is {name}, calling about {num}." if name else f"Hi Dana, I'm calling about {num}."
    checks = {c["name"]: c for c in documents.crosscheck(claim, data.get("documents") or [])}
    appraisal = ("I'm asking for an appraisal under my policy's appraisal clause."
                 if (checks.get("Appraisal clause") or {}).get("status") == "found" else
                 "I'm asking whether my policy has an appraisal clause that applies here.")

    sent = _turns([
        ("adjuster", "Claims, this is Dana. How can I help?"),
        ("owner", f"{hello} I sent my counteroffer letter. Your offer was {offer}. I'm asking for {ask}, which is {gap} "
                  f"more, and the letter lists {failed} problems with your valuation."),
        ("adjuster", "Let me review the comparable vehicles. I'll get back to you."),
        ("owner", f"Please answer in writing within {REPLY_DAYS} calendar days. Thank you."),
    ])
    denied = _turns([
        ("adjuster", "Claims, this is Dana."),
        ("owner", f"Hi Dana, it's {name} again about {num}. I got your reply."
                  if name else f"Hi Dana, it's me again about {num}. I got your reply."),
        ("adjuster", f"Yes. We're standing by our valuation of {offer}."),
        ("owner", f"{appraisal} I'm also filing a complaint with the California Department of Insurance."),
    ])
    return [
        {"id": "sent", "title": "After you send the letter", "turns": sent},
        {"id": "denied", "title": "If they say no", "turns": denied},
    ]
