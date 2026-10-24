"use client";

import { useRef, useState } from "react";
import { API, Json, usd } from "@/lib/api";
import { Badge, Notice, Stat, SummaryList } from "./ui";
import { Bridge, Market } from "./ValueCharts";
import VoiceAssistant from "./VoiceAssistant";

const focusRing = "focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-brand";

const TABS = [
  { id: "failed", label: "What failed" },
  { id: "market", label: "Market value" },
  { id: "gap", label: "How the gap adds up" },
] as const;

function Tabs({ panels }: { panels: Record<(typeof TABS)[number]["id"], React.ReactNode> }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent) => {
    const last = TABS.length - 1;
    const next =
      e.key === "ArrowRight" ? (active === last ? 0 : active + 1)
      : e.key === "ArrowLeft" ? (active === 0 ? last : active - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next == null) return;
    e.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="Audit results" onKeyDown={onKey} className="flex gap-6 overflow-x-auto overflow-y-hidden border-b border-line">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => { refs.current[i] = el; }}
            role="tab"
            id={`audit-tab-${t.id}`}
            aria-selected={active === i}
            aria-controls={`audit-panel-${t.id}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            className={`-mb-px shrink-0 cursor-pointer border-b-4 py-3 text-lg ${focusRing} ${
              active === i ? "border-brand font-bold text-ink" : "border-transparent text-brand underline underline-offset-4 hover:text-brand-dark"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {TABS.map((t, i) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`audit-panel-${t.id}`}
          aria-labelledby={`audit-tab-${t.id}`}
          hidden={active !== i}
          tabIndex={0}
          className={`pt-6 ${focusRing}`}
        >
          {active === i && panels[t.id]}
        </div>
      ))}
    </div>
  );
}

function ReportLine({ src, alt }: { src: string; alt: string }) {
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const url = attempt ? `${src}${src.includes("?") ? "&" : "?"}retry=${attempt}` : src;
  return (
    <div>
      {state === "loading" && <p className="text-base text-muted">Loading the report line…</p>}
      {state === "error" ? (
        <p role="alert" className="text-base text-ink">
          We could not load that part of your report.{" "}
          <button
            type="button"
            onClick={() => { setState("loading"); setAttempt((a) => a + 1); }}
            className={`cursor-pointer font-semibold text-brand underline ${focusRing}`}
          >
            Try again
          </button>
        </p>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={attempt}
          src={url}
          alt={alt}
          onLoad={() => setState("ok")}
          onError={() => setState("error")}
          className={`w-full ${state === "ok" ? "" : "hidden"}`}
        />
      )}
    </div>
  );
}

const label = (s: string) => (s === "fail" ? "Failed" : s === "pass" ? "Passed" : "Needs a look");
const toneCls = (s: string) => (s === "fail" ? "text-alert" : s === "pass" ? "text-brand" : "text-amber");

