"""When a case stops being routine. Fixed rules on the user's answers and the gap; never a rating of case strength."""
from typing import Optional

# California small claims limit for an individual (Code Civ. Proc. § 116.221). Confirm before relying on it.
SMALL_CLAIMS_LIMIT = 12_500

# The four yes/no questions asked at upload: key -> (question, plain reason shown when the answer is yes).
QUESTIONS = {
    "injured": ("Was anyone injured?",
                "Injury claims have their own rules and deadlines, and this app does not check them."),
    "fault_disputed": ("Is fault disputed?",
                       "Who pays depends on fault, and this app cannot decide fault."),
    "rideshare_or_commercial": ("Was a rideshare or commercial vehicle involved?",
                                "More than one policy may apply, often from different insurers."),
    "other_at_fault_drivers": ("Could other drivers share the fault?",
                               "Several insurers may share the claim and point at each other."),
}


def escalate(situation: Optional[dict], gap: Optional[float]) -> dict:
    """Which rules fired. Each reason says what triggered it and why that matters."""
    reasons = [{"because": QUESTIONS[k][0].replace("?", ": yes"), "why": QUESTIONS[k][1]}
               for k in QUESTIONS if (situation or {}).get(k)]
    if gap is not None and gap > SMALL_CLAIMS_LIMIT:
        reasons.append({"because": f"The gap (${gap:,.0f}) is over the ${SMALL_CLAIMS_LIMIT:,} small claims limit",
                        "why": "Small claims court cannot award the full amount, so another route may be needed."})
    return {"recommended": bool(reasons), "reasons": reasons}
