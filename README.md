# Totaled

A tool for the weeks after a car accident. Its deep part is auditing a total loss offer: it checks the insurer's valuation against California's rule (10 CCR § 2695.8) and live market data, drafts an evidence-backed counteroffer, works out what the owner actually walks away with, and helps buy the next car safely. Cal Hacks 13.0.

Rule for the whole system: the AI reads and writes, code computes every dollar, and the user approves every action.

The idea behind it is verify before you trust. The app never asks you to trust a number, a seller or a lawyer it has not checked.

## Who it is for

Californians whose insurer has declared their car a total loss and offered less than it is worth. They face an adjuster with valuation software, a 35-day window and a loan that may be bigger than the check. Most accept the first offer because checking it takes expertise they do not have.

## The flow

| # | Screen | What happens | Code |
|---|---|---|---|
| 1 | Upload | Claude reads the report PDF into structured fields, including the insurer, claim and policy numbers and the policyholder name for the letter; the user confirms each one, can add an optional note about what happened, and answers four yes/no questions (injury, disputed fault, rideshare or commercial vehicle, other at-fault drivers) | `backend/app/ai.py`, `frontend/src/components/Upload.tsx` |
| 2 | Audit | The 10 checks, click any result to see the highlighted report line, fair value from live listings on CarGurus and Cars.com (Estimate) with each listing's source and fetch time, gap in dollars, 35-day deadline. Optional: upload the policy and the insurer's letters; code cross-checks the deductible, appraisal clause, rental and GAP coverage, and the letter's amount, claim number and date against the report, each fact linked to its highlighted line | `backend/app/checks.py`, `valuation.py`, `comps.py`, `documents.py`, `Documents.tsx` |
| 3 | Counteroffer | Claude drafts the letter; every sentence cites evidence; code rejects any dollar amount not in the evidence; user edits then approves; the approved letter can be copied or downloaded as a PDF. Then "If they say no": dated next steps, a Department of Insurance complaint draft, the appraisal clause and small claims. When a rule fires (any yes answer, or a gap over the small claims limit) it says why a lawyer is worth talking to and offers an attorney-ready case package | `backend/app/letter.py`, `playbook.py`, `escalate.py`, `IfNo.tsx` |
| 4 | Net payout | CRS credit report finds the auto loan. Side by side at the offer and at the counteroffer: what you owe, what you walk away with, negative equity and GAP, buying power, whether financing qualifies, in plain words | `backend/app/crs.py`, `Payout.tsx` |
| 5 | Next car | Cars ranked inside your budget, each with the reason for its rank and an above-market flag from the same valuation code. A CRS seller check (identity and liens) locks the deposit until it comes back clean. A mandate sets the budget, the spending cap, the sellers that passed, an expiry and what the agent cannot do. A test-card deposit, then a receipt that shows it stayed inside the mandate | `backend/app/main.py`, `Replace.tsx` |

Every step logs what its agent did (Reader, Appraiser, Negotiator, Banker, Shopper), shown on each screen. An ask bar (typed or spoken) answers questions from the case file, the rule text and Moss's matching guidance only, citing a source for every sentence (`backend/app/ask.py`). "Find a lawyer" links to the State Bar's certified referral services and license search; the app never lists or recommends lawyers.

The results card shows dollars at stake, checks failed (distinct checks, not rows) and minutes from upload to approved letter, with an audit trail.

Claim API requests require a per-claim secret returned at upload; the backend stores only its SHA-256 hash and the browser keeps the secret locally. Uploaded reports are limited to 20 MB and 20 pages. Private claim records and local audit events expire after 30 days (`CLAIM_RETENTION_DAYS` can change this).

## Live vs demo

Each integration runs live when its key is set. With `DEMO_MODE=1`, Apify and CRS return clearly labeled demo data so the whole flow can run without keys. Without `ANTHROPIC_API_KEY`, the sample report uses its known fields and the letter is a code template. The UI shows which mode each integration is in.

