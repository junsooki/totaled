"""Decode a VIN with NHTSA's free vPIC API (no key)."""
import re

import requests

VPIC = "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/{vin}?format=json"
VIN_RE = re.compile(r"^[A-HJ-NPR-Z0-9]{17}$")  # VINs never use I, O or Q


def decode(vin: str) -> dict:
    vin = vin.strip().upper()
    if not VIN_RE.match(vin):
        raise ValueError("A VIN is 17 letters and digits, without I, O or Q")
    r = requests.get(VPIC.format(vin=vin), timeout=20)
    r.raise_for_status()
    res = r.json()["Results"][0]
    codes = {c.strip() for c in (res.get("ErrorCode") or "0").split(",")}
    if not res.get("Make"):
        raise ValueError(f"NHTSA could not decode this VIN: {res.get('ErrorText')}")
    return {
        "vin": vin,
        "year": int(res["ModelYear"]) if res.get("ModelYear") else None,
        "make": res["Make"].title(),
        "model": res.get("Model") or None,
        "trim": res.get("Trim") or None,
        "body": res.get("BodyClass") or None,
        # Code 1: the check digit is wrong, so a character was probably misread or mistyped.
        "warning": "The VIN's check digit doesn't match: double-check each character" if "1" in codes else None,
    }
