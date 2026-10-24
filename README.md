# Totaled

A tool for the weeks after a car accident. Its deep part is auditing a total loss offer: it checks the insurer's valuation against California's rule (10 CCR § 2695.8) and live market data, drafts an evidence-backed counteroffer, works out what the owner actually walks away with, and helps buy the next car safely. Cal Hacks 13.0.

Rule for the whole system: the AI reads and writes, code computes every dollar, and the user approves every action.

The idea behind it is verify before you trust. The app never asks you to trust a number, a seller or a lawyer it has not checked.

## Who it is for

Californians whose insurer has declared their car a total loss and offered less than it is worth. They face an adjuster with valuation software, a 35-day window and a loan that may be bigger than the check. Most accept the first offer because checking it takes expertise they do not have.

## The flow

| # | Screen | What happens | Code |
|---|---|---|---|
| 1 | Upload | Claude reads the report PDF into structured fields; the user confirms each one, then answers four yes/no questions (injury, disputed fault, rideshare or commercial vehicle, other at-fault drivers) | `backend/app/ai.py`, `frontend/src/components/Upload.tsx` |
| 2 | Audit | The 10 checks, click any result to see the highlighted report line, fair value from live listings (Estimate), gap in dollars, 35-day deadline | `backend/app/checks.py`, `valuation.py`, `comps.py` |
| 3 | Counteroffer | Claude drafts the letter; every sentence cites evidence; code rejects any dollar amount not in the evidence; user edits then approves. Then "If they say no": dated next steps, a Department of Insurance complaint draft, the appraisal clause and small claims. When a rule fires (any yes answer, or a gap over the small claims limit) it says why a lawyer is worth talking to and offers an attorney-ready case package | `backend/app/letter.py`, `playbook.py`, `escalate.py`, `IfNo.tsx` |
| 4 | Net payout | CRS credit report finds the auto loan. Side by side at the offer and at the counteroffer: what you owe, what you walk away with, negative equity and GAP, buying power, whether financing qualifies, in plain words | `backend/app/crs.py`, `Payout.tsx` |
| 5 | Next car | Cars ranked inside your budget, each with the reason for its rank and an above-market flag from the same valuation code. A CRS seller check (identity and liens) locks the deposit until it comes back clean. A mandate card sets the budget, the spending cap, the sellers that passed, an expiry and what the agent cannot do. A test-card deposit, then a receipt that shows it stayed inside the mandate | `backend/app/main.py`, `Replace.tsx` |

The results card shows dollars at stake, checks failed (distinct checks, not rows) and minutes from upload to approved letter, with an audit trail.

## Live vs demo

Each integration runs live when its key is set. With `DEMO_MODE=1`, Apify and CRS return clearly labeled demo data so the whole flow can run without keys. Without `ANTHROPIC_API_KEY`, the sample report uses its known fields and the letter is a code template. The UI shows which mode each integration is in.

- Apify: `e-commerce/cargurus-zipcode-search-scraper`; each search is saved in the database and reused for `MARKET_CACHE_HOURS` (24 on prod), capped at $0.50 per run.
- CRS: sandbox REST API, test personas only (`backend/app/fixtures/crs_personas.json`), never real credit data.
- Claude: `claude-opus-5-5` with structured output and server-side refusal fallback.
- Visa: test-mode checkout. Only Visa test card numbers (such as 4242 4242 4242 4242) are accepted, checked in code; no real card is charged and no payment provider is called yet.

## Real versus simulated

| Part | Status |
|---|---|
| Reading the report (Claude) | Real when `ANTHROPIC_API_KEY` is set; the user checks every field |
| 10 checks, fair value, counteroffer, payout math | Real, deterministic code |
| Market listings (Apify, CarGurus) | Real when `APIFY_TOKEN` is set; each listing shows its source and fetch time, and saved or demo data is labeled |
| Credit report, seller identity and liens (CRS) | CRS sandbox with test personas, never real people |
| Prequalification tiers | Our illustration, not a lender's offer |
| Deposit | Test mode with Visa test card numbers; no money moves |
| Deadlines and the small claims limit | Rule citations in code (10 CCR § 2695.5(b), § 2695.8(c), Code Civ. Proc. § 116.221); to be confirmed by a lawyer |

## Where Claude can go wrong

- **Misreading the report.** A digit or a sign can be read wrong. The user confirms every field, and each failed check links to the highlighted line in the report, so a misread shows up next to its source.
- **Inventing numbers in the letter.** Code rejects any sentence with a dollar amount that is not in the evidence, and the letter cannot be approved until every sentence passes.
- **Sounding like a lawyer.** The letter only restates checked facts. The app never rates case strength, labels everything "not legal advice", and its escalation rules are fixed code, not Claude's judgment.
- **Photos of pages.** Glare and cropping make reading less reliable than a PDF; the confirm step is the safeguard.

## Path to production

- Database: Postgres through `DATABASE_URL` (already supported), with row-level security on.
- Payments: replace the test-card check with a payment provider's authorization hold, keeping the mandate checks on the server.
- Legal: a California attorney reviews the letter template, the deadlines and the complaint draft; check the lawyer referral rules (Bus. & Prof. Code § 6155) before listing any attorneys.
- Personal data: real credit pulls need consent flows under the FCRA, and public tables keep holding no personal data.

## Real-time extras (SpacetimeDB, not in the main flow)

The live auction, agent feed and claim tracker below are off unless `SPACETIME_DB` and `SPACETIME_TOKEN` are set, and the main flow no longer uses them.

`spacetime/` is a SpacetimeDB module (TypeScript) published to Maincloud as `totaled-live`. It is the live shared state for three things:

- **Reverse auction** (`auction`, `dealer`, `bid`): once the payout is audited and financing prequalified, the buyer opens a live auction. Dealers join from `/dealer` on their phones (scan the QR code) and bid against each other in real time. The rules run inside the database, so no client can cheat: bids must fit the buyer's verified budget, a dealer can only lower their own price, a bid in the last 30 seconds extends the clock by 30 seconds, and only the backend can open or award an auction. The backend reads the winning bid back from SpacetimeDB before the deposit, never trusting the browser's price.
- **Agents at work** (`agent_step`): the Reader, Appraiser, Negotiator and Shopper agents post each step as they work; every screen shows it live.
- **Claim tracker** (`claim`, `claim_event`): `/track` follows every claim through the five steps, on any device.

Public tables hold no personal data: claim ids, cars, dollar amounts, step names, dealer display names and a 3-digit ZIP area.

- Publish: `cd spacetime && spacetime publish totaled-live --server maincloud`
- Register the backend writer once: `cd backend && .venv/bin/python scripts/register_spacetime_writer.py totaled-live`, then set `SPACETIME_DB` and `SPACETIME_TOKEN` on the backend and `NEXT_PUBLIC_SPACETIME_DB` on the frontend.
- Regenerate client bindings after changing the module: `spacetime generate --lang typescript --out-dir frontend/src/module_bindings --module-path spacetime/spacetimedb`

## Run it

Backend (Python 3.9+):

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

## CRS MCP server (developer helper for Claude Code)

```sh
claude mcp add crs-calhacks \
  -e CRS_USERNAME=YOUR_USERNAME \
  -e CRS_PASSWORD=YOUR_PASSWORD \
  -- npx -y @crscreditapi/crs-calhacks-mcp-server@latest
```

Or put it in `.mcp.json` (already gitignored, since it holds the password). Never commit keys.
