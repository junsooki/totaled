"use client";

import { useState } from "react";
import { API, Json, put } from "@/lib/api";
import { Badge, Button, inputCls } from "./ui";

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
  ["offer_date", "Offer date"], ["base_value", "Base value"], ["condition_adjustment", "Condition adj."],
  ["sales_tax", "Sales tax"], ["title_fees", "Title/fees"], ["registration_prorated", "Prorated registration"],
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
  const [draft, setDraft] = useState<{ id: string; claim: Json; by: string } | null>(null);

  async function start(file?: File) {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      if (file) form.append("file", file);
      const res = await fetch(`${API}/api/claims`, { method: "POST", body: form });
      const body = await res.json();
      if (!res.ok) throw new Error(body.detail ?? res.statusText);
      setDraft({ id: body.id, claim: body.claim, by: body.extracted_by });
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

  if (!draft) {
    return (
      <div className="rounded border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
        <p className="text-sm text-zinc-500">Drop in the insurer&apos;s valuation report and offer letter (one PDF).</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <label className="cursor-pointer rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-900">
            {busy ? "Reading report…" : "Upload PDF"}
            <input type="file" accept="application/pdf" className="hidden" disabled={busy}
              onChange={(e) => e.target.files?.[0] && start(e.target.files[0])} />
          </label>
          <Button variant="secondary" disabled={busy} onClick={() => start()}>Use the sample report</Button>
        </div>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  const c = draft.claim;
  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-500">
        Read by <Badge>{draft.by}</Badge>. Check every field against your report and fix anything misread.
      </p>
      <div>
        <h3 className="mb-2 font-medium">Your car</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
          {VEHICLE.map(([k, label]) => (
            <label key={k} className="text-xs text-zinc-500">{label}{field(["vehicle", k], k)}</label>
          ))}
          <label className="text-xs text-zinc-500">Your ZIP{field(["owner_zip"], "owner_zip")}</label>
        </div>
      </div>
      <div>
        <h3 className="mb-2 font-medium">Offer</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {OFFER.map(([k, label]) => (
            <label key={k} className="text-xs text-zinc-500">{label}{field(["offer", k], k)}</label>
          ))}
          <label className="text-xs text-zinc-500">Condition deduction{field(["condition", "deduction"], "deduction")}</label>
          <label className="text-xs text-zinc-500">Condition grade{field(["condition", "subject_grade"], "subject_grade")}</label>
        </div>
      </div>
      <div className="overflow-x-auto">
        <h3 className="mb-2 font-medium">Insurer&apos;s comparables</h3>
        <table className="w-full min-w-[900px] text-left text-xs">
          <thead className="text-zinc-500">
            <tr><th className="pr-2">#</th>{COMP.map(([k, l]) => <th key={k} className="pr-2">{l}</th>)}<th>Adjustments</th></tr>
          </thead>
          <tbody>
            {c.comparables.map((comp: Json, i: number) => (
              <tr key={comp.id} className="align-top">
                <td className="py-1 pr-2 font-medium">{comp.id}</td>
                {COMP.map(([k]) => <td key={k} className="py-1 pr-2">{field(["comparables", i, k], k)}</td>)}
                <td className="py-1 text-zinc-500">
                  {comp.adjustments.map((a: Json) => `${a.label} ${a.amount >= 0 ? "+" : ""}${a.amount}`).join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button onClick={confirm} disabled={busy}>{busy ? "Saving…" : "These fields are correct"}</Button>
    </div>
  );
}
