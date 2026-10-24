"use client";

import { useState } from "react";
import { Json, post, usd } from "@/lib/api";
import { Badge, Button, inputCls } from "./ui";

export default function Payout({ id, personas, onDone }: { id: string; personas: Json[]; onDone: (p: Json) => void }) {
  const [persona, setPersona] = useState("P01");
  const [balance, setBalance] = useState("");
  const [gap, setGap] = useState<"" | "yes" | "no">("");
  const [result, setResult] = useState<Json | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const r = await post(`/api/claims/${id}/payout`, {
        persona,
        loan_balance: balance === "" ? null : Number(balance),
        has_gap: gap === "" ? null : gap === "yes",
      });
      setResult(r);
      onDone(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const np = result ? result.at_counteroffer ?? result.at_offer : null;
  const walkTone = (x: Json) => (x.negative_equity ? "text-alert" : "text-brand");
  const labelCls = "block text-base font-medium text-ink";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-ink">Your details</h2>
        <p className="mt-1 text-base text-muted">
          We use test credit profiles only, never real credit data. Pick the one that stands in for you.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className={`${labelCls} sm:col-span-2`}>
            Test profile
            <select className={`${inputCls} mt-1`} value={persona} onChange={(e) => setPersona(e.target.value)}>
              {personas.map((p) => <option key={p.id} value={p.id}>{p.id} {p.name} ({p.profile})</option>)}
            </select>
          </label>
          <label className={labelCls}>
            Loan balance (optional)
            <input className={`${inputCls} mt-1`} inputMode="decimal" placeholder="Use the credit report" value={balance} onChange={(e) => setBalance(e.target.value)} />
          </label>
          <label className={labelCls}>
            Do you have GAP coverage?
            <select className={`${inputCls} mt-1`} value={gap} onChange={(e) => setGap(e.target.value as "" | "yes" | "no")}>
              <option value="">Not sure</option><option value="yes">Yes</option><option value="no">No</option>
            </select>
          </label>
        </div>
        <div className="mt-5">
          <Button onClick={run} disabled={busy}>{busy ? "Checking your loan…" : "Calculate"}</Button>
        </div>
        {error && <p className="mt-3 text-base text-alert">{error}</p>}
      </div>

      {result && np && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-line">
              <p className="text-base text-muted">At the insurer&apos;s offer, you walk away with</p>
              <p className={`mt-2 font-serif text-5xl font-semibold tracking-tight ${walkTone(result.at_offer)}`}>
                {usd(result.at_offer.walk_away)}
              </p>
              <p className="mt-2 text-base text-muted">Payout {usd(result.at_offer.payout)}</p>
            </div>
            {result.at_counteroffer && (
              <div className="rounded-2xl bg-brand-soft p-6">
                <p className="text-base text-muted">At your counteroffer, you walk away with</p>
                <p className={`mt-2 font-serif text-5xl font-semibold tracking-tight ${walkTone(result.at_counteroffer)}`}>
                  {usd(result.at_counteroffer.walk_away)}
                </p>
                <p className="mt-2 text-base text-muted">Payout {usd(result.at_counteroffer.payout)}</p>
              </div>
            )}
          </div>

          <p className="max-w-prose text-lg text-ink">
            {np.loan_balance
              ? `We found an auto loan on your credit report. You still owe ${usd(np.loan_balance)}, and that comes out of the payout first.`
              : "We found no open auto loan on your credit report, so the whole payout is yours."}
          </p>

          {np.negative_equity && (
            <p className="max-w-prose rounded-xl bg-alert-soft p-4 text-base text-alert">
              You owe more than the car is worth to the insurer. {np.gap_covers_shortfall
                ? "Your GAP coverage should pay the difference. File a GAP claim."
                : "Without GAP coverage, you pay the difference yourself."}
            </p>
          )}
          {!np.negative_equity && np.gap_covers_shortfall && (
            <p className="max-w-prose rounded-xl bg-amber-soft p-4 text-base text-amber">
              Your GAP coverage may help if the numbers change.
            </p>
          )}

          <div className="rounded-2xl bg-surface p-5 shadow-sm">
            <p className="font-serif text-lg font-semibold text-ink">Financing, as an example</p>
            <p className="mt-1 text-base text-ink">
              Decision: {np.prequal.decision}
              {np.prequal.apr ? `, about ${(np.prequal.apr * 100).toFixed(1)}% APR` : ""}
              {np.prequal.max_amount ? `, up to ${usd(np.prequal.max_amount)}` : ""}.
            </p>
            <p className="mt-1 text-sm text-muted">
              This is an illustration, not a lender&apos;s offer. {np.prequal.note}
            </p>
          </div>

          <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <span>
              {result.credit.name}: score {result.credit.score ?? "none"} ({result.credit.score_model ?? "n/a"}),{" "}
              {result.credit.auto_loans.length} open auto loan(s).
            </span>
            <Badge tone={result.credit.source === "demo" ? "amber" : "green"}>{result.credit.source === "demo" ? "Demo data" : "Live data"}</Badge>
          </p>
          {result.credit.errors.length > 0 && (
            <p className="text-sm text-alert">Credit report issues: {result.credit.errors.join("; ")}</p>
          )}
        </div>
      )}
    </div>
  );
}
