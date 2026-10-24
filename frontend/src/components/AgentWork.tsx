"use client";

import { useEffect, useState } from "react";
import { call, Json } from "@/lib/api";

const AVATAR: Record<string, string> = {
  Reader: "bg-[#ffd9bf] text-[#8a3b0f]",
  Appraiser: "bg-[#dfe6ff] text-[#1633c9]",
  Negotiator: "bg-[#e3f4ea] text-[#1d6b45]",
  Banker: "bg-[#f1e3ff] text-[#6b2bb3]",
  Shopper: "bg-[#fff1c7] text-[#8a6100]",
};

const secs = (a: string, b: string) => Math.max(0, (new Date(b).getTime() - new Date(a).getTime()) / 1000);

function Icon({ text }: { text: string }) {
  const search = /^(Search|Found|Pulling|Checking)/.test(text);
  return (
    <svg viewBox="0 0 16 16" className="mt-1 size-4 shrink-0 text-white/70" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      {search ? <><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" strokeLinecap="round" /></>
        : <path d="M4 1.5h5.5L12.5 4.5V14.5H4z M9.5 1.5v3h3" strokeLinejoin="round" />}
    </svg>
  );
}

/**
 * One crew member's work, shown in the open: live steps while it works, then "Worked for Xs" you can expand.
 * Steps are the backend's real log (GET /steps); it polls only while `active`.
 */
export default function AgentWork({ id, agent, active, defaultOpen = true, since }: {
  id: string; agent: string; active: boolean; defaultOpen?: boolean; since?: string;
}) {
  const [steps, setSteps] = useState<Json[]>([]);
  const [open, setOpen] = useState(defaultOpen);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let stop = false;
    const load = () => call(`/api/claims/${id}/steps`).then((all: Json[]) => {
      if (!stop) setSteps(all.filter((s) => s.agent === agent && (!since || s.at >= since)));
    }).catch(() => {});
    load();
    if (!active) return () => { stop = true; };
    const t = setInterval(() => { load(); setNow(Date.now()); }, 500);
    return () => { stop = true; clearInterval(t); };
  }, [id, agent, active, since]);

  if (!steps.length && !active) return null;
  const last = steps[steps.length - 1];
  const working = active || last?.status === "working";
  const failed = last?.status === "error";
  const showSteps = open || working;  // always show steps while the agent is working
  const took = steps.length ? (working ? (now - new Date(steps[0].at).getTime()) / 1000 : secs(steps[0].at, last.at)) : 0;

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(150deg,#0b1f4d,#132c8f_60%,#1633c9)] p-4 sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -bottom-20 size-64 rounded-full bg-[radial-gradient(closest-side,rgba(255,163,107,0.55),transparent)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-10 size-72 rounded-full bg-[radial-gradient(closest-side,rgba(90,125,255,0.45),transparent)]" />
      <div className="relative rounded-2xl bg-[linear-gradient(160deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04)_55%,rgba(255,255,255,0.07))] p-4 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.16)_inset,0_30px_60px_-30px_rgba(3,6,15,0.8)] backdrop-blur-md sm:p-5">
        <div className="flex items-center gap-3">
          <span className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${AVATAR[agent] ?? "bg-white text-ink"}`}>{agent[0]}</span>
          <span className="font-medium">{agent}</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={showSteps}
          className="mt-1 ml-10 flex cursor-pointer items-center gap-1.5 rounded text-sm text-white/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          {working ? (
            <span aria-hidden="true" className="size-3 animate-spin rounded-full border-[1.5px] border-white/30 border-t-white" />
          ) : (
            <span aria-hidden="true">✦</span>
          )}
          <span role="status">{working ? `Working ${took.toFixed(1)}s` : failed ? "Stopped with an error" : `Worked for ${took < 1 ? "under a second" : `${took.toFixed(1)}s`}`}</span>
          <span aria-hidden="true" className={`transition-transform ${showSteps ? "" : "rotate-180"}`}>⌃</span>
        </button>
        {showSteps && (
          <ol className="mt-3 ml-10 space-y-2">
            {steps.map((s, i) => (
              <li key={`${s.at}-${i}`} className="animate-rise flex gap-2.5 text-[15px] leading-6" style={{ animationDelay: `${Math.min(i, 8) * 90}ms` }}>
                {s.status === "done" ? <span aria-hidden="true" className="mt-0.5 text-[#a9bcff]">✓</span> : <Icon text={s.text} />}
                <span className={s.status === "done" ? "text-white" : s.status === "error" ? "text-[#ffb1a8]" : "text-white/85"}>{s.text}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
