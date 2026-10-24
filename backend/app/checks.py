"""The 10 checks against California's total loss rule, 10 CCR § 2695.8.

Deterministic code only. Thresholds we chose (not in the rule text) are named
constants so the UI can show them.
"""
from datetime import date
from typing import List, Optional

from .schemas import Claim, Comparable

LOCAL_RADIUS_MI = 100  # our reading of "local market area"
MAX_LISTING_AGE_DAYS = 90
MILEAGE_TOLERANCE = 0.20  # comparable odometer within ±20% of the loss vehicle
LUMPED_LABELS = {"other", "misc", "miscellaneous", "general", "adjustment", "various"}
MATH_TOLERANCE = 1.0  # dollars

CHECKS = [
    (1, "Same make and model", "(b)(2)"),
    (2, "Same or newer model year", "(b)(2)"),
    (3, f"Available locally ({LOCAL_RADIUS_MI} mi) within {MAX_LISTING_AGE_DAYS} days", "(b)(2), (b)(4)(A)"),
    (4, "Identified by VIN, stock number or plate, with seller contact", "(b)(2)"),
    (5, "Similar trim, options and mileage", "(b)(2)"),
    (6, "Adjustments itemized and documented", "(b)(2)"),
    (7, "Condition deduction only if documented below average", "(b)(2)"),
    (8, "Base value is the average of the comparables", "(b)(4)(A)"),
    (9, "Offer includes tax, fees and prorated registration, minus deductible", "(b)(1)"),
    (10, "Written explanation provided with the offer", "(b)(4)"),
]


def _days_between(a: str, b: str) -> int:
    return (date.fromisoformat(b) - date.fromisoformat(a)).days


def _result(check: int, passed: Optional[bool], detail: str, comp: Optional[Comparable] = None, source=None) -> dict:
    """passed=None means the report does not supply what the check needs."""
    return {
        "check": check,
        "status": "unknown" if passed is None else ("pass" if passed else "fail"),
        "detail": detail,
        "comparable": comp.id if comp else None,
        "source": (comp.source if comp else source).model_dump() if (comp and comp.source) or source else None,
    }


def adjusted_value(c: Comparable) -> float:
    return c.list_price + sum(a.amount for a in c.adjustments)


def check_comparable(claim: Claim, c: Comparable) -> List[dict]:
    v, out = claim.vehicle, []

    same = c.make.lower() == v.make.lower() and c.model.lower() == v.model.lower()
    out.append(_result(1, same, f"{c.make} {c.model} vs loss vehicle {v.make} {v.model}", c))

    if c.year < v.year:
        out.append(_result(2, False, f"{c.year} is older than the {v.year} loss vehicle", c))
    elif c.year > v.year:
        out.append(_result(2, True, f"{c.year} is newer; allowed only if same-year matches are scarce", c))
    else:
        out.append(_result(2, True, f"Same model year ({c.year})", c))

    problems = []
    if c.distance_mi is not None and c.distance_mi > LOCAL_RADIUS_MI:
        problems.append(f"{c.distance_mi:g} mi away")
    if c.listing_date:
        age = _days_between(c.listing_date, claim.offer.offer_date)
        if age > MAX_LISTING_AGE_DAYS:
            problems.append(f"listed {age} days before the offer")
    if c.distance_mi is None and not c.listing_date:
        out.append(_result(3, None, "Report gives neither distance nor listing date", c))
    else:
        out.append(_result(3, not problems, "; ".join(problems) or "Local and recent", c))

    missing = []
    if not (c.vin or c.stock_number or c.plate):
        missing.append("no VIN, stock number or plate")
    if not c.seller_contact:
        missing.append("no seller contact")
    out.append(_result(4, not missing, "; ".join(missing) or "Identified with seller contact", c))

    diffs = []
    if v.trim and c.trim and c.trim.lower() != v.trim.lower():
        diffs.append(f"trim {c.trim} vs {v.trim}")
    if c.odometer is not None and abs(c.odometer - v.mileage) > MILEAGE_TOLERANCE * v.mileage:
        diffs.append(f"{c.odometer:,} mi vs {v.mileage:,} mi")
    lacking = [o for o in v.options if o.lower() not in {x.lower() for x in c.options}]
    if lacking:
        diffs.append("missing " + ", ".join(lacking))
    out.append(_result(5, not diffs, "; ".join(diffs) or "Similar", c))

    bad = [a for a in c.adjustments if not a.label.strip() or a.label.strip().lower() in LUMPED_LABELS]
    detail = "; ".join(f"unlabeled or lumped: \"{a.label}\" {a.amount:+,.0f}" for a in bad)
    out.append(_result(6, not bad, detail or "Each adjustment is labeled", c))
    return out


