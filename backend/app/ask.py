"""Questions about the case, answered only from the case file and the rule text. Every sentence cites a source."""
import re
from typing import List

from . import ai, documents
from .checks import CHECKS
from .letter import build_evidence
from .schemas import Claim

RULE = "10 CCR § 2695.8"
STOP = {"a", "an", "the", "is", "are", "was", "were", "do", "does", "did", "i", "my", "me", "what", "when", "how",
        "why", "which", "who", "can", "could", "should", "would", "to", "of", "in", "on", "for", "and", "or", "it",
        "this", "that", "be", "with", "about", "have", "has", "if", "they", "their", "there", "you", "your", "much"}


def sources(data: dict) -> List[dict]:
    claim, audit = Claim(**data["claim"]), data["audit"]
    out = list(data.get("evidence") or build_evidence(claim, audit))
    out += [{"id": f"rule:{n}", "fact": f"Check {n}, {name}: {RULE}{sec}", "amounts": []} for n, name, sec in CHECKS]
    out.append({"id": "deadline", "fact": f"Deadline to tell the insurer you cannot buy a comparable car for the "
                                          f"settlement: {audit['deadline']['date']} (35 days after the offer, {RULE}(c))",
                "amounts": []})
    for c in documents.crosscheck(claim, data.get("documents") or []):
        if c["status"] == "needs_document":
            continue
        quotes = "; ".join(f"{f['name']} page {f['page']}: \"{f['quote']}\"" for f in c["sources"])
        fact = f"{c['name']} ({c['status'].replace('_', ' ')}): {c['detail']}" + (f" Source: {quotes}" if quotes else "")
        out.append({"id": f"doc:{re.sub(r'[^a-z]+', '-', c['name'].lower()).strip('-')}", "fact": fact,
                    "amounts": [float(m.replace(",", "")) for m in ai.DOLLARS.findall(fact)]})
    p = (data.get("payout") or {})
    np_ = p.get("at_counteroffer") or p.get("at_offer")
    if np_:
        out.append({"id": "payout", "fact": f"Net payout: insurance pays ${np_['payout']:,.2f}, the auto loan balance is "
                                            f"${np_['loan_balance']:,.2f}, you walk away with ${np_['walk_away']:,.2f}",
                    "amounts": [np_["payout"], np_["loan_balance"], np_["walk_away"]]})
    return out


def _words(text: str) -> set:
    return {w.rstrip("s") for w in re.findall(r"[a-z0-9]+", text.lower()) if w not in STOP and len(w) > 1}


def answer(question: str, data: dict, guidance: List[dict] = ()) -> dict:
    """`guidance` is Moss's matching public guidance; each item becomes a citable source next to the case facts."""
    src = sources(data) + [{"id": f"guide:{g['id']}", "fact": g["text"], "amounts": []} for g in guidance]
    facts = {s["id"]: s["fact"] for s in src}
    if ai.available():
        a = ai.answer_question(question, src)
        checked = ai.citation_check(ai.Letter(sentences=a.sentences), src) if a.found else []
        ok = [s for s in checked if s["ok"]]  # a sentence that fails the citation check is dropped, never shown
        by = "claude"
    else:  # no Claude: quote the best-matching sources word for word
        q = _words(question)
        scored = sorted(((len(q & _words(s["fact"])), s) for s in src), key=lambda x: -x[0])
        ok = [{"text": s["fact"], "citations": [s["id"]], "ok": True, "problems": []} for n, s in scored[:3] if n >= 1]
        by = "keyword search (Claude not configured)"
    cited = {c for s in ok for c in s["citations"]}
    return {"found": bool(ok), "sentences": ok, "sources": {c: facts[c] for c in cited if c in facts}, "by": by}
