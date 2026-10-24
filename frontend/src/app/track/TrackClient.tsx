"use client";

// Live claim tracker: subscribes to SpacetimeDB, so every step the backend records shows up instantly.
import { useMemo, useState } from "react";
import { SpacetimeDBProvider, useTable } from "spacetimedb/react";
import { Stat } from "@/components/ui";
import { usd } from "@/lib/api";
import { DbConnection, tables } from "@/module_bindings";

const HOST = process.env.NEXT_PUBLIC_SPACETIME_HOST ?? "wss://maincloud.spacetimedb.com";
const DB = process.env.NEXT_PUBLIC_SPACETIME_DB;

const STEPS: [string, string[]][] = [
  ["Upload", ["extracted", "confirmed"]],
  ["Audit", ["audited"]],
  ["Counteroffer", ["letter_drafted", "letter_approved"]],
  ["Net payout", ["payout"]],
  ["Rental and next car", ["rentals", "rental_hold", "shortlist", "seller_check", "deposit"]],
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
      <p className="flex items-center gap-2 text-sm text-muted">
        <span className="size-2 rounded-full bg-brand" aria-hidden="true" />
        Live. Connected to SpacetimeDB.
      </p>
      <div className="mt-4 space-y-6">
        {shown.map((c) => {
          const at = stepIndex(c.step);
          const feed = events
            .filter((e) => e.claimId === c.claimId)
            .sort((a, b) => Number(b.at.microsSinceUnixEpoch - a.at.microsSinceUnixEpoch))
            .slice(0, 8);
          return (
            <section key={c.claimId} className="rounded-3xl bg-surface p-6 shadow-sm ring-1 ring-line sm:p-8">
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-ink">{c.vehicle}</h2>
              <p className="mt-1 text-sm text-muted">
                Claim {c.claimId}. Updated {c.updatedAt.toDate().toLocaleTimeString()}.
              </p>
              <div className="mt-8 grid gap-8 md:grid-cols-[14rem_1fr]">
                <ol aria-label="Claim progress">
                  {STEPS.map(([name], i) => {
                    const done = i < at;
                    const current = i === at;
                    return (
                      <li key={name} className="flex gap-3" aria-current={current ? "step" : undefined}>
                        <div className="flex flex-col items-center">
                          <span
                            className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                              done
                                ? "bg-brand text-white"
                                : current
                                  ? "bg-brand-soft text-brand ring-2 ring-brand"
                                  : "bg-line/60 text-muted"
                            }`}
                          >
                            {done ? (
                              <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : (
                              i + 1
                            )}
                          </span>
                          {i < STEPS.length - 1 && <span aria-hidden="true" className={`my-1 w-0.5 flex-1 ${done ? "bg-brand" : "bg-line"}`} />}
                        </div>
                        <div className="pb-6">
                          <div className={`pt-1 text-base ${current ? "font-semibold text-ink" : done ? "font-medium text-ink" : "text-muted"}`}>{name}</div>
                          <div className="text-sm text-muted">{done ? "Done" : current ? "In progress" : "Waiting"}</div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
                <div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Stat label="Insurer offer" value={usd(c.offerTotal)} />
                    <Stat label="Counteroffer" value={c.counterofferTotal ? usd(c.counterofferTotal) : "—"} />
                    <Stat label="Checks failed" value={at >= 1 ? c.checksFailed : "—"} />
                    <Stat label="Walk away with" value={at >= 3 ? usd(c.walkAway) : "—"} tone="text-brand" />
                  </div>
                  {feed.length > 0 && (
                    <ul className="mt-6 space-y-1.5 text-sm text-muted">
                      {feed.map((e) => (
                        <li key={e.id.toString()}>
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
  const builder = useMemo(
    () =>
      DB
        ? DbConnection.builder()
            .withUri(HOST)
            .withDatabaseName(DB)
            .onConnect((conn) => {
              conn.subscriptionBuilder().subscribe([tables.claim, tables.claimEvent]);
            })
        : null,
    [],
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 font-sans text-ink sm:px-6">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">Live claim tracker</h1>
      <p className="mt-2 max-w-prose text-lg text-muted">
        Each step shows up here the moment it happens, on any device. Only public claim data is shown. No personal details.
      </p>
      <div className="mt-6">
        {builder ? (
          <SpacetimeDBProvider connectionBuilder={builder}>
            <Tracker />
          </SpacetimeDBProvider>
        ) : (
          <p className="text-base text-alert">NEXT_PUBLIC_SPACETIME_DB is not set.</p>
        )}
      </div>
    </main>
  );
}
