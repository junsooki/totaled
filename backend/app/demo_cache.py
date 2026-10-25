"""Saved results of real runs (fixtures/demo_cache.json), used in place of a slow paid call when the input recurs.

Built by scripts/build_demo_cache.py. Set DEMO_CACHE=0 to turn it off.
"""
import copy
import hashlib
import json
import os
from pathlib import Path
from typing import Optional

PATH = Path(__file__).resolve().parent / "fixtures" / "demo_cache.json"
_data = {}


def _load() -> dict:
    if os.environ.get("DEMO_CACHE") == "0":
        return {}
    if "d" not in _data:
        try:
            _data["d"] = json.loads(PATH.read_text())
        except (OSError, ValueError):
            _data["d"] = {}
    return _data["d"]


def evidence_hash(evidence: list) -> str:
    key = json.dumps([[e["id"], e["fact"]] for e in evidence], sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(key.encode()).hexdigest()


def pdf_hash(pdf: bytes) -> str:
    return hashlib.sha256(pdf).hexdigest()


def _get(section: dict, key: str) -> Optional[dict]:
    hit = section.get(key)
    return copy.deepcopy(hit) if hit else None  # callers may edit what they get


def document(pdf: bytes) -> Optional[dict]:
    return _get(_load().get("documents", {}), pdf_hash(pdf))


def market(key: str) -> Optional[dict]:
    return _get(_load().get("market", {}), key)


def extraction(pdf: bytes) -> Optional[dict]:
    return _get(_load().get("extraction", {}), pdf_hash(pdf))


def letter(evidence: list) -> Optional[dict]:
    return _get(_load().get("letters", {}), evidence_hash(evidence))


def credit(pid: str) -> Optional[dict]:
    return _get(_load().get("crs", {}).get("credit", {}), pid)


def seller(pid: str) -> Optional[dict]:
    return _get(_load().get("crs", {}).get("seller", {}), pid)
