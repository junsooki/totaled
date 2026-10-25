"use client";

import { useState } from "react";
import { download, Json, post } from "@/lib/api";
import { Button, Notice } from "./ui";

export default function Letter({ id, letter, onApproved }: { id: string; letter: Json; onApproved: () => void }) {
  const original: Json[] = letter.sentences;
  const [texts, setTexts] = useState<string[]>(original.map((s) => s.text));
  const [checked, setChecked] = useState<Json[]>(original);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
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

  async function downloadPdf() {
    setPdfBusy(true);
    setPdfError(null);
    try {
      await download(`/api/claims/${id}/letter.pdf`, "counteroffer-letter.pdf");
    } catch (e) {
      setPdfError((e as Error).message || "Could not prepare the PDF. Try again.");
    } finally {
      setPdfBusy(false);
    }
  }

  const rejected = checked.filter((s) => !s.ok).length;
  return (
    <div className="space-y-8">
      <p className="max-w-prose text-base text-muted">
        Read the letter and change any sentence. The links under each sentence show the evidence behind it. Nothing is
        sent until you approve.
      </p>

      <ol className="max-w-[65ch] space-y-6 font-serif text-[1.1875rem] leading-[1.7] text-ink">
        {texts.map((t, i) => {
          const s = checked[i];
          const failed = s && !s.ok;
          const edited = t !== original[i].text;
          return (
            <li key={i} className={failed ? "border-l-[5px] border-alert pl-4" : ""}>
              <textarea
                aria-label={`Sentence ${i + 1}`}
                className="block w-full resize-none border-0 border-b border-line bg-transparent p-0 hover:bg-surface font-serif text-[1.1875rem] leading-[1.7] text-ink focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-brand"
                rows={Math.max(1, Math.ceil(t.length / 62))}
                value={t}
                disabled={approved}
                onChange={(e) => setTexts(texts.map((x, j) => (j === i ? e.target.value : x)))}
              />
              {edited && <p className="mt-1 font-sans text-sm leading-normal text-muted line-through">{original[i].text}</p>}
              {original[i].citations.length > 0 && (
                <div className="mt-1 flex flex-wrap items-center gap-x-3 font-sans text-sm leading-normal text-muted">
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
                        className="cursor-pointer text-brand underline underline-offset-2 hover:text-brand-dark focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              )}
              {original[i].citations.map((c: string) =>
                open === `${i}:${c}` ? (
                  <div key={c} className="mt-2 font-sans leading-normal">
                    <Notice tone="info">
                      <p>
                        <span className="font-semibold">{c}:</span> {evidence.get(c) ?? "No detail available."}
                      </p>
                    </Notice>
                  </div>
                ) : null,
              )}
              {failed && (
                <ul className="mt-2 font-sans text-base font-medium leading-normal text-alert">
                  {s.problems.map((p: string) => <li key={p}>{p}</li>)}
                </ul>
              )}
            </li>
          );
        })}
      </ol>

      <div className="max-w-[65ch] space-y-4 border-t border-line pt-6">
        {rejected > 0 && (
          <p className="text-base font-medium text-alert">
            {rejected} {rejected === 1 ? "sentence does" : "sentences do"} not pass the check. Each dollar amount must
            match the evidence. Fix {rejected === 1 ? "it" : "them"} and approve again.
          </p>
        )}
        {error && <p role="alert" className="text-base text-alert">{error}</p>}
        {approved ? (
          <div className="space-y-4">
            <Notice tone="good" title="Letter approved">
              <p>Every dollar amount matches the evidence. You can copy the letter or download it as a PDF.</p>
            </Notice>
            <div className="flex flex-wrap gap-4">
              <Button variant="secondary" onClick={() => navigator.clipboard.writeText(texts.join("\n\n"))}>Copy letter</Button>
              <Button variant="secondary" onClick={downloadPdf} disabled={pdfBusy}>{pdfBusy ? "Preparing PDF…" : "Download as PDF"}</Button>
            </div>
            {pdfError && <Notice tone="bad"><p>{pdfError}</p></Notice>}
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
    </div>
  );
}
