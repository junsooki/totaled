"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Json, post, usd } from "@/lib/api";
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

const LiveAuctionPanel = dynamic(() => import("./live/LiveBits").then((m) => m.LiveAuctionPanel), { ssr: false });
const LIVE = !!process.env.NEXT_PUBLIC_SPACETIME_DB;
// An auction win has a `car` string and null year/make/model; listings have the parts.
const carName = (c: Json) => c.car ?? `${c.year} ${c.make} ${c.model} ${c.trim ?? ""}`.trim();

const parseNum = (s: string) => (s.trim() === "" ? NaN : Number(s));

function EntrySkeleton() {
  return (
    <div className="animate-pulse border-t-2 border-rule pt-3" aria-hidden="true">
      <div className="h-5 w-2/3 bg-line" />
      <div className="mt-3 h-10 w-1/2 bg-line" />
      <div className="mt-3 h-4 w-3/4 bg-line" />
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
        <div className="space-y-4">
          <Notice tone="bad">
            <p>We could not load cars. {loadError}</p>
          </Notice>
          <Button onClick={() => { setLoadError(null); setAttempt(attempt + 1); }}>Try again</Button>
        </div>
      );
    }
    return (
      <div role="status" aria-label="Searching listings">
        <p className="mb-3 text-base text-muted">Searching listings near you…</p>
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2"><EntrySkeleton /><EntrySkeleton /></div>
      </div>
    );
  }

  const financing = data.financing?.max_amount;

  return (
    <div className="space-y-10">
      <div>
        <p className="mb-3 flex flex-wrap items-center gap-2 text-base text-muted">
          Listings are
          <Badge tone={data.source === "demo" ? "amber" : "green"}>{data.source}</Badge>
        </p>
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-3">
          <Stat label="Your budget" value={usd(data.budget)} />
          <Stat label="Cash you walk away with" value={usd(data.walk_away)} />
          <Stat label="Prequalified financing" value={financing ? `Up to ${usd(financing)}` : "None"} />
        </div>
      </div>

      {LIVE && (
        <div className="border-t-2 border-rule pt-4">
          <h2 className="mb-4 font-serif text-2xl font-semibold text-ink">Live dealer auction</h2>
          <LiveAuctionPanel
            claimId={id}
            onAwarded={(win) => {
              setChecks((prev) => ({ ...prev, [win.vin]: { verdict: "OK: dealer chosen in the live auction" } }));
              setHold(win);
              setConsentKey(null);
            }}
          />
        </div>
      )}

      <div>
        <h2 className="font-serif text-2xl font-semibold text-ink">Or pick from today&apos;s listings</h2>

        <div className="mt-4">
          <label htmlFor="seller-persona" className="block text-base font-medium text-ink">Check sellers as</label>
          <select id="seller-persona" className={`${inputCls} mt-1 !w-auto max-w-full`} value={sellerPersona} onChange={(e) => setSellerPersona(e.target.value)}>
            {personas.map((p) => <option key={p.id} value={p.id}>{p.id} {p.name} ({p.profile})</option>)}
          </select>
          <p className="mt-1 text-base text-muted">Demo identity for the CRS sandbox.</p>
        </div>

        <div className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2">
          {data.shortlist.map((l: Json) => {
            const chk = checks[l.vin];
            const label = chk ? verdictLabel(chk.verdict) : null;
            const stop = label === "STOP";
            const title = `${l.year} ${l.make} ${l.model} ${l.trim ?? ""}`.trim();
            const selected = hold?.vin === l.vin;
            return (
              <div key={l.vin} className="flex flex-col border-t-2 border-rule pt-4">
                <div className={selected ? "border-l-[5px] border-brand pl-4" : ""}>
                  <div className="text-lg font-semibold text-ink">
                    {l.url ? <a className="text-brand underline underline-offset-4" href={l.url} target="_blank" rel="noreferrer">{title}</a> : title}
                  </div>
                  <div className="mt-2 font-serif text-4xl font-semibold tracking-tight text-ink">{usd(l.price)}</div>
                  <div className="mt-1 text-base font-medium">
                    {l.value_gap > 0 ? <span className="text-brand">{usd(l.value_gap)} under market</span>
                      : l.value_gap < 0 ? <span className="text-amber">{usd(-l.value_gap)} over market</span>
                        : <span className="text-muted">At market price</span>}
                  </div>
                  <div className="mt-2 text-base text-muted">
                    {l.mileage != null ? `${l.mileage.toLocaleString()} mi · ` : ""}
                    {l.distance_mi != null ? `${l.distance_mi} mi away · ` : ""}
                    {l.seller_name ?? "Seller"} ({l.seller_type ?? "unknown"})
                  </div>
                </div>
                {chk && (
                  <div className="mt-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge tone={label === "OK" ? "green" : stop ? "red" : "amber"}>{label}</Badge>
                      <span className="text-base font-medium text-ink">
                        {label === "OK" ? "Seller looks fine" : stop ? "Do not buy from this seller" : "Be careful with this seller"}
                      </span>
                    </div>
                    <p className="mt-1 text-base text-muted">Identity: {chk.identity_detail}. Records: {chk.records_detail}. ({chk.source})</p>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={() => checkSeller(l.vin)} disabled={!!busy}>
                    {busy === l.vin ? "Checking…" : chk ? "Check again" : "Check seller"}
                  </Button>
                  <Button onClick={() => { setHold(l); setConsentKey(null); }} disabled={!chk || stop}>
                    Hold this car
                  </Button>
                </div>
                {!chk && <p className="mt-2 text-base text-muted">Check the seller first to hold this car.</p>}
              </div>
            );
          })}
        </div>
        {data.shortlist.length === 0 && <p className="mt-6 text-base text-muted">No cars fit your budget right now.</p>}
      </div>

      {hold && (
        <div className="border-t-4 border-rule pt-4">
          <h3 className="font-serif text-2xl font-semibold text-ink">Approve this hold</h3>
          <p className="mt-2 max-w-prose text-base text-ink">
            We place a refundable deposit. It holds the car for 48 hours, counts toward the price if you buy, and is refunded if you do not.
          </p>
          <div className="mt-4">
            <SummaryList
              rows={[
                { label: "Car", value: carName(hold) },
                { label: "Price", value: usd(hold.price) },
                { label: "Seller", value: hold.seller_name ?? "Seller" },
              ]}
            />
          </div>
          <div className="mt-4 grid max-w-xl gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="car-deposit" className="block text-base font-medium text-ink">Deposit ($)</label>
              <input id="car-deposit" className={`${inputCls} mt-1`} inputMode="decimal" value={deposit} onChange={(e) => setDeposit(e.target.value)} aria-invalid={!depositOk} />
            </div>
            <div>
              <label htmlFor="car-cap" className="block text-base font-medium text-ink">Your spending cap ($)</label>
              <input id="car-cap" className={`${inputCls} mt-1`} inputMode="decimal" value={cap} onChange={(e) => setCap(e.target.value)} aria-invalid={!capOk} aria-describedby="car-cap-hint" />
              <p id="car-cap-hint" className="mt-1 text-base text-muted">The same cap covers the rental and your next car.</p>
            </div>
          </div>
          {!inputsOk && (
            <p role="alert" className="mt-3 text-base text-alert">
              {!depositOk ? "Enter a deposit that is more than $0." : "Enter a spending cap that is more than $0."}
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
            <Button onClick={pay} disabled={!consent || !inputsOk || busy === "pay"}>{busy === "pay" ? "Paying…" : "Pay deposit"}</Button>
            <Button variant="secondary" onClick={() => setHold(null)}>Cancel</Button>
          </div>
        </div>
      )}
      {error && <Notice tone="bad"><p>{error}</p></Notice>}

      {receipt && (
        <div className="border-t-4 border-rule pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-serif text-2xl font-semibold text-ink">Car held</h3>
            <Badge tone="amber">simulated</Badge>
          </div>
          <p className="mt-1 text-base text-muted">
            Receipt {receipt.id} · {carName(receipt.car)} · {receipt.network}
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
        </div>
      )}
    </div>
  );
}
