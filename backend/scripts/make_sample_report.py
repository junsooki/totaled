"""Generate a synthetic CCC-style valuation report (PDF) and the claim it contains (JSON).

The sample has deliberate problems so every screen has something to show:
a lower-trim comparable, a comparable with no VIN or seller contact, a stale and
distant comparable, a lumped adjustment, a mileage adjustment with the wrong sign,
an undocumented condition deduction, a base value that is not the average, and
missing prorated registration. It is fictional and labeled as a sample.

Run from backend/:  .venv/bin/python scripts/make_sample_report.py
"""
import json
from pathlib import Path

import fitz

OUT = Path(__file__).resolve().parent.parent / "app" / "fixtures"

COMPS = [
    dict(id="C1", year=2019, make="Honda", model="Civic", trim="LX", vin="2HGFC2F57KH512345", stock_number="VH4471",
         seller_name="Valley Honda", seller_contact="(510) 555-0142", distance_mi=38, listing_date="2026-09-20",
         odometer=61400, options=[], list_price=16450,
         adjustments=[dict(label="Mileage", amount=1050), dict(label="Equipment", amount=600)], adjusted_value=18100),
    dict(id="C2", year=2019, make="Honda", model="Civic", trim="EX", vin=None, stock_number=None,
         seller_name="Private party", seller_contact=None, distance_mi=42, listing_date="2026-09-28",
         odometer=52000, options=["Sunroof", "Apple CarPlay"], list_price=17200,
         adjustments=[dict(label="Mileage", amount=-400), dict(label="Other", amount=-900)],
         adjusted_value=15900),
    dict(id="C3", year=2020, make="Honda", model="Civic", trim="EX", vin="19XFC1F38LE201987", stock_number="F2210",
         seller_name="Central Valley Auto", seller_contact="(559) 555-0177", distance_mi=214,
         listing_date="2026-05-30", odometer=44900, options=["Sunroof", "Apple CarPlay"], list_price=19300,
         adjustments=[dict(label="Mileage", amount=-300), dict(label="Model year", amount=-1200)],
         adjusted_value=17800),
]

VEHICLE = dict(year=2019, make="Honda", model="Civic", trim="EX", vin="2HGFC1F35KH654321", mileage=48200,
               options=["Sunroof", "Apple CarPlay", "Heated Seats"])

BASE = 17050  # the report's stated base value (the true average is 17,266.67)
COND = 1150
TAXABLE = BASE - COND
TAX = round(TAXABLE * 0.1025, 2)
FEES = 75
DEDUCTIBLE = 500
TOTAL = round(TAXABLE + TAX + FEES - DEDUCTIBLE, 2)


def usd(x):
    return f"${x:,.2f}"


