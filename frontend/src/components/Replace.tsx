"use client";

import { useEffect, useRef, useState } from "react";
import { Json, post, usd } from "@/lib/api";
import AgentWork from "./AgentWork";
import { Badge, Button, Notice, Stat, SummaryList, inputCls } from "./ui";

/** Plain-language message from a thrown error, including FastAPI 422 `detail` arrays. */
function errMsg(e: unknown): string {
  const body = (e as { body?: Json } | null)?.body;
  if (Array.isArray(body)) {
    const parts = body.map((d: Json) => {
      const field = Array.isArray(d?.loc) ? d.loc.filter((x: Json) => x !== "body").join(" ") : "";
      const msg = typeof d?.msg === "string" ? d.msg : "is not valid";
      return field ? `${field}: ${msg}` : msg;
    });
    return `Please check your numbers. ${parts.join("; ")}`;
  }
  return e instanceof Error ? e.message : String(e);
}

const carName = (c: Json) => `${c.year} ${c.make} ${c.model} ${c.trim ?? ""}`.trim();
const parseNum = (s: string) => (s.trim() === "" ? NaN : Number(s));
const when = (iso: string) => new Date(iso).toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" });
const CANNOT = [
  "Hold a car priced over the spending cap",
  "Pay a seller that failed or skipped the check",
  "Buy the car, sign a contract or take out a loan",
  "Charge your card without your approval on the next screen",
  "Act after the mandate expires in 48 hours",
];

function EntrySkeleton() {
  return (
    <div className="animate-pulse border-t-2 border-rule pt-3" aria-hidden="true">
      <div className="h-5 w-2/3 bg-line" />
      <div className="mt-3 h-10 w-1/2 bg-line" />
      <div className="mt-3 h-4 w-3/4 bg-line" />
    </div>
  );
}

