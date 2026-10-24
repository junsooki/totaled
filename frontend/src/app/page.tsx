"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Listing = {
  vin: string | null;
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  price: number | null;
  mileage: number | null;
  distance_mi: number | null;
  seller_name: string | null;
  url: string | null;
};

type Result = {
  offer: number;
  fair_value: { estimate: number; method: string; n_comps: number; label: string } | null;
  gap: number | null;
  cached: boolean;
  listings: Listing[];
};

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const FIELDS = [
  { name: "year", label: "Year", type: "number" },
  { name: "make", label: "Make", type: "text" },
  { name: "model", label: "Model", type: "text" },
  { name: "trim", label: "Trim", type: "text" },
  { name: "mileage", label: "Mileage", type: "number" },
  { name: "zip", label: "ZIP", type: "text" },
  { name: "radius", label: "Radius (mi)", type: "number" },
  { name: "offer", label: "Insurer offer ($)", type: "number" },
] as const;

export default function Home() {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.currentTarget));
    const body = {
      ...form,
      year: Number(form.year),
      mileage: Number(form.mileage),
      radius: Number(form.radius),
      offer: Number(form.offer),
    };
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API}/api/appraise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).detail ?? res.statusText);
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 font-sans">
      <h1 className="text-3xl font-semibold tracking-tight">Totaled</h1>
      <p className="mt-1 text-zinc-500">Insurers use software to value your totaled car. Now you have software to check theirs.</p>

      <form onSubmit={onSubmit} className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {FIELDS.map((f) => (
          <label key={f.name} className="flex flex-col gap-1 text-sm">
            {f.label}
            <input
              name={f.name}
              type={f.type}
              required={f.name !== "trim"}
              defaultValue={f.name === "radius" ? 100 : undefined}
              className="rounded border border-zinc-300 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
        ))}
        <button
          disabled={loading}
          className="col-span-2 rounded bg-black px-4 py-2 text-white disabled:opacity-50 sm:col-span-4 dark:bg-white dark:text-black"
        >
          {loading ? "Pulling live listings…" : "Check my offer"}
        </button>
      </form>

      {error && <p className="mt-6 text-red-600">{error}</p>}

      {result && (
        <section className="mt-10">
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Insurer offer" value={usd(result.offer)} />
            <Stat label={`Fair value (${result.fair_value?.label ?? "Estimate"})`} value={result.fair_value ? usd(result.fair_value.estimate) : "—"} />
            <Stat
              label="Gap"
              value={result.gap != null ? usd(result.gap) : "—"}
              tone={result.gap != null && result.gap > 0 ? "text-red-600" : undefined}
            />
          </div>
          {result.fair_value && (
            <p className="mt-2 text-xs text-zinc-500">
              {result.fair_value.method}, {result.fair_value.n_comps} comparables{result.cached && " · cached dataset"}
            </p>
          )}

          <table className="mt-6 w-full text-left text-sm">
            <thead className="border-b border-zinc-300 text-zinc-500 dark:border-zinc-700">
              <tr>
                <th className="py-2">Car</th>
                <th>Price</th>
                <th>Mileage</th>
                <th>Distance</th>
                <th>Seller</th>
              </tr>
            </thead>
            <tbody>
              {result.listings.map((l, i) => (
                <tr key={l.vin ?? i} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2">
                    {l.url ? (
                      <a href={l.url} target="_blank" rel="noreferrer" className="underline">
                        {l.year} {l.make} {l.model} {l.trim}
                      </a>
                    ) : (
                      `${l.year} ${l.make} ${l.model} ${l.trim ?? ""}`
                    )}
                  </td>
                  <td>{l.price != null ? usd(l.price) : "—"}</td>
                  <td>{l.mileage?.toLocaleString() ?? "—"}</td>
                  <td>{l.distance_mi != null ? `${l.distance_mi} mi` : "—"}</td>
                  <td>{l.seller_name ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${tone ?? ""}`}>{value}</div>
    </div>
  );
}
