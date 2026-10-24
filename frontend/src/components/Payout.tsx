"use client";

import { useState } from "react";
import { Json, post, usd } from "@/lib/api";
import { Badge, Button, Stat, inputCls } from "./ui";

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
  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-500">
        CRS sandbox test personas only: never real credit data. Pick the persona that stands in for you.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <label className="text-xs text-zinc-500 sm:col-span-2">Sandbox persona
          <select className={inputCls} value={persona} onChange={(e) => setPersona(e.target.value)}>
            {personas.map((p) => <option key={p.id} value={p.id}>{p.id} {p.name} ({p.profile})</option>)}
          </select>
        </label>
        <label className="text-xs text-zinc-500">Loan balance override
          <input className={inputCls} placeholder="from credit report" value={balance} onChange={(e) => setBalance(e.target.value)} />
        </label>
        <label className="text-xs text-zinc-500">Do you have GAP coverage?
          <select className={inputCls} value={gap} onChange={(e) => setGap(e.target.value as "" | "yes" | "no")}>
            <option value="">Not sure</option><option value="yes">Yes</option><option value="no">No</option>
          </select>
        </label>
      </div>
      <Button onClick={run} disabled={busy}>{busy ? "Pulling credit report…" : "Find my auto loan"}</Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result && np && (
        <div className="space-y-3">
          <p className="text-sm">
            {result.credit.name}: score {result.credit.score ?? "none"} ({result.credit.score_model ?? "n/a"}),{" "}
            {result.credit.auto_loans.length} open auto loan(s){result.credit.errors.length ? `, errors: ${result.credit.errors.join("; ")}` : ""}{" "}
            <Badge tone={result.credit.source === "demo" ? "amber" : "zinc"}>{result.credit.source}</Badge>
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label={result.at_counteroffer ? "Payout if counteroffer accepted" : "Payout at offer"} value={usd(np.payout)} />
            <Stat label="Auto loan payoff" value={usd(np.loan_balance)} />
            <Stat label="You walk away with" value={usd(np.walk_away)} tone={np.negative_equity ? "text-red-600" : "text-green-700"} />
            <Stat label="Financing (prequal)" value={np.prequal.max_amount ? usd(np.prequal.max_amount) : np.prequal.decision} />
          </div>
          {result.at_counteroffer && (
            <p className="text-xs text-zinc-500">At the insurer&apos;s current offer you would walk away with {usd(result.at_offer.walk_away)}.</p>
          )}
          {np.negative_equity && (
            <p className="text-sm text-red-600">
              Negative equity: you owe more than the payout.{" "}
              {np.gap_covers_shortfall ? "Your GAP coverage should pay the difference; file a GAP claim." : "Without GAP coverage you pay the difference."}
            </p>
          )}
          <p className="text-xs text-zinc-500">
            Prequalification: {np.prequal.decision}{np.prequal.apr ? ` at about ${(np.prequal.apr * 100).toFixed(1)}% APR` : ""} ({np.prequal.note}).
            Illustrative tiers, not a lender&apos;s offer.
          </p>
        </div>
      )}
    </div>
  );
}
