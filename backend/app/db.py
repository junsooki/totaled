"""Claim records and audit trail: one JSON document per claim.

SQLite by default; Postgres (e.g. Supabase) when DATABASE_URL is set.
"""
import json
import logging
import os
import sqlite3
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Callable, Optional, Tuple

from . import live

DATABASE_URL = os.environ.get("DATABASE_URL")
SQLITE_PATH = Path(os.environ.get("SQLITE_PATH", Path(__file__).resolve().parent.parent / "data" / "totaled.db"))
CLAIM_RETENTION_DAYS = max(1, int(os.environ.get("CLAIM_RETENTION_DAYS", "30")))


def _connect():
    if DATABASE_URL:
        import psycopg
        return psycopg.connect(DATABASE_URL, autocommit=True, prepare_threshold=None), "%s"  # pooler-safe
    SQLITE_PATH.parent.mkdir(parents=True, exist_ok=True)
    return sqlite3.connect(SQLITE_PATH, isolation_level=None), "?"


def _init():
    conn, _ = _connect()
    conn.execute("CREATE TABLE IF NOT EXISTS claims (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, data TEXT NOT NULL)")
    conn.execute("CREATE TABLE IF NOT EXISTS events (claim_id TEXT NOT NULL, at TEXT NOT NULL, kind TEXT NOT NULL, "
                 "detail TEXT NOT NULL)")
    conn.execute("CREATE TABLE IF NOT EXISTS market_cache (key TEXT PRIMARY KEY, at TEXT NOT NULL, data TEXT NOT NULL)")
    if DATABASE_URL:  # Supabase exposes public tables over its REST API; RLS with no policies blocks that
        for t in ("claims", "events", "market_cache"):
            conn.execute(f"ALTER TABLE {t} ENABLE ROW LEVEL SECURITY")
    conn.close()


_init()


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def create(data: dict) -> str:
    prune_expired_claims()
    cid = uuid.uuid4().hex
    conn, p = _connect()
    conn.execute(f"INSERT INTO claims (id, created_at, data) VALUES ({p}, {p}, {p})", (cid, now(), json.dumps(data)))
    conn.close()
    log(cid, "created", {})
    return cid


def get(cid: str) -> dict:
    conn, p = _connect()
    row = conn.execute(f"SELECT data FROM claims WHERE id = {p}", (cid,)).fetchone()
    conn.close()
    if not row:
        raise KeyError(cid)
    return json.loads(row[0])


def update(cid: str, **fields) -> dict:
    conn, p = _connect()
    try:
        conn.execute("BEGIN" if DATABASE_URL else "BEGIN IMMEDIATE")
        lock = " FOR UPDATE" if DATABASE_URL else ""
        row = conn.execute(f"SELECT data FROM claims WHERE id = {p}{lock}", (cid,)).fetchone()
        if not row:
            raise KeyError(cid)
        data = json.loads(row[0])
        data.update(fields)
        conn.execute(f"UPDATE claims SET data = {p} WHERE id = {p}", (json.dumps(data), cid))
        conn.commit()
        return data
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def mutate(cid: str, change: Callable[[dict], dict], event: Optional[Tuple[str, dict]] = None) -> dict:
    """Atomically read and change a claim, optionally recording its event in the same transaction."""
    conn, p = _connect()
    try:
        conn.execute("BEGIN" if DATABASE_URL else "BEGIN IMMEDIATE")
        lock = " FOR UPDATE" if DATABASE_URL else ""
        row = conn.execute(f"SELECT data FROM claims WHERE id = {p}{lock}", (cid,)).fetchone()
        if not row:
            raise KeyError(cid)
        data = change(json.loads(row[0]))
        conn.execute(f"UPDATE claims SET data = {p} WHERE id = {p}", (json.dumps(data), cid))
        if event:
            kind, detail = event
            conn.execute(f"INSERT INTO events (claim_id, at, kind, detail) VALUES ({p}, {p}, {p}, {p})",
                         (cid, now(), kind, json.dumps(detail)))
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
    if event and live.enabled():
        try:
            live.report(cid, event[0], event[1], data)
        except Exception:
            logging.exception("SpacetimeDB event failed after claim update (%s)", event[0])
    return data


def log(cid: str, kind: str, detail: dict):
    """Audit trail. Callers pass only non-personal details (ids, amounts, statuses)."""
    conn, p = _connect()
    conn.execute(f"INSERT INTO events (claim_id, at, kind, detail) VALUES ({p}, {p}, {p}, {p})",
                 (cid, now(), kind, json.dumps(detail)))
    conn.close()
    if live.enabled() and kind != "created":  # "created" comes before the claim fields exist
        live.report(cid, kind, detail, get(cid))


def events(cid: str) -> list:
    conn, p = _connect()
    rows = conn.execute(f"SELECT at, kind, detail FROM events WHERE claim_id = {p} ORDER BY at", (cid,)).fetchall()
    conn.close()
    return [{"at": a, "kind": k, "detail": json.loads(d)} for a, k, d in rows]


def cache_get(key: str):
    """Last saved market search for this key: (saved_at ISO string, listings) or None."""
    conn, p = _connect()
    row = conn.execute(f"SELECT at, data FROM market_cache WHERE key = {p}", (key,)).fetchone()
    conn.close()
    return (row[0], json.loads(row[1])) if row else None


def cache_set(key: str, listings: list):
    conn, p = _connect()
    conn.execute(f"INSERT INTO market_cache (key, at, data) VALUES ({p}, {p}, {p}) "
                 "ON CONFLICT (key) DO UPDATE SET at = excluded.at, data = excluded.data",
                 (key, now(), json.dumps(listings)))
    conn.close()


def prune_expired_claims() -> int:
    """Delete expired claim documents and their audit events from the private application database."""
    cutoff = (datetime.now(timezone.utc) - timedelta(days=CLAIM_RETENTION_DAYS)).isoformat()
    conn, p = _connect()
    try:
        conn.execute("BEGIN" if DATABASE_URL else "BEGIN IMMEDIATE")
        rows = conn.execute(f"SELECT id FROM claims WHERE created_at < {p}", (cutoff,)).fetchall()
        for (cid,) in rows:
            conn.execute(f"DELETE FROM events WHERE claim_id = {p}", (cid,))
            conn.execute(f"DELETE FROM claims WHERE id = {p}", (cid,))
        conn.commit()
        return len(rows)
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


prune_expired_claims()
