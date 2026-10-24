"use client";

import { useEffect, useRef, useState } from "react";
import { Json, post, usd } from "@/lib/api";
import AgentWork from "./AgentWork";
import { CountUp, Reveal } from "./motion";
import { Badge, Button, inputCls, OkCard } from "./ui";

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

export default function Replace({ id, personas, onPurchased }: { id: string; personas: Json[]; onPurchased: () => void }) {
  const [data, setData] = useState<Json | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [checks, setChecks] = useState<Record<string, Json>>({});
  const [sellerPersona, setSellerPersona] = useState("P08");
  const [cap, setCap] = useState("1000");
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
  const capNum = parseNum(cap);
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

  const checkSeller = (vin: string) => run(vin, async () => {
    const r = await post(`/api/claims/${id}/seller-check`, { vin, persona: sellerPersona });
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
        <div role="alert" className="rounded-2xl bg-alert-soft p-5">
          <p className="text-base text-alert">We could not load cars. {loadError}</p>
          <div className="mt-4">
            <Button onClick={() => { setLoadError(null); setAttempt(attempt + 1); }}>Try again</Button>
          </div>
        </div>
      );
    }
    return (
      <div role="status" aria-label="Searching listings" className="space-y-4">
        <AgentWork key="searching" id={id} agent="Shopper" active />
        <div className="grid gap-4 sm:grid-cols-2"><CardSkeleton /><CardSkeleton /></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AgentWork key="shopping" id={id} agent="Shopper" active={!!busy && busy !== "mandate" && busy !== "pay"} defaultOpen={false} />
      <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(150deg,#0b1f4d,#132c8f_55%,#1633c9)] p-6 text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -bottom-24 size-72 rounded-full bg-[radial-gradient(closest-side,rgba(255,163,107,0.5),transparent)]" />
        <div className="relative flex flex-wrap items-center gap-2 text-base text-white/70">
          Your buying power
          <Badge tone={data.source === "demo" ? "amber" : "green"}>{data.source}</Badge>
        </div>
        <div className="relative text-5xl font-light tracking-[-0.03em] sm:text-6xl"><CountUp value={data.budget} format={(n) => usd(n)} /></div>
        <p className="relative mt-2 max-w-prose text-base text-white/85">
          {usd(data.walk_away)} in cash you walk away with
          {data.financing?.max_amount ? `, plus up to ${usd(data.financing.max_amount)} in prequalified financing` : ""}.
          The same listings that show the insurer underpaid you are now your shopping list.
        </p>
      </div>

      <section>
        <h3 className="font-serif text-xl font-semibold text-ink">1. Check sellers before any money moves</h3>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
          <label htmlFor="seller-persona" className="text-base text-ink">Check sellers as</label>
          <select id="seller-persona" className={`${inputCls} !w-auto max-w-full`} value={sellerPersona} onChange={(e) => setSellerPersona(e.target.value)}>
            {personas.map((p) => <option key={p.id} value={p.id}>{p.id} {p.name} ({p.profile})</option>)}
          </select>
          <span className="text-sm text-muted">Test identity for the CRS sandbox.</span>
        </div>

        <ol className="mt-4 grid gap-4 sm:grid-cols-2">
          {data.shortlist.map((l: Json) => {
            const chk = checks[l.vin];
            const over = l.value_gap < 0;
            return (
              <li key={l.vin} className="flex flex-col rounded-2xl bg-cream p-5">
                <div className="text-lg font-semibold text-ink">
                  {l.url ? <a className="underline underline-offset-4" href={l.url} target="_blank" rel="noreferrer">{carName(l)}</a> : carName(l)}
                </div>
                <div className="mt-2 flex flex-wrap items-baseline gap-x-3">
                  <span className="font-serif text-4xl font-semibold tracking-tight text-ink">{usd(l.price)}</span>
                  {over ? <Badge tone="amber">{usd(-l.value_gap)} above market</Badge>
                    : l.value_gap > 0 ? <Badge tone="green">{usd(l.value_gap)} under market</Badge> : null}
                </div>
                <p className="mt-2 text-base text-ink">
                  {l.why}{chk?.clean ? ", and the seller passed the check." : "."}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {l.seller_name ?? "Seller"} ({l.seller_type ?? "unknown"}) · market value {usd(l.market_value)} from {l.market_basis}
                </p>
                {chk && (
                  <div className={`mt-3 rounded-xl p-3 ${chk.clean ? "bg-surface" : "bg-alert-soft"}`}>
                    <div className="flex items-center gap-2">
                      <Badge tone={chk.clean ? "green" : "red"}>{chk.clean ? "Passed" : "Deposit locked"}</Badge>
                      <span className="text-base font-medium text-ink">{chk.clean ? "Identity verified, no liens or judgments" : "Do not send money to this seller yet"}</span>
                    </div>
                    {chk.flags.length > 0 && (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-alert">
                        {chk.flags.map((f: string) => <li key={f}>{f}</li>)}
                      </ul>
                    )}
                    <p className="mt-1 text-sm text-muted">CRS {chk.source === "demo" ? "demo data" : "sandbox"} · {chk.name}</p>
                  </div>
                )}
                <div className="mt-auto flex flex-wrap gap-3 pt-4">
                  <Button variant="secondary" onClick={() => checkSeller(l.vin)} disabled={!!busy}>
                    {busy === l.vin ? "Checking…" : chk ? "Check again" : "Check seller"}
                  </Button>
                  {inMandate.has(l.vin) && chk?.clean && !receipt && (
                    <Button onClick={() => { setHold(l); setConsentKey(null); }}>Hold this car</Button>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        {data.shortlist.length === 0 && <p className="text-base text-muted">No cars fit your budget right now.</p>}
      </section>

      <Reveal>
      <OkCard title="2. Set the agent's mandate" done={!!mandate && !stale}>
        <p className="max-w-prose text-base text-muted">
          Before anything is spent, you decide the limits. The checkout refuses anything outside them.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <dl className="space-y-3">
            <div><dt className="text-sm text-muted">Budget for the car</dt><dd className="text-lg font-semibold text-ink">{usd(data.budget)}</dd></div>
            <div>
              <dt className="text-sm text-muted">Sellers that passed the check</dt>
              <dd className="text-base text-ink">
                {passed.length ? passed.map((c) => data.shortlist.find((l: Json) => l.vin === c.vin)?.seller_name ?? c.vin).join(", ") : "None yet. Check a seller above."}
              </dd>
            </div>
            <div><dt className="text-sm text-muted">Expires</dt><dd className="text-base text-ink">{mandate ? when(mandate.expires_at) : "48 hours after you grant it"}</dd></div>
            <label className="block text-base font-medium text-ink">
              Spending cap ($)
              <input className={`${inputCls} mt-1`} inputMode="decimal" value={cap} onChange={(e) => setCap(e.target.value)} aria-invalid={!capOk} />
            </label>
          </dl>
          <div>
            <p className="text-sm font-semibold text-ink">The agent cannot</p>
            <ul className="mt-2 space-y-1.5 text-base text-ink">
              {(mandate?.cannot ?? [
                "Charge more than the spending cap",
                "Pay a seller that failed or skipped the check",
                "Buy the car, sign a contract or take out a loan",
                "Charge your card without your approval on the next screen",
                "Act after the mandate expires in 48 hours",
              ]).map((c: string) => (
                <li key={c} className="flex gap-2"><span aria-hidden="true" className="text-alert">✕</span>{c}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-5">
          <Button onClick={grant} disabled={!capOk || !passed.length || busy === "mandate" || (!!mandate && !stale && Number(mandate.spending_cap) === capNum)}>
            {busy === "mandate" ? "Granting…" : mandate ? "Update mandate" : "Grant this mandate"}
          </Button>
          {mandate && !stale && <Badge tone="green">Granted {mandate.id}</Badge>}
          {stale && <span className="text-sm text-amber">A new seller passed. Update the mandate to include them.</span>}
        </div>
      </OkCard>
      </Reveal>

      {hold && mandate && (
        <OkCard title="3. Approve this charge">
          <p className="max-w-prose text-base text-ink">
            A refundable deposit on the {carName(hold)} ({usd(hold.price)}) from {hold.seller_name}.
            It holds the car for 48 hours, counts toward the price if you buy, and is refunded if you do not.
          </p>
          <div className="mt-4 grid max-w-xl gap-4 sm:grid-cols-2">
            <label className="block text-base font-medium text-ink">
              Deposit ($)
              <input className={`${inputCls} mt-1`} inputMode="decimal" value={deposit} onChange={(e) => setDeposit(e.target.value)} aria-invalid={!depositOk} />
              <span className="mt-1 block text-sm font-normal text-muted">Your cap is {usd(mandate.spending_cap, true)}.</span>
            </label>
            <label className="block text-base font-medium text-ink">
              Visa test card
              <input className={`${inputCls} mt-1 font-mono`} inputMode="numeric" autoComplete="off" value={card} onChange={(e) => setCard(e.target.value)} />
              <span className="mt-1 block text-sm font-normal text-muted">Test mode: only test numbers work. No real charge.</span>
            </label>
          </div>
          <label className="mt-5 flex items-start gap-3 text-base text-ink">
            <input
              type="checkbox"
              className="mt-1 size-5 accent-brand"
              checked={consent}
              disabled={!depositOk}
              onChange={(e) => setConsentKey(e.target.checked ? `${hold.vin}|${deposit}|${card}` : null)}
            />
            <span>I approve one {depositOk ? usd(depositNum, true) : "$0"} hold on this test card. No other charges.</span>
          </label>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={pay} disabled={!consent || !depositOk || busy === "pay"}>{busy === "pay" ? "Placing hold…" : "Place deposit"}</Button>
            <Button variant="secondary" onClick={() => setHold(null)}>Cancel</Button>
          </div>
        </OkCard>
      )}
      {error && <p role="alert" className="rounded-xl bg-alert-soft px-4 py-3 text-base text-alert">{error}</p>}

      {receipt && (
        <section className="rounded-2xl bg-brand-soft p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-2xl font-semibold text-ink">Car held</h3>
            <Badge tone="amber">test mode</Badge>
          </div>
          <p className="mt-1 text-base text-muted">
            Receipt {receipt.id} · {carName(receipt.car)} · {receipt.network} ending {receipt.card_last4}
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
          <div className="mt-2 rounded-xl bg-surface p-4">
            <p className="text-sm font-semibold text-ink">Stayed inside mandate {receipt.mandate_id}</p>
            <ul className="mt-2 space-y-1 text-base text-ink">
              {receipt.within_mandate.map((w: string) => (
                <li key={w} className="flex gap-2"><span aria-hidden="true" className="text-brand">✓</span>{w}</li>
              ))}
            </ul>
          </div>
          <p className="mt-4 text-base text-ink">
            <span className="font-semibold text-brand">{usd(receipt.remaining_under_cap, true)} left</span> under your{" "}
            {usd(receipt.spending_cap, true)} cap. {receipt.verified_buyer}
          </p>
        </section>
      )}
    </div>
  );
}
