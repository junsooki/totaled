"""Render the simulated calls (and the spoken briefing) to saved speech in app/fixtures/call/.

  python scripts/build_call_audio.py --claim ID [--yes] [--no-briefing]

--claim     id of a finished local claim on the sample report (letter approved, policy and letter loaded)
--yes       actually call Cartesia; without it the script only prints how many characters it would send
Voices: the owner's lines use CARTESIA_OWNER_VOICE_ID (a clone of the presenter's own voice), the adjuster uses
CARTESIA_ADJUSTER_VOICE_ID, the briefing uses the stock voice in app/cartesia.py. Lines that already have a file are skipped.
The briefing text includes dates counted from the day the letter is approved, so rebuild it on the day you present.
Run from backend/. Reads the keys from backend/.env and never prints them.
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

DEFAULT_ADJUSTER_VOICE = "c46cf1f6-49a1-4d67-9a57-ff859a4046d3"  # "Cora - Service Specialist", a stock voice


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.environ.get("SQLITE_PATH", str(BACKEND / "data" / "totaled.db")))
    ap.add_argument("--claim", required=True)
    ap.add_argument("--yes", action="store_true")
    ap.add_argument("--no-briefing", action="store_true")
    args = ap.parse_args()
    os.environ["SQLITE_PATH"] = args.db

    from app import call_audio, calls, cartesia, playbook  # noqa: E402

    row = sqlite3.connect(args.db).execute("SELECT data FROM claims WHERE id = ?", (args.claim,)).fetchone()
    if not row:
        sys.exit(f"Claim {args.claim} not in {args.db}")
    data = json.loads(row[0])
    if not (data.get("letter") or {}).get("approved_at"):
        sys.exit("That claim's letter is not approved yet")

    owner_voice = os.environ.get("CARTESIA_OWNER_VOICE_ID")
    adjuster_voice = os.environ.get("CARTESIA_ADJUSTER_VOICE_ID", DEFAULT_ADJUSTER_VOICE)
    lines = [(t["speaker"], t["text"], owner_voice if t["speaker"] == "owner" else adjuster_voice)
             for c in calls.build(data) for t in c["turns"]]
    if not args.no_briefing:
        lines.append(("briefing", playbook.briefing(data), None))
    if any(role == "owner" for role, _, _ in lines) and not owner_voice:
        sys.exit("Set CARTESIA_OWNER_VOICE_ID (the id of your cloned voice) in backend/.env or the environment")

    todo = [(role, text, voice) for role, text, voice in lines if call_audio.saved(role, text) is None]
    chars = sum(len(text) for _, text, _ in todo)
    print(f"{len(lines)} lines, {len(todo)} without audio, {chars} characters to send to Cartesia")
    if not args.yes:
        print("Dry run. Add --yes to render.")
        return
    call_audio.DIR.mkdir(parents=True, exist_ok=True)
    for i, (role, text, voice) in enumerate(todo, 1):
        audio = cartesia.speak(text, voice)
        (call_audio.DIR / f"{call_audio.key(role, text)}.mp3").write_bytes(audio)
        print(f"{i}/{len(todo)} {role}: {len(audio) / 1024:.0f} KB")
    print(f"saved in {call_audio.DIR}")


if __name__ == "__main__":
    main()
