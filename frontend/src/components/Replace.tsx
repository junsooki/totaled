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
      <div className="h-5 w-2/3 rounded bg-line" />
      <div className="mt-3 h-10 w-1/2 rounded bg-line" />
      <div className="mt-3 h-4 w-3/4 rounded bg-line" />
      <div className="mt-5 h-12 w-full rounded-xl bg-line" />
    </div>
  );
}

const verdictLabel = (v: string) => (v.startsWith("OK") ? "OK" : v.startsWith("STOP") ? "STOP" : "CAUTION");

export default function Replace({ id, personas, cap, setCap, onPurchased }: {
  id: string; personas: Json[]; cap: string; setCap: (v: string) => void; onPurchased: () => void;
}) {
  const [data, setData] = useState<Json | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [checks, setChecks] = useState<Record<string, Json>>({});
  const [sellerPersona, setSellerPersona] = useState("P08");
  const [hold, setHold] = useState<Json | null>(null);
  const [deposit, setDeposit] = useState("500");
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
  const capNum = parseNum(cap);
  const depositOk = Number.isFinite(depositNum) && depositNum > 0;
  const capOk = Number.isFinite(capNum) && capNum > 0;
  const inputsOk = depositOk && capOk;
  const consent = consentKey === `${deposit}|${cap}`;

  async function checkSeller(vin: string) {
    setBusy(vin);
    setError(null);
    try {
      const r = await post(`/api/claims/${id}/seller-check`, { vin, persona: sellerPersona });
      setChecks((prev) => ({ ...prev, [vin]: r }));
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy("");
    }
  }

  async function pay() {
    if (!hold) return;
    if (!inputsOk) {
      setError("Enter a deposit and a spending cap that are more than $0.");
      return;
    }
    setBusy("pay");
    setError(null);
    try {
      const r = await post(`/api/claims/${id}/checkout`, {
        vin: hold.vin, deposit: depositNum, spending_cap: capNum, consent,
      });
      setReceipt(r);
      setHold(null);
      onPurchased();
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setBusy("");
    }
  }

  if (!data) {
    if (loadError) {
      return (
        <div role="alert" className="rounded-2xl bg-alert-soft p-5">
          <p className="text-base text-alert">We could not load cars. {loadError}</p>
          <div className="mt-4">
            <Button onClick={() => { setLoadError(null); setAttempt(attempt + 1); }}>Try again</Button>
          </div>
        </div>
      );
    }
    return (
      <div role="status" aria-label="Searching listings">
        <p className="mb-3 text-base text-muted">Searching listings near you…</p>
        <div className="grid gap-4 sm:grid-cols-2"><CardSkeleton /><CardSkeleton /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-brand-soft p-5">
        <div className="flex flex-wrap items-center gap-2 text-base text-muted">
          Your budget
          <Badge tone={data.source === "demo" ? "amber" : "green"}>{data.source}</Badge>
        </div>
        <div className="font-serif text-4xl font-semibold tracking-tight text-ink">{usd(data.budget)}</div>
        <p className="mt-1 text-base text-ink">
          {usd(data.walk_away)} in cash you walk away with
          {data.financing?.max_amount ? `, plus up to ${usd(data.financing.max_amount)} in prequalified financing` : ""}.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <label htmlFor="seller-persona" className="text-base text-ink">Check sellers as</label>
        <select id="seller-persona" className={`${inputCls} !w-auto max-w-full`} value={sellerPersona} onChange={(e) => setSellerPersona(e.target.value)}>
          {personas.map((p) => <option key={p.id} value={p.id}>{p.id} {p.name} ({p.profile})</option>)}
        </select>
        <span className="text-sm text-muted">Demo identity for the CRS sandbox.</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {data.shortlist.map((l: Json) => {
          const chk = checks[l.vin];
          const label = chk ? verdictLabel(chk.verdict) : null;
          const stop = label === "STOP";
          const title = `${l.year} ${l.make} ${l.model} ${l.trim ?? ""}`.trim();
          return (
            <div key={l.vin} className="flex flex-col rounded-2xl bg-cream p-5">
              <div className="text-lg font-semibold text-ink">
                {l.url ? <a className="underline underline-offset-4" href={l.url} target="_blank" rel="noreferrer">{title}</a> : title}
              </div>
              <div className="mt-2 font-serif text-4xl font-semibold tracking-tight text-ink">{usd(l.price)}</div>
              <div className="mt-1 text-base font-medium">
                {l.value_gap > 0 ? <span className="text-brand">{usd(l.value_gap)} under market</span>
                  : l.value_gap < 0 ? <span className="text-amber">{usd(-l.value_gap)} over market</span>
                    : <span className="text-muted">At market price</span>}
              </div>
              <div className="mt-2 text-sm text-muted">
                {l.mileage != null ? `${l.mileage.toLocaleString()} mi · ` : ""}
                {l.distance_mi != null ? `${l.distance_mi} mi away · ` : ""}
                {l.seller_name ?? "Seller"} ({l.seller_type ?? "unknown"})
              </div>
              {chk && (
                <div className="mt-3 rounded-xl bg-surface p-3">
                  <div className="flex items-center gap-2">
                    <Badge tone={label === "OK" ? "green" : stop ? "red" : "amber"}>{label}</Badge>
                    <span className="text-base font-medium text-ink">
                      {label === "OK" ? "Seller looks fine" : stop ? "Do not buy from this seller" : "Be careful with this seller"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">Identity: {chk.identity_detail}. Records: {chk.records_detail}. ({chk.source})</p>
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-3 pt-1">
                <Button variant="secondary" onClick={() => checkSeller(l.vin)} disabled={!!busy}>
                  {busy === l.vin ? "Checking…" : chk ? "Check again" : "Check seller"}
                </Button>
                <Button onClick={() => { setHold(l); setConsentKey(null); }} disabled={!chk || stop}>
                  Hold this car
                </Button>
              </div>
              {!chk && <p className="mt-2 text-sm text-muted">Check the seller first to hold this car.</p>}
            </div>
          );
        })}
      </div>
      {data.shortlist.length === 0 && <p className="text-base text-muted">No cars fit your budget right now.</p>}

      {hold && (
        <div className="rounded-2xl bg-brand-soft p-6">
          <h3 className="font-serif text-2xl font-semibold text-ink">Approve this charge</h3>
          <p className="mt-2 max-w-prose text-base text-ink">
            We place a refundable deposit on the {hold.year} {hold.make} {hold.model} {hold.trim} ({usd(hold.price)}) from {hold.seller_name}.
            It holds the car for 48 hours, counts toward the price if you buy, and is refunded if you do not.
          </p>
          <div className="mt-4 grid max-w-xl gap-4 sm:grid-cols-2">
            <label className="block text-base font-medium text-ink">
              Deposit ($)
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
              {!depositOk ? "Enter a deposit that is more than $0." : "Enter a spending cap that is more than $0."}
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
            <span>I approve a {depositOk ? usd(depositNum, true) : "$0"} charge to my Visa card. No other charges.</span>
          </label>
          <p className="mt-2 max-w-prose text-sm text-muted">
            This is a simulated Visa checkout for the demo. No real payment is made and no card is charged.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={pay} disabled={!consent || !inputsOk || busy === "pay"}>{busy === "pay" ? "Paying…" : "Pay deposit"}</Button>
            <Button variant="secondary" onClick={() => setHold(null)}>Cancel</Button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="rounded-xl bg-alert-soft px-4 py-3 text-base text-alert">{error}</p>}

      {receipt && (
        <div className="rounded-2xl bg-brand-soft p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-2xl font-semibold text-ink">Car held</h3>
            <Badge tone="amber">simulated</Badge>
          </div>
          <p className="mt-1 text-base text-muted">
            Receipt {receipt.id} · {receipt.car.year} {receipt.car.make} {receipt.car.model} {receipt.car.trim} · {receipt.network}
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
        </div>
      )}
    </div>
  );
}
