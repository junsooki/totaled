"""Fair value math. Code computes every dollar; no AI-made numbers."""
from typing import List, Optional

import numpy as np

from .schemas import Claim, Vehicle


def comparable_listings(listings: List[dict], v: Vehicle) -> List[dict]:
    """Listings that would pass checks 1, 2 and 5 against the loss vehicle."""
    out = []
    for l in listings:
        if not l.get("price") or l.get("mileage") is None:
            continue
        if (l.get("make") or "").lower() != v.make.lower() or (l.get("model") or "").lower() != v.model.lower():
            continue
        if l["year"] != v.year:
            continue
        if v.trim and l.get("trim") and l["trim"].lower() != v.trim.lower():
            continue
        out.append(l)
    return out


def fair_value(listings: List[dict], mileage: int) -> Optional[dict]:
    """Estimate market value at the subject's mileage from comparable asking prices.

    With 3+ comps, fits price ~ mileage and reads off the subject's mileage.
    Otherwise falls back to the mean price. Always labeled an Estimate.
    """
    comps = [l for l in listings if l.get("price") and l.get("mileage") is not None]
    if not comps:
        return None

    prices = np.array([c["price"] for c in comps], dtype=float)
    miles = np.array([c["mileage"] for c in comps], dtype=float)

    if len(comps) >= 3 and miles.std() > 0:
        slope, intercept = np.polyfit(miles, prices, 1)
        value = slope * mileage + intercept
        method = "linear fit of price on mileage"
    else:
        slope = None
        value = prices.mean()
        method = "mean asking price"

    return {
        "estimate": round(float(value)),
        "method": method,
        "per_mile": round(float(slope), 4) if slope is not None else None,
        "n_comps": len(comps),
        "label": "Estimate",
    }


def counteroffer(claim: Claim, market_value: float) -> dict:
    """What the offer should be with the market value in place of the insurer's base value.

    Keeps the insurer's own effective tax rate and fees, drops an undocumented condition
    deduction, and leaves registration as an open item when the report omits it.
    """
    o = claim.offer
    taxable = o.base_value + o.condition_adjustment
    tax_rate = (o.sales_tax / taxable) if o.sales_tax and taxable else 0
    vehicle_value = market_value
    if claim.condition.deduction and not claim.condition.documented:
        condition = 0.0
    else:
        condition = o.condition_adjustment
    taxable_new = vehicle_value + condition
    total = taxable_new + taxable_new * tax_rate + (o.title_fees or 0) + (o.registration_prorated or 0) - o.deductible
    return {
        "vehicle_value": round(vehicle_value, 2),
        "condition_adjustment": round(condition, 2),
        "tax_rate": round(tax_rate, 4),
        "sales_tax": round(taxable_new * tax_rate, 2),
        "title_fees": o.title_fees or 0,
        "registration_prorated": o.registration_prorated,
        "deductible": o.deductible,
        "total": round(total, 2),
        "gap": round(total - o.total, 2),
    }
