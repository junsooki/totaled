"""Report claim progress to the SpacetimeDB live tracker (no-op unless SPACETIME_DB and SPACETIME_TOKEN are set)."""
import json
import logging
import os

import requests

HOST = os.environ.get("SPACETIME_HOST", "https://maincloud.spacetimedb.com")
DB = os.environ.get("SPACETIME_DB")
TOKEN = os.environ.get("SPACETIME_TOKEN")


def enabled() -> bool:
    return bool(DB and TOKEN)


def report(cid: str, kind: str, detail: dict, data: dict):
    """Send one step. Only non-personal fields leave the backend: ids, car, amounts, step names."""
    if not enabled():
        return
    v = data["claim"]["vehicle"]
    co = (data.get("audit") or {}).get("counteroffer") or {}
    payout = data.get("payout") or {}
    np_ = payout.get("at_counteroffer") or payout.get("at_offer") or {}
    args = [
        cid,
        kind,
        json.dumps(detail),
        f"{v['year']} {v['make']} {v['model']} {v.get('trim') or ''}".strip(),
        float(data["claim"]["offer"]["total"]),
        float(co.get("total") or 0),
        int((data.get("audit") or {}).get("failed") or 0),
        float(np_.get("walk_away") or 0),
        float((data.get("purchase") or {}).get("total") or 0),
    ]
    try:
        r = requests.post(f"{HOST}/v1/database/{DB}/call/record_event", json=args,
                          headers={"Authorization": f"Bearer {TOKEN}"}, timeout=5)
        r.raise_for_status()
    except requests.RequestException as e:  # the tracker is a side channel; never fail the claim over it
        logging.warning("SpacetimeDB report failed: %s", e)
