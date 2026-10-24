"use client";

// Live claim tracker: subscribes to SpacetimeDB, so every step the backend records shows up instantly.
import { useMemo, useState } from "react";
import { useTable } from "spacetimedb/react";
import AgentFeed from "@/components/live/AgentFeed";
import { Stat } from "@/components/ui";
import { usd } from "@/lib/api";
import { LiveProvider } from "@/lib/live";
import { tables } from "@/module_bindings";

const STEPS: [string, string[]][] = [
  ["Upload", ["extracted", "confirmed"]],
  ["Audit", ["audited"]],
  ["Counteroffer", ["letter_drafted", "letter_approved"]],
  ["Net payout", ["payout"]],
  ["Rental and next car", ["rentals", "rental_hold", "shortlist", "seller_check", "deposit", "auction_opened", "auction_awarded"]],
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

  if (!ready) return <p className="text-lg text-muted">Connecting to the live tracker…</p>;
  if (!shown.length) return <p className="text-lg text-muted">No claims yet. Start one on the main page and watch it appear here.</p>;

  return (
    <div>
      <p className="text-base text-muted">Live. Connected to SpacetimeDB.</p>
      <div className="mt-4 space-y-12">
        {shown.map((c) => {
          const at = stepIndex(c.step);
          const feed = events
            .filter((e) => e.claimId === c.claimId)
            .sort((a, b) => Number(b.at.microsSinceUnixEpoch - a.at.microsSinceUnixEpoch))
            .slice(0, 8);
          return (
            <section key={c.claimId} className="border-t-4 border-rule pt-4">
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-ink">{c.vehicle}</h2>
              <p className="mt-1 text-base text-muted">
                Claim {c.claimId}. Updated {c.updatedAt.toDate().toLocaleTimeString()}.
              </p>
              <div className="mt-8 grid gap-10 md:grid-cols-[14rem_1fr]">
                <ol aria-label="Claim progress" className="relative">
                  <li aria-hidden="true" className="absolute bottom-3 left-[11px] top-3 w-0.5 bg-line" />
                  {STEPS.map(([name], i) => {
                    const done = i < at;
                    const current = i === at;
                    return (
                      <li key={name} className="relative flex gap-4 pb-6 last:pb-0" aria-current={current ? "step" : undefined}>
                        <span
                          className={`relative z-10 flex size-6 shrink-0 items-center justify-center ${
                            done
                              ? "bg-brand text-white"
                              : current
                                ? "border-4 border-brand bg-surface"
                                : "border-2 border-muted bg-surface"
                          }`}
                        >
                          {done && (
                            <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                              <path d="M4 10.5l4 4 8-9" strokeLinecap="square" />
                            </svg>
                          )}
                        </span>
                        <div>
                          <div className={`text-lg leading-6 ${current ? "font-bold text-ink" : done ? "font-medium text-ink" : "text-muted"}`}>{name}</div>
                          <div className="text-base text-muted">{done ? "Done" : current ? "In progress" : "Waiting"}</div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
                <div>
                  <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
                    <Stat label="Insurer offer" value={usd(c.offerTotal)} />
                    <Stat label="Counteroffer" value={c.counterofferTotal ? usd(c.counterofferTotal) : "—"} />
                    <Stat label="Checks failed" value={at >= 1 ? c.checksFailed : "—"} />
                    <Stat label="Walk away with" value={at >= 3 ? usd(c.walkAway) : "—"} tone="text-brand" />
                  </div>
                  <div className="mt-8"><AgentFeed claimId={c.claimId} /></div>
                  {feed.length > 0 && (
                    <ul className="mt-8 border-t border-line text-base text-muted">
                      {feed.map((e) => (
                        <li key={e.id.toString()} className="border-t border-line py-2 first:border-t-0">
                          {e.at.toDate().toLocaleTimeString()}. <span className="font-medium text-ink">{e.kind}</span> {e.detail}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 font-sans text-ink sm:px-6">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">Live claim tracker</h1>
      <p className="mt-2 max-w-prose text-lg text-muted">
        Each step shows up here the moment it happens, on any device. Only public claim data is shown. No personal details.
      </p>
      <div className="mt-6">
        <LiveProvider><Tracker /></LiveProvider>
      </div>
    </main>
  );
}
