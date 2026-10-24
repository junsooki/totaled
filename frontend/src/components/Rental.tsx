"use client";

import { useEffect, useRef, useState } from "react";
import { Json, post, usd } from "@/lib/api";
import { Badge, Button, inputCls } from "./ui";

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

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-cream p-5" aria-hidden="true">
      <div className="h-4 w-1/3 rounded bg-line" />
      <div className="mt-3 h-10 w-1/2 rounded bg-line" />
      <div className="mt-3 h-4 w-3/4 rounded bg-line" />
      <div className="mt-5 h-12 w-full rounded-xl bg-line" />
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

  const stepBtn =
    "flex size-12 cursor-pointer items-center justify-center rounded-xl bg-surface text-2xl font-semibold text-brand ring-1 ring-inset ring-brand/40 hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="space-y-6">
      <p className="max-w-prose text-base text-muted">
        Your car is totaled, so you may need a ride while the claim is open. The next car comes after.
      </p>

      <div>
        <label htmlFor="rental-days" className="block text-base font-medium text-ink">
          How many days do you need a rental?
        </label>
        <p className="text-sm text-muted">This is your own estimate of how long the claim will take.</p>
        <div className="mt-2 flex items-center gap-2">
          <button type="button" className={stepBtn} onClick={() => step(-1)} disabled={daysValid && daysNum <= 1} aria-label="One day fewer">−</button>
          <input
            id="rental-days"
            className={`${inputCls} !w-20 text-center font-serif text-xl font-semibold`}
            inputMode="numeric"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            aria-invalid={!daysValid}
          />
          <button type="button" className={stepBtn} onClick={() => step(1)} disabled={daysValid && daysNum >= 90} aria-label="One day more">+</button>
          <span className="text-base text-muted">days</span>
        </div>
        {!daysValid && <p role="alert" className="mt-2 text-base text-alert">Enter a whole number of days from 1 to 90.</p>}
      </div>

      {loading && (
        <div role="status" aria-label="Searching rentals">
          <p className="mb-3 text-base text-muted">Looking for rentals near you…</p>
          <div className="grid gap-4 sm:grid-cols-2"><CardSkeleton /><CardSkeleton /></div>
        </div>
      )}

      {searchError && (
        <div role="alert" className="rounded-2xl bg-alert-soft p-5">
          <p className="text-base text-alert">We could not load rentals. {searchError}</p>
          <div className="mt-4"><Button onClick={() => { setResult(null); setAttempt(attempt + 1); }}>Try again</Button></div>
        </div>
      )}

      {data && (
        <div>
          <p className="flex flex-wrap items-center gap-2 text-base text-muted">
            Rentals for {data.days} days
            <Badge tone={data.source === "demo" ? "amber" : "green"}>{data.source}</Badge>
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {data.options.map((o: Json) => (
              <div key={o.id} className="flex flex-col rounded-2xl bg-cream p-5">
                <div className="text-lg font-semibold text-ink">{o.agency}</div>
                <div className="text-base text-muted">{o.car_class} · e.g. {o.example_car}</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-serif text-4xl font-semibold tracking-tight text-ink">{usd(o.daily_rate, true)}</span>
                  <span className="text-base text-muted">per day</span>
                </div>
                <div className="mt-1 text-base text-ink">{usd(o.total, true)} for {data.days} days</div>
                <div className="text-sm text-muted">{o.pickup_distance_mi} mi away</div>
                <div className="mt-4 pt-1">
                  <Button variant={activeHold?.id === o.id ? "secondary" : "primary"} onClick={() => { setHold({ opt: o, days: daysNum }); setConsentKey(null); }}>
                    {activeHold?.id === o.id ? "Selected" : "Hold this rental"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeHold && data && (
        <div className="rounded-2xl bg-brand-soft p-6">
          <h3 className="font-serif text-2xl font-semibold text-ink">Approve this charge</h3>
          <p className="mt-2 max-w-prose text-base text-ink">
            We place a refundable hold on a {activeHold.car_class} ({activeHold.example_car}) from {activeHold.agency}.
            That is {data.days} days at {usd(activeHold.daily_rate, true)} per day, about {usd(activeHold.total, true)}.
            The hold is released when you return the car. You pay the rental cost at the counter.
          </p>
          <div className="mt-4 grid max-w-xl gap-4 sm:grid-cols-2">
            <label className="block text-base font-medium text-ink">
              Hold amount ($)
              <input className={`${inputCls} mt-1`} inputMode="decimal" value={deposit} onChange={(e) => setDeposit(e.target.value)} aria-invalid={!depositOk} />
            </label>
            <label className="block text-base font-medium text-ink">
              Your spending cap ($)
              <input className={`${inputCls} mt-1`} inputMode="decimal" value={cap} onChange={(e) => setCap(e.target.value)} aria-invalid={!capOk} />
              <span className="mt-1 block text-sm font-normal text-muted">The same cap covers the rental and your next car.</span>
            </label>
          </div>
          {!inputsOk && (
            <p role="alert" className="mt-3 text-base text-alert">
              {!depositOk ? "Enter a hold amount that is more than $0." : "Enter a spending cap that is more than $0."}
            </p>
          )}
          <label className="mt-5 flex items-start gap-3 text-base text-ink">
            <input
              type="checkbox"
              className="mt-1 size-5 accent-brand"
              checked={consent}
              disabled={!inputsOk}
              onChange={(e) => setConsentKey(e.target.checked ? `${deposit}|${cap}` : null)}
            />
            <span>I approve a {depositOk ? usd(depositNum, true) : "$0"} hold on my Visa card. No other charges.</span>
          </label>
          <p className="mt-2 max-w-prose text-sm text-muted">
            This is a simulated Visa checkout for the demo. No real payment is made and no card is charged.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={pay} disabled={!consent || !inputsOk || paying}>{paying ? "Paying…" : "Pay rental hold"}</Button>
            <Button variant="secondary" onClick={() => setHold(null)}>Cancel</Button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="rounded-xl bg-alert-soft px-4 py-3 text-base text-alert">{error}</p>}

      {receipt && (
        <div className="rounded-2xl bg-brand-soft p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-2xl font-semibold text-ink">Rental held</h3>
            <Badge tone="amber">simulated</Badge>
          </div>
          <p className="mt-1 text-base text-muted">
            Receipt {receipt.id} · {receipt.rental.agency} · {receipt.rental.car_class} ({receipt.rental.example_car}) ·{" "}
            {receipt.rental.days} days at {usd(receipt.rental.daily_rate, true)} per day · {receipt.network}
          </p>
          <ul className="mt-4 divide-y divide-line">
            {receipt.lines.map((ln: Json) => (
              <li key={ln.label} className="flex items-start justify-between gap-4 py-2">
                <div>
                  <div className="text-base text-ink">{ln.label}</div>
                  <div className="text-sm text-muted">{ln.why}</div>
                </div>
                <div className="text-base text-ink">{usd(ln.amount, true)}</div>
              </li>
            ))}
            <li className="flex items-baseline justify-between gap-4 py-3">
              <div className="text-base font-semibold text-ink">Total held</div>
              <div className="font-serif text-2xl font-semibold text-ink">{usd(receipt.total, true)}</div>
            </li>
          </ul>
          <p className="text-base text-ink">
            <span className="font-semibold text-brand">{usd(receipt.remaining_under_cap, true)} left</span> under your{" "}
            {usd(receipt.spending_cap, true)} spending cap, counting both holds.
          </p>
          <p className="mt-1 text-sm text-muted">
            Estimated rental cost {usd(receipt.rental.estimated_total, true)}, paid at the counter.
          </p>
        </div>
      )}
    </div>
  );
}
