"""Saved speech for the simulated calls and the spoken briefing (fixtures/call/), built once by scripts/build_call_audio.py.

A file is found by the voice role and the exact text, so a changed script simply has no audio until it is rebuilt.
"""
import hashlib
from pathlib import Path
from typing import Optional

DIR = Path(__file__).resolve().parent / "fixtures" / "call"


def key(role: str, text: str) -> str:
    return hashlib.sha256(f"{role}|{text}".encode()).hexdigest()[:16]


def saved_by_key(k: str) -> Optional[bytes]:
    path = DIR / f"{k}.mp3"
    return path.read_bytes() if path.is_file() else None


def saved(role: str, text: str) -> Optional[bytes]:
    return saved_by_key(key(role, text))
