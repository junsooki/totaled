# Totaled

An AI agent that checks an insurer's total loss offer against live market data, drafts an evidence-backed counteroffer, and helps the owner buy a replacement car. Cal Hacks 13.0.

Rule for the whole system: the AI reads and writes, code computes every dollar, and the user approves every action.

## Status

Friday night core path: type in a car and an offer, pull comparables from CarGurus through Apify, and show fair value (an Estimate) next to the offer.

## Run it

Backend (Python 3.9+):

```sh
cd backend
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
cp .env.example .env   # add APIFY_TOKEN
.venv/bin/uvicorn app.main:app --reload --port 8000
```

Frontend:

```sh
cd frontend
npm install
npm run dev            # http://localhost:3000
```

Each Apify run is cached in `backend/data/cache/`. If a live run fails, the last cached run for the same search is used.

## CRS MCP server (developer helper for Claude Code)

```sh
claude mcp add crs-calhacks \
  -e CRS_USERNAME=YOUR_USERNAME \
  -e CRS_PASSWORD=YOUR_PASSWORD \
  -- npx -y @crscreditapi/crs-calhacks-mcp-server@latest
```

Or put it in `.mcp.json` (already gitignored, since it holds the password). Never commit keys.