- Apify: two listing sources, `e-commerce/cargurus-zipcode-search-scraper` (capped at $0.50 per run) and `fatihtahta/cars-com-scraper` (20 listings, about $0.02; its minimum cap is $1). Each search is saved in the database and reused for `MARKET_CACHE_HOURS` (24 on prod). If one source fails, the other still values the car and the screen says which was unavailable.
- CRS: sandbox REST API, test personas only (`backend/app/fixtures/crs_personas.json`), never real credit data.
- Claude: `claude-opus-5-5` with structured output and server-side refusal fallback.
- MOSS: semantic retrieval behind the ask bar. It indexes only the public guidance in `backend/app/fixtures/voice_knowledge.json` (rebuild with `scripts/build_moss_index.py` after editing it); the question is sent to Moss, claim facts never are. Matching guidance becomes citable `guide:` sources. On serverless hosts the model is cached under `/tmp` (`MOSS_MODEL_CACHE_DIR`).
- Cartesia: `CARTESIA_API_KEY` turns on the spoken attorney briefing (stock voice, labeled as AI).
- Visa: test-mode checkout. Only Visa test card numbers (such as 4242 4242 4242 4242) are accepted, checked in code; no real card is charged and no payment provider is called yet.

## Demo cache

`backend/app/fixtures/demo_cache.json` holds saved results of real runs: the sample report read by Claude, the Apify searches for a 2019 Civic (blank ZIP and 94704), two letters (with and without the "Use an example" note), and the CRS sandbox results for all 20 personas.
A saved result replaces a paid call only when the same input recurs (the bundled sample report, ZIP 94704, the example note). Anything new still runs live.
The saved Claude read and letters also work when no `ANTHROPIC_API_KEY` is set, so a deployment without the key still shows the real Claude results for the sample. Apify and CRS saved results apply when those integrations are configured.
The UI then shows "claude (saved demo run)", the original Apify fetch time, and "Saved data" for CRS.
`DEMO_CACHE=0` turns it off.
Rebuild the Claude read and letters with `cd backend && python scripts/build_demo_cache.py --keep-existing --claims ID1 ID2` (ids of two finished local claims: one without the note, one with it). Without `--keep-existing` the script also refetches Apify and CRS data, which makes paid calls.

## Real versus simulated

| Part | Status |
|---|---|
| Reading the report (Claude) | Real when `ANTHROPIC_API_KEY` is set; the user checks every field |
| 10 checks, fair value, counteroffer, payout math | Real, deterministic code |
| Market listings (Apify, CarGurus) | Real when `APIFY_TOKEN` is set; each listing shows its source and fetch time, and saved or demo data is labeled |
| Credit report, seller identity and liens (CRS) | CRS sandbox with test personas, never real people |
| Prequalification tiers | Our illustration, not a lender's offer |
| Deposit | Test mode with Visa test card numbers; no money moves |
| Deadlines and the small claims limit | Checked against the rule text on Oct 24, 2026: 15-day reply (10 CCR § 2695.5(b)), 40-day accept or deny (§ 2695.7(b)), 35-day reopen (§ 2695.8(c)), $12,500 small claims limit (Code Civ. Proc. § 116.221). Not yet reviewed by a lawyer |
| Policy and insurer letters | Real when uploaded; the bundled samples (`scripts/make_sample_documents.py`) are fictional and labeled |

## Where Claude can go wrong

- **Misreading the report.** A digit or a sign can be read wrong. The user confirms every field, and each failed check links to the highlighted line in the report, so a misread shows up next to its source.
- **Inventing numbers in the letter.** Code rejects any sentence with a dollar amount that is not in the evidence, and the letter cannot be approved until every sentence passes.
- **Sounding like a lawyer.** The letter only restates checked facts. The app never rates case strength, labels everything "not legal advice", and its escalation rules are fixed code, not Claude's judgment.
- **Photos of pages.** Glare and cropping make reading less reliable than a PDF; the confirm step is the safeguard.

## Path to production

