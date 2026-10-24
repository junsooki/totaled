"use client";

import { useState } from "react";
import { Json, post, usd } from "@/lib/api";
import AgentWork from "./AgentWork";
import { CountUp } from "./motion";
import { Badge, Button, inputCls } from "./ui";

/** Monthly payment on an amortized loan. */
const monthly = (p: number, apr: number, n: number) => (p * (apr / 12)) / (1 - (1 + apr / 12) ** -n);

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
  const cols: Json[] = result ? [result.at_offer, ...(result.at_counteroffer ? [result.at_counteroffer] : [])] : [];
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

      {(busy || result) && <AgentWork id={id} agent="Banker" active={busy} defaultOpen={false} />}

      {result && np && (
        <div className="space-y-6">
          <div className="overflow-x-auto rounded-2xl ring-1 ring-line">
            <table className="w-full text-left text-base">
              <caption className="sr-only">Payout at the insurer&apos;s offer and at your counteroffer</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="p-4 font-medium text-muted"><span className="sr-only">Line</span></th>
                  <th scope="col" className="p-4 font-semibold text-ink">At their offer</th>
                  {cols.length > 1 && <th scope="col" className="bg-brand-soft p-4 font-semibold text-ink">At your counteroffer</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {([
                  ["Insurance payout", (x: Json) => usd(x.payout)],
                  ["You still owe on the loan", (x: Json) => (x.loan_balance ? `− ${usd(x.loan_balance)}` : usd(0))],
                  ["You walk away with", (x: Json) => <span className={`font-serif text-3xl font-semibold tracking-tight ${walkTone(x)}`}><CountUp value={x.walk_away} format={(n) => usd(n)} /></span>],
                  ["Negative equity", (x: Json) => (x.negative_equity ? (x.gap_covers_shortfall ? "Yes, GAP should cover it" : "Yes, you pay the difference") : "No")],
                  ["Buying power for your next car", (x: Json) => usd(Math.max(x.walk_away, 0) + x.prequal.max_amount)],
                  ["Financing", (x: Json) => (x.prequal.decision === "PREQUALIFIED" ? "Qualifies" : x.prequal.decision === "DECLINE" ? "Does not qualify" : "Needs review")],
                ] as [string, (x: Json) => React.ReactNode][]).map(([label, f]) => (
                  <tr key={label}>
                    <th scope="row" className="p-4 font-medium text-muted">{label}</th>
                    {cols.map((x, i) => <td key={i} className={`p-4 text-ink ${i === 1 ? "bg-brand-soft" : ""}`}>{f(x)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.at_counteroffer && (
            <p className="max-w-prose text-lg text-ink">
              Winning the counteroffer puts <span className="font-semibold text-brand">{usd(result.at_counteroffer.walk_away - result.at_offer.walk_away)}</span> more in your pocket.
            </p>
          )}

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

          <div className="rounded-2xl bg-surface p-5 shadow-sm ring-1 ring-line">
            <p className="font-serif text-lg font-semibold text-ink">Financing, in plain words</p>
            <p className="mt-1 max-w-prose text-base text-ink">
              {np.prequal.decision === "PREQUALIFIED"
                ? `With a credit score of ${result.credit.score}, a lender would likely lend you up to ${usd(np.prequal.max_amount)} for your next car, at about ${(np.prequal.apr * 100).toFixed(1)}% a year. On a ${usd(np.prequal.max_amount)} loan over 5 years that is about ${usd(monthly(np.prequal.max_amount, np.prequal.apr, 60))} a month.`
                : np.prequal.decision === "DECLINE"
                  ? `With a credit score of ${result.credit.score}, a loan is unlikely right now. Plan to buy with the cash you walk away with.`
                  : "There is no credit score on file, so a lender would need to look at your situation by hand."}
            </p>
            <p className="mt-2 text-sm text-muted">
              Our illustration from your score, not a lender&apos;s offer. {np.prequal.note}
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
