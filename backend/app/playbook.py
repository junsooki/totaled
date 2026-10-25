"""If they say no: dated next steps, a complaint draft, and an attorney-ready case package.

Built in code from the case file. States what is documented and what is missing; never rates the case.
"""
from datetime import date, datetime, timedelta
from typing import List

from .checks import CHECKS
from .escalate import SMALL_CLAIMS_LIMIT, escalate
from .schemas import Claim

RULE = "10 CCR § 2695.8"
REPLY_DAYS = 15  # 10 CCR § 2695.5(b): respond to claim communications within 15 calendar days
CDI_COMPLAINT_URL = "https://www.insurance.ca.gov/01-consumers/101-help/"
STATE_BAR_SEARCH_URL = "https://apps.calbar.ca.gov/attorney/LicenseeSearch/QuickSearch"
CHECK_NAME = {n: name for n, name, _ in CHECKS}
CHECK_RULE = {n: sec for n, _, sec in CHECKS}

EVENT_TEXT = {
    "created": "Report uploaded", "extracted": "Report read", "confirmed": "Fields confirmed by the owner",
    "situation": "Accident questions answered", "story": "Owner told what happened", "audited": "Offer audited", "letter_drafted": "Counteroffer drafted",
    "letter_approved": "Counteroffer approved by the owner", "payout": "Net payout computed",
    "shortlist": "Replacement cars shortlisted", "seller_check": "Seller checked", "mandate": "Spending mandate granted",
    "deposit": "Refundable deposit placed (test mode)",
}


def _usd(x: float) -> str:
    return f"${x:,.2f}"


def _day(iso: str) -> date:
    return datetime.fromisoformat(iso).date()


def _failed(audit: dict) -> List[int]:
    return sorted({r["check"] for r in audit["checks"] if r["status"] == "fail"})


def _missing(claim: Claim, audit: dict) -> List[str]:
    out = [f"Check {r['check']} ({CHECK_NAME[r['check']]}): {r['detail']}"
           for r in audit["checks"] if r["status"] == "unknown"]
    if claim.offer.registration_prorated is None:
        out.append("The offer does not list prorated registration.")
    if claim.condition.deduction and not claim.condition.documented:
        out.append(f"No inspection notes or photos support the {_usd(claim.condition.deduction)} condition deduction.")
    out.append("Not uploaded: your policy (for the appraisal clause) and the insurer's letters.")
    return out


def _questions(claim: Claim, audit: dict, situation: dict, gap: float) -> List[str]:
    failed = len(_failed(audit))
    q = [
        "Does my policy have an appraisal clause, does it fit this dispute, and who pays the appraisers?",
        f"The audit found {failed} failed checks under {RULE} (listed in the case package). "
        "Do they support anything beyond a revised offer?",
        f"How do you charge (contingency, hourly or flat), and what would that cost against a {_usd(gap)} gap?",
        "Which deadlines apply to me, and which one comes first?",
    ]
    extra = {
        "injured": "How does an injury claim interact with the claim for my car, and what deadlines apply to it?",
        "fault_disputed": "How is fault decided here, and how does it change who pays for my car?",
        "rideshare_or_commercial": "Which policies apply (mine, the driver's, the company's), and in what order?",
        "other_at_fault_drivers": "How is the claim split when several drivers may share fault?",
    }
    return q + [extra[k] for k in extra if situation.get(k)]


def complaint_draft(claim: Claim, audit: dict, approved_at: str) -> str:
    v, o, co, fv = claim.vehicle, claim.offer, audit["counteroffer"], audit["market"]["fair_value"]
    failed = _failed(audit)
    lines = [
        "To the California Department of Insurance,",
        "",
        f"I am filing a complaint about [insurer name], claim number [claim number], for the total loss of my "
        f"{v.year} {v.make} {v.model} {v.trim or ''}".rstrip() + f" (VIN {v.vin or 'unknown'}).",
        f"On {o.offer_date} the insurer offered {_usd(o.total)}.",
    ]
    if failed:
        lines.append(f"The valuation does not meet {RULE} in {len(failed)} ways: "
                     + "; ".join(f"{CHECK_NAME[n]} ({RULE}{CHECK_RULE[n]})" for n in failed) + ".")
    if fv:
        lines.append(f"Current listings for the same car near me put its market value at {_usd(fv['estimate'])}.")
    if co:
        lines.append(f"On {_day(approved_at).isoformat()} I asked in writing for a revised offer of {_usd(co['total'])}.")
    lines += [
        "[Describe the insurer's reply, with its date, or say that no reply came.]",
        "",
        "I ask the Department to review how this claim was valued. My letter and the valuation report are attached.",
        "",
        "Sincerely,",
        "[Your name and phone number]",
    ]
    return "\n".join(lines)


