"use client";

import { useState } from "react";
import { Json, post } from "@/lib/api";
import { Button, OkCard } from "./ui";

export default function Letter({ id, letter, onApproved }: { id: string; letter: Json; onApproved: () => void }) {
  const original: Json[] = letter.sentences;
  const [texts, setTexts] = useState<string[]>(original.map((s) => s.text));
  const [checked, setChecked] = useState<Json[]>(original);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const evidence = new Map<string, string>(letter.evidence.map((e: Json) => [e.id, e.fact]));

  async function approve() {
    setBusy(true);
    setError(null);
    try {
      await post(`/api/claims/${id}/letter/approve`, {
        sentences: texts.map((text, i) => ({ text, citations: original[i].citations })),
      });
      setChecked(texts.map((text, i) => ({ text, citations: original[i].citations, ok: true, problems: [] })));
      setApproved(true);
      onApproved();
    } catch (e) {
      const err = e as Error & { body?: Json };
      if (err.body?.sentences) setChecked(err.body.sentences);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const rejected = checked.filter((s) => !s.ok).length;
  return (
    <div className="space-y-6">
      <p className="max-w-prose text-base text-muted">
        Read the letter and change any sentence. The small numbers show the evidence behind each sentence. Nothing is
        sent until you approve.
      </p>

      <div className="mx-auto max-w-2xl rounded-2xl bg-cream px-6 py-8 shadow-sm ring-1 ring-line sm:px-12 sm:py-12">
        <ol className="space-y-5 font-serif text-lg leading-8 text-ink">
          {texts.map((t, i) => {
            const s = checked[i];
            const failed = s && !s.ok;
            const edited = t !== original[i].text;
            return (
              <li key={i} className={failed ? "rounded-lg bg-alert-soft p-3" : ""}>
                <textarea
                  aria-label={`Sentence ${i + 1}`}
                  className={`block w-full resize-none rounded-md bg-transparent px-1 py-0.5 font-serif text-lg leading-8 hover:bg-surface focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:hover:bg-transparent ${failed ? "text-alert" : "text-ink"}`}
                  rows={Math.max(1, Math.ceil(t.length / 62))}
                  value={t}
                  disabled={approved}
                  onChange={(e) => setTexts(texts.map((x, j) => (j === i ? e.target.value : x)))}
                />
                {edited && <p className="mt-1 px-1 font-sans text-sm text-muted line-through">{original[i].text}</p>}
                {original[i].citations.length > 0 && (
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 px-1 font-sans text-sm text-muted">
                    <span>Evidence:</span>
                    {original[i].citations.map((c: string) => {
                      const key = `${i}:${c}`;
                      return (
                        <button
                          key={c}
                          type="button"
                          aria-expanded={open === key}
                          title={evidence.get(c) ?? ""}
                          onClick={() => setOpen(open === key ? null : key)}
                          className="cursor-pointer rounded px-1 text-brand underline decoration-dotted underline-offset-2 hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                )}
                {original[i].citations.map((c: string) =>
                  open === `${i}:${c}` ? (
                    <p key={c} className="mt-1 rounded-md bg-brand-soft px-3 py-2 font-sans text-sm leading-6 text-ink">
                      <span className="font-semibold">{c}:</span> {evidence.get(c) ?? "No detail available."}
                    </p>
                  ) : null,
                )}
                {failed && (
                  <ul className="mt-2 px-1 font-sans text-sm font-medium text-alert">
                    {s.problems.map((p: string) => <li key={p}>{p}</li>)}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mx-auto max-w-2xl">
      <OkCard title={approved ? "This letter goes out in your name." : "Approve this letter to go out in your name?"} done={approved}>
      <div className="space-y-4">
        {rejected > 0 && (
          <p className="text-base font-medium text-alert">
            {rejected} {rejected === 1 ? "sentence does" : "sentences do"} not pass the check. Each dollar amount must
            match the evidence. Fix {rejected === 1 ? "it" : "them"} and approve again.
          </p>
        )}
        {error && <p role="alert" className="text-base text-alert">{error}</p>}
        {approved ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={() => navigator.clipboard.writeText(texts.join("\n\n"))}>Copy letter</Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button onClick={approve} disabled={busy}>{busy ? "Checking…" : "Approve this letter"}</Button>
            <p className="text-base text-muted">
              We check every dollar amount against the evidence, then save the letter so you can copy it.
            </p>
          </div>
        )}
        <p className="text-sm text-muted">
          Drafted by {letter.drafted_by === "claude" ? "Claude" : letter.drafted_by}.
        </p>
      </div>
      </OkCard>
      </div>
    </div>
  );
}
