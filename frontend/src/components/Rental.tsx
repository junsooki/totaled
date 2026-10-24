"use client";

import { useEffect, useRef, useState } from "react";
import { Json, post, usd } from "@/lib/api";
import { Badge, Button, Notice, SummaryList, inputCls } from "./ui";

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

const parseNum = (s: string) => (s.trim() === "" ? NaN : Number(s));

function EntrySkeleton() {
  return (
    <div className="animate-pulse border-t-2 border-rule pt-3" aria-hidden="true">
      <div className="h-5 w-1/3 bg-line" />
      <div className="mt-3 h-10 w-1/2 bg-line" />
      <div className="mt-3 h-4 w-3/4 bg-line" />
    </div>
  );
}

type Result = { days: number; data?: Json; error?: string };

export default function Rental({ id, cap, setCap, onHeld }: { id: string; cap: string; setCap: (v: string) => void; onHeld: () => void }) {
  const [days, setDays] = useState("14");
  const [result, setResult] = useState<Result | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [hold, setHold] = useState<{ opt: Json; days: number } | null>(null);
  const [deposit, setDeposit] = useState("200");
  const [consentKey, setConsentKey] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Json | null>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const first = useRef(true);

  const daysNum = parseNum(days);
  const daysValid = Number.isInteger(daysNum) && daysNum >= 1 && daysNum <= 90;

  // Search on mount and when days change (debounced). Stale responses are ignored.
  useEffect(() => {
    if (!daysValid) return;
    let stale = false;
    const delay = first.current ? 0 : 400;
    const t = setTimeout(async () => {
      first.current = false;
      try {
        const data = await post(`/api/claims/${id}/rentals`, { days: daysNum });
        if (!stale) setResult({ days: daysNum, data });
      } catch (e) {
        if (!stale) setResult({ days: daysNum, error: errMsg(e) });
      }
    }, delay);
    return () => {
      stale = true;
      clearTimeout(t);
    };
  }, [id, daysNum, daysValid, attempt]);

  const current = daysValid && result?.days === daysNum ? result : null;
  const data = current?.data;
  const searchError = current?.error;
  const loading = daysValid && !current;
  const activeHold = hold && data && hold.days === daysNum ? hold.opt : null;

  const depositNum = parseNum(deposit);
  const capNum = parseNum(cap);
  const depositOk = Number.isFinite(depositNum) && depositNum > 0;
  const capOk = Number.isFinite(capNum) && capNum > 0;
  const inputsOk = depositOk && capOk;
  const consent = consentKey === `${deposit}|${cap}`;

  const step = (n: number) => {
    const base = daysValid ? daysNum : 14;
    setDays(String(Math.min(90, Math.max(1, base + n))));
  };

  async function pay() {
    if (!activeHold || !data) return;
    if (!inputsOk) {
      setError("Enter a hold and a spending cap that are more than $0.");
      return;
    }
    setPaying(true);
    setError(null);
    try {
      const r = await post(`/api/claims/${id}/rental-checkout`, {
        rental_id: activeHold.id, days: data.days, deposit: depositNum, spending_cap: capNum, consent,
      });
      setReceipt(r);
      setHold(null);
      onHeld();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="space-y-8">
      <p className="max-w-prose text-lg text-muted">
        Your car is totaled, so you may need a ride while the claim is open. The next car comes after.
      </p>

      <div>
        <label htmlFor="rental-days" className="block text-base font-medium text-ink">
          How many days do you need a rental?
        </label>
        <p className="mt-1 text-base text-muted">This is your own estimate of how long the claim will take.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => step(-1)} disabled={daysValid && daysNum <= 1}>
            <span aria-hidden="true">−</span>
            <span className="sr-only">One day fewer</span>
          </Button>
          <input
            id="rental-days"
            className={`${inputCls} !w-24 text-center font-serif text-2xl font-semibold`}
            inputMode="numeric"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            aria-invalid={!daysValid}
          />
          <Button variant="secondary" onClick={() => step(1)} disabled={daysValid && daysNum >= 90}>
            <span aria-hidden="true">+</span>
            <span className="sr-only">One day more</span>
          </Button>
          <span className="text-base text-muted">days</span>
        </div>
        {!daysValid && <p role="alert" className="mt-2 text-base text-alert">Enter a whole number of days from 1 to 90.</p>}
      </div>

      {loading && (
        <div role="status" aria-label="Searching rentals">
          <p className="mb-3 text-base text-muted">Looking for rentals near you…</p>
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2"><EntrySkeleton /><EntrySkeleton /></div>
        </div>
      )}

      {searchError && (
        <div className="space-y-4">
          <Notice tone="bad">
            <p>We could not load rentals. {searchError}</p>
          </Notice>
          <Button onClick={() => { setResult(null); setAttempt(attempt + 1); }}>Try again</Button>
        </div>
      )}

      {data && (
        <div>
          <p className="flex flex-wrap items-center gap-2 text-base text-muted">
            Rentals for {data.days} days
            <Badge tone={data.source === "demo" ? "amber" : "green"}>{data.source}</Badge>
          </p>
          <div className="mt-4 grid gap-x-8 gap-y-8 sm:grid-cols-2">
            {data.options.map((o: Json) => {
              const selected = activeHold?.id === o.id;
              return (
                <div key={o.id} className="flex flex-col border-t-2 border-rule pt-4">
                  <div className={selected ? "border-l-[5px] border-brand pl-4" : ""}>
                    <div className="text-lg font-semibold text-ink">{o.agency}</div>
                    <div className="text-base text-muted">{o.car_class} · e.g. {o.example_car}</div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="font-serif text-4xl font-semibold tracking-tight text-ink">{usd(o.daily_rate, true)}</span>
                      <span className="text-base text-muted">per day</span>
                    </div>
                    <div className="mt-1 text-base text-ink">{usd(o.total, true)} for {data.days} days</div>
                    <div className="text-base text-muted">{o.pickup_distance_mi} mi away</div>
                  </div>
                  <div className="mt-4">
                    <Button variant={selected ? "secondary" : "primary"} onClick={() => { setHold({ opt: o, days: daysNum }); setConsentKey(null); }}>
                      {selected ? "Selected" : "Hold this rental"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeHold && data && (
        <div className="border-t-4 border-rule pt-4">
          <h3 className="font-serif text-2xl font-semibold text-ink">Approve this hold</h3>
          <p className="mt-2 max-w-prose text-base text-ink">
            We place a refundable hold on a rental car. The hold is released when you return the car. You pay the rental cost at the counter.
          </p>
          <div className="mt-4">
            <SummaryList
              rows={[
                { label: "Agency", value: activeHold.agency },
                { label: "Car", value: `${activeHold.car_class} (${activeHold.example_car})` },
                { label: "Rate", value: `${data.days} days at ${usd(activeHold.daily_rate, true)} per day` },
                { label: "Estimated rental cost", value: usd(activeHold.total, true) },
              ]}
            />
          </div>
          <div className="mt-4 grid max-w-xl gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="rental-deposit" className="block text-base font-medium text-ink">Hold amount ($)</label>
              <input id="rental-deposit" className={`${inputCls} mt-1`} inputMode="decimal" value={deposit} onChange={(e) => setDeposit(e.target.value)} aria-invalid={!depositOk} />
            </div>
            <div>
              <label htmlFor="rental-cap" className="block text-base font-medium text-ink">Your spending cap ($)</label>
              <input id="rental-cap" className={`${inputCls} mt-1`} inputMode="decimal" value={cap} onChange={(e) => setCap(e.target.value)} aria-invalid={!capOk} aria-describedby="rental-cap-hint" />
              <p id="rental-cap-hint" className="mt-1 text-base text-muted">The same cap covers the rental and your next car.</p>
            </div>
          </div>
          {!inputsOk && (
            <p role="alert" className="mt-3 text-base text-alert">
              {!depositOk ? "Enter a hold amount that is more than $0." : "Enter a spending cap that is more than $0."}
            </p>
          )}
          <label className="mt-6 flex items-start gap-3 text-lg text-ink">
            <input
              type="checkbox"
              className="mt-0.5 size-6 shrink-0 accent-brand"
              checked={consent}
              disabled={!inputsOk}
              onChange={(e) => setConsentKey(e.target.checked ? `${deposit}|${cap}` : null)}
            />
            <span>I approve a {depositOk ? usd(depositNum, true) : "$0"} hold on my Visa card. No other charges.</span>
          </label>
          <div className="mt-4 max-w-prose">
            <Notice tone="info">
              <p>This is a simulated Visa checkout for the demo. No real payment is made and no card is charged.</p>
            </Notice>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={pay} disabled={!consent || !inputsOk || paying}>{paying ? "Paying…" : "Pay rental hold"}</Button>
            <Button variant="secondary" onClick={() => setHold(null)}>Cancel</Button>
          </div>
        </div>
      )}
      {error && <Notice tone="bad"><p>{error}</p></Notice>}

      {receipt && (
        <div className="border-t-4 border-rule pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-serif text-2xl font-semibold text-ink">Rental held</h3>
            <Badge tone="amber">simulated</Badge>
          </div>
          <p className="mt-1 text-base text-muted">
            Receipt {receipt.id} · {receipt.rental.agency} · {receipt.rental.car_class} ({receipt.rental.example_car}) ·{" "}
            {receipt.rental.days} days at {usd(receipt.rental.daily_rate, true)} per day · {receipt.network}
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
                {
                  label: "Left under your cap",
                  value: `${usd(receipt.remaining_under_cap, true)} of ${usd(receipt.spending_cap, true)}, counting both holds`,
                  tone: "good" as const,
                },
              ]}
            />
          </div>
          <p className="mt-2 text-base text-muted">
            Estimated rental cost {usd(receipt.rental.estimated_total, true)}, paid at the counter.
          </p>
        </div>
      )}
    </div>
  );
}
