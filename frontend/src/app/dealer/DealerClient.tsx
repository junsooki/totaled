"use client";

// Dealer's side of the reverse auction, built for a phone: join, see verified buyers, bid live.
import { useEffect, useState } from "react";
import { useReducer, useSpacetimeDB, useTable } from "spacetimedb/react";
import { clock } from "@/components/live/LiveAuction";
import { Badge, Button, inputCls } from "@/components/ui";
import { usd } from "@/lib/api";
import { LiveProvider, micros } from "@/lib/live";
import { reducers, tables } from "@/module_bindings";

const errText = (e: unknown) => (e instanceof Error ? e.message : String(e)).replace(/^.*?SenderError:?\s*/i, "");

function Dealer() {
  const { identity, isActive } = useSpacetimeDB();
  const [dealers] = useTable(tables.dealer);
  const [auctions] = useTable(tables.auction);
  const [bids] = useTable(tables.bid);
  const join = useReducer(reducers.joinAsDealer);
  const placeBid = useReducer(reducers.placeBid);
  const [name, setName] = useState("");
  const [form, setForm] = useState<Record<string, { car: string; mileage: string; price: string; vin: string }>>({});
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);
  const [focus] = useState(() =>
    typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("auction"),
  );

  const me = identity ? dealers.find((d) => d.identity.isEqual(identity)) : undefined;
  const open = auctions
    .filter((a) => a.status === "open" && micros(a.endsAt) > now)
    .sort((a, b) => (a.auctionId === focus ? -1 : b.auctionId === focus ? 1 : micros(a.endsAt) - micros(b.endsAt)));

  if (!isActive) return <p className="text-sm text-zinc-500">Connecting…</p>;

  if (!me) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-zinc-500">Verified buyers with audited payouts and prequalified financing. Join to bid.</p>
        <input className={inputCls} placeholder="Dealership name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={() => join({ name }).catch((e) => setMsg({ join: errText(e) }))} disabled={!name.trim()}>Join as a dealer</Button>
        {msg.join && <p className="text-sm text-red-600">{msg.join}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm">Bidding as <b>{me.name}</b></p>
      {!open.length && <p className="text-sm text-zinc-500">No open auctions right now. This page updates live.</p>}
      {open.map((a) => {
        const ab = bids.filter((b) => b.auctionId === a.auctionId).sort((x, y) => x.price - y.price);
        const best = ab[0];
        const mineBest = ab.find((b) => identity && b.dealer.isEqual(identity));
        const f = form[a.auctionId] ?? { car: "", mileage: "", price: "", vin: "" };
        const set = (k: string, v: string) => setForm({ ...form, [a.auctionId]: { ...f, [k]: v } });
        const left = micros(a.endsAt) - now;
        const leading = best && identity && best.dealer.isEqual(identity);
        return (
          <div key={a.auctionId} className="rounded border border-zinc-200 p-3 dark:border-zinc-800">
            <div className="flex items-baseline justify-between">
              <div className="font-semibold">{a.wanted}</div>
              <div className={`text-2xl font-semibold tabular-nums ${left < 30000 ? "text-red-600" : ""}`}>{clock(left)}</div>
            </div>
            <div className="mt-1 flex flex-wrap gap-1 text-xs">
              <Badge tone="green">payout audited</Badge>
              {a.financingApproved > 0 && <Badge tone="green">financing prequalified {usd(a.financingApproved)}</Badge>}
              <Badge>area {a.zip3}xx</Badge>
            </div>
            <p className="mt-2 text-sm">
              Budget <b>{usd(a.budget)}</b> · best offer {best ? <b>{usd(best.price)}</b> : "none yet"}
              {mineBest && <> · yours {usd(mineBest.price)} {leading ? <Badge tone="green">leading</Badge> : <Badge tone="amber">outbid</Badge>}</>}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input className={`${inputCls} col-span-2`} placeholder="Car (e.g. 2020 Honda Civic EX)" value={f.car} onChange={(e) => set("car", e.target.value)} />
              <input className={inputCls} placeholder="Mileage" inputMode="numeric" value={f.mileage} onChange={(e) => set("mileage", e.target.value)} />
              <input className={inputCls} placeholder="Price ($)" inputMode="numeric" value={f.price} onChange={(e) => set("price", e.target.value)} />
              <input className={`${inputCls} col-span-2`} placeholder="VIN (optional)" value={f.vin} onChange={(e) => set("vin", e.target.value)} />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Button
                disabled={!f.car || !f.price}
                onClick={() => {
                  setMsg({ ...msg, [a.auctionId]: "" });
                  placeBid({ auctionId: a.auctionId, car: f.car, vin: f.vin, mileage: Number(f.mileage) || 0, price: Number(f.price) })
                    .then(() => setMsg({ ...msg, [a.auctionId]: "Offer placed" }))
                    .catch((e) => setMsg({ ...msg, [a.auctionId]: errText(e) }));
                }}
              >
                Place offer
              </Button>
              {best && (
                <button className="text-xs underline" onClick={() => set("price", String(Math.floor(best.price - 100)))}>
                  Beat best by $100
                </button>
              )}
            </div>
            {msg[a.auctionId] && <p className={`mt-1 text-sm ${msg[a.auctionId] === "Offer placed" ? "text-green-700" : "text-red-600"}`}>{msg[a.auctionId]}</p>}
          </div>
        );
      })}
    </div>
  );
}

export default function DealerClient() {
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8 font-sans">
      <h1 className="text-2xl font-semibold tracking-tight">Totaled · dealer bidding</h1>
      <p className="mt-1 text-sm text-zinc-500">Compete live for buyers who already know what they can spend.</p>
      <div className="mt-6">
        <LiveProvider><Dealer /></LiveProvider>
      </div>
    </main>
  );
}