def if_no(data: dict) -> dict:
    claim, audit, letter = Claim(**data["claim"]), data["audit"], data["letter"]
    co = audit["counteroffer"]
    gap = co["gap"] if co else 0.0
    situation = data.get("situation") or {}
    sent = _day(letter["approved_at"])
    reopen = date.fromisoformat(audit["deadline"]["date"])
    small_ok = gap <= SMALL_CLAIMS_LIMIT

    steps = [
        {"date": sent.isoformat(), "step": "Send the approved letter",
         "detail": "Email it to your adjuster or send it by certified mail. Keep a copy and the date you sent it."},
        {"date": (sent + timedelta(days=REPLY_DAYS)).isoformat(), "step": "Expect a written reply",
         "detail": f"Insurers must answer claim letters within {REPLY_DAYS} calendar days (10 CCR § 2695.5(b)). "
                   "If nothing comes, follow up in writing."},
        {"date": reopen.isoformat(), "step": "Tell them if you cannot buy a comparable car",
         "detail": f"Within 35 days of the offer, tell the insurer in writing if you cannot buy a comparable car for "
                   f"the settlement, so it has to reopen the claim ({RULE}(c))."},
        {"date": None, "step": "Ask for an appraisal",
         "detail": "If your policy has an appraisal clause, you and the insurer each pick an appraiser, and an umpire "
                   "settles any difference. Look for \"Appraisal\" in your policy. It is not in your documents yet."},
        {"date": None, "step": "File a complaint with the Department of Insurance",
         "detail": "It is free. The Department asks the insurer to respond. A draft is below."},
        {"date": None, "step": "Small claims court",
         "detail": (f"The {_usd(gap)} gap is within the {_usd(SMALL_CLAIMS_LIMIT)} limit for individuals, "
                    "and you do not need a lawyer there.") if small_ok else
                   (f"The {_usd(gap)} gap is over the {_usd(SMALL_CLAIMS_LIMIT)} limit. Small claims can award only "
                    "up to the limit.")},
    ]
    steps.sort(key=lambda s: (s["date"] is None, s["date"] or ""))
    return {
        "steps": steps,
        "complaint": {"text": complaint_draft(claim, audit, letter["approved_at"]), "url": CDI_COMPLAINT_URL},
        "small_claims": {"limit": SMALL_CLAIMS_LIMIT, "within": small_ok},
        "escalation": escalate(situation, gap),
        "questions": _questions(claim, audit, situation, gap),
        "state_bar_url": STATE_BAR_SEARCH_URL,
    }


def case_package(data: dict, events: List[dict]) -> str:
    """Markdown for an attorney: what is documented, with sources, and what is missing."""
    claim, audit = Claim(**data["claim"]), data["audit"]
    v, o, co, fv = claim.vehicle, claim.offer, audit["counteroffer"], audit["market"]["fair_value"]
    plan = if_no(data)
    sources = {}
    for r in audit["checks"]:
        if r["status"] == "fail" and r.get("source"):
            rid = f"check:{r['check']}" + (f":{r['comparable']}" if r["comparable"] else "")
            sources[rid] = f"report page {r['source']['page']}: \"{r['source']['quote']}\""

    md = [
        f"# Case package: {v.year} {v.make} {v.model} {v.trim or ''}".rstrip(),
        "",
        f"Prepared by Totaled on {date.today().isoformat()}. Not legal advice. Every fact below lists its source. "
        "This package does not rate the strength of the case.",
        "",
        "## Summary",
        "",
        f"- Insurer's offer: {_usd(o.total)} (dated {o.offer_date})",
    ]
    if fv:
        md.append(f"- Market value from {fv['n_comps']} current listings: {_usd(fv['estimate'])} ({fv['method']}, an estimate)")
    if co:
        md += [f"- Counteroffer requested: {_usd(co['total'])}", f"- Gap: {_usd(co['gap'])}"]
    md.append(f"- Failed checks under {RULE}: {len(_failed(audit))} of {len(CHECKS)}")

    md += ["", "## Timeline", ""]
    md.append(f"- {o.offer_date}: Insurer's offer of {_usd(o.total)}")
    for e in events:
        if e["kind"] in EVENT_TEXT:
            md.append(f"- {_day(e['at']).isoformat()}: {EVENT_TEXT[e['kind']]}")
    told = data.get("story") or {}
    if told.get("text"):
        md += ["", "## What happened, in the owner's words", "", told["text"]]
        if told.get("timeline"):
            md += ["", "Timeline read from the account (each line quotes the owner):", ""]
            md += [f"- {e['when'] or 'Time not given'}: {e['event']} (\"{e['quote']}\")" for e in told["timeline"]]
    md += ["", "## Deadlines and next steps", ""]
    md += [f"- {s['date'] or 'Any time'}: {s['step']}. {s['detail']}" for s in plan["steps"]]

    md += ["", "## Evidence index", ""]
    for ev in data.get("evidence") or []:
        md.append(f"- **{ev['id']}**: {ev['fact']}" + (f" (source: {sources[ev['id']]})" if ev["id"] in sources else ""))

    md += ["", f"## Regulations the checks used ({RULE})", ""]
    status = {}
    for r in audit["checks"]:
        status[r["check"]] = "fail" if r["status"] == "fail" or status.get(r["check"]) == "fail" else \
            ("unknown" if r["status"] == "unknown" or status.get(r["check"]) == "unknown" else "pass")
    md += [f"- {n}. {name}, {RULE}{sec}: {status.get(n, 'not run')}" for n, name, sec in CHECKS]

    md += ["", "## Documented and missing", ""]
    md += [f"- Missing: {m}" for m in _missing(claim, audit)]
    esc = plan["escalation"]
    if esc["reasons"]:
        md += ["", "## Why the owner is talking to an attorney", ""]
        md += [f"- {r['because']}. {r['why']}" for r in esc["reasons"]]
    md += ["", "## Questions for the attorney", ""]
    md += [f"- {q}" for q in plan["questions"]]
    letter = data.get("letter") or {}
    if letter.get("approved_at"):
        md += ["", "## Approved counteroffer letter", ""]
        md += [s["text"] for s in letter["sentences"]]
    return "\n".join(md) + "\n"