// Demo assignment of CRS sandbox test profiles, by car position in the shortlist (cycles).
// Expected verdicts: OK, OK, CAUTION, OK, OK, CAUTION, OK, STOP.
const SELLER_PROFILES = ["P01", "P02", "P08", "P03", "P05", "P11", "P04", "P12"];
const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export default function Replace({ id, personas, onPurchased }: { id: string; personas: Json[]; onPurchased: () => void }) {
  const [data, setData] = useState<Json | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [checks, setChecks] = useState<Record<string, Json>>({});
  const [cap, setCap] = useState<string | null>(null);  // until typed, the cap is the whole budget
  const [mandate, setMandate] = useState<Json | null>(null);
  const [hold, setHold] = useState<Json | null>(null);
  const [deposit, setDeposit] = useState("500");
  const [card, setCard] = useState("4242 4242 4242 4242");
  const [consentKey, setConsentKey] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Json | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Run the shortlist once per mount (and on retry). The ref stops the Strict Mode double effect
  // from sending a second request, which could start a second paid search.
  const startedFor = useRef<number | null>(null);
  useEffect(() => {
    if (startedFor.current === attempt) return;
    startedFor.current = attempt;
    post(`/api/claims/${id}/replace`)
      .then(setData)
      .catch((e) => setLoadError(errMsg(e)));
  }, [id, attempt]);

  const depositNum = parseNum(deposit);
  const capText = cap ?? (data ? String(Math.floor(data.budget)) : "");
  const capNum = parseNum(capText);
  const depositOk = Number.isFinite(depositNum) && depositNum > 0;
  const capOk = Number.isFinite(capNum) && capNum > 0;
  const consent = consentKey === `${hold?.vin}|${deposit}|${card}`;
  const passed = Object.values(checks).filter((c) => c.clean);
  const inMandate = new Set<string>((mandate?.sellers ?? []).map((s: Json) => s.vin));
  // The mandate is stale when a seller passed the check after it was granted.
  const stale = !!mandate && passed.some((c) => !inMandate.has(c.vin));

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy("");
    }
  }

  const checkSeller = (vin: string, persona: string) => run(vin, async () => {
    const r = await post(`/api/claims/${id}/seller-check`, { vin, persona });
    setChecks((prev) => ({ ...prev, [vin]: r }));
  });

  const grant = () => run("mandate", async () => {
    setMandate(await post(`/api/claims/${id}/mandate`, { spending_cap: capNum }));
    setHold(null);
  });

  const pay = () => run("pay", async () => {
    if (!hold) return;
    const r = await post(`/api/claims/${id}/checkout`, { vin: hold.vin, deposit: depositNum, consent, card_number: card });
    setReceipt(r);
    setHold(null);
    onPurchased();
  });

  if (!data) {
    if (loadError) {
      return (
        <div className="space-y-4">
          <Notice tone="bad">
            <p>We could not load cars. {loadError}</p>
          </Notice>
          <Button onClick={() => { setLoadError(null); setAttempt(attempt + 1); }}>Try again</Button>
        </div>
      );
    }
    return (
      <div role="status" aria-label="Searching listings" className="space-y-6">
        <AgentWork key="searching" id={id} agent="Shopper" active />
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2"><EntrySkeleton /><EntrySkeleton /></div>
      </div>
    );
  }

  const financing = data.financing?.max_amount;

  return (
    <div className="space-y-10">
      <AgentWork key="shopping" id={id} agent="Shopper" active={!!busy && busy !== "mandate" && busy !== "pay"} defaultOpen={false} />
      <div>
        <p className="mb-3 flex flex-wrap items-center gap-2 text-base text-muted">
          Your buying power
          <Badge tone={data.source === "demo" ? "amber" : "green"}>{data.source}</Badge>
        </p>
        <p className="mb-5 max-w-prose text-base text-muted">
          The same listings that show the insurer underpaid you are now your shopping list, ranked inside your real budget.
        </p>
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-3">
          <Stat label="Your budget" value={usd(data.budget)} />
          <Stat label="Cash you walk away with" value={usd(data.walk_away)} />
          <Stat label="Prequalified financing" value={financing ? `Up to ${usd(financing)}` : "None"} />
        </div>
      </div>

      <div>
        <h2 className="font-serif text-2xl font-semibold text-ink">1. Check sellers before any money moves</h2>
        <p className="mt-2 text-base text-muted">
          A deposit stays locked until the seller&apos;s check comes back clean. Checks run on CRS sandbox test profiles, one per car, not on the real dealers.
        </p>

        <div className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2">
          {data.shortlist.map((l: Json, i: number) => {
            const chk = checks[l.vin];
            const personaId = SELLER_PROFILES[i % SELLER_PROFILES.length];
            const persona = personas.find((p) => p.id === personaId);
            const title = carName(l);
            const selected = hold?.vin === l.vin;
            return (
              <div key={l.vin} className="flex flex-col border-t-2 border-rule pt-4">
                <div className={selected ? "border-l-[5px] border-brand pl-4" : ""}>
                  <div className="text-lg font-semibold text-ink">
                    {l.url ? <a className="text-brand underline underline-offset-4" href={l.url} target="_blank" rel="noreferrer">{title}</a> : title}
                  </div>
                  <div className="mt-2 flex flex-wrap items-baseline gap-3">
                    <span className="font-serif text-4xl font-semibold tracking-tight text-ink">{usd(l.price)}</span>
                    {l.value_gap < 0 ? <Badge tone="amber">{usd(-l.value_gap)} above market</Badge>
                      : l.value_gap > 0 ? <Badge tone="green">{usd(l.value_gap)} under market</Badge> : null}
                  </div>
                  <p className="mt-2 text-base text-ink">{l.why}{chk?.clean ? ", and the seller passed the check." : "."}</p>
                  <p className="mt-1 text-base text-muted">
                    {l.seller_name ?? "Seller"} ({l.seller_type ?? "unknown"}) · market value {usd(l.market_value)} from {l.market_basis}
                  </p>
                </div>
                {chk && (
                  <div className="mt-3">
                    <Notice tone={chk.clean ? "good" : "bad"} announce={false} title={chk.clean ? "Passed: identity verified, no liens or judgments" : "Deposit locked: do not send money to this seller yet"}>
                      {chk.flags.length > 0 && (
                        <ul className="list-disc space-y-1 pl-5">
                          {chk.flags.map((f: string) => <li key={f}>{f}</li>)}
                        </ul>
                      )}
                      <p className="mt-1 text-sm text-muted">
                        CRS {chk.source} · test profile {persona ? `${titleCase(persona.name)} (${persona.profile})` : personaId}. The sandbox has no real dealers.
                      </p>
                    </Notice>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={() => checkSeller(l.vin, personaId)} disabled={!!busy}>
                    {busy === l.vin ? "Checking…" : chk ? "Check again" : "Check seller"}
                  </Button>
                  {inMandate.has(l.vin) && chk?.clean && !receipt && (
                    <Button onClick={() => { setHold(l); setConsentKey(null); }}>Hold this car</Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {data.shortlist.length === 0 && <p className="mt-6 text-base text-muted">No cars fit your budget right now.</p>}
      </div>

      <div className="border-t-4 border-rule pt-4">
        <h2 className="font-serif text-2xl font-semibold text-ink">2. Set the agent&apos;s mandate</h2>
        <p className="mt-2 max-w-prose text-base text-muted">
          Before anything is spent, you decide the limits. The checkout refuses anything outside them.
        </p>
        <div className="mt-4 grid gap-8 sm:grid-cols-2">
          <div className="space-y-4">
            <SummaryList
              rows={[
                { label: "Budget for the car", value: usd(data.budget) },
                { label: "Sellers that passed", value: passed.length ? passed.map((c) => data.shortlist.find((l: Json) => l.vin === c.vin)?.seller_name ?? c.vin).join(", ") : "None yet" },
                { label: "Expires", value: mandate ? when(mandate.expires_at) : "48 hours after you grant it" },
              ]}
            />
            <div>
              <label htmlFor="car-cap" className="block text-base font-medium text-ink">Spending cap on the car&apos;s price ($)</label>
              <input id="car-cap" className={`${inputCls} mt-1`} inputMode="decimal" value={capText} onChange={(e) => setCap(e.target.value)} aria-invalid={!capOk} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-ink">The agent cannot</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-base text-ink">
              {(mandate?.cannot ?? CANNOT).map((c: string) => <li key={c}>{c}</li>)}
            </ul>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={grant} disabled={!capOk || !passed.length || busy === "mandate" || (!!mandate && !stale && Number(mandate.spending_cap) === capNum)}>
            {busy === "mandate" ? "Granting…" : mandate ? "Update mandate" : "Grant this mandate"}
          </Button>
          {mandate && !stale && <Badge tone="green">Granted {mandate.id}</Badge>}
          {!passed.length && <span className="text-base text-muted">Check a seller first. Only sellers that pass can be in the mandate.</span>}
          {stale && <span className="text-base text-amber">A new seller passed. Update the mandate to include them.</span>}
        </div>
      </div>

      {hold && mandate && (
        <div className="border-t-4 border-rule pt-4">
          <h3 className="font-serif text-2xl font-semibold text-ink">3. Approve this hold</h3>
          <p className="mt-2 max-w-prose text-base text-ink">
            We place a refundable deposit. It holds the car for 48 hours, counts toward the price if you buy, and is refunded if you do not.
          </p>
          <div className="mt-4">
            <SummaryList
              rows={[
                { label: "Car", value: carName(hold) },
                { label: "Price", value: usd(hold.price) },
                { label: "Seller", value: hold.seller_name ?? "Seller" },
                { label: "Your spending cap", value: usd(mandate.spending_cap, true) },
              ]}
            />
          </div>
          <div className="mt-4 grid max-w-xl gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="car-deposit" className="block text-base font-medium text-ink">Deposit ($)</label>
              <input id="car-deposit" className={`${inputCls} mt-1`} inputMode="decimal" value={deposit} onChange={(e) => setDeposit(e.target.value)} aria-invalid={!depositOk} />
            </div>
            <div>
              <label htmlFor="car-card" className="block text-base font-medium text-ink">Visa test card</label>
              <input id="car-card" className={`${inputCls} mt-1 font-mono`} inputMode="numeric" autoComplete="off" value={card} onChange={(e) => setCard(e.target.value)} />
            </div>
          </div>
          {!depositOk && <p role="alert" className="mt-3 text-base text-alert">Enter a deposit that is more than $0.</p>}
          <label className="mt-6 flex items-start gap-3 text-lg text-ink">
            <input
              type="checkbox"
              className="mt-0.5 size-6 shrink-0 accent-brand"
              checked={consent}
              disabled={!depositOk}
              onChange={(e) => setConsentKey(e.target.checked ? `${hold.vin}|${deposit}|${card}` : null)}
            />
            <span>I approve one {depositOk ? usd(depositNum, true) : "$0"} hold on this test card. No other charges.</span>
          </label>
          <div className="mt-4 max-w-prose">
            <Notice tone="info">
              <p>Test mode: only Visa test card numbers work. No real payment is made and no card is charged.</p>
            </Notice>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={pay} disabled={!consent || !depositOk || busy === "pay"}>{busy === "pay" ? "Placing hold…" : "Place deposit"}</Button>
            <Button variant="secondary" onClick={() => setHold(null)}>Cancel</Button>
          </div>
        </div>
      )}
      {error && <Notice tone="bad"><p>{error}</p></Notice>}

      {receipt && (
        <div className="border-t-4 border-rule pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-serif text-2xl font-semibold text-ink">Car held</h3>
            <Badge tone="amber">test mode</Badge>
          </div>
          <p className="mt-1 text-base text-muted">
            Receipt {receipt.id} · {carName(receipt.car)} · {receipt.network} ending {receipt.card_last4}
          </p>
          <div className="mt-4">
            <SummaryList
              rows={[
                ...receipt.lines.map((ln: Json) => ({
                  label: ln.label,
                  value: (
                    <>
                      {usd(ln.amount, true)}
                      <span className="block text-base font-normal text-muted">{ln.why}</span>
                    </>
                  ),
                })),
                { label: "Total held", value: usd(receipt.total, true), big: true },
                { label: "Car price under your cap by", value: `${usd(receipt.remaining_under_cap, true)} (cap ${usd(receipt.spending_cap, true)})`, tone: "good" as const },
              ]}
            />
          </div>
          <div className="mt-4">
            <Notice tone="good" title={`Stayed inside mandate ${receipt.mandate_id}`}>
              <ul className="list-disc space-y-1 pl-5">
                {receipt.within_mandate.map((w: string) => <li key={w}>{w}</li>)}
              </ul>
            </Notice>
          </div>
          <p className="mt-4 max-w-prose text-base text-ink">{receipt.verified_buyer}</p>
        </div>
      )}
    </div>
  );
}
