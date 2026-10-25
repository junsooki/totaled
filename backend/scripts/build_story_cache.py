"""Save Claude's reading of an accident account into demo_cache.json ("stories"), so the demo's spoken account is instant.

  python scripts/build_story_cache.py "On October 3rd ..." [more text ...]

Makes one live Claude call per account (a few cents). A later run with the same words (spacing and punctuation
ignored) is answered from the saved result, with or without a key. Run from backend/; never prints the key.
"""
import json
import os
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(BACKEND / ".env")

OUT = BACKEND / "app" / "fixtures" / "demo_cache.json"


def main():
    text = " ".join(sys.argv[1:]).strip()
    if len(text) < 3:
        sys.exit(__doc__)
    os.environ["DEMO_CACHE"] = "0"  # read it live, not from an older saved copy

    from app import ai, demo_cache, story  # noqa: E402

    if not ai.available():
        sys.exit("ANTHROPIC_API_KEY is not set")
    result = story.read(text)
    print(f"timeline: {len(result['timeline'])}, answers: {len(result['answers'])}, dropped: {result['dropped']}")
    cache = json.loads(OUT.read_text())
    cache.setdefault("stories", {})[demo_cache.story_hash(text)] = result
    OUT.write_text(json.dumps(cache, indent=1))
    print(f"saved in {OUT}")


if __name__ == "__main__":
    main()
