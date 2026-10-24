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
    <div className="rounded border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Agents at work</h3>
        <span className="text-xs text-zinc-500">live · SpacetimeDB</span>
      </div>
      <div className="mb-3 grid grid-cols-5 gap-1 text-center text-[11px]">
        {AGENTS.map((a) => {
          const s = latest.get(a);
          return (
            <div key={a} className="rounded bg-zinc-100 px-1 py-1 dark:bg-zinc-900">
              <div className="font-medium">{a}</div>
              {s ? <Badge tone={tone(s.status)}>{s.status}</Badge> : <span className="text-zinc-400">idle</span>}
            </div>
          );
        })}
      </div>
      <ol className="max-h-56 space-y-1 overflow-y-auto text-xs">
        {[...mine].reverse().map((s) => (
          <li key={s.id.toString()} className="leading-snug">
            <span className="text-zinc-400">{new Date(micros(s.at)).toLocaleTimeString()}</span>{" "}
            <b>{s.agent}</b> <Badge tone={tone(s.status)}>{s.status}</Badge> {s.text}
          </li>
        ))}
        {!mine.length && <li className="text-zinc-500">Waiting for the first agent…</li>}
      </ol>
    </div>
  );
}
