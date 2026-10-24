"""Evidence for the counteroffer letter, and a template draft used when Claude is not configured."""
from typing import List

from .ai import Letter, Sentence
from .checks import CHECKS
from .schemas import Claim

RULE = "10 CCR § 2695.8"
CHECK_INFO = {n: (name, sec) for n, name, sec in CHECKS}


def _usd(x: float) -> str:
    return f"${x:,.2f}"


def build_evidence(claim: Claim, audit: dict) -> List[dict]:
    v, o = claim.vehicle, claim.offer
    ev = [{
        "id": "claim",
        "fact": f"{v.year} {v.make} {v.model} {v.trim or ''} VIN {v.vin or 'unknown'}, {v.mileage:,} mi; "
                f"insurer's offer dated {o.offer_date} totals {_usd(o.total)} with base value {_usd(o.base_value)}",
        "amounts": [o.total, o.base_value],
    }]
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
    s = [Sentence(text="To the claims adjuster,", citations=["claim"]),
         Sentence(text=f"I am responding to your total loss offer dated {o.offer_date} of {_usd(o.total)} for my "
                       f"{v.year} {v.make} {v.model} {v.trim or ''}.", citations=["claim"])]
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
    return Letter(sentences=s)
