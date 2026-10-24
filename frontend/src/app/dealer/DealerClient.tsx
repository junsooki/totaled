"use client";

// Dealer's side of the reverse auction, built for a phone: join, see verified buyers, bid live.
import { useEffect, useState } from "react";
import { useReducer, useSpacetimeDB, useTable } from "spacetimedb/react";
import { clock } from "@/components/live/LiveAuction";
import { Badge, Button, inputCls } from "@/components/ui";
import { usd } from "@/lib/api";
import { LiveProvider, micros } from "@/lib/live";
import { reducers, tables } from "@/module_bindings";

const field = `${inputCls} min-h-12`;
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

  if (!isActive) return <p className="text-base text-muted">Connecting...</p>;

  if (!me) {
    return (
      <div className="space-y-4 rounded-3xl bg-surface p-5 shadow-sm ring-1 ring-line sm:p-8">
        <h2 className="font-serif text-2xl font-semibold text-ink">Join to bid</h2>
        <p className="text-base text-muted">Verified buyers with audited payouts and prequalified financing.</p>
        <input className={`${field} text-lg`} aria-label="Dealership name" placeholder="Dealership name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="[&>button]:w-full">
          <Button onClick={() => join({ name }).catch((e) => setMsg({ join: errText(e) }))} disabled={!name.trim()}>Join as a dealer</Button>
        </div>
        {msg.join && <p className="text-base text-alert">{msg.join}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-base text-ink">Bidding as <span className="font-semibold">{me.name}</span></p>
      {!open.length && <p className="rounded-3xl bg-surface p-5 text-base text-muted shadow-sm ring-1 ring-line">No open auctions right now. This page updates live.</p>}
      {open.map((a) => {
        const ab = bids.filter((b) => b.auctionId === a.auctionId).sort((x, y) => x.price - y.price);
        const best = ab[0];
        const mineBest = ab.find((b) => identity && b.dealer.isEqual(identity));
        const f = form[a.auctionId] ?? { car: "", mileage: "", price: "", vin: "" };
        const set = (k: string, v: string) => setForm({ ...form, [a.auctionId]: { ...f, [k]: v } });
        const left = micros(a.endsAt) - now;
        const leading = best && identity && best.dealer.isEqual(identity);
        return (
          <div key={a.auctionId} className="rounded-3xl bg-surface p-5 shadow-sm ring-1 ring-line sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-xl font-semibold text-ink">{a.wanted}</h2>
              <div className={`font-serif text-4xl font-semibold tabular-nums ${left < 30000 ? "text-alert" : "text-ink"}`}>{clock(left)}</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="green">Payout audited</Badge>
              {a.financingApproved > 0 && <Badge tone="green">Financing prequalified {usd(a.financingApproved)}</Badge>}
              <Badge>Area {a.zip3}xx</Badge>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-muted">Buyer budget</dt>
                <dd className="font-serif text-3xl font-semibold tracking-tight text-ink">{usd(a.budget)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Best offer</dt>
                <dd className="font-serif text-3xl font-semibold tracking-tight text-ink">{best ? usd(best.price) : "None yet"}</dd>
              </div>
            </dl>
            {mineBest && (
              <p className="mt-3 text-base text-ink">
                Your offer {usd(mineBest.price)} {leading ? <Badge tone="green">Leading</Badge> : <Badge tone="amber">Outbid</Badge>}
              </p>
            )}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <input className={`${field} col-span-2`} aria-label="Car" placeholder="Car (e.g. 2020 Honda Civic EX)" value={f.car} onChange={(e) => set("car", e.target.value)} />
              <input className={field} aria-label="Mileage" placeholder="Mileage" inputMode="numeric" value={f.mileage} onChange={(e) => set("mileage", e.target.value)} />
              <input className={`${field} font-serif text-xl font-semibold`} aria-label="Price" placeholder="Price ($)" inputMode="numeric" value={f.price} onChange={(e) => set("price", e.target.value)} />
              <input className={`${field} col-span-2`} aria-label="VIN" placeholder="VIN (optional)" value={f.vin} onChange={(e) => set("vin", e.target.value)} />
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <div className="[&>button]:w-full">
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
              </div>
              {best && (
                <button
                  className="min-h-11 cursor-pointer rounded-xl text-base font-semibold text-brand underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  onClick={() => set("price", String(Math.floor(best.price - 100)))}
                >
                  Beat best by $100
                </button>
              )}
            </div>
            {msg[a.auctionId] && <p className={`mt-2 text-base ${msg[a.auctionId] === "Offer placed" ? "text-brand" : "text-alert"}`}>{msg[a.auctionId]}</p>}
          </div>
        );
      })}
    </div>
  );
}

export default function DealerClient() {
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-8 font-sans text-ink">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">Totaled dealer bidding</h1>
      <p className="mt-2 text-lg text-muted">Compete live for buyers who already know what they can spend.</p>
      <div className="mt-6">
        <LiveProvider><Dealer /></LiveProvider>
      </div>
    </main>
  );
}
