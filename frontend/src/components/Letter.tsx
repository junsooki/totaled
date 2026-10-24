"use client";

import { useState } from "react";
import { Json, post } from "@/lib/api";
import { Badge, Button, inputCls } from "./ui";

export default function Letter({ id, letter, onApproved }: { id: string; letter: Json; onApproved: () => void }) {
  const original: Json[] = letter.sentences;
  const [texts, setTexts] = useState<string[]>(original.map((s) => s.text));
  const [checked, setChecked] = useState<Json[]>(original);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
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
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">
        Drafted by <Badge>{letter.drafted_by}</Badge>. Every sentence cites a check or listing; code rejects any dollar
        amount that is not in the evidence. Edit freely, then approve. Nothing is sent until you approve.
      </p>
      {rejected > 0 && <p className="text-sm text-red-600">{rejected} sentence(s) fail the citation check.</p>}
      <ol className="space-y-3">
        {texts.map((t, i) => {
          const s = checked[i];
          const edited = t !== original[i].text;
          return (
            <li key={i} className={`rounded border p-2 ${s && !s.ok ? "border-red-400" : "border-zinc-200 dark:border-zinc-800"}`}>
              <textarea className={`${inputCls} min-h-[2.5rem]`} rows={Math.ceil(t.length / 110)} value={t} disabled={approved}
                onChange={(e) => setTexts(texts.map((x, j) => (j === i ? e.target.value : x)))} />
              {edited && <p className="mt-1 text-xs text-zinc-500 line-through">{original[i].text}</p>}
              <div className="mt-1 flex flex-wrap gap-1">
                {original[i].citations.map((c: string) => (
                  <span key={c} title={evidence.get(c) ?? ""}><Badge>{c}</Badge></span>
                ))}
                {s && !s.ok && s.problems.map((p: string) => <Badge key={p} tone="red">{p}</Badge>)}
              </div>
            </li>
          );
        })}
      </ol>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {approved ? (
        <div className="flex items-center gap-3">
          <Badge tone="green">Approved</Badge>
          <Button variant="secondary" onClick={() => navigator.clipboard.writeText(texts.join("\n\n"))}>Copy letter</Button>
        </div>
      ) : (
        <Button onClick={approve} disabled={busy}>{busy ? "Checking…" : "Approve letter"}</Button>
      )}
    </div>
  );
}
