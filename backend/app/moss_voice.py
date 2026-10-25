"""Moss semantic retrieval for the claim voice assistant. User audio and claim facts are not indexed."""
import os
import asyncio
from typing import Dict, List

_client = None
_loaded = False
_load_lock = asyncio.Lock()


def available() -> bool:
    return bool(os.environ.get("MOSS_PROJECT_ID") and os.environ.get("MOSS_PROJECT_KEY")
                and os.environ.get("MOSS_INDEX_NAME", "totaled-voice-guide"))


async def search(question: str) -> Dict:
    """Search the prebuilt public Totaled guidance index; do not send claim-specific facts to Moss."""
    global _client, _loaded
    if not available():
        raise RuntimeError("MOSS_PROJECT_ID and MOSS_PROJECT_KEY are required")
    from moss import MossClient, QueryOptions

    index_name = os.environ.get("MOSS_INDEX_NAME", "totaled-voice-guide")
    if _client is None:
        # Model and index files go under /tmp: serverless hosts (Vercel) can't write to the default ~/.cache.
        os.environ.setdefault("MOSS_MODEL_CACHE_DIR", "/tmp/moss-models")
        _client = MossClient(project_id=os.environ["MOSS_PROJECT_ID"],
                             project_key=os.environ["MOSS_PROJECT_KEY"],
                             cache_path=os.environ.get("MOSS_CACHE_PATH", "/tmp/moss-cache"))
    if not _loaded:
        async with _load_lock:
            if not _loaded:
                await _client.load_index(index_name)
                _loaded = True
    result = await _client.query(index_name, question, QueryOptions(top_k=5, alpha=0.8))
    docs: List[Dict] = [
        {"id": str(doc.id), "text": str(doc.text), "score": float(doc.score)}
        for doc in result.docs
    ]
    return {"docs": docs, "time_ms": getattr(result, "time_taken_ms", None)}
