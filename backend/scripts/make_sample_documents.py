"""Generate a synthetic auto policy and insurer settlement letter (PDFs) that go with the sample report.

The policy's collision deductible ($250) differs from the $500 the sample offer subtracts, so the cross-checks
have a finding to show; the letter's amount, date and claim number match the report. Fictional, labeled as samples.
sample_documents.json holds what each document says, with the exact quoted line, for when Claude is not configured.

Run from backend/:  .venv/bin/python scripts/make_sample_documents.py
"""
import json
from pathlib import Path

import fitz

OUT = Path(__file__).resolve().parent.parent / "app" / "fixtures"

POLICY = [
    ["SAMPLE DOCUMENT - FICTIONAL", "Golden State Mutual Insurance Co.", "Personal Auto Policy - Declarations",
     "Policy Number: CA-AUTO-7731904", "Named Insured: Jordan Rivera", "Policy Period: 2026-03-01 to 2027-03-01",
     "Vehicle: 2019 Honda Civic EX, VIN 2HGFC1F35KH654321", "",
     "Coverages and Limits",
     "Bodily Injury Liability: $50,000 each person / $100,000 each accident",
     "Collision Coverage Deductible: $250",
     "Comprehensive Coverage Deductible: $250",
     "Rental Reimbursement: $40 per day, up to $1,200 per loss",
     "Loan/Lease Gap Coverage: Not purchased"],
    ["SAMPLE DOCUMENT - FICTIONAL", "Part D - Coverage for Damage to Your Auto", "",
     "Limit of Liability. Our limit of liability for loss will be the lesser of the actual cash value of the",
     "stolen or damaged property or the amount necessary to repair or replace the property.", "",
     "APPRAISAL",
     "If we and you do not agree on the amount of loss, either may demand an appraisal of the loss.",
     "Each party will select a competent appraiser. The two appraisers will select an umpire.",
     "Each party will pay its chosen appraiser and share the expenses of the umpire equally."],
]

LETTER = [
    ["SAMPLE DOCUMENT - FICTIONAL", "Golden State Mutual Insurance Co.", "Claims Department, Sacramento, CA", "",
     "Date: October 14, 2026", "Claim Number: CLM-2026-48213", "Insured: Jordan Rivera", "",
     "Re: Total loss settlement offer for your 2019 Honda Civic EX", "",
     "We have determined that your vehicle is a total loss. Based on the enclosed valuation report,",
     "our settlement offer is $17,104.75, which reflects the actual cash value, sales tax and fees,",
     "less your deductible of $500.00.", "",
     "If you have questions about this offer, please contact your adjuster within 30 days."],
]

KNOWN = {
    "policy": [
        {"key": "insurer", "value": "Golden State Mutual Insurance Co.", "page": 1, "quote": "Golden State Mutual Insurance Co."},
        {"key": "policy_number", "value": "CA-AUTO-7731904", "page": 1, "quote": "Policy Number: CA-AUTO-7731904"},
        {"key": "collision_deductible", "value": "250", "page": 1, "quote": "Collision Coverage Deductible: $250"},
        {"key": "rental_daily_limit", "value": "40", "page": 1, "quote": "Rental Reimbursement: $40 per day, up to $1,200 per loss"},
        {"key": "rental_max_total", "value": "1200", "page": 1, "quote": "Rental Reimbursement: $40 per day, up to $1,200 per loss"},
        {"key": "gap_coverage", "value": "no", "page": 1, "quote": "Loan/Lease Gap Coverage: Not purchased"},
        {"key": "appraisal_clause", "value": "Either party may demand an appraisal if they disagree on the amount of loss",
         "page": 2, "quote": "If we and you do not agree on the amount of loss, either may demand an appraisal of the loss."},
    ],
    "letter": [
        {"key": "insurer", "value": "Golden State Mutual Insurance Co.", "page": 1, "quote": "Golden State Mutual Insurance Co."},
        {"key": "letter_date", "value": "2026-10-14", "page": 1, "quote": "Date: October 14, 2026"},
        {"key": "claim_number", "value": "CLM-2026-48213", "page": 1, "quote": "Claim Number: CLM-2026-48213"},
        {"key": "offer_total", "value": "17104.75", "page": 1, "quote": "our settlement offer is $17,104.75, which reflects the actual cash value, sales tax and fees,"},
        {"key": "deductible", "value": "500", "page": 1, "quote": "less your deductible of $500.00."},
    ],
}


def write(pages, path):
    doc = fitz.open()
    for lines in pages:
        page = doc.new_page(width=612, height=792)
        y = 72
        for line in lines:
            page.insert_text((60, y), line, fontsize=11)
            y += 20
    doc.save(path)


if __name__ == "__main__":
    write(POLICY, OUT / "sample_policy.pdf")
    write(LETTER, OUT / "sample_insurer_letter.pdf")
    (OUT / "sample_documents.json").write_text(json.dumps(KNOWN, indent=1) + "\n")
    print("wrote sample_policy.pdf, sample_insurer_letter.pdf, sample_documents.json")