export default function Audit({ id, claim, audit, checks, voiceEnabled }: { id: string; claim: Json; audit: Json; checks: Json[]; voiceEnabled: boolean }) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [shown, setShown] = useState<string | null>(null);
  const fv = audit.market.fair_value;
  const co = audit.counteroffer;
  const d = audit.deadline;
  const results: Json[] = audit.checks;

  const toggle = (n: number) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });

  const nums = [...new Set(results.map((r) => r.check as number))].sort((a, b) => a - b);
  const rows = nums.map((n) => {
    const info = checks.find((c) => c.check === n);
    const ch = { check: n, name: info?.name ?? `Check ${n}`, rule: info?.rule ?? "" };
    const rs = results.filter((r) => r.check === n);
    const status = rs.some((r) => r.status === "fail") ? "fail" : rs.every((r) => r.status === "pass") ? "pass" : "review";
    return { ch, rs, status };
  });
  const failed = rows.filter((r) => r.status !== "pass");
  const passed = rows.filter((r) => r.status === "pass");
  const nFail = rows.filter((r) => r.status === "fail").length;
  const nLook = failed.length - nFail;
  const headline = [
    nFail > 0 && `${nFail} ${nFail === 1 ? "check" : "checks"} failed`,
    nLook > 0 && (nFail > 0 ? `${nLook} ${nLook === 1 ? "needs" : "need"} a look` : `${nLook} ${nLook === 1 ? "check needs" : "checks need"} a look`),
  ].filter(Boolean).join(", ");

  const row = ({ ch, rs, status }: (typeof rows)[number]) => {
    const isOpen = open.has(ch.check);
    const quiet = status === "pass";
    const firstBad = rs.find((r) => r.status !== "pass");
    return (
      <li key={ch.check} className={`border-t border-t-line first:border-t-0 ${quiet ? "" : status === "fail" ? "border-l-[5px] border-l-alert" : "border-l-[5px] border-l-amber"}`}>
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => toggle(ch.check)}
          className={`flex w-full cursor-pointer items-start justify-between gap-4 py-4 text-left ${quiet ? "" : "pl-4"} ${focusRing}`}
        >
          <span>
            <span className="block text-lg font-semibold text-ink">
              {ch.check}. {ch.name} <span className="sr-only">: {label(status)}</span>
            </span>
            <span className="mt-1 block max-w-prose text-base text-muted">{quiet ? ch.rule : (firstBad?.detail ?? ch.rule)}</span>
          </span>
          <span className="flex shrink-0 items-center gap-2">
            {!quiet && <span className={`text-base font-semibold ${toneCls(status)}`}>{label(status)}</span>}
            <span aria-hidden="true" className="text-brand underline underline-offset-4">{isOpen ? "Hide" : "Details"}</span>
          </span>
        </button>
        {isOpen && (
          <div className={`space-y-5 pb-5 ${quiet ? "" : "pl-4"}`}>
            {ch.rule && <p className="text-base text-muted">Rule: {ch.rule}</p>}
            {rs.map((r, i) => {
              const key = `${r.check}:${r.comparable ?? ""}:${i}`;
              return (
                <div key={key} className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="font-semibold text-ink">
                      {r.comparable ? `Comparable ${r.comparable}` : "Report"}{" "}
                      <span className={`text-sm ${toneCls(r.status)}`}>{label(r.status)}</span>
                    </p>
                    <p className="mt-1 text-base text-ink">{r.detail}</p>
                    {r.source && (
                      <>
                        <p className="mt-2 text-sm text-muted">Report page {r.source.page}: “{r.source.quote}”</p>
                        <button
                          type="button"
                          onClick={() => setShown(shown === key ? null : key)}
                          className={`mt-2 cursor-pointer text-base font-semibold text-brand underline ${focusRing}`}
                        >
                          {shown === key ? "Hide report line" : "Show the line in your report"}
                        </button>
                      </>
                    )}
                  </div>
                  {r.source && shown === key && (
                    <ReportLine
                      alt={`Report page ${r.source.page}, with the line highlighted`}
                      src={`${API}/api/claims/${id}/page/${r.source.page}.png?quote=${encodeURIComponent(r.source.quote)}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </li>
    );
  };

  const failedPanel = (
    <div className="space-y-8">
      {failed.length > 0 ? (
        <div>
          <h3 className="font-serif text-2xl font-semibold text-ink">
            {headline}
          </h3>
          <ul className="mt-3 border-b border-line">{failed.map(row)}</ul>
        </div>
      ) : rows.length > 0 ? (
        <p className="text-base text-ink">Every check passed. The report looks sound.</p>
      ) : (
        <p className="text-base text-muted">No check results to show.</p>
      )}
      {passed.length > 0 && (
        <div>
          <h3 className="border-t-2 border-rule pt-3 text-xl">{passed.length} passed</h3>
          <ul className="mt-2">{passed.map(row)}</ul>
        </div>
      )}
      <p className="text-sm text-muted">Open any check to see the exact line in your report.</p>
    </div>
  );

  const marketPanel = (
    <div className="space-y-6">
      <Stat label="Fair value of your car (estimate)" value={fv ? usd(fv.estimate) : "—"} />
      <SummaryList
        rows={[
          { label: "Source", value: <Badge tone={audit.market.source === "demo" ? "amber" : "green"}>{audit.market.source === "demo" ? "demo" : audit.market.source}</Badge> },
          { label: "Listings used", value: fv ? `${fv.n_comps} of ${audit.market.searched} found` : "None" },
          ...(fv ? [{ label: "Method", value: fv.method }] : []),
        ]}
      />
      <p className="max-w-prose text-base text-muted">
        {fv ? "The estimate uses same-year, same-trim listings. " : "No matching listings found. "}
        {audit.market.fetched_at && `CarGurus via Apify, fetched ${new Date(audit.market.fetched_at).toLocaleString()}.`}
      </p>
      <Market listings={audit.market.listings} fair={fv} mileage={claim.vehicle.mileage} insurer={audit.insurer_comps ?? []} />
      {audit.market.listings.length > 0 && (
        <div>
          <h4 className="border-t-2 border-rule pt-3 text-xl">Live listings behind the estimate</h4>
          <ul className="mt-2 text-base text-muted">
            {audit.market.listings.slice(0, 5).map((l: Json) => (
              <li key={l.vin} className="border-t border-line py-2 first:border-t-0">
                {l.url ? <a className="text-brand underline underline-offset-2" href={l.url} target="_blank" rel="noreferrer">{l.year} {l.make} {l.model} {l.trim}</a>
                  : `${l.year} ${l.make} ${l.model} ${l.trim}`}
                {" "}· {usd(l.price)} · {l.mileage?.toLocaleString()} mi{l.distance_mi != null ? ` · ${l.distance_mi} mi away` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const gapPanel = (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Insurer offer" value={usd(claim.offer.total)} />
        <Stat label="Counteroffer total" value={co ? usd(co.total) : "—"} />
        <Stat label="Gap" value={co ? usd(co.gap) : "—"} tone={co && co.gap > 0 ? "text-alert" : undefined} />
      </div>
      {audit.bridge?.length > 0 && <Bridge steps={audit.bridge} />}
      <p className="max-w-prose text-base text-muted">
        The counteroffer keeps the insurer&apos;s tax rate and fees and drops an undocumented condition deduction.
      </p>
    </div>
  );

  const urgent = d.days_left <= 7;

  return (
    <div className="space-y-10">
      <div className="border-t-4 border-rule pt-4">
        <p className="text-lg text-muted">Your insurer may owe you about</p>
        <p className="mt-1 font-serif text-7xl font-semibold leading-none tracking-tight text-brand sm:text-8xl">{co ? usd(co.gap) : "—"}</p>
        <p className="mt-4 max-w-prose text-lg text-ink">
          {co
            ? `That is the gap between their offer of ${usd(claim.offer.total)} and a fair total of ${usd(co.total)}.`
            : "We could not work out a fair total without matching listings."}
        </p>
      </div>

      <Notice tone={urgent ? "bad" : "warn"} announce={false}>
        <p className="text-lg">
          <span className="font-serif text-2xl font-semibold">{d.days_left} days left</span> to dispute. Your deadline is {d.date}.
        </p>
        <p className="mt-2">
          Tell your insurer you can&apos;t buy a comparable car for the settlement within 35 days of the offer (10 CCR § 2695.8(c)).
          {d.insurer_exception_may_apply &&
            " The report names a comparable with seller contact and an identifier, so the insurer may not have to reopen. Check that car is really available."}{" "}
          Not legal advice.
        </p>
      </Notice>

      <Tabs panels={{ failed: failedPanel, market: marketPanel, gap: gapPanel }} />
      {voiceEnabled && <VoiceAssistant claimId={id} />}
    </div>
  );
}