def main():
    doc = fitz.open()
    sources = {}

    def page(lines, key_lines):
        p = doc.new_page()
        y = 60
        for text, size in lines:
            p.insert_text((50, y), text, fontsize=size, fontname="helv")
            if text in key_lines:
                sources[key_lines[text]] = {"page": doc.page_count, "quote": text}
            y += size + 8

    v = VEHICLE
    head = [("SAMPLE - FICTIONAL REPORT FOR DEMONSTRATION", 9), ("Market Valuation Report", 18),
            ("Claim 26-CA-004417   Loss state: California   Valuation date: 2026-10-14", 10), ("", 6),
            ("Loss Vehicle", 13),
            (f"{v['year']} {v['make']} {v['model']} {v['trim']} 4D Sedan   VIN {v['vin']}", 10),
            (f"Odometer: {v['mileage']:,} mi   Equipment: {', '.join(v['options'])}", 10), ("", 6),
            ("Condition", 13)]
    cond_line = f"Condition grade: Average   Condition adjustment: -{usd(COND)}"
    head += [(cond_line, 10), ("Inspection notes: none on file", 10), ("", 6), ("Valuation Summary", 13)]
    base_line = f"Base Value (average of comparable vehicles): {usd(BASE)}"
    head += [(base_line, 10), (f"Condition Adjustment: -{usd(COND)}", 10), (f"Adjusted Vehicle Value: {usd(TAXABLE)}", 10),
             (f"Sales Tax (10.25%): {usd(TAX)}", 10), (f"Title and Transfer Fees: {usd(FEES)}", 10),
             (f"Less Deductible: -{usd(DEDUCTIBLE)}", 10)]
    total_line = f"Total Settlement Offer: {usd(TOTAL)}"
    head += [(total_line, 11)]
    page(head, {cond_line: "condition", total_line: "offer", base_line: "base"})

    comp_lines, keys = [("Comparable Vehicles", 14), ("", 6)], {}
    for c in COMPS:
        ident = f"VIN {c['vin']}" if c["vin"] else "VIN not provided"
        title = f"{c['id']}: {c['year']} {c['make']} {c['model']} {c['trim']}   {ident}"
        keys[title] = c["id"]
        comp_lines += [
            (title, 11),
            (f"   Seller: {c['seller_name']}   Contact: {c['seller_contact'] or 'not provided'}   Stock: {c['stock_number'] or 'n/a'}", 9),
            (f"   Listed {c['listing_date']}   Distance {c['distance_mi']} mi   Odometer {c['odometer']:,} mi", 9),
            (f"   List price {usd(c['list_price'])}", 9),
        ]
        for a in c["adjustments"]:
            sign = "+" if a["amount"] >= 0 else "-"
            comp_lines.append((f"   {a['label']} adjustment {sign}{usd(abs(a['amount']))}", 9))
        comp_lines += [(f"   Adjusted value {usd(c['adjusted_value'])}", 9), ("", 6)]
    page(comp_lines, keys)

    letter = [("SAMPLE - FICTIONAL", 9), ("Total Loss Settlement Offer", 16), ("October 14, 2026", 10), ("", 6),
              ("Dear Policyholder,", 10),
              (f"We have determined your vehicle to be a total loss. Our offer of {usd(TOTAL)} is based on", 10),
              ("the enclosed market valuation report, which explains how the value was calculated.", 10),
              ("Please contact your adjuster with any questions.", 10)]
    page(letter, {})

    OUT.mkdir(parents=True, exist_ok=True)
    doc.save(OUT / "sample_report.pdf")

    claim = {
        "owner_zip": "94704",
        "vehicle": VEHICLE,
        "offer": dict(offer_date="2026-10-14", base_value=BASE, condition_adjustment=-COND, sales_tax=TAX,
                      title_fees=FEES, registration_prorated=None, deductible=DEDUCTIBLE, total=TOTAL,
                      written_explanation=True, source=sources["offer"]),
        "condition": dict(subject_grade="Average", documented=False, deduction=COND, source=sources["condition"]),
        "comparables": [dict(c, source=sources[c["id"]]) for c in COMPS],
    }
    (OUT / "sample_claim.json").write_text(json.dumps(claim, indent=2))
    print("wrote", OUT / "sample_report.pdf", "and sample_claim.json")


def make_demo_listings():
    """Synthetic market listings used when DEMO_MODE=1 (no Apify token). Labeled demo, no URLs."""
    import random

    rng = random.Random(7)
    sellers = [("Berkeley Honda", "DEALER", "(510) 555-0101"), ("Oakland Auto Mall", "DEALER", "(510) 555-0118"),
               ("Bay Motors", "DEALER", "(415) 555-0190"), ("Private seller", "PRIVATE", "(510) 555-0166")]
    out = []
    for i in range(16):
        year = rng.choice([2019, 2019, 2019, 2020, 2021])
        trim = rng.choice(["EX", "EX", "Sport", "LX", "Touring"])
        miles = rng.randint(30000, 72000)
        base = {"LX": 17200, "Sport": 18600, "EX": 19400, "Touring": 21500}[trim] + (year - 2019) * 1300
        price = round(base - (miles - 48000) * 0.09 + rng.randint(-700, 700), -1)
        name, kind, phone = rng.choice(sellers)
        out.append(dict(vin=f"DEMO{i:013d}", year=year, make="Honda", model="Civic", trim=trim, body="Sedan",
                        price=price, expected_price=round(price + rng.randint(-900, 900), -1), mileage=miles,
                        options=["Sunroof", "Apple CarPlay"] + (["Heated Seats"] if trim in ("EX", "Touring") else []),
                        distance_mi=rng.randint(2, 60), days_on_market=rng.randint(1, 60), stock_number=f"D{i:04d}",
                        seller_type=kind, seller_name=name, seller_phone=phone, url=None, source="demo"))
    (OUT / "demo_listings.json").write_text(json.dumps(out, indent=2))
    print("wrote", OUT / "demo_listings.json")


if __name__ == "__main__":
    main()
    make_demo_listings()
