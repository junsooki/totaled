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
    <div className="border-t-4 border-rule pt-3">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-2xl font-semibold text-ink">Agents at work</h3>
        <Badge tone="green">Live</Badge>
      </div>
      <ul className="mt-3">
        {AGENTS.map((a) => {
          const s = latest.get(a);
          return (
            <li key={a} className="flex items-center justify-between gap-3 border-t border-line py-2 first:border-t-0">
              <span className="text-base font-medium text-ink">{a}</span>
              {s ? <Badge tone={tone(s.status)}>{s.status}</Badge> : <span className="text-base text-muted">Idle</span>}
            </li>
          );
        })}
      </ul>
      <ol className="mt-4 max-h-56 overflow-y-auto border-t border-line text-base">
        {[...mine].reverse().map((s) => (
          <li key={s.id.toString()} className="border-t border-line py-2 leading-snug text-ink first:border-t-0">
            <span className="text-muted">{new Date(micros(s.at)).toLocaleTimeString()}</span>{" "}
            <span className="font-semibold">{s.agent}</span> {s.text}
          </li>
        ))}
        {!mine.length && <li className="py-2 text-muted">Waiting for the first agent...</li>}
      </ol>
    </div>
  );
}
