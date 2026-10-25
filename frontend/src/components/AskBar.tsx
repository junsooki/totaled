"use client";

import { useState } from "react";
import { Json, post } from "@/lib/api";
import { Button, inputCls } from "./ui";

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
    <div className="fixed inset-x-0 bottom-0 z-30 border-t-4 border-brand bg-surface">
      <div className="mx-auto w-full max-w-3xl px-4 py-3 sm:px-6">
        {showCard && (
          <div className="mb-3 max-h-[45vh] overflow-y-auto border-l-[5px] border-brand bg-brand-soft px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <p className="text-base font-bold text-ink">{asked}</p>
              <button type="button" onClick={() => { setAnswer(null); setError(null); }}
                className="cursor-pointer text-base font-semibold text-brand underline focus-visible:outline-4 focus-visible:outline-brand">Close</button>
            </div>
            {busy && <p role="status" className="mt-1 text-base text-muted">Looking through your case file…</p>}
            {error && <p role="alert" className="mt-1 text-base text-alert">{error}</p>}
            {answer && !busy && (answer.found ? (
              <div className="mt-1 space-y-2">
                {answer.sentences.map((s: Json, i: number) => (
                  <div key={i}>
                    <p className="text-base text-ink">
                      {s.text}{" "}
                      {s.citations.map((c: string) => (
                        <button key={c} type="button" onClick={() => setOpen(open === `${i}:${c}` ? null : `${i}:${c}`)} aria-expanded={open === `${i}:${c}`}
                          className="mr-1 cursor-pointer border border-brand px-1 text-sm font-bold text-brand hover:bg-surface focus-visible:outline-4 focus-visible:outline-brand">
                          {c}
                        </button>
                      ))}
                    </p>
                    {s.citations.map((c: string) => open === `${i}:${c}` && (
                      <p key={c} className="mt-1 border-l-2 border-brand pl-3 text-sm text-ink">{answer.sources[c]}</p>
                    ))}
                  </div>
                ))}
                <p className="text-sm text-muted">From your case file only · {answer.by === "claude" ? "Claude" : answer.by} · not legal advice</p>
              </div>
            ) : (
              <p className="mt-1 text-base text-ink">That is not in your documents. Try asking about the checks, the listings, the deadline or your payout.</p>
            ))}
          </div>
        )}
        {!showCard && focused && (
          <div className="mb-2 flex flex-wrap gap-2">
            {EXAMPLES.map((e) => (
              <button key={e} type="button" onMouseDown={(ev) => ev.preventDefault()} onClick={() => ask(e)}
                className="cursor-pointer border-2 border-ink bg-surface px-2 py-0.5 text-base text-ink hover:bg-brand-soft focus-visible:outline-4 focus-visible:outline-brand">
                {e}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="flex gap-2">
          <label htmlFor="ask" className="sr-only">Ask about your case</label>
          <input id="ask" className={inputCls} value={q} onChange={(e) => setQ(e.target.value)} maxLength={500}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder="Ask about your case" />
          <Button type="submit" disabled={busy || q.trim().length < 3}>Ask</Button>
        </form>
      </div>
    </div>
  );
}
