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
      <div className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
        <h3 className="font-semibold">Let dealers compete for you</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Your payout is audited and your financing is prequalified, so you&apos;re a verified buyer. Open a live reverse
          auction: dealers see your budget (never your name), bid against each other in real time, and can only lower their price.
        </p>
        <div className="mt-3">
          <Button onClick={() => act("open", async () => { await post(`/api/claims/${claimId}/auction`, { duration_secs: 180 }); })} disabled={busy === "open"}>
            {busy === "open" ? "Opening…" : "Start a 3-minute live auction"}
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  const left = micros(auction.endsAt) - now;
  const open = auction.status === "open" && left > 0;
  const best = mine[0];
  const dealers = new Set(mine.map((b) => b.dealerName)).size;

  return (
    <div className="rounded border-2 border-zinc-900 p-4 dark:border-white">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold">Live auction: {auction.wanted}</h3>
          <p className="text-sm text-zinc-500">
            Verified budget {usd(auction.budget)} · {dealers} dealer{dealers === 1 ? "" : "s"} · {mine.length} offer{mine.length === 1 ? "" : "s"}
          </p>
          <div className={`mt-2 text-4xl font-semibold tabular-nums ${open && left < 30000 ? "text-red-600" : ""}`}>
            {auction.status === "awarded" ? "Awarded" : open ? clock(left) : "Ended"}
          </div>
          {open && <p className="text-xs text-zinc-500">A bid in the last 30 seconds adds 30 seconds.</p>}
          {best && (
            <p className="mt-2 text-sm">
              Best offer <b>{usd(best.price)}</b> from {best.dealerName}: {usd(auction.budget - best.price)} under your budget
            </p>
          )}
        </div>
        {qr && open && (
          <div className="text-center text-xs text-zinc-500">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="Scan to bid as a dealer" className="mx-auto h-32 w-32 rounded bg-white p-1" />
            Dealers: scan to bid
            <div className="max-w-40 truncate"><a className="underline" href={dealerUrl} target="_blank" rel="noreferrer">{dealerUrl.replace(/^https?:\/\//, "")}</a></div>
          </div>
        )}
      </div>

      <ol className="mt-4 space-y-2">
        {mine.map((b, i) => {
          const won = auction.winningBidId === b.id;
          return (
            <li key={b.id.toString()} className={`flex flex-wrap items-center justify-between gap-2 rounded border p-2 text-sm transition-all ${
              won ? "border-green-600 bg-green-50 dark:bg-green-950" : i === 0 ? "border-zinc-900 dark:border-white" : "border-zinc-200 dark:border-zinc-800"}`}>
              <div>
                <div className="font-medium">{i === 0 && !won && <Badge tone="green">best</Badge>} {b.car}</div>
                <div className="text-xs text-zinc-500">{b.dealerName} · {b.mileage.toLocaleString()} mi{b.vin ? ` · VIN ${b.vin}` : ""} · {new Date(micros(b.at)).toLocaleTimeString()}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold tabular-nums">{usd(b.price)}</span>
                {auction.status !== "awarded" && (
                  <Button variant={i === 0 ? "primary" : "secondary"} disabled={!!busy}
                    onClick={() => act(`a${b.id}`, async () => onAwarded(await post(`/api/claims/${claimId}/auction/award`, { bid_id: Number(b.id) })))}>
                    {busy === `a${b.id}` ? "Choosing…" : "Choose"}
                  </Button>
                )}
                {won && <Badge tone="green">your pick</Badge>}
              </div>
            </li>
          );
        })}
        {!mine.length && <li className="text-sm text-zinc-500">Waiting for dealers to bid… share the QR code.</li>}
      </ol>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
