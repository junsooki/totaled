"use client";

import { useState } from "react";
import { API, Json, usd } from "@/lib/api";
import { Badge, Stat } from "./ui";

const tone = (s: string) => (s === "fail" ? "red" : s === "pass" ? "green" : "amber");

export default function Audit({ id, claim, audit, checks }: { id: string; claim: Json; audit: Json; checks: Json[] }) {
  const [focus, setFocus] = useState<Json | null>(null);
  const comps: Json[] = claim.comparables;
  const byKey = new Map<string, Json>(audit.checks.map((r: Json) => [`${r.check}:${r.comparable ?? ""}`, r]));
  const fv = audit.market.fair_value;
  const co = audit.counteroffer;
  const d = audit.deadline;

  const cell = (r: Json | undefined) =>
    r ? (
      <button onClick={() => setFocus(r)} className="cursor-pointer" title={r.detail}>
        <Badge tone={tone(r.status)}>{r.status}</Badge>
      </button>
    ) : null;

  return (
    <div className="space-y-6">
      <div className={`rounded p-3 text-sm ${d.days_left <= 7 ? "bg-red-100 dark:bg-red-950" : "bg-amber-50 dark:bg-amber-950"}`}>
        <b>{d.days_left} days left</b> to tell your insurer you can&apos;t buy a comparable car for the settlement
        (by {d.date}, 35 days from the offer, 10 CCR § 2695.8(c)).
        {d.insurer_exception_may_apply &&
          " The report names a comparable with seller contact and an identifier, so the insurer may not have to reopen: check that car is really available."}
        {" "}Not legal advice.
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Insurer offer" value={usd(claim.offer.total)} />
        <Stat label="Fair value of the car (Estimate)" value={fv ? usd(fv.estimate) : "—"} />
        <Stat label="Counteroffer total" value={co ? usd(co.total) : "—"} />
        <Stat label="Gap" value={co ? usd(co.gap) : "—"} tone={co && co.gap > 0 ? "text-red-600" : undefined} />
      </div>
      <p className="text-xs text-zinc-500">
        {fv ? `Estimate: ${fv.method} over ${fv.n_comps} same-year, same-trim listings out of ${audit.market.searched} found. ` : "No matching listings found. "}
        Market data: <Badge tone={audit.market.source === "demo" ? "amber" : "zinc"}>{audit.market.source}</Badge>
        {audit.market.fetched_at && ` CarGurus via Apify, fetched ${new Date(audit.market.fetched_at).toLocaleString()}.`}
        {" "}The counteroffer keeps the insurer&apos;s tax rate and fees and drops an undocumented condition deduction.
      </p>

      <div className="overflow-x-auto">
        <h3 className="mb-2 font-medium">The 10 checks · {audit.failed} failed</h3>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs text-zinc-500">
            <tr><th className="py-1">Check</th><th>Rule</th>{comps.map((c) => <th key={c.id}>{c.id}</th>)}<th>Report</th></tr>
          </thead>
          <tbody>
            {checks.map((ch) => (
              <tr key={ch.check} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="py-1.5 pr-2">{ch.check}. {ch.name}</td>
                <td className="pr-2 text-xs text-zinc-500">{ch.rule}</td>
                {comps.map((c) => <td key={c.id}>{cell(byKey.get(`${ch.check}:${c.id}`))}</td>)}
                <td>{cell(byKey.get(`${ch.check}:`))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-1 text-xs text-zinc-500">Click any result to see the exact line in your report.</p>
      </div>

      {focus && (
        <div className="grid gap-4 rounded border border-zinc-200 p-4 sm:grid-cols-2 dark:border-zinc-800">
          <div>
            <div className="text-sm font-medium">
              Check {focus.check}{focus.comparable ? ` · ${focus.comparable}` : ""} <Badge tone={tone(focus.status)}>{focus.status}</Badge>
            </div>
            <p className="mt-2 text-sm">{focus.detail}</p>
            {focus.source && <p className="mt-2 text-xs text-zinc-500">Report page {focus.source.page}: “{focus.source.quote}”</p>}
            <h4 className="mt-4 text-sm font-medium">Live listings that back the fair value</h4>
            <ul className="mt-1 space-y-1 text-xs">
              {audit.market.listings.slice(0, 5).map((l: Json) => (
                <li key={l.vin}>
                  {l.url ? <a className="underline" href={l.url} target="_blank" rel="noreferrer">{l.year} {l.make} {l.model} {l.trim}</a>
                    : `${l.year} ${l.make} ${l.model} ${l.trim}`}
                  {" "}· {usd(l.price)} · {l.mileage?.toLocaleString()} mi{l.distance_mi != null ? ` · ${l.distance_mi} mi away` : ""}
                </li>
              ))}
            </ul>
          </div>
          {focus.source && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={`Report page ${focus.source.page}`}
              className="w-full rounded border border-zinc-200 dark:border-zinc-800"
              src={`${API}/api/claims/${id}/page/${focus.source.page}.png?quote=${encodeURIComponent(focus.source.quote)}`}
            />
          )}
        </div>
      )}
    </div>
  );
}
