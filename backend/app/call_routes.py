"""The simulated calls: the script with a transcript, and the saved speech for each line."""
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from . import call_audio, calls


def build(require_approved) -> APIRouter:
    router = APIRouter()

    @router.get("/api/claims/{cid}/calls")
    def list_calls(cid: str):
        out = calls.build(require_approved(cid))
        for call in out:
            for turn in call["turns"]:
                turn["audio"] = call_audio.saved_by_key(turn["key"]) is not None
        return {"calls": out}

    @router.get("/api/claims/{cid}/calls/audio/{key}.mp3")
    def call_speech(cid: str, key: str):
        # Only this claim's own lines can be fetched, so the key cannot name an arbitrary file.
        if key not in {t["key"] for c in calls.build(require_approved(cid)) for t in c["turns"]}:
            raise HTTPException(404, "No such line in this call")
        audio = call_audio.saved_by_key(key)
        if audio is None:
            raise HTTPException(404, "No saved audio for this line")
        return Response(audio, media_type="audio/mpeg")

    return router
