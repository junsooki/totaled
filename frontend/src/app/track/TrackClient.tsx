"use client";

// Live claim tracker: subscribes to SpacetimeDB, so every step the backend records shows up instantly.
import { useMemo, useState } from "react";
import { useTable } from "spacetimedb/react";
import AgentFeed from "@/components/live/AgentFeed";
import { Badge, Stat } from "@/components/ui";
import { usd } from "@/lib/api";
import { LiveProvider } from "@/lib/live";
import { tables } from "@/module_bindings";

const STEPS: [string, string[]][] = [
  ["Upload", ["extracted", "confirmed"]],
  ["Audit", ["audited"]],
  ["Counteroffer", ["letter_drafted", "letter_approved"]],
  ["Net payout", ["payout"]],
  ["Replace", ["shortlist", "seller_check", "deposit"]],
];
const stepIndex = (kind: string) => STEPS.findIndex(([, kinds]) => kinds.includes(kind));

function Tracker() {
  const [claims, ready] = useTable(tables.claim);
  const [events] = useTable(tables.claimEvent);
  // Read on the client only; the server render shows "Connecting…" until the subscription is ready.
  const [only] = useState(() =>
    typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("id"),
  );

  const shown = useMemo(
    () =>
      [...claims]
        .filter((c) => !only || c.claimId === only)
        .sort((a, b) => Number(b.updatedAt.microsSinceUnixEpoch - a.updatedAt.microsSinceUnixEpoch)),
    [claims, only],
  );

  if (!ready) return <p className="text-sm text-zinc-500">Connecting to the live tracker…</p>;
  if (!shown.length) return <p className="text-sm text-zinc-500">No claims yet. Start one on the main page and watch it appear here.</p>;

  return (
    <div className="space-y-6">
      {shown.map((c) => {
        const at = stepIndex(c.step);
        const feed = events
          .filter((e) => e.claimId === c.claimId)
          .sort((a, b) => Number(b.at.microsSinceUnixEpoch - a.at.microsSinceUnixEpoch))
          .slice(0, 8);
        return (
          <div key={c.claimId} className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold">{c.vehicle}</h2>
              <span className="text-xs text-zinc-500">claim {c.claimId} · updated {c.updatedAt.toDate().toLocaleTimeString()}</span>
            </div>
            <ol className="mt-3 grid grid-cols-5 gap-1 text-center text-xs">
              {STEPS.map(([name], i) => (
                <li key={name} className={`rounded px-1 py-1.5 ${i < at ? "bg-green-100 dark:bg-green-950" : i === at ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-zinc-100 text-zinc-400 dark:bg-zinc-900"}`}>
                  {name}
                </li>
              ))}
            </ol>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Insurer offer" value={usd(c.offerTotal)} />
              <Stat label="Counteroffer" value={c.counterofferTotal ? usd(c.counterofferTotal) : "—"} />
              <Stat label="Checks failed" value={at >= 1 ? c.checksFailed : "—"} />
              <Stat label="Walk away with" value={at >= 3 ? usd(c.walkAway) : "—"} />
            </div>
            <div className="mt-3"><AgentFeed claimId={c.claimId} /></div>
            <ul className="mt-3 space-y-0.5 text-xs text-zinc-500">
              {feed.map((e) => (
                <li key={e.id.toString()}>{e.at.toDate().toLocaleTimeString()} · <Badge>{e.kind}</Badge> {e.detail}</li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export default function TrackPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 font-sans">
      <h1 className="text-2xl font-semibold tracking-tight">Totaled · live claim tracker</h1>
      <p className="mt-1 text-sm text-zinc-500">Updates the moment each step happens, on any device. Powered by SpacetimeDB.</p>
      <div className="mt-6">
        <LiveProvider><Tracker /></LiveProvider>
      </div>
    </main>
  );
}