def check_report(claim: Claim) -> List[dict]:
    o, cond, out = claim.offer, claim.condition, []

    if cond.deduction > 0 and (not cond.documented or (cond.subject_grade or "").lower() not in ("below average", "poor", "rough")):
        out.append(_result(7, False, f"${cond.deduction:,.0f} deducted with grade \"{cond.subject_grade}\" and "
                                     f"{'with' if cond.documented else 'without'} documentation", source=cond.source))
    else:
        out.append(_result(7, True, "No undocumented condition deduction", source=cond.source))

    comps = claim.comparables
    problems = []
    for c in comps:
        mine = adjusted_value(c)
        if c.adjusted_value is not None and abs(mine - c.adjusted_value) > MATH_TOLERANCE:
            problems.append(f"{c.id} adds up to ${mine:,.0f}, report says ${c.adjusted_value:,.0f}")
        for a in c.adjustments:
            if a.label.lower().startswith("mileage") and c.odometer is not None:
                # A comparable with more miles is worth less, so the adjustment should raise its value.
                expected_sign = 1 if c.odometer > claim.vehicle.mileage else -1
                if a.amount * expected_sign < 0:
                    problems.append(f"{c.id} mileage adjustment {a.amount:+,.0f} has the wrong sign "
                                    f"({c.odometer:,} vs {claim.vehicle.mileage:,} mi)")
    if len(comps) < 2:
        problems.append(f"only {len(comps)} comparable")
    avg = sum(c.adjusted_value if c.adjusted_value is not None else adjusted_value(c) for c in comps) / max(len(comps), 1)
    if abs(avg - o.base_value) > MATH_TOLERANCE:
        problems.append(f"average of adjusted values is ${avg:,.2f}, report says ${o.base_value:,.2f}")
    out.append(_result(8, not problems, "; ".join(problems) or f"Base value matches the average (${avg:,.2f})",
                       source=o.source))

    missing = [name for name, val in (("sales tax", o.sales_tax), ("title and transfer fees", o.title_fees),
                                      ("prorated registration", o.registration_prorated)) if not val]
    expected_total = (o.base_value + o.condition_adjustment + (o.sales_tax or 0) + (o.title_fees or 0)
                      + (o.registration_prorated or 0) - o.deductible)
    if abs(expected_total - o.total) > MATH_TOLERANCE:
        missing.append(f"line items add up to ${expected_total:,.2f}, offer says ${o.total:,.2f}")
    out.append(_result(9, not missing, "Missing: " + "; ".join(missing) if missing else "All required items included",
                       source=o.source))

    out.append(_result(10, o.written_explanation, "Explanation provided" if o.written_explanation
                       else "No written explanation found", source=o.source))
    return out


def run_checks(claim: Claim) -> List[dict]:
    results = []
    for c in claim.comparables:
        results += check_comparable(claim, c)
    return results + check_report(claim)


def reopen_exception(claim: Claim) -> bool:
    """Under (c) the insurer need not reopen if it named an available comparable with seller contact and an identifier."""
    for c in claim.comparables:
        if (c.vin or c.stock_number or c.plate) and c.seller_contact and c.listing_date \
                and _days_between(c.listing_date, claim.offer.offer_date) <= MAX_LISTING_AGE_DAYS:
            return True
    return False
