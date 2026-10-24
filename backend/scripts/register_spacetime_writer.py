"""One-time setup: create a SpacetimeDB identity for the backend and register it as the tracker's only writer.

Run from backend/ after publishing the module:
    .venv/bin/python scripts/register_spacetime_writer.py totaled-live
Then set SPACETIME_DB and the printed SPACETIME_TOKEN in the backend environment.
"""
import os
import sys

import requests

HOST = os.environ.get("SPACETIME_HOST", "https://maincloud.spacetimedb.com")
db = sys.argv[1]

r = requests.post(f"{HOST}/v1/identity", timeout=30)
r.raise_for_status()
token = r.json()["token"]

r = requests.post(f"{HOST}/v1/database/{db}/call/claim_writer", json=[],
                  headers={"Authorization": f"Bearer {token}"}, timeout=30)
r.raise_for_status()
print(f"SPACETIME_DB={db}\nSPACETIME_TOKEN={token}")
