"""Cartesia text to speech for the spoken case briefing. A stock voice, never a clone of a real person."""
import os

import requests

URL = "https://api.cartesia.ai/tts/bytes"
VERSION = "2025-04-16"
MODEL = "sonic-3"
VOICE = os.environ.get("CARTESIA_VOICE_ID", "47c38ca4-5f35-497b-b1a3-415245fb35e1")  # "Daniel - Modern Assistant"


def available() -> bool:
    return bool(os.environ.get("CARTESIA_API_KEY"))


def speak(text: str, voice: str = None) -> bytes:
    r = requests.post(URL, timeout=60, headers={
        "X-API-Key": os.environ["CARTESIA_API_KEY"], "Cartesia-Version": VERSION, "Content-Type": "application/json",
    }, json={
        "model_id": MODEL, "transcript": text, "language": "en",
        "voice": {"mode": "id", "id": voice or VOICE},
        "output_format": {"container": "mp3", "sample_rate": 44100, "bit_rate": 128000},
    })
    if r.status_code != 200:
        raise RuntimeError(f"Cartesia returned {r.status_code}: {r.text[:200]}")
    return r.content