- Database: Postgres through `DATABASE_URL` (already supported), with row-level security on.
- Payments: replace the test-card check with a payment provider's authorization hold, keeping the mandate checks on the server.
- Legal: a California attorney reviews the letter template, the deadlines and the complaint draft. Listing lawyers by name would risk operating an uncertified referral service (Bus. & Prof. Code § 6155; *Jackson v. LegalMatch.com* (2019) 42 Cal.App.5th 760) and scraping Google Maps breaks Google's terms, so the app links to the State Bar's certified referral services instead. A named list would need the Places API and an ethics review.
- Personal data: real credit pulls need consent flows under the FCRA, and public tables keep holding no personal data.

## Real-time extras (SpacetimeDB, not in the main flow)

The live auction, agent feed and claim tracker below are off unless `SPACETIME_DB` and `SPACETIME_TOKEN` are set, and the main flow no longer uses them.

`spacetime/` is a SpacetimeDB module (TypeScript) published to Maincloud as `totaled-live`. It is the live shared state for three things:

- **Reverse auction** (`auction`, `dealer`, `bid`): once the payout is audited and financing prequalified, the buyer opens a live auction. Dealers join from `/dealer` on their phones (scan the QR code) and bid against each other in real time. The rules run inside the database, so no client can cheat: bids must fit the buyer's verified budget, a dealer can only lower their own price, a bid in the last 30 seconds extends the clock by 30 seconds, and only the backend can open or award an auction. The backend reads the winning bid back from SpacetimeDB before the deposit, never trusting the browser's price.
- **Agents at work** (`agent_step`): the Reader, Appraiser, Negotiator and Shopper agents post each step as they work; every screen shows it live.
- **Claim tracker** (`claim`, `claim_event`): `/track` follows every claim through the five steps, on any device.

The live tracker and auction use public SpacetimeDB tables for real-time subscriptions. Dealer-submitted VINs are discarded; the tables expose pseudonymous claim IDs, vehicle summaries, dollar amounts, step names, dealer display names and a 3-digit ZIP area. Treat that feed as public demo data, not private claim storage.

- Publish: `cd spacetime && spacetime publish totaled-live --server maincloud`
- Register the backend writer once: `cd backend && .venv/bin/python scripts/register_spacetime_writer.py totaled-live`, then set `SPACETIME_DB` and `SPACETIME_TOKEN` on the backend and `NEXT_PUBLIC_SPACETIME_DB` on the frontend.
- Regenerate client bindings after changing the module: `spacetime generate --lang typescript --out-dir frontend/src/module_bindings --module-path spacetime/spacetimedb`

## Run it

Backend (Python 3.10+):

```sh
cd backend
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
cp .env.example .env   # add keys, or set DEMO_MODE=1
.venv/bin/uvicorn app.main:app --reload --port 8000
```

Frontend:

```sh
cd frontend
npm install
npm run dev            # http://localhost:3000 (set NEXT_PUBLIC_API_URL if the API is elsewhere)
```

Regenerate the sample report and demo listings: `cd backend && .venv/bin/python scripts/make_sample_report.py`.

### Voice claim guide (optional)

Set `MOSS_PROJECT_ID`, `MOSS_PROJECT_KEY`, and optionally `MOSS_INDEX_NAME` in `backend/.env`, then create the guidance index once:

```sh
cd backend
.venv/bin/python scripts/build_moss_index.py
```

The guide appears on the audit screen when MOSS and `ANTHROPIC_API_KEY` are configured. It uses the browser's speech APIs where available; typed questions work in every browser. MOSS is retrieval, while Claude writes a short answer grounded in retrieved guidance and the current claim's calculated facts. Say or type `VIN` followed by 17 characters and the guide automatically decodes the vehicle through NHTSA; VIN decoding does not check title history or vehicle condition.

## CRS MCP server (developer helper for Claude Code)

```sh
claude mcp add crs-calhacks \
  -e CRS_USERNAME=YOUR_USERNAME \
  -e CRS_PASSWORD=YOUR_PASSWORD \
  -- npx -y @crscreditapi/crs-calhacks-mcp-server@latest
```

Or put it in `.mcp.json` (already gitignored, since it holds the password). Never commit keys.
