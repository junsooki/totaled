"use client";

import { useEffect, useState } from "react";
import { call, Json } from "@/lib/api";

const secs = (a: string, b: string) => Math.max(0, (new Date(b).getTime() - new Date(a).getTime()) / 1000);

/**
 * One agent's work, shown in the open: its real steps from the backend log (GET /steps) while it works,
 * then "Worked for Xs", which the user can expand. Polls only while `active`.
 */
export default function AgentWork({ id, agent, active, defaultOpen = true }: {
  id: string; agent: string; active: boolean; defaultOpen?: boolean;
}) {
  const [steps, setSteps] = useState<Json[]>([]);
  const [open, setOpen] = useState(defaultOpen);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let stop = false;
    const load = () => call(`/api/claims/${id}/steps`).then((all: Json[]) => {
      if (!stop) setSteps(all.filter((s) => s.agent === agent));
    }).catch(() => {});
    load();
    if (!active) return () => { stop = true; };
    const t = setInterval(() => { load(); setNow(Date.now()); }, 500);
    return () => { stop = true; clearInterval(t); };
  }, [id, agent, active]);

  if (!steps.length && !active) return null;
  const last = steps[steps.length - 1];
  const working = active || last?.status === "working";
  const showSteps = open || working;
  const took = steps.length ? (working ? (now - new Date(steps[0].at).getTime()) / 1000 : secs(steps[0].at, last.at)) : 0;

  return (
    <div className="border-l-[5px] border-ink bg-line/40 px-4 py-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={showSteps}
        className="flex w-full cursor-pointer flex-wrap items-baseline gap-x-3 text-left focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <span className="text-lg font-bold text-ink">{agent}</span>
        <span role="status" className="text-base text-muted">
          {working ? `Working ${took.toFixed(1)}s` : last?.status === "error" ? "Stopped with an error"
            : `Worked for ${took < 1 ? "under a second" : `${took.toFixed(1)}s`}`}
        </span>
        <span className="ml-auto text-base font-semibold text-brand underline">{showSteps ? "Hide steps" : `Show ${steps.length} steps`}</span>
      </button>
      {showSteps && (
        <ol className="mt-2 space-y-1 border-t border-line pt-2">
          {steps.map((s, i) => (
            <li key={`${s.at}-${i}`} className="flex gap-2 text-base">
              <span aria-hidden="true" className={`w-4 shrink-0 font-bold ${s.status === "done" ? "text-brand" : s.status === "error" ? "text-alert" : "text-muted"}`}>
                {s.status === "done" ? "✓" : s.status === "error" ? "!" : "·"}
              </span>
              <span className={s.status === "error" ? "text-alert" : "text-ink"}>{s.text}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
