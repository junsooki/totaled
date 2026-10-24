from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

from .comps import fetch_comps  # noqa: E402
from .valuation import fair_value  # noqa: E402

app = FastAPI(title="Totaled")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Claim(BaseModel):
    year: int
    make: str
    model: str
    trim: Optional[str] = None
    mileage: int
    zip: str
    radius: int = 100
    offer: int


@app.post("/api/appraise")
def appraise(claim: Claim):
    try:
        result = fetch_comps(claim.year, claim.make, claim.model, claim.mileage, claim.zip, claim.radius)
    except Exception as e:
        raise HTTPException(502, f"Could not fetch comparables: {e}")

    value = fair_value(result["listings"], claim.mileage)
    return {
        "offer": claim.offer,
        "fair_value": value,
        "gap": value["estimate"] - claim.offer if value else None,
        "cached": result["cached"],
        "listings": result["listings"],
    }
