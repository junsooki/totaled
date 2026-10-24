"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import Audit from "@/components/Audit";
import Letter from "@/components/Letter";
import Payout from "@/components/Payout";
import Rental from "@/components/Rental";
import Replace from "@/components/Replace";
import Upload from "@/components/Upload";
import { Button, Notice, Stat, StepCard, Stepper, SummaryPanel, type SummaryRow } from "@/components/ui";
import { call, Json, post, usd } from "@/lib/api";

const STEP_LABELS = ["Upload", "Audit", "Counteroffer", "Net payout", "Rental and car", "Summary"];

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
  const [cap, setCap] = useState("1000");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState<{ msg: string; at: number } | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [cur, setCur] = useState(0);
  const [wide, setWide] = useState(false);
  // Steps the user has opened. Letter, Payout and rental/car stay mounted once opened so Back keeps their data.
  const [seen, setSeen] = useState<Record<number, boolean>>({});
  const auditStarted = useRef(false);
  const prevCur = useRef(0);

  const show = (i: number) => {
    setCur(i);
    setSeen((s) => (s[i] ? s : { ...s, [i]: true }));
  };

  // Move focus to the new step's title when the step changes (not on first load).
  useEffect(() => {
    if (prevCur.current === cur) return;
    prevCur.current = cur;
    // Kept-mounted steps are hidden with display:none, so the visible title is the one with a layout box.
    Array.from(document.querySelectorAll<HTMLElement>("main h1")).find((h) => h.offsetParent !== null)?.focus();
  }, [cur]);

  useEffect(() => {
    call("/api/status").then(setStatus).catch((e) => setStatusError(e.message));
  }, []);

  async function step(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setError(null);
    const at = cur;
    try {
      await fn();
    } catch (e) {
      setError({ msg: e instanceof Error ? e.message : String(e), at });
    } finally {
      setBusy("");
    }
  }

  const refreshResults = (cid = id) => cid && call(`/api/claims/${cid}/results`).then(setResults);

  async function runAudit() {
    if (!id) return;
    setBusy("audit");
    setAuditError(null);
    try {
      setAudit(await post(`/api/claims/${id}/audit`));
      await refreshResults();
    } catch (e) {
      setAuditError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy("");
    }
  }

  // Run the audit once when the user reaches step 2 with a confirmed claim.
  useEffect(() => {
    if (cur === 1 && id && claim && !audit && !auditStarted.current) {
      auditStarted.current = true;
      runAudit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur, id, claim, audit]);

  // Gating: a step is unlocked when its prerequisite exists.
  const unlocked = [true, !!claim, !!audit, approved, !!payout, !!claim];
  const done = [!!claim, !!audit, approved, !!payout, !!(results?.rental || results?.purchase), false];
  const steps = STEP_LABELS.map((label, i) => ({ label, done: done[i], locked: !unlocked[i] }));
  const canContinue = [!!claim, !!audit, approved, !!payout, !!payout, false][cur];
  const go = (i: number) => unlocked[i] && show(i);
  const next = () => canContinue && show(cur + 1);

  const trackerLink = process.env.NEXT_PUBLIC_SPACETIME_DB && id && (
    <a href={`/track?id=${id}`} target="_blank" rel="noreferrer">
      Open live tracker
    </a>
  );

  const nav = (nextLabel?: string) => (
    <>
      {cur > 0 ? (
        <Button variant="secondary" onClick={() => show(cur - 1)}>Back</Button>
      ) : (
        <span />
      )}
      {nextLabel && (
        <Button disabled={!canContinue} onClick={next}>{nextLabel}</Button>
      )}
    </>
  );

  const v = claim?.vehicle;
  const co = audit?.counteroffer;
  const summaryRows: SummaryRow[] = claim
    ? [
        { label: "Your car", value: `${v.year} ${v.make} ${v.model} ${v.trim ?? ""}`.trim() },
        { label: "Insurer's offer", value: usd(claim.offer.total, true) },
        ...(co
          ? [
              { label: "Our counteroffer", value: usd(co.total, true), tone: "good" as const },
              { label: "Gap", value: usd(co.gap, true), tone: "good" as const, big: true },
            ]
          : []),
        ...(audit ? [{ label: "Letter", value: approved ? "Approved" : letter ? "Drafted, needs your approval" : "Not drafted yet" }] : []),
        ...(results?.rental ? [{ label: "Rental hold", value: usd(results.rental.total) }] : []),
        ...(results?.purchase ? [{ label: "Car deposit hold", value: usd(results.purchase.total) }] : []),
        ...(payout ? [{ label: "Spending cap left", value: cap.trim() !== "" && Number.isFinite(Number(cap)) ? usd(Math.max(0, Number(cap) - (results?.rental?.total ?? 0) - (results?.purchase?.total ?? 0))) : "—" }] : []),
      ]
    : [];

  const showPanel = !!claim && cur > 0;
  const personas = status?.personas ?? [];

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b-4 border-brand">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-4 sm:px-6">
          <span className="font-serif text-2xl font-semibold tracking-tight text-brand">Totaled</span>
          <p className="text-base text-muted">Insurers use software to value your totaled car. Now you have software to check theirs.</p>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-6 pt-6 sm:px-6 sm:pb-8">
      {!status && statusError && (
        <div className="mb-6">
          <Notice tone="bad">
            We can&apos;t reach the server right now ({statusError}). Check that the backend is running, then reload.
          </Notice>
        </div>
      )}

      <Stepper steps={steps} current={cur} onSelect={go} />

      <main className={`mt-10 grid flex-1 items-start gap-8 lg:gap-12 ${showPanel ? "lg:grid-cols-[minmax(0,1fr)_20rem]" : ""}`}>
        {showPanel && (
          <div className="space-y-6 lg:sticky lg:top-6 lg:order-2 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:border-l lg:border-line lg:pl-8">
            <SummaryPanel rows={summaryRows} />
            {LIVE && id && <LiveAgentFeed claimId={id} />}
          </div>
        )}

        <div className={`min-w-0 ${showPanel || (cur === 0 && wide) ? "" : "mx-auto w-full max-w-3xl"}`}>
          {error && error.at === cur && (
            <div className="mb-6"><Notice tone="bad">{error.msg}</Notice></div>
          )}

          {cur === 0 && (
            <StepCard
              title="Upload your offer"
              subtitle="Add the insurer's total-loss valuation. We read it for you and you check the details."
              footer={claim ? nav("Continue to audit") : undefined}
            >
              {claim ? (
                <div>
                  <p className="font-serif text-[1.75rem] font-semibold text-ink">{v.year} {v.make} {v.model} {v.trim}</p>
                  <p className="mt-2 text-lg text-muted">
                    Offer of {usd(claim.offer.total, true)} with {claim.comparables.length} comparable cars. Your claim is confirmed.
                  </p>
                  {trackerLink && <p className="mt-3">{trackerLink}</p>}
                </div>
              ) : (
                <Upload
                  onWide={setWide}
                  onConfirmed={(cid, c) => {
                    setId(cid);
                    setClaim(c);
                    refreshResults(cid);
                    show(1);
                  }}
                />
              )}
            </StepCard>
          )}

          {cur === 1 && id && claim && (
            <StepCard
              title="Checking your offer"
              subtitle="We test the insurer's numbers and compare them with cars for sale near you."
              footer={nav("Continue to counteroffer")}
            >
              {audit ? (
                <Audit id={id} claim={claim} audit={audit} checks={status?.checks ?? []} />
              ) : auditError ? (
                <div>
                  <Notice tone="bad" title="The audit did not finish">{auditError}</Notice>
                  <div className="mt-4">
                    <Button disabled={busy === "audit"} onClick={runAudit}>Try again</Button>
                  </div>
                </div>
              ) : (
                <p role="status" className="text-lg text-muted">Running checks and pulling live listings. This can take a moment.</p>
              )}
            </StepCard>
          )}

          {(cur === 2 || seen[2]) && id && audit && (
            <div hidden={cur !== 2}>
              <StepCard
                title="Your counteroffer letter"
                subtitle="We write a letter that asks the insurer for a fair value. Read it, then approve it."
                footer={nav("Continue to net payout")}
              >
                {letter ? (
                  <Letter key={`letter-${id}`} id={id} letter={letter} onApproved={() => { setApproved(true); refreshResults(); }} />
                ) : (
                  <Button disabled={busy === "letter"} onClick={() => step("letter", async () => {
                    setLetter(await post(`/api/claims/${id}/letter`));
                  })}>
                    {busy === "letter" ? "Drafting…" : "Draft counteroffer letter"}
                  </Button>
                )}
              </StepCard>
            </div>
          )}

          {(cur === 3 || seen[3]) && id && approved && (
            <div hidden={cur !== 3}>
              <StepCard
                title="What you would take home"
                subtitle="See your payout after taxes, fees and any loan, at the offer and at our counteroffer."
                footer={nav("Continue to rental and next car")}
              >
                <Payout key={`payout-${id}`} id={id} personas={personas} onDone={(p) => { setPayout(p); refreshResults(); }} />
              </StepCard>
            </div>
          )}

          {(cur === 4 || seen[4]) && id && payout && (
            <div hidden={cur !== 4}>
            <StepCard
              title="Rental and your next car"
              subtitle="Get a ride while you wait, then find a car to replace yours. Both stay under your spending cap."
              footer={nav("Continue to summary")}
            >
              <h2>A rental for now</h2>
              <div className="mt-4">
                <Rental key={`rental-${id}`} id={id} cap={cap} setCap={setCap} onHeld={() => refreshResults()} />
              </div>
              <h2 className="mt-12 border-t border-line pt-8">Your next car</h2>
              <div className="mt-4">
                <Replace key={`replace-${id}`} id={id} personas={personas} cap={cap} setCap={setCap} onPurchased={() => refreshResults()} />
              </div>
            </StepCard>
            </div>
          )}

          {cur === 5 && claim && (
            <StepCard
              title="Your summary"
              subtitle="Here is where your case stands."
              footer={nav()}
            >
              {results && results.checks_failed != null ? (
                <>
                  <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                    <Stat label="Dollars at stake" value={usd(results.dollars_at_stake)} tone="text-brand" />
                    <Stat label="Checks failed" value={results.checks_failed} />
                    <Stat label="Upload to approved letter" value={results.minutes_to_letter != null ? `${results.minutes_to_letter} min` : "—"} />
                    <Stat label="Rental held" value={results.rental ? usd(results.rental.total) : "—"} />
                    <Stat label="Replacement held" value={results.purchase ? usd(results.purchase.total) : "—"} />
                  </div>
                  <details className="mt-6 text-base text-muted">
                    <summary className="cursor-pointer font-medium text-ink">Audit trail ({results.events.length} events)</summary>
                    <ul className="mt-2 space-y-1 text-sm">
                      {results.events.map((e: Json, i: number) => (
                        <li key={i}>{new Date(e.at).toLocaleTimeString()} · {e.kind} {JSON.stringify(e.detail)}</li>
                      ))}
                    </ul>
                  </details>
                </>
              ) : (
                <p className="text-lg text-muted">Run the audit to see your numbers.</p>
              )}
              {trackerLink && <p className="mt-6">{trackerLink}</p>}
            </StepCard>
          )}
        </div>
      </main>

      <footer className="mt-12 border-t border-line pt-4 text-sm text-muted">
        {status ? (
          <p className="text-sm">
            Data: Apify {status.apify} · CRS {status.crs} · Claude {status.claude} · Database {status.database}
          </p>
        ) : (
          <p className="text-sm">{statusError ? "Server status unavailable" : "Connecting…"}</p>
        )}
        <p className="mt-1 text-sm">California only · not legal advice</p>
      </footer>
      </div>
    </div>
  );
}
