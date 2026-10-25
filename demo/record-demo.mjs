// Records the Toto demo (DEMO.md) as a video: every click is real, against the live app.
//
//   cd demo && npm install && npm run record                      # production, headless
//   URL=http://localhost:3000 HEADED=1 npm run record             # local app, watch it run
//
// Output: demo/out/totaled-demo.webm. Warm production first (backend/scripts/warmup.py) so steps don't cold-start.
// A browser can't speak into its own mic, so a stand-in speech recognizer "says" the accident account; the caption says so.
import { chromium } from "playwright";
import { mkdirSync, readdirSync, renameSync } from "node:fs";
import { fileURLToPath } from "node:url";

const BASE = process.env.URL ?? "https://totaled-web.vercel.app";
const OUT = fileURLToPath(new URL("./out/", import.meta.url));  // .pathname breaks on Windows
const SIZE = { width: 1280, height: 800 };
const ACCOUNT = [
  "On October 3rd I was stopped at a red light on Shattuck Avenue when an Uber hit me from behind.",
  "Nobody was hurt. The other driver's insurer says I braked suddenly, so they dispute fault.",
];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: !process.env.HEADED });
const context = await browser.newContext({ viewport: SIZE, recordVideo: { dir: OUT, size: SIZE } });

// Stand-in for the browser's speech recognition: delivers the account sentence by sentence, then stops.
await context.addInitScript((sentences) => {
  class SpokenAccount {
    start() {
      sentences.forEach((t, i) => setTimeout(() => {
        const results = [Object.assign([{ transcript: t }], { isFinal: true })];
        this.onresult?.({ resultIndex: 0, results });
      }, 1400 * (i + 1)));
      setTimeout(() => this.onend?.(), 1400 * sentences.length + 600);
    }
    stop() { this.onend?.(); }
  }
  window.SpeechRecognition = SpokenAccount;
  window.webkitSpeechRecognition = SpokenAccount;
}, ACCOUNT);

const page = await context.newPage();
page.setDefaultTimeout(120_000);

/** A caption bar at the top of the video, so it explains itself without a voiceover. */
async function caption(text, ms = 3500) {
  await page.evaluate((t) => {
    let el = document.getElementById("demo-caption");
    if (!el) {
      el = document.createElement("div");
      el.id = "demo-caption";
      Object.assign(el.style, {
        position: "fixed", top: "12px", left: "50%", transform: "translateX(-50%)", zIndex: 99999,
        maxWidth: "860px", padding: "10px 18px", background: "#1f2a24", color: "#fff",
        font: "600 18px/1.4 system-ui, sans-serif", borderLeft: "6px solid #8fd1a5", pointerEvents: "none",
      });
      document.body.appendChild(el);
    }
    el.textContent = t;
  }, text);
  await page.waitForTimeout(ms);
}

/** Scroll something into the middle of the screen, then pause on it. */
async function show(target, ms = 1500) {
  const locator = target.first();
  await locator.scrollIntoViewIfNeeded();
  await locator.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "smooth" }));
  await page.waitForTimeout(ms);
}

const btn = (name, exact = false) => page.getByRole("button", { name, exact });

