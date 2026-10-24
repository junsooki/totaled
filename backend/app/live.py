"""SpacetimeDB: Totaled's real-time core (no-op unless SPACETIME_DB and SPACETIME_TOKEN are set).

The backend is the only identity allowed to write claim progress, agent steps and auctions; dealers bid
directly from their own browsers, and SpacetimeDB enforces the bidding rules.
"""
import json
import logging
import os
from typing import List

import requests

HOST = os.environ.get("SPACETIME_HOST", "https://maincloud.spacetimedb.com")
DB = os.environ.get("SPACETIME_DB")
TOKEN = os.environ.get("SPACETIME_TOKEN")


def enabled() -> bool:
    return bool(DB and TOKEN)


def _call(reducer: str, args: list, strict: bool = False):
    try:
        r = requests.post(f"{HOST}/v1/database/{DB}/call/{reducer}", json=args,
                          headers={"Authorization": f"Bearer {TOKEN}"}, timeout=10)
        r.raise_for_status()
    except requests.RequestException as e:
        if strict:  # the caller depends on this write (auctions)
            detail = getattr(e.response, "text", "") if getattr(e, "response", None) is not None else ""
            raise RuntimeError(f"SpacetimeDB {reducer} failed: {detail or e}")
        logging.warning("SpacetimeDB %s failed: %s", reducer, e)  # progress feed is a side channel


def sql(query: str) -> List[dict]:
    """Run a read query and return rows as dicts."""
    r = requests.post(f"{HOST}/v1/database/{DB}/sql", data=query,
                      headers={"Authorization": f"Bearer {TOKEN}"}, timeout=10)
    r.raise_for_status()
    result = r.json()[0]
    names = [(e.get("name") or {}).get("some") for e in result["schema"]["elements"]]
    return [dict(zip(names, row)) for row in result["rows"]]


def report(cid: str, kind: str, detail: dict, data: dict):
    """Claim progress for the live tracker. Only non-personal fields: ids, car, amounts, step names."""
    if not enabled():
        return
    v = data["claim"]["vehicle"]
    co = (data.get("audit") or {}).get("counteroffer") or {}
    payout = data.get("payout") or {}
    np_ = payout.get("at_counteroffer") or payout.get("at_offer") or {}
    _call("record_event", [
        cid,
        kind,
        json.dumps(detail),
        f"{v['year']} {v['make']} {v['model']} {v.get('trim') or ''}".strip(),
        float(data["claim"]["offer"]["total"]),
        float(co.get("total") or 0),
        int((data.get("audit") or {}).get("failed") or 0),
        float(np_.get("walk_away") or 0),
        float((data.get("purchase") or {}).get("total") or 0),
    ])


def agent(cid: str, name: str, status: str, text: str):
    """One step of an AI agent's work, shown live: status is working | done | error."""
    if enabled():
        _call("record_agent_step", [cid, name, status, text])


def open_auction(cid: str, wanted: str, budget: float, buyer_verified: bool, financing: float, zip3: str,
                 duration_secs: int):
    _call("open_auction", [cid, wanted, budget, buyer_verified, financing, zip3, duration_secs], strict=True)


def award(cid: str, bid_id: int):
    _call("award_bid", [cid, bid_id], strict=True)
