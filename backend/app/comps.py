"""Pull market listings from Apify and normalize them into one schema."""
import hashlib
import json
import os
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import List

from apify_client import ApifyClient

from . import db, demo_cache

CARGURUS_ACTOR = "e-commerce/cargurus-zipcode-search-scraper"
CARSCOM_ACTOR = "fatihtahta/cars-com-scraper"
CARSCOM_LIMIT = 20
CARSCOM_MAX_CHARGE_USD = 1.0  # the actor's minimum cap; it bills per listing, about $0.02 for 20
ROOT = Path(__file__).resolve().parent
DEMO_LISTINGS = ROOT / "fixtures" / "demo_listings.json"

# The CarGurus Actor only accepts these radius values.
RADIUS_OPTIONS = [10, 25, 50, 75, 100, 150, 200, 500]
CACHE_HOURS = float(os.environ.get("MARKET_CACHE_HOURS", "12"))  # reuse a search this long before paying again
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


def run_input_and_key(make: str, model: str, year_from: int, year_to: int, zip_code: str, radius: int):
    run_input = {
        "zips": [zip_code],
        "carBrands": [make],
        "carModels": [model],
        "yearFrom": year_from,
        "yearTo": year_to,
        "radius": _radius_label(radius),
    }
    key = hashlib.sha1(json.dumps(run_input, sort_keys=True).encode()).hexdigest()[:12]
    return run_input, key


def _normalize_carscom(item: dict) -> dict:
    v, pr, ls = item.get("vehicle") or {}, item.get("pricing") or {}, item.get("listing") or {}
    loc = ls.get("location") or ""  # e.g. "Santa Rosa, CA (46 mi)"
    miles = re.search(r"\((\d+(?:\.\d+)?) mi\)", loc)
    return {
        "vin": v.get("vin"), "year": v.get("year"), "make": v.get("make"), "model": v.get("model"), "trim": v.get("trim"),
        "body": v.get("body_style"), "price": pr.get("price_numeric"), "expected_price": None,
        "mileage": v.get("mileage_numeric"), "options": [], "distance_mi": float(miles.group(1)) if miles else None,
        "days_on_market": None, "stock_number": None, "seller_type": None,
        "seller_name": f"Cars.com dealer in {loc.split(' (')[0]}" if loc else None,  # cars.com shows no seller name
        "seller_phone": None, "url": ls.get("url"), "source": "cars.com",
    }


def carscom_input_and_key(make: str, model: str, year_from: int, year_to: int, zip_code: str, radius: int):
    m = make.lower()
    url = (f"https://www.cars.com/shopping/results/?makes[]={m}&models[]={m}-{model.lower().replace(' ', '_')}"
           f"&year_min={year_from}&year_max={year_to}&zip={zip_code}&maximum_distance={radius}&stock_type=used")
    run_input = {"startUrls": [url], "limit": CARSCOM_LIMIT, "get_contacts": False}
    key = hashlib.sha1(json.dumps({"actor": CARSCOM_ACTOR, **run_input}, sort_keys=True).encode()).hexdigest()[:12]
    return run_input, key


def _run(key: str, actor: str, run_input: dict, max_charge: float, normalize) -> dict:
    """One source: a saved demo run, else a recent saved run, else a live (paid) run; a stale run beats nothing."""
    saved = demo_cache.market(key)
    if saved:
        return {"listings": saved["listings"], "source": "cached", "fetched_at": saved["at"]}
    cached = db.cache_get(key)
    if cached and datetime.now(timezone.utc) - datetime.fromisoformat(cached[0]) < timedelta(hours=CACHE_HOURS):
        return {"listings": cached[1], "source": "cached", "fetched_at": cached[0]}
    try:
        client = ApifyClient(os.environ["APIFY_TOKEN"])
        run = client.actor(actor).call(run_input=run_input, max_total_charge_usd=max_charge, logger=None)
        items = client.dataset(run["defaultDatasetId"]).list_items().items
        listings = _dedupe([normalize(i) for i in items])
        db.cache_set(key, listings)
        return {"listings": listings, "source": "live", "fetched_at": db.now()}
    except Exception:
        if cached:
            return {"listings": cached[1], "source": "cached", "fetched_at": cached[0]}
        raise


def search(make: str, model: str, year_from: int, year_to: int, zip_code: str, radius: int) -> dict:
    """Listings from CarGurus and Cars.com, so one scrape does not decide the valuation. Either may fail alone.

    Returns {"listings": [...], "source": "live" | "cached" | "demo", "fetched_at": ISO time or None,
    "sources": [{"name", "source", "fetched_at", "count"}], "unavailable": ["Cars.com: <error>", ...]}.
    """
    if demo_mode():
        listings = [l for l in json.loads(DEMO_LISTINGS.read_text())
                    if l["make"].lower() == make.lower() and l["model"].lower() == model.lower()
                    and year_from <= l["year"] <= year_to]
        return {"listings": listings, "source": "demo", "fetched_at": None,
                "sources": [{"name": "Demo listings", "source": "demo", "fetched_at": None, "count": len(listings)}],
                "unavailable": []}

    args = (make, model, year_from, year_to, zip_code, radius)
    cg_input, cg_key = run_input_and_key(*args)
    cc_input, cc_key = carscom_input_and_key(*args)
    providers = [
        ("CarGurus", cg_key, CARGURUS_ACTOR, cg_input, MAX_CHARGE_USD, _normalize),
        ("Cars.com", cc_key, CARSCOM_ACTOR, cc_input, CARSCOM_MAX_CHARGE_USD, _normalize_carscom),
    ]
    results, unavailable = [], []
    for name, *run_args in providers:
        try:
            results.append(dict(_run(*run_args), name=name))
        except Exception as e:
            unavailable.append(f"{name}: {e}")
    if not results:
        raise RuntimeError("; ".join(unavailable))
    return {
        "listings": _dedupe([l for r in results for l in r["listings"]]),
        "source": "live" if any(r["source"] == "live" for r in results) else "cached",
        "fetched_at": results[0]["fetched_at"],
        "sources": [{"name": r["name"], "source": r["source"], "fetched_at": r["fetched_at"], "count": len(r["listings"])}
                    for r in results],
        "unavailable": unavailable,
    }
