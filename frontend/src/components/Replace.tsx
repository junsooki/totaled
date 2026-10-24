"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Json, post, usd } from "@/lib/api";
import { Badge, Button, inputCls } from "./ui";

const LiveAuctionPanel = dynamic(() => import("./live/LiveBits").then((m) => m.LiveAuctionPanel), { ssr: false });
const carName = (c: Json) => c.car ?? `${c.year} ${c.make} ${c.model} ${c.trim ?? ""}`;

export default function Replace({ id, personas, onPurchased }: { id: string; personas: Json[]; onPurchased: () => void }) {
  const [data, setData] = useState<Json | null>(null);
  const [checks, setChecks] = useState<Record<string, Json>>({});
  const [sellerPersona, setSellerPersona] = useState("P08");
  const [hold, setHold] = useState<Json | null>(null);
  const [deposit, setDeposit] = useState("500");
  const [cap, setCap] = useState("1000");
  const [consent, setConsent] = useState(false);
  const [receipt, setReceipt] = useState<Json | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function act(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy("");
    }
  }

  const shortlist = () => act("list", async () => setData(await post(`/api/claims/${id}/replace`)));
  const checkSeller = (vin: string) =>
    act(vin, async () => {
      const r = await post(`/api/claims/${id}/seller-check`, { vin, persona: sellerPersona });
      setChecks({ ...checks, [vin]: r });
    });
  const pay = () =>
    act("pay", async () => {
      const r = await post(`/api/claims/${id}/checkout`, {
        vin: hold.vin, deposit: Number(deposit), spending_cap: Number(cap), consent,
      });
      setReceipt(r);
      setHold(null);
      onPurchased();
    });

  if (!data) {
    return (
      <div>
        <Button onClick={shortlist} disabled={busy === "list"}>{busy === "list" ? "Searching listings…" : "Find replacement cars"}</Button>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  const verdictTone = (v: string) => (v.startsWith("OK") ? "green" : v.startsWith("STOP") ? "red" : "amber");
  return (
    <div className="space-y-4">
      <p className="text-sm">
        Budget <b>{usd(data.budget)}</b>: {usd(data.walk_away)} you walk away with
        {data.financing.max_amount ? ` + up to ${usd(data.financing.max_amount)} prequalified financing` : ""}.{" "}
        <Badge tone={data.source === "demo" ? "amber" : "zinc"}>{data.source}</Badge>
      </p>
      {process.env.NEXT_PUBLIC_SPACETIME_DB && (
        <LiveAuctionPanel claimId={id} onAwarded={(win) => { setChecks({ ...checks, [win.vin]: { verdict: "OK: dealer chosen in the live auction" } }); setHold(win); setConsent(false); }} />
      )}
      <h3 className="pt-2 font-medium">Or pick from today&apos;s listings</h3>
      <label className="block max-w-md text-xs text-zinc-500">Seller identity for the check (CRS sandbox persona)
        <select className={inputCls} value={sellerPersona} onChange={(e) => setSellerPersona(e.target.value)}>
          {personas.map((p) => <option key={p.id} value={p.id}>{p.id} {p.name} ({p.profile})</option>)}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        {data.shortlist.map((l: Json) => {
          const chk = checks[l.vin];
          return (
            <div key={l.vin} className="rounded border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="flex items-baseline justify-between">
                <div className="font-medium">
                  {l.url ? <a className="underline" href={l.url} target="_blank" rel="noreferrer">{l.year} {l.make} {l.model} {l.trim}</a>
                    : `${l.year} ${l.make} ${l.model} ${l.trim ?? ""}`}
                </div>
                <div className="font-semibold">{usd(l.price)}</div>
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                {l.mileage?.toLocaleString()} mi · {l.distance_mi != null ? `${l.distance_mi} mi away · ` : ""}
                {l.seller_name ?? "Seller"} ({l.seller_type ?? "unknown"})
              </div>
              <div className="mt-1 text-xs">
                {l.value_gap > 0 ? <Badge tone="green">{usd(l.value_gap)} under market</Badge>
                  : l.value_gap < 0 ? <Badge tone="amber">{usd(-l.value_gap)} over market</Badge> : <Badge>at market</Badge>}
              </div>
              {chk && (
                <p className="mt-2 text-xs">
                  <Badge tone={verdictTone(chk.verdict)}>{chk.verdict}</Badge>
                  <span className="mt-1 block text-zinc-500">Identity: {chk.identity_detail}. Records: {chk.records_detail}. ({chk.source})</span>
                </p>
              )}
              <div className="mt-2 flex gap-2">
                <Button variant="secondary" onClick={() => checkSeller(l.vin)} disabled={!!busy}>
                  {busy === l.vin ? "Checking…" : "Check seller"}
                </Button>
                <Button onClick={() => { setHold(l); setConsent(false); }} disabled={!chk || chk.verdict.startsWith("STOP")}>
                  Hold this car
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      {data.shortlist.length === 0 && <p className="text-sm text-zinc-500">No cars within budget.</p>}

      {hold && (
        <div className="rounded border-2 border-zinc-900 p-4 dark:border-white">
          <h3 className="font-semibold">Approve this charge</h3>
          <p className="mt-1 text-sm">
            Refundable hold deposit on the {carName(hold)} ({usd(hold.price)}) from {hold.seller_name}.
            It holds the car for 48 hours, counts toward the price if you buy, and is refunded if you don&apos;t.
          </p>
          <div className="mt-3 grid max-w-md grid-cols-2 gap-3">
            <label className="text-xs text-zinc-500">Deposit ($)<input className={inputCls} value={deposit} onChange={(e) => setDeposit(e.target.value)} /></label>
            <label className="text-xs text-zinc-500">Your spending cap ($)<input className={inputCls} value={cap} onChange={(e) => setCap(e.target.value)} /></label>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            I approve a {usd(Number(deposit), true)} charge to my Visa card. No other charges.
          </label>
          <p className="mt-1 text-xs text-zinc-500">Simulated Visa checkout for the demo: no real payment is made.</p>
          <div className="mt-3 flex gap-2">
            <Button onClick={pay} disabled={!consent || busy === "pay"}>{busy === "pay" ? "Paying…" : "Pay deposit"}</Button>
            <Button variant="secondary" onClick={() => setHold(null)}>Cancel</Button>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {receipt && (
        <div className="rounded border border-green-600 p-4">
          <h3 className="font-semibold">Receipt {receipt.id} <Badge tone="amber">simulated</Badge></h3>
          <p className="text-sm">{carName(receipt.car)} · {receipt.network}</p>
          <table className="mt-2 w-full text-sm">
            <tbody>
              {receipt.lines.map((ln: Json) => (
                <tr key={ln.label} className="border-t border-zinc-100 align-top dark:border-zinc-800">
                  <td className="py-1 pr-2">{ln.label}<div className="text-xs text-zinc-500">{ln.why}</div></td>
                  <td className="py-1 text-right">{usd(ln.amount, true)}</td>
                </tr>
              ))}
              <tr className="border-t font-semibold"><td className="py-1">Total</td><td className="text-right">{usd(receipt.total, true)}</td></tr>
            </tbody>
          </table>
          <p className="mt-1 text-xs text-zinc-500">{usd(receipt.remaining_under_cap, true)} left under your {usd(receipt.spending_cap, true)} cap.</p>
        </div>
      )}
    </div>
  );
}
