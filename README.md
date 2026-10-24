# Totaled

An AI agent that checks an insurer's total loss offer against California's rule (10 CCR § 2695.8) and live market data, drafts an evidence-backed counteroffer, works out what the owner actually walks away with, and helps buy the replacement car. Cal Hacks 13.0.

Rule for the whole system: the AI reads and writes, code computes every dollar, and the user approves every action.

## The flow

| # | Screen | What happens | Code |
|---|---|---|---|
| 1 | Upload | Claude reads the report PDF into structured fields, including the insurer, claim and policy numbers and the policyholder name for the letter; the user confirms each one and can add an optional note about what happened | `backend/app/ai.py`, `frontend/src/components/Upload.tsx` |
| 2 | Audit | The 10 checks, click any result to see the highlighted report line, fair value from live listings (Estimate), gap in dollars, 35-day deadline | `backend/app/checks.py`, `valuation.py`, `comps.py` |
| 3 | Counteroffer | Claude drafts the letter; every sentence cites evidence; code rejects any dollar amount not in the evidence; user edits then approves; the approved letter can be copied or downloaded as a PDF | `backend/app/letter.py`, `ai.py` |
| 4 | Net payout | CRS credit report finds the auto loan, walk-away amount, negative equity and GAP, prequalification | `backend/app/crs.py` |
| 5 | Rental and next car | 5a: demo rental options and a simulated Visa rental hold. 5b: ranked replacement cars in budget, CRS seller check (identity + liens), simulated Visa deposit. Both holds share one spending cap, with consent and an explained receipt | `backend/app/main.py`, `Rental.tsx`, `Replace.tsx` |

The results card shows dollars at stake, checks failed (distinct checks, not rows) and minutes from upload to approved letter, with an audit trail.

## Live vs demo

Each integration runs live when its key is set. With `DEMO_MODE=1`, Apify and CRS return clearly labeled demo data so the whole flow can run without keys. Without `ANTHROPIC_API_KEY`, the sample report uses its known fields and the letter is a code template. The UI shows which mode each integration is in.

- Apify: `e-commerce/cargurus-zipcode-search-scraper`; each search is saved in the database and reused for `MARKET_CACHE_HOURS` (24 on prod), capped at $0.50 per run.
- CRS: sandbox REST API, test personas only (`backend/app/fixtures/crs_personas.json`), never real credit data.
- Claude: `claude-opus-5-5` with structured output and server-side refusal fallback.
- Visa: simulated checkout, labeled as such. Covers the rental hold and the car deposit; one spending cap applies to both.

## Demo cache

`backend/app/fixtures/demo_cache.json` holds saved results of real runs: the sample report read by Claude, the Apify searches for a 2019 Civic (blank ZIP and 94704), two letters (with and without the "Use an example" note), and the CRS sandbox results for all 20 personas.
A saved result replaces a paid call only when the same input recurs (the bundled sample report, ZIP 94704, the example note). Anything new still runs live.
The saved Claude read and letters also work when no `ANTHROPIC_API_KEY` is set, so a deployment without the key still shows the real Claude results for the sample. Apify and CRS saved results apply when those integrations are configured.
The UI then shows "claude (saved demo run)", the original Apify fetch time, and "Saved data" for CRS.
`DEMO_CACHE=0` turns it off.
Rebuild the Claude read and letters with `cd backend && python scripts/build_demo_cache.py --keep-existing --claims ID1 ID2` (ids of two finished local claims: one without the note, one with it). Without `--keep-existing` the script also refetches Apify and CRS data, which makes paid calls.

## Real-time core (SpacetimeDB)

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
