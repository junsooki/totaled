"use client";

import { useState } from "react";
import { Json, post } from "@/lib/api";

const EXAMPLES = ["When is my deadline?", "Why does comparable C2 fail?", "How was the market value worked out?"];

/** Ask about your case. Answers come only from the case file and the rule text, and every sentence is cited. */
export default function AskBar({ id }: { id: string }) {
  const [q, setQ] = useState("");
  const [asked, setAsked] = useState("");
  const [answer, setAnswer] = useState<Json | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);  // example questions show only while the bar is in use

  async function ask(question: string) {
    if (question.trim().length < 3 || busy) return;
    setBusy(true);
    setError(null);
    setAsked(question);
    setOpen(null);
    try {
      setAnswer(await post(`/api/claims/${id}/ask`, { question }));
      setQ("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setAnswer(null);
    } finally {
      setBusy(false);
    }
  }

  const showCard = busy || answer || error;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-2xl">
        {showCard && (
          <div className="animate-rise mb-3 max-h-[50vh] overflow-y-auto rounded-3xl bg-[linear-gradient(160deg,#16297a,#0b1f4d_60%)] p-5 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)_inset,0_30px_80px_-20px_rgba(3,6,15,0.7)]">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-white/60">{asked}</p>
              <button type="button" onClick={() => { setAnswer(null); setError(null); }} aria-label="Close answer"
                className="cursor-pointer rounded-full px-2 text-white/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">✕</button>
            </div>
            {busy && <p role="status" className="mt-2 flex items-center gap-2 text-white/80"><span aria-hidden="true" className="size-3 animate-spin rounded-full border-[1.5px] border-white/30 border-t-white" />Looking through your case file…</p>}
            {error && <p role="alert" className="mt-2 text-[#ffb1a8]">{error}</p>}
            {answer && !busy && (answer.found ? (
              <div className="mt-2 space-y-3">
                {answer.sentences.map((s: Json, i: number) => (
                  <p key={i} className="leading-7">
                    {s.text}{" "}
                    {s.citations.map((c: string) => (
                      <button key={c} type="button" onClick={() => setOpen(open === `${i}:${c}` ? null : `${i}:${c}`)} aria-expanded={open === `${i}:${c}`}
                        className="mr-1 cursor-pointer rounded-full bg-white/15 px-2 py-0.5 align-middle text-xs text-white hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
                        {c}
                      </button>
                    ))}
                    {s.citations.map((c: string) => open === `${i}:${c}` && (
                      <span key={c} className="mt-2 block rounded-xl bg-white/10 px-3 py-2 text-sm text-white/85">{answer.sources[c]}</span>
                    ))}
                  </p>
                ))}
                <p className="text-xs text-white/50">From your case file only · {answer.by === "claude" ? "Claude" : answer.by} · not legal advice</p>
              </div>
            ) : (
              <p className="mt-2 text-white/85">That is not in your documents. Try asking about the checks, the listings, the deadline or your payout.</p>
            ))}
          </div>
        )}
        {!showCard && focused && (
          <div className="animate-rise mb-2 flex flex-wrap justify-center gap-2">
            {EXAMPLES.map((e) => (
              <button key={e} type="button" onMouseDown={(ev) => ev.preventDefault()} onClick={() => ask(e)}
                className="cursor-pointer rounded-full bg-white/90 px-3 py-1 text-sm text-ink shadow-[0_0_0_1px_rgba(11,31,77,0.08),0_8px_18px_-12px_rgba(11,31,77,0.5)] backdrop-blur hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                {e}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); ask(q); }}
          className="animate-glow flex items-center gap-2 rounded-2xl bg-[linear-gradient(160deg,rgba(40,62,160,0.92),rgba(11,31,77,0.94))] py-2 pr-2 pl-4 backdrop-blur-md">
          <span aria-hidden="true" className="text-white/60">✦</span>
          <label htmlFor="ask" className="sr-only">Ask about your case</label>
          <input id="ask" value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder="Ask about your case…" maxLength={500}
            className="min-w-0 flex-1 bg-transparent py-1.5 text-base text-white placeholder:text-white/50 focus:outline-none" />
          <button type="submit" disabled={busy || q.trim().length < 3} aria-label="Ask"
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-brand disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
}
