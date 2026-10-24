"use client";

import { useState } from "react";
import { Json, post, usd } from "@/lib/api";
import { Badge, Button, Notice, SummaryList, inputCls } from "./ui";

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

          <div className="max-w-xl border-t-2 border-rule pt-3">
            <h3 className="font-serif text-xl font-semibold text-ink">How the estimate is worked out</h3>
            <SummaryList
              rows={[
                { label: "Settlement used", value: usd(np.payout) },
                { label: "Auto loan balance", value: np.loan_balance ? usd(np.loan_balance) : "No open auto loan found" },
                { label: "Estimated cash to you", value: usd(np.walk_away), big: true, tone: np.negative_equity ? "bad" : "good" },
              ]}
            />
            <p className="text-sm text-muted">CRS credit report · {result.credit.source === "demo" ? "demo data" : "live data"}. Financing is an illustration, not a lender offer.</p>
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
            <h3 className="font-serif text-xl font-semibold text-ink">Financing, as an example</h3>
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
