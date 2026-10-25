# Toto: working notes (Oct 24, 2026)

Where things stand, what changed, and how to run and record the demo. See `README.md` for the product and `DEMO.md` for the spoken script.

## What the demo shows

Upload the sample report, say what happened, audit the offer (gap $5,082.53, 6 of 10 checks fail), cross-check the policy and letter, approve the letter, hear a simulated call to the adjuster, see "If they say no" (with a second simulated call), compute the net payout (CRS loan), then check sellers, set a mandate and place a test-card hold. A local run takes about 2:35.

## Changes in this pass

- Merged `origin/main` several times. Your report pane, claim-token fix and ZIP default are in.
- **Spending cap now limits the car's price.** It defaults to the whole budget so the demo is not blocked. Lower it before the hold to show a block.
- Status call retries until the backend answers. GAP card says "Not found" when the policy has no GAP. Rental line shows once. Payout shows one data label.
- Windows bug fixed: the spoken briefing used a date format (`%-d`) that only works on Mac and Linux.
- The recording script's output path used `.pathname`, which breaks on Windows. It now uses `fileURLToPath`.
- Saved Claude letters rebuilt for the current evidence (CarGurus and Cars.com).
- **Two simulated calls, four lines each** (`backend/app/calls.py`, `call_routes.py`, `frontend/src/components/CallPlayback.tsx`):
  - after the letter is approved, the owner calls the adjuster;
  - in "If they say no", the adjuster stands by the offer and the owner asks for an appraisal and files a complaint.
  - Code writes the scripts from the audit, so every dollar is in the case file. The adjuster is a made-up person in a stock AI voice. The owner line is a clone of the presenter's own voice. No real insurer is called, and the screen says so.
  - The law-office call was dropped. The lawyer section links to State Bar certified referral services only (B&P § 6155).
- **Saved so the demo needs no live calls:** the call audio and the briefing audio (`backend/app/fixtures/call/`), and Claude's reading of the demo account (`stories` in `demo_cache.json`).
- `demo/record-demo.mjs` plays the first 8 seconds of call 1 and the first 5 of call 2. The recording is silent video (`.webm`), because Playwright does not capture sound. To get the call audio into an MP4, log when each call starts and stops, then mix the saved speech in with a full FFmpeg (Playwright's own FFmpeg only writes VP8).

## Run and test

Backend first (Python 3.10+), then the frontend:

```bash
cd backend && uvicorn app.main:app --port 8000
cd frontend && npm run dev
```

Use the sample report with ZIP 94704 only. Any new ZIP, car or year range runs a paid Apify search.
`DEMO_MODE=1` does not stop live Apify when `APIFY_TOKEN` is set, so the footer says "live" even on saved data.

Checks: `cd frontend && npx tsc --noEmit && npm run lint`, then `python -m py_compile backend/app/main.py`.

## Record the demo

```bash
cd demo && npm install && npx playwright install chromium
URL=http://localhost:3000 HEADED=1 npm run record
```

It also saves `demo/out/totaled-demo.webm`. For OBS, run it headed and record the window. Without `URL` it records the production site.

## Rebuild when something changes

- **Letters or documents:** `cd backend && python scripts/build_demo_cache.py --keep-existing --claims ID1 ID2` (finished local claims, one without the note and one with it). Needs `ANTHROPIC_API_KEY`.
- **Call audio and briefing audio:** `CARTESIA_OWNER_VOICE_ID=<your cloned voice id> python scripts/build_call_audio.py --claim ID --yes`. Without `--yes` it only prints the character count. **Rebuild the briefing on the day you present**, because its text has dates counted from the day the letter is approved. A missed saved file falls back to a live Cartesia call.
- **Spoken account:** `python scripts/build_story_cache.py "the account text"`. One live Claude call.
- **Ask-bar answer ("Where does my case stand?"):** `python scripts/build_ask_cache.py --claim ID "Where does my case stand?"`, using a local claim that went through the whole demo (sample policy loaded, payout calculated). One live Claude call. The saved answer only applies to that exact question on a case file with the same facts, so loading the sample letter too, or skipping the payout, falls back to a live answer.

## Open items and risks

- The deadline text counts from today. The sample offer is dated Oct 14, so "reopen by Nov 18" turns into "past" after that date.
- Production steps take 2 to 5 seconds each, so a production recording runs longer than 2:35.
- Older call audio files in `backend/app/fixtures/call/` that no script line uses any more can be deleted.
- Ask bar answers are not saved. They need a Claude key.
- Keep the owner voice ID and the voice recording out of git. Never write keys into the repo.
- `backend/.env` should have no plain-text note lines (python-dotenv warns) and no trailing slash on `CORS_ORIGINS`.
- Seller checks use CRS sandbox test profiles. The deposit is test mode only. All of it is "not legal advice".
