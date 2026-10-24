"use client";

// Buyer's side of the reverse auction: dealers compete live to sell this verified buyer a car.
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useTable } from "spacetimedb/react";
import { Badge, Button, Notice, SummaryList } from "@/components/ui";
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
      <div className="border-t-4 border-rule pt-3">
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
        {error && <div className="mt-3"><Notice tone="bad">{error}</Notice></div>}
      </div>
    );
  }

  const left = micros(auction.endsAt) - now;
  const open = auction.status === "open" && left > 0;
  const best = mine[0];
  const dealers = new Set(mine.map((b) => b.dealerName)).size;

  return (
    <div>
      <div className="border-t-4 border-rule pt-3">
        <h3 className="font-serif text-2xl font-semibold text-ink">Live auction: {auction.wanted}</h3>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-8">
          <div className="min-w-0 flex-1 basis-72">
            <div className={`font-serif text-6xl font-semibold tabular-nums ${open && left < 30000 ? "text-alert" : "text-ink"}`}>
              {auction.status === "awarded" ? "Awarded" : open ? clock(left) : "Ended"}
            </div>
            {open && <p className="mt-1 text-base text-muted">A bid in the last 30 seconds adds 30 seconds.</p>}
            <div className="mt-4">
              <SummaryList
                rows={[
                  { label: "Your budget", value: usd(auction.budget) },
                  { label: "Dealers", value: dealers },
                  { label: "Offers", value: mine.length },
                  ...(best
                    ? [{
                        label: "Best offer",
                        value: `${usd(best.price)} from ${best.dealerName}, ${usd(auction.budget - best.price)} under your budget`,
                        tone: "good" as const,
                      }]
                    : []),
                ]}
              />
            </div>
          </div>
          {qr && open && (
            <div className="text-base text-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="Scan to bid as a dealer" className="size-36 border border-line bg-white p-2" />
              <p className="mt-2 font-medium text-ink">Dealers, scan to bid</p>
              <div className="max-w-40 truncate"><a className="text-brand underline" href={dealerUrl} target="_blank" rel="noreferrer">{dealerUrl.replace(/^https?:\/\//, "")}</a></div>
            </div>
          )}
        </div>
      </div>

      <ol className="mt-6">
        {mine.map((b, i) => {
          const won = auction.winningBidId === b.id;
          return (
            <li key={b.id.toString()} className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-rule py-5">
              <div className={`min-w-0 ${won || i === 0 ? "border-l-[5px] border-brand pl-4" : ""}`}>
                <div className="font-serif text-4xl font-semibold tabular-nums tracking-tight text-ink">
                  {usd(b.price)} {won ? <Badge tone="green">Your pick</Badge> : i === 0 && <Badge tone="green">Best offer</Badge>}
                </div>
                <div className="mt-1 text-lg font-medium text-ink">{b.car}</div>
                <div className="text-base text-muted">{b.dealerName} · {b.mileage.toLocaleString()} mi{b.vin ? ` · VIN ${b.vin}` : ""} · {new Date(micros(b.at)).toLocaleTimeString()}</div>
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
        {!mine.length && <li className="border-t-2 border-rule py-5 text-base text-muted">Waiting for dealers to bid. Share the QR code.</li>}
      </ol>
      {error && <div className="mt-3"><Notice tone="bad">{error}</Notice></div>}
    </div>
  );
}
