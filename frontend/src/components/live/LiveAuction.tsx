"use client";

// Buyer's side of the reverse auction: dealers compete live to sell this verified buyer a car.
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useTable } from "spacetimedb/react";
import { Badge, Button } from "@/components/ui";
import { Json, post, usd } from "@/lib/api";
import { micros } from "@/lib/live";
import { tables } from "@/module_bindings";

function useNow(ms = 500) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

export const clock = (msLeft: number) => {
  const s = Math.max(0, Math.ceil(msLeft / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export default function LiveAuction({ claimId, onAwarded }: { claimId: string; onAwarded: (win: Json) => void }) {
  const [auctions] = useTable(tables.auction);
  const [bids] = useTable(tables.bid);
  const [qr, setQr] = useState<string | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState<string | null>(null);
  const now = useNow();
  const auction = auctions.find((a) => a.auctionId === claimId);
  const mine = bids.filter((b) => b.auctionId === claimId).sort((a, b) => a.price - b.price || micros(a.at) - micros(b.at));
  const dealerUrl = typeof window === "undefined" ? "" : `${window.location.origin}/dealer?auction=${claimId}`;

  useEffect(() => {
    if (dealerUrl) QRCode.toDataURL(dealerUrl, { margin: 1, width: 160 }).then(setQr).catch(() => setQr(null));
  }, [dealerUrl]);

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

  if (!auction) {
    return (
      <div className="rounded-3xl bg-brand-soft p-6">
        <h3 className="font-serif text-2xl font-semibold text-ink">Let dealers compete for you</h3>
        <p className="mt-2 max-w-prose text-base text-ink">
          Your payout is audited and your financing is prequalified, so you&apos;re a verified buyer. Open a live reverse
          auction. Dealers see your budget, never your name. They bid against each other in real time and can only lower their price.
        </p>
        <div className="mt-4">
          <Button onClick={() => act("open", async () => { await post(`/api/claims/${claimId}/auction`, { duration_secs: 180 }); })} disabled={busy === "open"}>
            {busy === "open" ? "Opening…" : "Start a 3-minute live auction"}
          </Button>
        </div>
        {error && <p className="mt-3 text-base text-alert">{error}</p>}
      </div>
    );
  }

  const left = micros(auction.endsAt) - now;
  const open = auction.status === "open" && left > 0;
  const best = mine[0];
  const dealers = new Set(mine.map((b) => b.dealerName)).size;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-6 rounded-3xl bg-brand-soft p-6">
        <div>
          <h3 className="font-serif text-xl font-semibold text-ink">Live auction: {auction.wanted}</h3>
          <div className={`mt-2 font-serif text-5xl font-semibold tabular-nums ${open && left < 30000 ? "text-alert" : "text-ink"}`}>
            {auction.status === "awarded" ? "Awarded" : open ? clock(left) : "Ended"}
          </div>
          {open && <p className="mt-1 text-sm text-muted">A bid in the last 30 seconds adds 30 seconds.</p>}
          <p className="mt-3 text-base text-ink">
            Your budget {usd(auction.budget)}. {dealers} dealer{dealers === 1 ? "" : "s"}, {mine.length} offer{mine.length === 1 ? "" : "s"}.
          </p>
          {best && (
            <p className="mt-1 text-base text-ink">
              Best offer <span className="font-semibold">{usd(best.price)}</span> from {best.dealerName}, {usd(auction.budget - best.price)} under your budget.
            </p>
          )}
        </div>
        {qr && open && (
          <div className="text-center text-sm text-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="Scan to bid as a dealer" className="mx-auto size-32 rounded-xl bg-white p-2" />
            <p className="mt-2 font-medium text-ink">Dealers, scan to bid</p>
            <div className="max-w-40 truncate"><a className="text-brand underline" href={dealerUrl} target="_blank" rel="noreferrer">{dealerUrl.replace(/^https?:\/\//, "")}</a></div>
          </div>
        )}
      </div>

      <ol className="mt-4 space-y-3">
        {mine.map((b, i) => {
          const won = auction.winningBidId === b.id;
          return (
            <li key={b.id.toString()} className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface p-5 ${
              won ? "ring-2 ring-brand" : i === 0 ? "shadow-sm ring-2 ring-brand/40" : "shadow-sm ring-1 ring-line"}`}>
              <div className="min-w-0">
                <div className="font-serif text-3xl font-semibold tabular-nums tracking-tight text-ink">
                  {usd(b.price)} {won ? <Badge tone="green">Your pick</Badge> : i === 0 && <Badge tone="green">Best offer</Badge>}
                </div>
                <div className="mt-1 text-base font-medium text-ink">{b.car}</div>
                <div className="text-sm text-muted">{b.dealerName} · {b.mileage.toLocaleString()} mi{b.vin ? ` · VIN ${b.vin}` : ""} · {new Date(micros(b.at)).toLocaleTimeString()}</div>
              </div>
              {auction.status !== "awarded" && (
                <Button variant={i === 0 ? "primary" : "secondary"} disabled={!!busy}
                  onClick={() => act(`a${b.id}`, async () => onAwarded(await post(`/api/claims/${claimId}/auction/award`, { bid_id: Number(b.id) })))}>
                  {busy === `a${b.id}` ? "Choosing..." : "Choose this bid"}
                </Button>
              )}
            </li>
          );
        })}
        {!mine.length && <li className="text-base text-muted">Waiting for dealers to bid. Share the QR code.</li>}
      </ol>
      {error && <p className="mt-3 text-base text-alert">{error}</p>}
    </div>
  );
}
