"use client";

// The AI agents' work as it happens: each one posts its steps into SpacetimeDB, every screen sees them live.
import { useTable } from "spacetimedb/react";
import { Badge } from "@/components/ui";
import { micros } from "@/lib/live";
import { tables } from "@/module_bindings";

const AGENTS = ["Reader", "Appraiser", "Negotiator", "Shopper", "Droid"];
const tone = (s: string) => (s === "done" ? "green" : s === "error" ? "red" : "amber");

export default function AgentFeed({ claimId }: { claimId: string }) {
  const [steps] = useTable(tables.agentStep);
  const mine = steps.filter((s) => s.claimId === claimId).sort((a, b) => micros(a.at) - micros(b.at));
  const latest = new Map(mine.map((s) => [s.agent, s]));

  return (
    <div className="rounded-3xl bg-surface p-5 shadow-sm ring-1 ring-line">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-xl font-semibold text-ink">Agents at work</h3>
        <span className="text-sm text-muted">Live</span>
      </div>
      <ul className="mt-3 divide-y divide-line">
        {AGENTS.map((a) => {
          const s = latest.get(a);
          return (
            <li key={a} className="flex items-center justify-between gap-3 py-2">
              <span className="text-base font-medium text-ink">{a}</span>
              {s ? <Badge tone={tone(s.status)}>{s.status}</Badge> : <span className="text-sm text-muted">Idle</span>}
            </li>
          );
        })}
      </ul>
      <ol className="mt-4 max-h-56 space-y-2 overflow-y-auto border-t border-line pt-4 text-sm">
        {[...mine].reverse().map((s) => (
          <li key={s.id.toString()} className="leading-snug text-ink">
            <span className="text-muted">{new Date(micros(s.at)).toLocaleTimeString()}</span>{" "}
            <span className="font-semibold">{s.agent}</span> {s.text}
          </li>
        ))}
        {!mine.length && <li className="text-muted">Waiting for the first agent...</li>}
      </ol>
    </div>
  );
}
