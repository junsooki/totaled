"use client";

import { useState } from "react";
import { API, Json, put } from "@/lib/api";
import { Badge, Button, inputCls } from "./ui";

const fileBtn =
  "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-semibold transition-colors focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2 focus-within:ring-offset-cream";

type Path = (string | number)[];

function setIn(obj: Json, path: Path, value: Json): Json {
  const copy = Array.isArray(obj) ? [...obj] : { ...obj };
  const [head, ...rest] = path;
  copy[head as never] = rest.length ? setIn(obj[head as never], rest, value) : value;
  return copy;
}

const VEHICLE: [string, string][] = [
  ["year", "Year"], ["make", "Make"], ["model", "Model"], ["trim", "Trim"], ["vin", "VIN"], ["mileage", "Mileage"],
];
const OFFER: [string, string][] = [
  ["offer_date", "Offer date"], ["base_value", "Base value"], ["condition_adjustment", "Condition adjustment"],
  ["sales_tax", "Sales tax"], ["title_fees", "Title and fees"], ["registration_prorated", "Prorated registration"],
  ["deductible", "Deductible"], ["total", "Total offer"],
];
const COMP: [string, string][] = [
  ["year", "Year"], ["trim", "Trim"], ["vin", "VIN"], ["seller_contact", "Contact"], ["distance_mi", "Miles away"],
  ["listing_date", "Listed"], ["odometer", "Odometer"], ["list_price", "Price"], ["adjusted_value", "Adjusted"],
];
const NUMERIC = new Set(["year", "mileage", "base_value", "condition_adjustment", "sales_tax", "title_fees",
  "registration_prorated", "deductible", "total", "distance_mi", "odometer", "list_price", "adjusted_value"]);

