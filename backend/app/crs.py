"""CRS sandbox: credit report for the net payout, identity and liens for the seller check.

Sandbox test personas only, never real people. The product calls the REST API directly.
"""
import json
import os
import re
import time
from pathlib import Path
from typing import Optional

import requests

BASE = "https://api-sandbox.stitchcredit.com/api"
PERSONAS = json.loads((Path(__file__).resolve().parent / "fixtures" / "crs_personas.json").read_text())["personas"]
AUTO_LOAN_TYPES = {"Automobile", "AutoRefinance", "AutoLoanEquityTransfer", "AutoLease"}

_token = {"value": None, "at": 0.0}


def available() -> bool:
    return bool(os.environ.get("CRS_USERNAME") and os.environ.get("CRS_PASSWORD"))


def demo_mode() -> bool:
    return os.environ.get("DEMO_MODE") == "1" and not available()


def persona(pid: str) -> dict:
    for p in PERSONAS:
        if p["id"] == pid:
            return p
    raise KeyError(f"Unknown persona {pid}")


def _auth() -> dict:
    if not _token["value"] or time.time() - _token["at"] > 30 * 60:
        r = requests.post(f"{BASE}/users/login", json={"username": os.environ["CRS_USERNAME"],
                                                        "password": os.environ["CRS_PASSWORD"]}, timeout=30)
        r.raise_for_status()
        _token.update(value=r.json()["token"], at=time.time())
    return {"Authorization": f"Bearer {_token['value']}", "Accept": "application/json"}


def _post(path: str, body: dict) -> dict:
    r = requests.post(f"{BASE}{path}", json=body, headers=_auth(), timeout=60)
    if r.status_code == 401:  # token expired early: log in again once
        _token["value"] = None
        r = requests.post(f"{BASE}{path}", json=body, headers=_auth(), timeout=60)
    r.raise_for_status()
    return r.json()


def _num(x) -> Optional[float]:
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


# --- Net payout -------------------------------------------------------------

# Illustrative prequalification tiers: our assumption, not a lender's offer.
TIERS = [(720, 0.065, 30000), (660, 0.095, 22000), (600, 0.14, 12000)]


def _prequal(score: Optional[int]) -> dict:
    if score is None:
        return {"decision": "REVIEW", "apr": None, "max_amount": 0, "note": "No score on file"}
    for floor, apr, amount in TIERS:
        if score >= floor:
            return {"decision": "PREQUALIFIED", "apr": apr, "max_amount": amount, "note": f"Score {score} ≥ {floor}"}
    return {"decision": "DECLINE", "apr": None, "max_amount": 0, "note": f"Score {score} below 600"}


def credit_summary(pid: str, demo: bool) -> dict:
    p = persona(pid)
    if demo:
        m = re.search(r"\b(\d{3})\b", p["expected"]["credit"])
        score = int(m.group(1)) if m else None
        # Demo: a synthetic open auto loan so the walk-away math has something to show.
        loans = [{"creditor": "DEMO AUTO FINANCE", "balance": 13500.0, "monthly_payment": 389.0, "opened": "2022-03-01"}]
        return {"persona": pid, "name": p["name"], "score": score, "score_model": "VantageScore 4.0 (demo)",
                "auto_loans": loans, "errors": [], "file_status": "FileReturned", "source": "demo"}

    report = _post("/experian/credit-report/standard/exp-prequal-vantage4", p["credit_body"])
    errors = [e.get("creditErrorMessageText") for e in (report.get("errorMessages") or [])]
    files = report.get("creditFiles") or []
    status = (files[0].get("creditFileDetail") or {}).get("creditFileResultStatusType") if files else None
    score, model = None, None
    for s in report.get("scores") or []:
        if s.get("scoreValue") not in (None, ""):
            score, model = int(float(s["scoreValue"])), s.get("modelName")
            break
    loans = []
    for t in report.get("tradelines") or []:
        is_auto = t.get("loanType") in AUTO_LOAN_TYPES or t.get("businessType") == "Automotive"
        if is_auto and t.get("accountStatusType") == "Open":
            loans.append({"creditor": t.get("creditorName"), "balance": _num(t.get("currentBalanceAmount")) or 0.0,
                          "monthly_payment": _num(t.get("monthlyPaymentAmount")), "opened": t.get("accountOpenedDate")})
    return {"persona": pid, "name": p["name"], "score": score, "score_model": model, "auto_loans": loans,
            "errors": errors, "file_status": status, "source": "live"}