try {
  // 0:00 The problem
  await page.goto(BASE);
  await caption("When your car is totaled, the insurer values it with software. Toto checks their math.", 4000);
  await caption("AI reads and writes. Code computes every dollar. You approve every action.", 3500);

  // 0:15 Upload and the spoken account
  await btn("Try the sample report").click();
  await page.getByText("Tell us what happened").waitFor();
  await caption("Sample valuation report loaded. First: tell us what happened, in your own words.");
  await btn("Speak").click();
  await caption("(Recording stand-in for the microphone: the account is spoken in, sentence by sentence.)", 4200);
  await btn("Fill in from my account").click();
  await page.getByText(/Found \d+ events|Saved for your attorney package/).waitFor();
  await show(page.getByText(/Found \d+ events|Saved for your attorney package/));
  await caption("Claude fills in the questions, each tied to the owner's exact words. Anything it can't quote is dropped.", 4500);
  await show(page.getByRole("group", { name: "Could other drivers share the fault?" }));
  for (const q of ["injured", "fault_disputed", "rideshare_or_commercial", "other_at_fault_drivers"]) {
    const answered = (await page.locator(`input[name=${q}]:checked`).count()) > 0;
    if (!answered) await page.locator(`input[name=${q}]`).nth(1).check({ force: true });
  }
  await caption("The owner confirms every answer. This account stays private: it goes to a lawyer, never to the insurer.", 4000);
  await btn("These look right").click();

  // 0:45 Audit
  await page.getByText(/may owe you/).first().waitFor();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await caption("The audit: the insurer may owe about $5,082 more than its $17,104.75 offer.", 4500);
  await page.getByRole("tabpanel").locator('button[aria-expanded="false"]', { hasText: "8." }).first().click();
  await caption("Check 8: comparable C2's mileage adjustment has the wrong sign. The adjusted values average $17,266.67, not $17,050.", 5000);
  await btn("Show the line in your report").first().click();
  await page.locator('img[alt*="highlighted"]').first().waitFor({ state: "visible" });
  await show(page.locator('img[alt*="highlighted"]').first(), 1000);
  await caption("Every finding links to the exact line in the insurer's own report.", 3500);
  await page.getByRole("tab", { name: "Market value" }).click();
  await show(page.getByText(/CarGurus \d+/).first());
  await caption("Fair value comes from live listings on CarGurus and Cars.com, each with its source and fetch time.", 4500);
  await btn("Try the sample policy").click();
  await page.getByText("Deductible", { exact: true }).waitFor();
  await show(page.getByText("Deductible", { exact: true }));
  await caption("The policy cross-check: the insurer subtracted a $500 deductible. The policy says $250.", 4500);
  await btn("Show the line").first().click();
  await page.locator('img[alt*="Document page"]').waitFor();
  await show(page.locator('img[alt*="Document page"]'), 2500);

  // 1:25 Letter, If they say no, spoken briefing
  await btn("Continue to counteroffer").click();
  await btn("Draft counteroffer letter").click();
  await btn("Approve this letter").waitFor();
  await caption("The counteroffer letter: every sentence cites evidence, and code rejects any dollar amount not in it.", 4500);
  await btn("Approve this letter").click();
  await page.getByText("What the call could sound like").waitFor();
  await show(page.getByText("What the call could sound like"), 1000);
  await caption("A simulated call to the adjuster. The owner's voice is a clone of the presenter's; the adjuster is an AI voice. Every number comes from the case file.", 5500);
  await btn("Hear the call").first().click();
  await page.waitForTimeout(8000);
  await btn("Stop the call").first().click();
  await page.getByText("If they say no").first().waitFor();
  await show(page.getByText("If they say no").first());
  await caption("If they say no: dated next steps, a complaint draft, and the policy's own appraisal clause.", 4500);
  await show(page.getByText("If they say no, a follow-up call"), 1000);
  await caption("And a follow-up call: the adjuster stands by the offer, and the owner asks for an appraisal and files a complaint.", 5000);
  await btn("Hear the call").nth(1).click();
  await page.waitForTimeout(5000);
  await btn("Stop the call").first().click();
  await show(page.getByText("A lawyer is worth talking to, and here is why"));
  await caption("Fault is disputed and a rideshare was involved, so it explains why a lawyer is worth talking to. It never rates the case.", 5000);
  await btn("Show the script").click();
  await page.getByText(/This is an AI-generated voice/).waitFor();
  await btn("Make the audio").click();
  await page.locator("audio").waitFor();
  await show(page.locator("audio"));
  await caption("A one-minute spoken briefing for an attorney, voiced by Cartesia and labeled as AI.", 4000);

  // 1:50 Payout
  await btn("Continue to net payout").click();
  await btn("Calculate").click();
  await page.getByText("At their offer and at your counteroffer").waitFor();
  await show(page.getByText("At their offer and at your counteroffer"));
  await caption("CRS finds the car loan. At their offer the owner walks away with $1,504.75; at the counteroffer, $6,587.28.", 5000);

  // 2:10 Next car
  await btn("Continue to your next car").click();
  await page.getByText("1. Check sellers before any money moves").waitFor();
  await caption("Buying power: the walk-away cash plus prequalified financing. The listings that proved the lowball become the shopping list.", 5000);
  await btn("Check seller").nth(2).click();
  await page.getByText(/^Deposit locked:/).waitFor();
  await show(page.getByText(/^Deposit locked:/));
  await caption("CRS seller check: a lien is on record, so the deposit stays locked.", 4000);
  await btn("Check seller").first().click();
  await page.getByText(/^Passed: identity verified/).first().waitFor();
  await show(btn("Grant this mandate"));
  await caption("A seller that passed. Before any money moves, the owner sets a mandate: budget, spending cap, expiry, what the agent can't do.", 5000);
  await page.locator("#car-cap").fill("15000");
  await caption("The cap limits the car's price. Set it to $15,000.", 3000);
  await btn("Grant this mandate").click();
  await page.getByText(/Granted MND-/).waitFor();
  await btn("Hold this car").click();
  await page.getByLabel("Deposit ($)").fill("500");
  await page.getByRole("checkbox").check();
  await btn("Place deposit").click();
  await page.getByText(/Blocked by your spending cap/).waitFor();
  await show(page.getByText(/Blocked by your spending cap/));
  await caption("The $16,786 car is over the $15,000 cap, so the checkout refuses it.", 4000);
  await caption("Raise the cap to $20,000 and try again.", 1500);
  await page.locator("#car-cap").fill("20000");
  // Wait for the new mandate to be saved before holding the car again.
  await Promise.all([
    page.waitForResponse((r) => r.url().includes("/mandate") && r.request().method() === "POST"),
    btn("Update mandate").click(),
  ]);
  await btn("Hold this car").click();
  await page.getByLabel("Deposit ($)").fill("500");
  await page.getByRole("checkbox").check();
  await btn("Place deposit").click();
  await page.getByText("Car held").waitFor();
  await show(page.getByText(/Stayed inside mandate/));
  await caption("$500 test-card hold placed, and the receipt shows it stayed inside the mandate.", 4500);

  // 2:50 Close
  await caption("Verify before you trust: every number, every seller, every source. Not legal advice. You approve every step.", 5000);
} finally {
  const video = page.video();
  await context.close();
  await browser.close();
  if (video) {
    const target = `${OUT}totaled-demo.webm`;
    renameSync(await video.path(), target);
    for (const f of readdirSync(OUT)) if (f.endsWith(".webm") && f !== "totaled-demo.webm") console.log("leftover", f);
    console.log("Saved", target);
  }
}
