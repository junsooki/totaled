"""Pull comparable listings from Apify and normalize them into one schema."""
import hashlib
import json
import os
from pathlib import Path
from typing import List

from apify_client import ApifyClient

CARGURUS_ACTOR = "e-commerce/cargurus-zipcode-search-scraper"
CACHE_DIR = Path(__file__).resolve().parent.parent / "data" / "cache"

# The CarGurus Actor only accepts these radius values.
RADIUS_OPTIONS = [10, 25, 50, 75, 100, 150, 200, 500]


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


def fetch_comps(year: int, make: str, model: str, mileage: int, zip_code: str, radius: int) -> dict:
    """Run the CarGurus Actor; fall back to the last cached run for the same search."""
    run_input = {
        "zips": [zip_code],
        "carBrands": [make],
        "carModels": [model],
        "yearFrom": year,
        "yearTo": year + 1,
        "radius": _radius_label(radius),
    }
    key = hashlib.sha1(json.dumps(run_input, sort_keys=True).encode()).hexdigest()[:12]
    cache_file = CACHE_DIR / f"{key}.json"

    try:
        client = ApifyClient(os.environ["APIFY_TOKEN"])
        run = client.actor(CARGURUS_ACTOR).call(run_input=run_input)
        items = client.dataset(run["defaultDatasetId"]).list_items().items
        listings = _dedupe([_normalize(i) for i in items])
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        cache_file.write_text(json.dumps(listings))
        return {"listings": listings, "cached": False}
    except Exception:
        if cache_file.exists():
            return {"listings": json.loads(cache_file.read_text()), "cached": True}
        raise
