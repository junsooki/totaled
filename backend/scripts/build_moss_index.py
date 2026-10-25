"""Create the static Totaled voice-guidance index in the configured Moss project."""
import asyncio
import json
import os
from pathlib import Path

from dotenv import load_dotenv
from moss import DocumentInfo, MossClient

load_dotenv()


async def main():
    project_id = os.environ["MOSS_PROJECT_ID"]
    project_key = os.environ["MOSS_PROJECT_KEY"]
    index_name = os.getenv("MOSS_INDEX_NAME", "totaled-voice-guide")
    source = Path(__file__).resolve().parents[1] / "app" / "fixtures" / "voice_knowledge.json"
    docs = [DocumentInfo(**row) for row in json.loads(source.read_text())]
    client = MossClient(project_id=project_id, project_key=project_key)
    await client.create_index(index_name, docs, model_id="moss-minilm")
    print(f"Created Moss index {index_name!r} with {len(docs)} guidance documents.")


if __name__ == "__main__":
    asyncio.run(main())
