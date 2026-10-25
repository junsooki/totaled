# Totaled demo (3 minutes)

Numbers below are what https://totaled-web.vercel.app shows for the sample report as of Oct 24, 2026, 10 PM PT.
If someone rebuilds the demo cache, rerun `backend/scripts/warmup.py`. It prints the gap and failed-check count to confirm.

## Before judges arrive

1. Warm production 5–10 minutes before: `cd backend && .venv/bin/python scripts/warmup.py`. It should end with
   `Ready. Sample gap $5,082.53, 6 failed checks, letter by claude (saved demo run).`
   Each step still takes 2–5 seconds because of database round trips. Talk through it.
2. Use Chrome and allow the microphone once. Firefox has no voice input.
3. Have this account ready to say, or paste it if the mic fails:
   "On October 3rd I was stopped at a red light on Shattuck Avenue when an Uber hit me from behind.
   Nobody was hurt. The other driver's insurer says I braked suddenly, so they dispute fault."

## The script

**0:00 The problem (15 s).** "When your car is totaled, the insurer values it with software. Californians get
35 days to push back, and most accept the first offer. Totaled checks the insurer's math against California's
total-loss rule and live listings. AI reads and writes. Code computes every dollar. You approve every action."

**0:15 Upload (30 s).** Click **Try the sample report**. The page opens on **About the accident**.
Click **Speak** and say the account. Click **Fill in from my account**. The questions fill in, each showing your
own words, and the timeline appears. Point out: "Anything Claude can't tie to your exact words is dropped.
And this account stays private. It goes to your lawyer, not your insurer." Answer the last question
(other drivers: No). Click **These look right**.

**0:45 Audit, the hook (40 s).** The gap is **$5,082.53**: the offer was $17,104.75, and a fair total is
$22,187.28. Open **What failed** and then check **8**: "C2's mileage adjustment of −400 has the wrong sign.
The adjusted values average **$17,266.67**, but the report says **$17,050.00**." Click **Show the line in your
report** to bring up the highlighted line. Open **Market value**: "84 live listings from CarGurus and
Cars.com. Each one shows its source and fetch time." Scroll to **Your policy and the insurer's letters** and click
**Try the sample policy**. The deductible doesn't match: "They subtracted **$500**. The policy says
**$250**." Click **Show the line**.

**1:25 Letter (25 s).** Click **Draft counteroffer letter**, then **Approve this letter**. "Every sentence cites its
evidence, and code rejects any dollar amount that isn't in the evidence." **If they say no** gives dated next
steps and quotes the policy's appraisal clause. Fault is disputed and a rideshare was involved, so it says a
lawyer is worth talking to, with the reasons. Click **Show the script** and play a few seconds of the spoken
briefing (Cartesia, labeled as an AI voice).

**1:50 Payout (20 s).** Click **Calculate**. CRS finds a **$15,600** loan. You walk away with **$1,504.75** at their
offer, or **$6,587.28** at yours. Financing qualifies, up to $30,000 at about 6.5%.

**2:10 Next car (40 s).** Buying power is **$36,587.28**. "The same listings that prove the lowball are now the
shopping list." Point at the reason under #1: "$3,904 under market." Check the seller on **#3, American Auto Depot**:
**Deposit locked: lien not cleared.** Check **#1, Golden State Auto** ($16,786): passed. The spending cap limits the
car's price. Set it to **$15,000** and **Grant this mandate**. **Hold this car** and place a $500 deposit: it's
**blocked by your spending cap**, because the car costs more than the cap. Raise the cap to $20,000, **Update
mandate**, and place it again. The receipt says it **stayed inside the mandate**, and the seller gets a buyer
whose budget and financing are already verified.

**2:50 Close (10 s).** "Verify before you trust. Every number, every seller, every source. Not legal advice. You
approve every step."

## Say these before they ask

- Seller checks run on CRS **sandbox test profiles**, one per car, not on the real dealers. The sandbox has no
  real people.
- Prequalification tiers are **our illustration**, not a lender's offer.
- The deposit is a **test-mode** checkout. Only Visa test numbers work, and no money moves.
- The sample report, policy and letter are **fictional** and labeled as samples. The listings are real (saved runs).
- Deadlines and the small claims limit were checked against the rule text, but not reviewed by a lawyer.
- We don't list lawyers. Under California's referral-service law (B&P § 6155), "Find a lawyer" links to the State Bar's
  certified referral services.

## If something breaks

- Mic fails: paste the account into the box.
- A step hangs past about 10 seconds: wait it out. Production is serverless and the database is in another region.
  Don't click twice.
- Total failure: run the same flow locally (`README.md`, Run it) with `DEMO_MODE=1`.
