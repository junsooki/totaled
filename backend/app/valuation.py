"""Fair value math. Code computes every dollar; no AI-made numbers."""
from typing import List, Optional

import numpy as np


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
