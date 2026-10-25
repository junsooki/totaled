"use client";

import { useEffect, useState } from "react";
import { call, fileUrl, Json } from "@/lib/api";
import { Badge, Notice } from "./ui";

const TONE: Record<string, "green" | "red" | "amber" | "zinc"> = {
  match: "green", found: "green", mismatch: "red", not_found: "amber", needs_document: "zinc",
};
const LABEL: Record<string, string> = {
  match: "Matches", found: "Found", mismatch: "Doesn't match", not_found: "Not found", needs_document: "Needs a document",
};

function PageLine({ path, alt }: { path: string; alt: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let made: string | null = null;
    fileUrl(path).then((u) => { made = u; setUrl(u); }).catch(() => setFailed(true));
    return () => { if (made) URL.revokeObjectURL(made); };
  }, [path]);
  if (failed) return <p className="text-base text-alert">We could not load that page.</p>;
  // eslint-disable-next-line @next/next/no-img-element
  return url ? <img src={url} alt={alt} className="mt-2 w-full border border-line" /> : <p className="text-base text-muted">Loading the page…</p>;
}

/** The owner's policy and the insurer's letters, read field by field and checked against the valuation report. */
export default function Documents({ id }: { id: string }) {
  const [data, setData] = useState<Json | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shown, setShown] = useState<string | null>(null);

  const load = () => call(`/api/claims/${id}/documents`).then(setData).catch((e) => setError(e.message));
  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function add(kind: string, file?: File) {
    setBusy(kind);
    setError(null);
    try {
      const form = new FormData();
      form.append("kind", kind);
      if (file) form.append("file", file);
      await call(`/api/claims/${id}/documents`, { method: "POST", body: form });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy("");
    }
  }

  const has = new Set((data?.documents ?? []).map((d: Json) => d.kind));
  const uploader = (kind: string, label: string, sampleLabel: string) => (
    <div className="flex flex-wrap items-center gap-3">
      <label className="inline-flex min-h-11 cursor-pointer items-center border-2 border-ink bg-surface px-5 py-2 text-lg font-semibold text-ink hover:bg-brand-soft focus-within:outline-4 focus-within:outline-brand">
        {busy === kind ? "Reading…" : `Upload ${label} (PDF)`}
        <input type="file" accept="application/pdf" className="sr-only" disabled={!!busy}
          onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) add(kind, f); }} />
      </label>
      <button type="button" disabled={!!busy} onClick={() => add(kind)}
        className="cursor-pointer text-base font-semibold text-brand underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
        Try the sample {sampleLabel}
      </button>
    </div>
  );

  return (
    <section className="border-t-4 border-rule pt-4">
      <h2 className="font-serif text-2xl font-semibold text-ink">Your policy and the insurer&apos;s letters</h2>
      <p className="mt-1 max-w-prose text-base text-muted">
        We read each one, show the exact line behind every fact, and compare it with the valuation report. Optional.
      </p>
      <div className="mt-4 space-y-3">
        {!has.has("policy") && uploader("policy", "your policy", "policy")}
        {!has.has("letter") && uploader("letter", "the insurer's letter", "letter")}
      </div>
      {error && <div className="mt-3"><Notice tone="bad"><p>{error}</p></Notice></div>}

      {data?.documents?.length > 0 && (
        <p className="mt-4 text-sm text-muted">
          Read: {data.documents.map((d: Json) => `${d.name} (${d.fields.length} facts${d.dropped ? `, ${d.dropped} left out because the line wasn't on the page` : ""})`).join(" · ")}
        </p>
      )}
      <ul className="mt-4 divide-y divide-line">
        {(data?.checks ?? []).map((c: Json) => (
          <li key={c.name} className="py-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-lg font-semibold text-ink">{c.name}</span>
              <Badge tone={TONE[c.status] ?? "zinc"}>{LABEL[c.status] ?? c.status}</Badge>
            </div>
            <p className="mt-1 max-w-prose text-base text-ink">{c.detail}</p>
            {c.sources.length > 0 && (
              <div>
                {c.sources.map((f: Json, i: number) => (
                  <p key={i} className="mt-1 text-sm text-muted">{f.name}, page {f.page}: “{f.quote}”</p>
                ))}
                <button type="button" onClick={() => setShown(shown === c.name ? null : c.name)}
                  className="cursor-pointer text-base font-semibold text-brand underline underline-offset-2">
                  {shown === c.name ? "Hide the " : "Show the "}{c.sources.length > 1 ? "lines" : "line"}
                </button>
                {shown === c.name && c.sources.map((f: Json, i: number) => (
                  <PageLine key={i}
                    alt={f.doc === "report" ? `Insurer's valuation report page ${f.page}, with the line highlighted` : "Document page with the line highlighted"}
                    path={f.doc === "report"
                      ? `/api/claims/${id}/page/${f.page}.png?quote=${encodeURIComponent(f.quote)}`
                      : `/api/claims/${id}/documents/${f.doc}/page/${f.page}.png?quote=${encodeURIComponent(f.quote)}`} />
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