export default function Upload({ onConfirmed }: { onConfirmed: (id: string, claim: Json) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"add" | "check">("add");
  const [dragging, setDragging] = useState(false);
  const [draft, setDraft] = useState<{ id: string; claim: Json; by: string } | null>(null);

  async function start(files?: FileList | null) {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      for (const f of Array.from(files ?? [])) form.append("files", f);
      const res = await fetch(`${API}/api/claims`, { method: "POST", body: form });
      const body = await res.json();
      if (!res.ok) throw new Error(body.detail ?? res.statusText);
      setDraft({ id: body.id, claim: body.claim, by: body.extracted_by });
      setStage("check");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (!draft) return;
    setBusy(true);
    setError(null);
    try {
      await put(`/api/claims/${draft.id}/claim`, draft.claim);
      onConfirmed(draft.id, draft.claim);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  // VIN: decode with NHTSA (free) or scan a photo; fill empty fields, flag disagreements with the report.
  const [vinNote, setVinNote] = useState<string | null>(null);
  const [vinIssues, setVinIssues] = useState<string[]>([]);
  const [vinBusy, setVinBusy] = useState(false);

  function applyVin(d: Json) {
    if (!draft) return;
    let claim = setIn(draft.claim, ["vehicle", "vin"], d.vin);
    const v = draft.claim.vehicle;
    const filled: string[] = [];
    const differs: string[] = [];
    for (const k of ["year", "make", "model", "trim"] as const) {
      if (d[k] == null) continue;
      if (v[k] == null || v[k] === "") {
        claim = setIn(claim, ["vehicle", k], d[k]);
        filled.push(k);
      } else if (String(v[k]).toLowerCase() !== String(d[k]).toLowerCase()) {
        differs.push(`${k}: VIN says ${d[k]}, report says ${v[k]}`);
      }
    }
    if (d.odometer != null && v.mileage == null) {
      claim = setIn(claim, ["vehicle", "mileage"], d.odometer);
      filled.push("mileage");
    }
    setDraft({ ...draft, claim });
    setVinIssues([...differs, ...(d.warning ? [String(d.warning)] : [])]);
    setVinNote(
      [`VIN ${d.vin}: ${[d.year, d.make, d.model, d.trim].filter(Boolean).join(" ")}`,
        filled.length ? `filled ${filled.join(", ")}` : "",
        d.odometer != null ? `odometer in photo: ${d.odometer.toLocaleString()} mi` : ""].filter(Boolean).join(" · "),
    );
  }

  async function vinRequest(req: Promise<Response>) {
    setVinBusy(true);
    setVinNote(null);
    setVinIssues([]);
    try {
      const res = await req;
      const body = await res.json();
      if (!res.ok) throw new Error(body.detail ?? res.statusText);
      applyVin(body);
    } catch (e) {
      setVinIssues([e instanceof Error ? e.message : String(e)]);
    } finally {
      setVinBusy(false);
    }
  }

  const decodeVin = (vin: string) => vinRequest(fetch(`${API}/api/vin/${encodeURIComponent(vin)}`));
  const scanVin = (photo: File) => {
    const form = new FormData();
    form.append("photo", photo);
    return vinRequest(fetch(`${API}/api/vin/scan`, { method: "POST", body: form }));
  };

  const field = (path: Path, key: string) => {
    const value = path.reduce((o: Json, k) => o?.[k], draft!.claim);
    return (
      <input
        className={inputCls}
        value={value ?? ""}
        placeholder="not in report"
        onChange={(e) => {
          const raw = e.target.value;
          const v = raw === "" ? null : NUMERIC.has(key) ? Number(raw) : raw;
          setDraft({ ...draft!, claim: setIn(draft!.claim, path, v) });
        }}
      />
    );
  };
  const labeled = (label: string, path: Path, key: string) => (
    <label key={path.join(".")} className="block text-sm font-medium text-ink">
      <span className="mb-1 block">{label}</span>
      {field(path, key)}
    </label>
  );

  // Stage 1: add the report.
  if (stage === "add" || !draft) {
    if (busy) {
      return (
        <div role="status" aria-live="polite" className="rounded-3xl bg-brand-soft px-6 py-14 text-center">
          <div className="mx-auto size-10 animate-spin rounded-full border-4 border-brand/20 border-t-brand" aria-hidden="true" />
          <p className="mt-6 font-serif text-2xl font-semibold text-ink">Reading your report…</p>
          <p className="mx-auto mt-2 max-w-md text-base text-muted">
            This can take a minute. We are pulling out your car, the offer and the comparable cars. You can check it all next.
          </p>
          <div className="mx-auto mt-6 h-1.5 max-w-xs overflow-hidden rounded-full bg-brand/15" aria-hidden="true">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-brand" />
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files.length) start(e.dataTransfer.files);
          }}
          className={`rounded-3xl border-2 border-dashed px-6 py-14 text-center transition-colors ${dragging ? "border-brand bg-brand-soft" : "border-brand/40 bg-cream"}`}
        >
          <svg viewBox="0 0 24 24" className="mx-auto size-12 text-brand" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="mt-4 font-serif text-2xl font-semibold text-ink">Drop your valuation report here</p>
          <p className="mx-auto mt-2 max-w-md text-base text-muted">
            One PDF works best. A photo of each page works too.
          </p>
          <div className="mt-6">
            <label className={`${fileBtn} bg-brand text-white shadow-sm hover:bg-brand-dark`}>
              Choose a PDF or photos
              <input type="file" accept="application/pdf,image/*" multiple className="sr-only"
                onChange={(e) => {
                  if (e.target.files?.length) start(e.target.files);
                  e.target.value = "";
                }} />
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className={`${fileBtn} bg-surface text-brand ring-1 ring-inset ring-brand/40 hover:bg-brand-soft`}>
            Take photos with your camera
            <input type="file" accept="image/*" capture="environment" multiple className="sr-only"
              onChange={(e) => {
                if (e.target.files?.length) start(e.target.files);
                e.target.value = "";
              }} />
          </label>
          <Button variant="secondary" onClick={() => start()}>Try the sample report</Button>
        </div>
        {error && <p role="alert" className="text-base font-medium text-alert">{error}</p>}
        {draft && (
          <div>
            <Button onClick={() => setStage("check")}>Keep what we already read</Button>
          </div>
        )}
      </div>
    );
  }

  // Stage 2: check what we read.
  const c = draft.claim;
  return (
    <div className="space-y-10">
      <p className="text-base text-muted">
        We read your report using <Badge>{draft.by}</Badge>. Fix anything that looks wrong, then confirm.
      </p>

      <section>
        <h2 className="font-serif text-2xl font-semibold text-ink">Your car</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {VEHICLE.map(([k, label]) => (
            <div key={k} className={k === "vin" ? "col-span-2" : ""}>
              {labeled(label, ["vehicle", k], k)}
              {k === "vin" && (
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <button type="button" className="cursor-pointer font-semibold text-brand underline underline-offset-2 hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
                    disabled={vinBusy || (c.vehicle.vin ?? "").length !== 17} onClick={() => decodeVin(c.vehicle.vin)}>
                    {vinBusy ? "Checking…" : "Look up this VIN"}
                  </button>
                  <label className="cursor-pointer font-semibold text-brand underline underline-offset-2 hover:text-brand-dark focus-within:ring-2 focus-within:ring-brand">
                    Scan it from a photo
                    <input type="file" accept="image/*" capture="environment" className="sr-only" disabled={vinBusy}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        if (f) scanVin(f);
                      }} />
                  </label>
                </div>
              )}
            </div>
          ))}
          <div className="col-span-2 sm:col-span-1">{labeled("Your ZIP", ["owner_zip"], "owner_zip")}</div>
        </div>
        <div className="mt-2 space-y-1 text-sm" aria-live="polite">
          <p className="text-muted">{vinNote ?? "The VIN is on the door-jamb sticker, the dashboard plate or your registration card."}</p>
          {vinIssues.map((m, i) => <p key={i} className="font-medium text-alert">Please check: {m}</p>)}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl font-semibold text-ink">The insurer&apos;s offer</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {OFFER.map(([k, label]) => labeled(label, ["offer", k], k))}
          {labeled("Condition deduction", ["condition", "deduction"], "deduction")}
          {labeled("Condition grade", ["condition", "subject_grade"], "subject_grade")}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl font-semibold text-ink">Cars the insurer compared</h2>
        <div className="mt-4 divide-y divide-line">
          {c.comparables.map((comp: Json, i: number) => (
            <div key={comp.id ?? i} className="py-6 first:pt-0 last:pb-0">
              <h3 className="text-lg font-semibold text-ink">Comparable {comp.id}</h3>
              <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {COMP.map(([k, label]) => labeled(label, ["comparables", i, k], k))}
              </div>
              {comp.adjustments?.length > 0 && (
                <p className="mt-3 text-sm text-muted">
                  Adjustments: {comp.adjustments.map((a: Json) => `${a.label} ${a.amount >= 0 ? "+" : ""}${a.amount}`).join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {error && <p role="alert" className="text-base font-medium text-alert">{error}</p>}
      <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="secondary" onClick={() => setStage("add")} disabled={busy}>Back</Button>
        <Button onClick={confirm} disabled={busy}>{busy ? "Saving…" : "These look right"}</Button>
      </div>
    </div>
  );
}
