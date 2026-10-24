"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Audit from "@/components/Audit";
import Letter from "@/components/Letter";
import Payout from "@/components/Payout";
import Replace from "@/components/Replace";
import Upload from "@/components/Upload";
import { Badge, Button, Section, Stat } from "@/components/ui";
import { call, Json, post, usd } from "@/lib/api";

const LiveAgentFeed = dynamic(() => import("@/components/live/LiveBits").then((m) => m.LiveAgentFeed), { ssr: false });
const LIVE = !!process.env.NEXT_PUBLIC_SPACETIME_DB;

export default function Home() {
  const [status, setStatus] = useState<Json | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [claim, setClaim] = useState<Json | null>(null);
  const [audit, setAudit] = useState<Json | null>(null);
  const [letter, setLetter] = useState<Json | null>(null);
  const [approved, setApproved] = useState(false);
  const [payout, setPayout] = useState<Json | null>(null);
  const [results, setResults] = useState<Json | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    call("/api/status").then(setStatus).catch((e) => setStatusError(e.message));
  }, []);

  async function step(label: string, fn: () => Promise<void>) {
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

  const refreshResults = (cid = id) => cid && call(`/api/claims/${cid}/results`).then(setResults);

  const tone = (s: string) => (s === "live" || s === "postgres" || s === "sqlite" ? "green" : s === "demo" ? "amber" : "red");

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 font-sans">
      <h1 className="text-3xl font-semibold tracking-tight">Totaled</h1>
      <p className="mt-1 text-zinc-500">Insurers use software to value your totaled car. Now you have software to check theirs.</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {status ? (
          ["apify", "claude", "crs", "database"].map((k) => (
            <Badge key={k} tone={tone(status[k])}>{k}: {status[k]}</Badge>
          ))
        ) : (
          <Badge tone="red">{statusError ? `backend unreachable: ${statusError}` : "connecting…"}</Badge>
        )}
        <Badge>California only · not legal advice</Badge>
      </div>

      <Section title="1. Upload">
        {claim ? (
          <p className="text-sm">
            {claim.vehicle.year} {claim.vehicle.make} {claim.vehicle.model} {claim.vehicle.trim} · offer {usd(claim.offer.total, true)} ·{" "}
            {claim.comparables.length} comparables <Badge tone="green">confirmed</Badge>{" "}
            {process.env.NEXT_PUBLIC_SPACETIME_DB && (
              <a className="underline" href={`/track?id=${id}`} target="_blank" rel="noreferrer">Open live tracker</a>
            )}
          </p>
        ) : (
          <Upload onConfirmed={(cid, c) => { setId(cid); setClaim(c); refreshResults(cid); }} />
        )}
      </Section>

      {id && claim && LIVE && (
        <div className="mt-6"><LiveAgentFeed claimId={id} /></div>
      )}

      {id && claim && (
        <Section title="2. Audit">
          {audit ? (
            <Audit id={id} claim={claim} audit={audit} checks={status?.checks ?? []} />
          ) : (
            <Button disabled={busy === "audit"} onClick={() => step("audit", async () => {
              setAudit(await post(`/api/claims/${id}/audit`));
              await refreshResults();
            })}>
              {busy === "audit" ? "Running checks and pulling live listings…" : "Audit my offer"}
            </Button>
          )}
        </Section>
      )}

      {id && audit && (
        <Section title="3. Counteroffer">
          {letter ? (
            <Letter id={id} letter={letter} onApproved={() => { setApproved(true); refreshResults(); }} />
          ) : (
            <Button disabled={busy === "letter"} onClick={() => step("letter", async () => {
              setLetter(await post(`/api/claims/${id}/letter`));
            })}>
              {busy === "letter" ? "Drafting…" : "Draft counteroffer letter"}
            </Button>
          )}
        </Section>
      )}

      {id && approved && (
        <Section title="4. Net payout">
          <Payout id={id} personas={status?.personas ?? []} onDone={(p) => { setPayout(p); refreshResults(); }} />
        </Section>
      )}

      {id && payout && (
        <Section title="5. Replace">
          <Replace id={id} personas={status?.personas ?? []} onPurchased={() => refreshResults()} />
        </Section>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {results && results.checks_failed != null && (
        <Section title="Results">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Dollars at stake" value={usd(results.dollars_at_stake)} tone="text-green-700" />
            <Stat label="Checks failed" value={results.checks_failed} />
            <Stat label="Upload to approved letter" value={results.minutes_to_letter != null ? `${results.minutes_to_letter} min` : "—"} />
            <Stat label="Replacement held" value={results.purchase ? usd(results.purchase.total) : "—"} />
          </div>
          <details className="mt-3 text-xs text-zinc-500">
            <summary className="cursor-pointer">Audit trail ({results.events.length} events)</summary>
            <ul className="mt-1">
              {results.events.map((e: Json, i: number) => (
                <li key={i}>{new Date(e.at).toLocaleTimeString()} · {e.kind} {JSON.stringify(e.detail)}</li>
              ))}
            </ul>
          </details>
        </Section>
      )}
    </main>
  );
}