def net_payout(payout: float, credit: dict, loan_balance: Optional[float], has_gap: Optional[bool]) -> dict:
    if loan_balance is None:
        loan_balance = max((l["balance"] for l in credit["auto_loans"]), default=0.0)
    net = payout - loan_balance
    negative = net < 0
    return {
        "payout": round(payout, 2),
        "loan_balance": round(loan_balance, 2),
        "walk_away": round(net, 2),
        "negative_equity": negative,
        "gap_covers_shortfall": bool(has_gap) if negative else None,
        "prequal": _prequal(credit["score"]),
    }


# --- Seller check -----------------------------------------------------------

def _find_counts(obj, keys=("BankruptciesFound", "JudgmentsFound", "LiensFound")) -> dict:
    found = {}

    def walk(o):
        if isinstance(o, dict):
            for k, v in o.items():
                if k in keys and k not in found:
                    found[k] = int(_num(v) or 0)
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    walk(obj)
    return found


def seller_check(pid: str, demo: bool) -> dict:
    p = persona(pid)
    if demo:
        idv_text = p["expected"]["idv"]
        idv = "PASS" if "PASS" in idv_text else ("STEP_UP" if "KBA" in idv_text else "FAIL")
        blj = p["expected"]["blj"].split(": ", 1)[-1]
        records = 0 if blj.strip() == "0/0/0" else 1
        return {"persona": pid, "name": p["name"], "identity": idv, "identity_detail": idv_text,
                "records": records, "records_detail": blj, "verdict": _verdict(idv, records),
                "flags": _flags(idv, records), "source": "demo"}

    sr = _post("/transunion/identity-manager-verification/basic", p["idv_body"])
    msgs = (((sr.get("addOnProducts") or [{}])[0].get("idManagerVerification") or {}).get("messages")) or []
    codes = {str(m.get("code")) for m in msgs}
    idv = "PASS" if not msgs else ("STEP_UP" if codes == {"2401"} else "FAIL")
    try:
        counts = _find_counts(_post("/pp/fcrablj/data", p["blj_body"]))
    except requests.HTTPError as e:  # I008 = no hit, which means no records
        if e.response is not None and "I008" in e.response.text:
            counts = {}
        else:
            raise
    records = sum(counts.values())
    return {"persona": pid, "name": p["name"], "identity": idv,
            "identity_detail": "; ".join(f"{m.get('code')}: {m.get('text')}" for m in msgs) or "Identity verified",
            "records": records, "records_detail": ", ".join(f"{k} {v}" for k, v in counts.items()) or "No records",
            "verdict": _verdict(idv, records), "flags": _flags(idv, records), "source": "live"}


def _verdict(idv: str, records: int) -> str:
    if idv == "FAIL":
        return "STOP: identity does not verify"
    if records:
        return "CAUTION: liens or judgments on record; confirm the title is clear"
    if idv == "STEP_UP":
        return "CAUTION: fraud alert; ask for more proof of identity"
    return "OK: identity verified, no liens or judgments"


def _flags(idv: str, records: int) -> list:
    """Each red flag in plain words. The deposit stays locked while any flag is open."""
    flags = []
    if idv == "FAIL":
        flags.append("Identity mismatch: the seller's name, Social Security number or date of birth does not verify.")
    if idv == "STEP_UP":
        flags.append("Fraud alert on file: the seller has to prove who they are before any money moves.")
    if records:
        flags.append("Lien not cleared: liens or judgments are on record. A lien can follow the car, so get the title "
                     "and a lien release first.")
    return flags
