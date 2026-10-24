"use client";

import { useState } from "react";
import { API, Json, put, setClaimToken } from "@/lib/api";
import { Badge, Button, Notice, inputCls } from "./ui";

const fileBtn =
  "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 px-5 py-2 text-lg font-semibold focus-within:outline-4 focus-within:outline-offset-2 focus-within:outline-brand";
const filePrimary = `${fileBtn} border-b-[3px] border-brand-dark bg-brand text-white hover:bg-brand-dark`;
const fileSecondary = `${fileBtn} border-2 border-ink bg-surface text-ink hover:bg-brand-soft`;
const linkCls =
  "cursor-pointer text-brand underline underline-offset-4 hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline";
const EXAMPLE_NOTE = "Another car ran a red light and hit my driver side. I was not hurt. Repairs were quoted at $9,800.";
const sectionH ="font-serif text-2xl font-semibold text-ink";

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
const DETAILS: [string, string][] = [
  ["insurer_name", "Insurer"], ["claim_number", "Claim number"], ["policy_number", "Policy number"],
  ["policyholder_name", "Your name as on the policy"],
];
const NUMERIC =new Set(["year", "mileage", "base_value", "condition_adjustment", "sales_tax", "title_fees",
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
      setClaimToken(body.id, body.access_token);
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
    if (!d.vin) {
      if (!d.plate) throw new Error("We could not read a VIN from that photo.");
      setVinNote(`Plate seen: ${d.plate}. A plate does not tell us the VIN: type it from your registration or door sticker.`);
      return;
    }
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
        d.odometer != null ? `odometer in photo: ${d.odometer.toLocaleString()} mi` : ""].filter(Boolean).join(" · ")
        + (d.plate ? `. Plate seen: ${d.plate}.` : ""),
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
    <label key={path.join(".")} className="block text-base font-medium text-ink">
      <span className="mb-1 block">{label}</span>
      {field(path, key)}
    </label>
  );

  // Stage 1: add the report.
  if (stage === "add" || !draft) {
    if (busy) {
      return (
        <div role="status" aria-live="polite">
          <Notice tone="info" title="Reading your report">
            <p>This can take a minute. We are pulling out your car, the offer and the comparable cars. You can check it all next.</p>
          </Notice>
        </div>
      );
    }
    return (
      <div className="space-y-8">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files.length) start(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed px-6 py-12 ${dragging ? "border-brand" : "border-ink"}`}
        >
          <h2 className={sectionH}>Add your valuation report</h2>
          <p className="mt-2 max-w-prose text-lg text-muted">
            Drop it here. One PDF works best. A photo of each page works too.
          </p>
          <div className="mt-6">
            <label className={filePrimary}>
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
          <label className={fileSecondary}>
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
      <p className="text-lg text-muted">
        We read your report using <Badge>{draft.by}</Badge>. Fix anything that looks wrong, then confirm.
      </p>

      <section className="border-t border-line pt-6">
        <h2 className={sectionH}>Your car</h2>
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3">
          {VEHICLE.map(([k, label]) => (
            <div key={k} className={k === "vin" ? "sm:col-span-2" : ""}>
              {labeled(label, ["vehicle", k], k)}
              {k === "vin" && (
                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-base">
                  <button type="button" className={linkCls}
                    disabled={vinBusy || (c.vehicle.vin ?? "").length !== 17} onClick={() => decodeVin(c.vehicle.vin)}>
                    {vinBusy ? "Checking…" : "Look up this VIN"}
                  </button>
                  <label className={`${linkCls} focus-within:outline-4 focus-within:outline-offset-2 focus-within:outline-brand`}>
                    Scan VIN or plate from a photo
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
          <div>{labeled("Your ZIP", ["owner_zip"], "owner_zip")}</div>
        </div>
        <div className="mt-3 space-y-3" aria-live="polite">
          <p className="text-base text-muted">{vinNote ?? "The VIN is on the door-jamb sticker, the dashboard plate or your registration card."}</p>
          {vinIssues.length > 0 && (
            <Notice tone="warn">
              {vinIssues.map((m, i) => <p key={i}>Please check: {m}</p>)}
            </Notice>
          )}
        </div>
      </section>

      <section className="border-t border-line pt-6">
        <h2 className={sectionH}>The insurer&apos;s offer</h2>
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          {OFFER.map(([k, label]) => labeled(label, ["offer", k], k))}
          {labeled("Condition deduction", ["condition", "deduction"], "deduction")}
          {labeled("Condition grade", ["condition", "subject_grade"], "subject_grade")}
        </div>
      </section>

      <section className="border-t border-line pt-6">
        <h2 className={sectionH}>Claim details</h2>
        <p className="mt-2 text-base text-muted">
          We read these from your report. They go into your letter. Leave any blank if you do not have it.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          {DETAILS.map(([k, label]) => (
            <label key={k} className="block text-base font-medium text-ink">
              <span className="mb-1 block">{label}</span>
              <input
                className={inputCls}
                value={c[k] ?? ""}
                onChange={(e) => setDraft({ ...draft, claim: { ...c, [k]: e.target.value === "" ? null : e.target.value } })}
              />
            </label>
          ))}
        </div>
        <label className="mt-5 block text-base font-medium text-ink">
          <span className="mb-1 block">What happened? (optional)</span>
          <textarea
            className={inputCls}
            rows={4}
            maxLength={600}
            value={c.loss_note ?? ""}
            aria-describedby="loss-note-hint"
            onChange={(e) => setDraft({ ...draft, claim: { ...c, loss_note: e.target.value === "" ? null : e.target.value } })}
          />
          <span className="mt-1 flex justify-between gap-4 text-base font-normal text-muted">
            <span id="loss-note-hint">
              One or two sentences. It goes near the top of your letter. Only write what you would be willing to send to your insurer.
            </span>
            <span className="shrink-0">{(c.loss_note ?? "").length}/600</span>
          </span>
        </label>
        <button
          type="button"
          className={`${linkCls} mt-1 text-base`}
          onClick={() => setDraft({ ...draft, claim: { ...c, loss_note: EXAMPLE_NOTE } })}
        >
          Use an example
        </button>
      </section>

      <section className="border-t border-line pt-6">
        <h2 className={sectionH}>Cars the insurer compared</h2>
        <ol className="mt-4 divide-y divide-line">
          {c.comparables.map((comp: Json, i: number) => (
            <li key={comp.id ?? i} className="py-6 first:pt-0 last:pb-0">
              <h3 className="font-serif text-xl font-semibold text-ink">{i + 1}. Comparable {comp.id}</h3>
              <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
                {COMP.map(([k, label]) => labeled(label, ["comparables", i, k], k))}
              </div>
              {comp.adjustments?.length > 0 && (
                <p className="mt-3 text-base text-muted">
                  Adjustments: {comp.adjustments.map((a: Json) => `${a.label} ${a.amount >= 0 ? "+" : ""}${a.amount}`).join(", ")}
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>

      {error && <p role="alert" className="text-base font-medium text-alert">{error}</p>}
      <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="secondary" onClick={() => setStage("add")} disabled={busy}>Back</Button>
        <Button onClick={confirm} disabled={busy}>{busy ? "Saving…" : "These look right"}</Button>
      </div>
    </div>
  );
}