# How each failed check and each lawyer trigger sounds when read aloud.
SPOKEN_CHECK = {
    1: "comparables that are a different make or model", 2: "comparables that are an older model year",
    3: "comparables too far away or listed too long ago", 4: "comparables with no VIN or seller contact",
    5: "trim, options or mileage that don't match", 6: "adjustments that aren't itemized",
    7: "an undocumented condition deduction", 8: "a base value that doesn't average the comparables",
    9: "missing taxes, fees or registration", 10: "no written explanation",
}
SPOKEN_REASON = {
    "injured": "someone was injured", "fault_disputed": "fault is disputed",
    "rideshare_or_commercial": "a rideshare or commercial vehicle was involved",
    "other_at_fault_drivers": "other drivers may share the fault",
}


def _say_usd(x: float) -> str:
    return f"{x:,.0f} dollars"


def briefing(data: dict) -> str:
    """About a minute of speech for an attorney, built in code from the case file. Opens by saying it is an AI voice."""
    claim, audit = Claim(**data["claim"]), data["audit"]
    v, o, co, fv = claim.vehicle, claim.offer, audit["counteroffer"], audit["market"]["fair_value"]
    plan = if_no(data)
    failed = _failed(audit)
    owner = claim.policyholder_name
    parts = [
        "This is an AI-generated voice reading a case summary prepared by Totaled"
        + (f" for {owner}" if owner else "") + ". It is not legal advice and it does not rate the case.",
        f"The car is a {v.year} {v.make} {v.model}, declared a total loss in California. "
        f"The insurer offered {_say_usd(o.total)} on {date.fromisoformat(o.offer_date):%B %-d}.",
    ]
    if failed:
        parts.append(f"The valuation fails {len(failed)} of the {len(CHECKS)} checks under California's total loss rule, "
                     f"including {'; '.join(SPOKEN_CHECK[n] for n in failed[:3])}.")
    if fv and co:
        parts.append(f"Current listings for the same car put its value near {_say_usd(fv['estimate'])}. "
                     f"The owner asked for {_say_usd(co['total'])}, which is {_say_usd(co['gap'])} more than the offer.")
    dated = [s for s in plan["steps"] if s["date"]]
    if dated:
        parts.append("Dates: " + "; ".join(f"{s['step'].lower()} by {date.fromisoformat(s['date']):%B %-d}" for s in dated) + ".")
    situation = data.get("situation") or {}
    reasons = [SPOKEN_REASON[k] for k in SPOKEN_REASON if situation.get(k)]
    if co and co["gap"] > SMALL_CLAIMS_LIMIT:
        reasons.append("the gap is over the small claims limit")
    if reasons:
        parts.append(f"The owner is talking to an attorney because {', and '.join(reasons)}.")
    parts.append("The written case package lists every fact with its source, and what is still missing.")
    return " ".join(parts)
