"use client";

import { useState } from "react";
import { Json, post, usd } from "@/lib/api";
import AgentWork from "./AgentWork";
import { Badge, Button, Notice, SummaryList, inputCls } from "./ui";

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
  const walkTone = (x: Json) => (x.negative_equity ? "text-alert" : "text-brand");
  const labelCls = "block text-base font-medium text-ink";
  const figure = (label: string, x: Json) => (
    <div className="border-t-4 border-rule pt-3">
      <p className="text-base text-muted">{label}</p>
      <p className={`mt-1 font-serif text-5xl font-semibold tracking-tight ${walkTone(x)}`}>{usd(x.walk_away)}</p>
      <p className="mt-2 text-base text-muted">Payout {usd(x.payout)}</p>
    </div>
  );

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-ink">Your details</h2>
        <p className="mt-1 max-w-prose text-base text-muted">
          CRS checks a test credit profile for an auto loan and financing estimate. No real credit data is used. Pick a profile or enter a known loan balance.
        </p>
        <div className="mt-5 max-w-xl space-y-5">
          <label className={labelCls}>
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
          <Button onClick={run} disabled={busy}>{busy ? "Checking your loan…" : "Calculate"}</Button>
        </div>
        {error && <p role="alert" className="mt-3 text-base text-alert">{error}</p>}
      </div>

      {(busy || result) && <AgentWork id={id} agent="Banker" active={busy} defaultOpen={false} />}

      {result && np && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-0">
            <div className="sm:pr-8">{figure("At the insurer's offer, you walk away with", result.at_offer)}</div>
            {result.at_counteroffer && (
              <div className="sm:border-l sm:border-line sm:pl-8">
                {figure("At your counteroffer, you walk away with", result.at_counteroffer)}
              </div>
            )}
          </div>

          <p className="max-w-prose text-lg text-ink">
            {np.loan_balance
              ? `We found an auto loan on your credit report. You still owe ${usd(np.loan_balance)}, and that comes out of the payout first.`
              : "We found no open auto loan on your credit report, so the whole payout is yours."}
          </p>

          <div className="border-t-2 border-rule pt-3">
            <h3 className="font-serif text-xl font-semibold text-ink">At their offer and at your counteroffer</h3>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left text-lg">
                <thead>
                  <tr className="border-b-2 border-ink">
                    <th scope="col" className="py-2 pr-4 font-normal text-muted"><span className="sr-only">Line</span></th>
                    <th scope="col" className="py-2 pr-4">At their offer</th>
                    {result.at_counteroffer && <th scope="col" className="py-2">At your counteroffer</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {([
                    ["Insurance payout", (x: Json) => usd(x.payout)],
                    ["You still owe on the loan", (x: Json) => (x.loan_balance ? `− ${usd(x.loan_balance)}` : usd(0))],
                    ["You walk away with", (x: Json) => <span className={`font-bold ${walkTone(x)}`}>{usd(x.walk_away)}</span>],
                    ["Negative equity", (x: Json) => (x.negative_equity ? (x.gap_covers_shortfall ? "Yes, GAP should cover it" : "Yes, you pay the difference") : "No")],
                    ["Buying power for your next car", (x: Json) => usd(Math.max(x.walk_away, 0) + x.prequal.max_amount)],
                    ["Financing", (x: Json) => (x.prequal.decision === "PREQUALIFIED" ? "Qualifies" : x.prequal.decision === "DECLINE" ? "Does not qualify" : "Needs review")],
                  ] as [string, (x: Json) => React.ReactNode][]).map(([label, f]) => (
                    <tr key={label}>
                      <th scope="row" className="py-2 pr-4 font-normal text-muted">{label}</th>
                      <td className="py-2 pr-4 text-ink">{f(result.at_offer)}</td>
                      {result.at_counteroffer && <td className="py-2 text-ink">{f(result.at_counteroffer)}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted">CRS credit report · {result.credit.source === "demo" ? "demo data" : result.credit.source === "cached" ? "saved data" : "live data"}. Financing is an illustration, not a lender offer.</p>
          </div>

          {np.negative_equity && (
            <div className="max-w-prose">
              <Notice tone="bad" announce={false}>
                <p>
                  You owe more than the car is worth to the insurer. {np.gap_covers_shortfall
                    ? "Your GAP coverage should pay the difference. File a GAP claim."
                    : "Without GAP coverage, you pay the difference yourself."}
                </p>
              </Notice>
            </div>
          )}
          {!np.negative_equity && np.gap_covers_shortfall && (
            <div className="max-w-prose">
              <Notice tone="warn">
                <p>Your GAP coverage may help if the numbers change.</p>
              </Notice>
            </div>
          )}

          <div className="max-w-xl border-t-2 border-rule pt-3">
            <h3 className="font-serif text-xl font-semibold text-ink">Financing, in plain words</h3>
            <p className="mt-1 text-lg text-ink">
              {np.prequal.decision === "PREQUALIFIED"
                ? `With a credit score of ${result.credit.score}, a lender would likely lend you up to ${usd(np.prequal.max_amount)} for your next car, at about ${(np.prequal.apr * 100).toFixed(1)}% a year. On a ${usd(np.prequal.max_amount)} loan over 5 years that is about ${usd(monthly(np.prequal.max_amount, np.prequal.apr, 60))} a month.`
                : np.prequal.decision === "DECLINE"
                  ? `With a credit score of ${result.credit.score}, a loan is unlikely right now. Plan to buy with the cash you walk away with.`
                  : "There is no credit score on file, so a lender would need to look at your situation by hand."}
            </p>
            <p className="mt-1 text-sm text-muted">
              This is an illustration, not a lender&apos;s offer. {np.prequal.note}
            </p>
            <div className="mt-2">
              <SummaryList
                rows={[
                  { label: "Decision", value: String(np.prequal.decision) },
                  ...(np.prequal.apr ? [{ label: "APR (about)", value: `${(np.prequal.apr * 100).toFixed(1)}% APR` }] : []),
                  ...(np.prequal.max_amount ? [{ label: "Up to", value: usd(np.prequal.max_amount) }] : []),
                ]}
              />
            </div>
          </div>

          <div className="border-t border-line pt-3">
            <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <span>
                {result.credit.name}: score {result.credit.score ?? "none"} ({result.credit.score_model ?? "n/a"}),{" "}
                {result.credit.auto_loans.length} open auto loan(s).
              </span>
              <Badge tone={result.credit.source === "demo" ? "amber" : result.credit.source === "cached" ? "zinc" : "green"}>{result.credit.source === "demo" ? "Demo data" : result.credit.source === "cached" ? "Saved data" : "Live data"}</Badge>
            </p>
            {result.credit.errors.length > 0 && (
              <p className="mt-1 text-sm text-alert">Credit report issues: {result.credit.errors.join("; ")}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
