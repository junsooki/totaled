"""Warm production before a demo: run the sample through every step once, so nothing cold-starts in front of judges.

Loads each serverless function and the Moss model. Uses the saved demo runs, so it makes no paid Apify search;
it costs one small Claude call (the ask bar). Prints how long each step took.

Run from backend/:  .venv/bin/python scripts/warmup.py [API base URL]
"""
import sys
import time

import requests

BASE = (sys.argv[1] if len(sys.argv) > 1 else "https://totaled-api.vercel.app").rstrip("/")


def step(name, method, path, headers=None, **kw):
    t = time.time()
    r = requests.request(method, f"{BASE}{path}", headers=headers, timeout=300, **kw)
    print(f"{name:<14} {r.status_code}  {time.time() - t:5.1f}s")
    r.raise_for_status()
    return r.json() if "json" in r.headers.get("content-type", "") else None


if __name__ == "__main__":
    step("status", "GET", "/api/status")
    c = step("upload", "POST", "/api/claims")
    cid, h = c["id"], {"x-claim-token": c["access_token"]}
    step("confirm", "PUT", f"/api/claims/{cid}/claim", h, json=c["claim"])
    step("questions", "PUT", f"/api/claims/{cid}/situation", h, json={
        "injured": False, "fault_disputed": True, "rideshare_or_commercial": False, "other_at_fault_drivers": False})
    a = step("audit", "POST", f"/api/claims/{cid}/audit", h)
    step("ask (Moss)", "POST", f"/api/claims/{cid}/ask", h, json={"question": "When is my deadline?"})
    step("policy", "POST", f"/api/claims/{cid}/documents", h, data={"kind": "policy"})
    l = step("letter", "POST", f"/api/claims/{cid}/letter", h)
    step("approve", "POST", f"/api/claims/{cid}/letter/approve", h,
         json={"sentences": [{"text": s["text"], "citations": s["citations"]} for s in l["sentences"]]})
    step("if they say no", "GET", f"/api/claims/{cid}/if-no", h)
    step("payout", "POST", f"/api/claims/{cid}/payout", h, json={"persona": "P01"})
    step("next car", "POST", f"/api/claims/{cid}/replace", h)
    print(f"\nReady. Sample gap ${a['counteroffer']['gap']:,.2f}, {a['failed']} failed checks, letter by {l['drafted_by']}.")
