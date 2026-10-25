"""Save Claude's answer to one question about one finished local claim into demo_cache.json ("asks").

  python scripts/build_ask_cache.py --claim ID "Where does my case stand?"

--claim  id of a local claim that went through the whole demo flow, so its case file matches the one shown on stage
Makes one live Claude call (a few cents). The saved answer is used only when the same question (spacing and punctuation
ignored) is asked on a case file with the same facts; any other question still goes to Claude. Run from backend/;
never prints the key.
"""
import argparse
import json
import os
import sqlite3
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(BACKEND / ".env")
os.environ.pop("DATABASE_URL", None)  # always read the local SQLite file
OUT = BACKEND / "app" / "fixtures" / "demo_cache.json"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.environ.get("SQLITE_PATH", str(BACKEND / "data" / "totaled.db")))
    ap.add_argument("--claim", required=True)
    ap.add_argument("question")
    args = ap.parse_args()
    os.environ["DEMO_CACHE"] = "0"  # answer live, not from an older saved copy

    from app import ai, ask, demo_cache  # noqa: E402

    if not ai.available():
        sys.exit("ANTHROPIC_API_KEY is not set")
    row = sqlite3.connect(args.db).execute("SELECT data FROM claims WHERE id = ?", (args.claim,)).fetchone()
    if not row:
        sys.exit(f"Claim {args.claim} not in {args.db}")
    data = json.loads(row[0])
    result = ask.answer(args.question, data, [])
    print(f"found: {result['found']}, {len(result['sentences'])} sentences")
    for s in result["sentences"]:
        print(f"  - {s['text']}  {s['citations']}")
    if not result["found"]:
        sys.exit("No answer to save")
    key = demo_cache.ask_hash(args.question, ask.sources(data))
    orig = OUT.read_text(encoding="utf-8")
    cache = json.loads(orig)
    asks = cache.get("asks", {})
    asks[key] = result
    entry = json.dumps(asks, indent=1).replace("\n", "\n ")
    if "asks" in cache:  # replace the section in place
        cache["asks"] = asks
        OUT.write_text(json.dumps(cache, indent=1), encoding="utf-8")
    else:  # append the section and leave the rest of the file as it is
        body = orig.rstrip()
        OUT.write_text(body[:-1].rstrip() + ',\n "asks": ' + entry + "\n}\n", encoding="utf-8")
    json.loads(OUT.read_text(encoding="utf-8"))
    print(f"saved in {OUT}")


if __name__ == "__main__":
    main()
