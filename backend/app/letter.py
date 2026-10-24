"""Evidence for the counteroffer letter, and a template draft used when Claude is not configured."""
from typing import List

from .ai import DOLLARS, Letter, Sentence
from .checks import CHECKS
from .schemas import Claim

RULE = "10 CCR § 2695.8"
CHECK_INFO = {n: (name, sec) for n, name, sec in CHECKS}


def _usd(x: float) -> str:
    return f"${x:,.2f}"


def _note(claim: Claim) -> str:
    return (claim.loss_note or "").strip()[:600].strip()


def build_evidence(claim: Claim, audit: dict) -> List[dict]:
    v, o = claim.vehicle, claim.offer
    ev = [{
        "id": "claim",
        "fact": f"{v.year} {v.make} {v.model} {v.trim or ''} VIN {v.vin or 'unknown'}, {v.mileage:,} mi; "
                f"insurer's offer dated {o.offer_date} totals {_usd(o.total)} with base value {_usd(o.base_value)}",
        "amounts": [o.total, o.base_value],
    }]
    known = [f"{label} {val}" for label, val in (
        ("insurer", claim.insurer_name), ("claim number", claim.claim_number),
        ("policy number", claim.policy_number), ("policyholder name", claim.policyholder_name)) if val]
    if known:
        ev[0]["fact"] += "; " + ", ".join(known)
    note = _note(claim)
    if note:
        ev.append({"id": "note", "fact": f"Policyholder's own account: {note}",
                   "amounts": [float(m.replace(",", "")) for m in DOLLARS.findall(note)]})
    comps = {c.id: c for c in claim.comparables}
    for r in audit["checks"]:
        if r["status"] != "fail":
            continue
        name, sec = CHECK_INFO[r["check"]]
        rid = f"check:{r['check']}" + (f":{r['comparable']}" if r["comparable"] else "")
        amounts = []
        if r["comparable"]:
            c = comps[r["comparable"]]
            amounts += [c.list_price] + ([c.adjusted_value] if c.adjusted_value is not None else [])
            amounts += [abs(a.amount) for a in c.adjustments]
        if r["check"] == 7:
            amounts.append(claim.condition.deduction)
        if r["check"] == 8:
            amounts += [o.base_value, audit["recomputed_base"]]
        ev.append({
            "id": rid,
            "fact": f"Fails check {r['check']} ({name}, {RULE}{sec})"
                    + (f" for comparable {r['comparable']}" if r["comparable"] else "") + f": {r['detail']}",
            "amounts": amounts,
        })
    for l in audit["market"]["listings"][:5]:
        ev.append({
            "id": f"listing:{l['vin']}",
            "fact": f"{l['year']} {l['make']} {l['model']} {l.get('trim') or ''}, {l['mileage']:,} mi, listed at "
                    f"{_usd(l['price'])} by {l.get('seller_name') or 'a seller'}"
                    + (f", {l['distance_mi']:g} mi away" if l.get("distance_mi") is not None else "")
                    + (f" ({l['url']})" if l.get("url") else ""),
            "amounts": [l["price"]],
        })
    fv, co = audit["market"]["fair_value"], audit["counteroffer"]
    if fv:
        ev.append({"id": "market", "fact": f"Market value at {v.mileage:,} mi from {fv['n_comps']} current comparable "
                                           f"listings: {_usd(fv['estimate'])} ({fv['method']})", "amounts": [fv["estimate"]]})
    if co:
        ev.append({"id": "counter", "fact": f"Counteroffer total {_usd(co['total'])}: vehicle {_usd(co['vehicle_value'])}, "
                                            f"sales tax {_usd(co['sales_tax'])}, fees {_usd(co['title_fees'])}, less deductible "
                                            f"{_usd(co['deductible'])}; {_usd(co['gap'])} above the current offer",
                   "amounts": [co["total"], co["vehicle_value"], co["sales_tax"], co["title_fees"], co["deductible"], co["gap"]]})
    return ev


def template_letter(claim: Claim, evidence: List[dict]) -> Letter:
    v, o = claim.vehicle, claim.offer
    greeting = f"To {claim.insurer_name} claims department," if claim.insurer_name else "To the claims adjuster,"
    s = [Sentence(text=greeting, citations=["claim"])]
    refs = [f"claim number {claim.claim_number}" if claim.claim_number else "",
            f"policy number {claim.policy_number}" if claim.policy_number else ""]
    refs = [r for r in refs if r]
    if refs:
        s.append(Sentence(text=f"Re: {', '.join(refs)}.", citations=["claim"]))
    s.append(Sentence(text=f"I am responding to your total loss offer dated {o.offer_date} of {_usd(o.total)} for my "
                           f"{v.year} {v.make} {v.model} {v.trim or ''}.", citations=["claim"]))
    note = _note(claim)
    if note:
        s.append(Sentence(text=f"In my own words: {note}", citations=["note"]))
    for e in evidence:
        if e["id"].startswith("check:"):
            s.append(Sentence(text=e["fact"].replace("Fails", "The valuation fails") + ".", citations=[e["id"]]))
    ids = {e["id"]: e for e in evidence}
    if "market" in ids:
        listings = [e["id"] for e in evidence if e["id"].startswith("listing:")]
        s.append(Sentence(text=ids["market"]["fact"] + ".", citations=["market"] + listings))
    if "counter" in ids:
        s.append(Sentence(text=f"I request a revised offer: {ids['counter']['fact']}.", citations=["counter"]))
    s.append(Sentence(text="Please respond in writing with a revised offer or an explanation of each item above.",
                      citations=["claim"]))
    s.append(Sentence(text="Sincerely,", citations=["claim"]))
    if claim.policyholder_name:
        s.append(Sentence(text=claim.policyholder_name, citations=["claim"]))
    return Letter(sentences=s)
