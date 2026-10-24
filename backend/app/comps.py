"""Pull market listings from Apify and normalize them into one schema."""
import hashlib
import json
import os
from pathlib import Path
from typing import List

from apify_client import ApifyClient

CARGURUS_ACTOR = "e-commerce/cargurus-zipcode-search-scraper"
ROOT = Path(__file__).resolve().parent
CACHE_DIR = Path(os.environ.get("CACHE_DIR", ROOT.parent / "data" / "cache"))
DEMO_LISTINGS = ROOT / "fixtures" / "demo_listings.json"

# The CarGurus Actor only accepts these radius values.
RADIUS_OPTIONS = [10, 25, 50, 75, 100, 150, 200, 500]
MAX_CHARGE_USD = float(os.environ.get("APIFY_MAX_CHARGE_USD", "0.5"))  # per run; the free plan has $5/month


def demo_mode() -> bool:
    """Demo data only for integrations without credentials: a key, once set, always wins."""
    return os.environ.get("DEMO_MODE") == "1" and not os.environ.get("APIFY_TOKEN")


def _radius_label(miles: int) -> str:
    for r in RADIUS_OPTIONS:
        if miles <= r:
            return f"{r} miles"
    return "Nationwide"


def _normalize(item: dict) -> dict:
    return {
        "vin": item.get("vin"),
        "year": item.get("carYear"),
        "make": item.get("makeName"),
        "model": item.get("modelName"),
        "trim": item.get("trimName"),
        "body": item.get("bodyTypeName"),
        "price": item.get("price"),
        "expected_price": item.get("expectedPrice"),
        "mileage": item.get("mileage"),
        "options": item.get("options") or [],
        "distance_mi": item.get("roundedDistance"),
        "days_on_market": item.get("daysOnMarket"),
        "stock_number": item.get("stockNumber"),
        "seller_type": item.get("sellerType"),
        "seller_name": item.get("serviceProviderName"),
        "seller_phone": item.get("phoneNumberString"),
        "url": item.get("detailUrl"),
        "source": "cargurus",
    }


def _dedupe(listings: List[dict]) -> List[dict]:
    seen, out = set(), []
    for l in listings:
        key = l["vin"] or l["url"]
        if key in seen:
            continue
        seen.add(key)
        out.append(l)
    return out


def search(make: str, model: str, year_from: int, year_to: int, zip_code: str, radius: int) -> dict:
    """Run the CarGurus Actor; fall back to the last cached run for the same search.

    Returns {"listings": [...], "source": "live" | "cached" | "demo"}.
    """
    if demo_mode():
        listings = [l for l in json.loads(DEMO_LISTINGS.read_text())
                    if l["make"].lower() == make.lower() and l["model"].lower() == model.lower()
                    and year_from <= l["year"] <= year_to]
        return {"listings": listings, "source": "demo"}

    run_input = {
        "zips": [zip_code],
        "carBrands": [make],
        "carModels": [model],
        "yearFrom": year_from,
        "yearTo": year_to,
        "radius": _radius_label(radius),
    }
    key = hashlib.sha1(json.dumps(run_input, sort_keys=True).encode()).hexdigest()[:12]
    cache_file = CACHE_DIR / f"{key}.json"

    try:
        client = ApifyClient(os.environ["APIFY_TOKEN"])
        run = client.actor(CARGURUS_ACTOR).call(run_input=run_input, max_total_charge_usd=MAX_CHARGE_USD, logger=None)
        items = client.dataset(run["defaultDatasetId"]).list_items().items
        listings = _dedupe([_normalize(i) for i in items])
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        cache_file.write_text(json.dumps(listings))
        return {"listings": listings, "source": "live"}
    except Exception:
        if cache_file.exists():
            return {"listings": json.loads(cache_file.read_text()), "source": "cached"}
        raise
