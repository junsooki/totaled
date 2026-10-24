"""Build backend/app/fixtures/demo_cache.json from real runs saved in the local database.

  python scripts/build_demo_cache.py [--db PATH] [--claims ID ...] [--keep-existing] [--fetch-missing] [--fetch-crs]

--claims         ids of the claims (in the database) that ran live on the sample report; default: the two old ones.
--keep-existing  keep the market and crs sections of the current demo_cache.json; rebuild only extraction and letters
                 (no market or CRS lookups).

--fetch-missing  run the Apify searches the scenarios need but the database lacks (paid, capped per run).
--fetch-crs      call the live CRS sandbox for all personas (test people only).
Run from backend/. Reads the keys from backend/.env and never prints them.
"""
import argparse
import json
import os
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path

BACKEND = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(BACKEND / ".env")
os.environ.pop("DATABASE_URL", None)  # always read the local SQLite file

# claims that ran live on the sample report (default; override with --claims)
DEFAULT_CLAIMS = ["9a601339636c", "5c988dd1cf18"]
OUT = BACKEND / "app" / "fixtures" / "demo_cache.json"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.environ.get("SQLITE_PATH", str(BACKEND / "data" / "totaled.db")))
    ap.add_argument("--claims", nargs="+", default=DEFAULT_CLAIMS)
    ap.add_argument("--keep-existing", action="store_true")
    ap.add_argument("--fetch-missing", action="store_true")
    ap.add_argument("--fetch-crs", action="store_true")
    args = ap.parse_args()
    os.environ["SQLITE_PATH"] = args.db  # app.db reads this at import

    from app import comps, crs, db, demo_cache  # noqa: E402
    from app.checks import LOCAL_RADIUS_MI  # noqa: E402

    demo_cache._data["d"] = {}  # an old seed must not answer: fetches here are live

    conn = sqlite3.connect(args.db)
    claims = {}
    for cid in args.claims:
        row = conn.execute("SELECT data FROM claims WHERE id = ?", (cid,)).fetchone()
        if not row:
            sys.exit(f"Claim {cid} not in {args.db}")
        claims[cid] = json.loads(row[0])

    out = {"note": "Saved results of real runs; built by backend/scripts/build_demo_cache.py. "
                   "Replaces a paid call only when the same input recurs. DEMO_CACHE=0 turns it off.",
           "market": {}, "extraction": {}, "letters": {}, "crs": {"credit": {}, "seller": {}}}

    if args.keep_existing:
        old = json.loads(OUT.read_text())
        out["market"], out["crs"] = old["market"], old["crs"]

    # Extraction: the raw Claude read had no ZIP or note; the user typed those later.
    first = None
    for label, d in claims.items():
        raw = dict(d["claim"], owner_zip="", loss_note=None)
        pdf_key = demo_cache.pdf_hash(__import__("base64").b64decode(d["pdf"]))
        if first is None:
            first = raw
        elif raw != first:
            diff = sorted(k for k in set(raw) | set(first) if raw.get(k) != first.get(k))
            print(f"extraction {label} differs from first in: {diff}; keeping the first")
        else:
            print(f"extraction {label} equals the first (after zip reset)")
        out["extraction"].setdefault(pdf_key, first)
    print("sample pdf hashes:", sorted(out["extraction"]))

    # Letters
    for label, d in claims.items():
        sents = [{"text": s["text"], "citations": s["citations"]} for s in d["letter"]["sentences"]]
        out["letters"][demo_cache.evidence_hash(d["evidence"])] = {"sentences": sents}
        print(f"letter {label}: {len(sents)} sentences")

    # Market searches the claims use
    needed = {}  # key -> (description, search arguments)
    for label, d in claims.items():
        v, z = d["claim"]["vehicle"], d["claim"]["owner_zip"]
        for what, y2 in (("audit", v["year"]), ("replace", v["year"] + 2)):
            args_ = (v["make"], v["model"], v["year"], y2, z, LOCAL_RADIUS_MI)
            needed[comps.run_input_and_key(*args_)[1]] = (f"{label} {what} zip={z!r}", args_)
    missing = []
    for key, (what, _) in ({} if args.keep_existing else needed).items():
        hit = db.cache_get(key)
        if not hit:
            missing.append(key)
        print(f"market {key} ({what}): " + (f"{len(hit[1])} listings" if hit else "MISSING"))
    if args.fetch_missing:
        for key in missing:
            what, args_ = needed[key]
            res = comps.search(*args_)
            print(f"fetched {key} ({what}): source={res['source']}, {len(res['listings'])} listings, "
                  f"capped at ${comps.MAX_CHARGE_USD} per run")
    for key, (what, _) in ({} if args.keep_existing else needed).items():
        hit = db.cache_get(key)
        if hit:
            out["market"][key] = {"at": hit[0], "listings": hit[1]}
        else:
            print(f"market {key} ({what}) still missing, not seeded")

    # CRS sandbox, all personas
    if args.fetch_crs:
        failed = []
        for p in crs.PERSONAS:
            for kind, fn in (("credit", crs.credit_summary), ("seller", crs.seller_check)):
                try:
                    r = fn(p["id"], False)
                    r["saved_at"] = datetime.now(timezone.utc).isoformat()
                    out["crs"][kind][p["id"]] = r
                except Exception as e:
                    failed.append(f"{p['id']} {kind}: {type(e).__name__}")
                    print(f"CRS {p['id']} {kind} failed: {type(e).__name__}")
        print(f"CRS saved: {len(out['crs']['credit'])} credit, {len(out['crs']['seller'])} seller; failed: {failed or 'none'}")

    OUT.write_text(json.dumps(out, indent=1))
    print(f"wrote {OUT} ({OUT.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
