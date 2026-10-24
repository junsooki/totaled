export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Json = any;

export async function call(path: string, init?: RequestInit): Promise<Json> {
  const res = await fetch(`${API}${path}`, init);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = body.detail;
    const err = new Error(typeof detail === "string" ? detail : detail?.message ?? res.statusText) as Error & {
      body?: Json;
    };
    err.body = detail;
    throw err;
  }
  return body;
}

export const post = (path: string, body?: Json) =>
  call(path, {
    method: "POST",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

export const put = (path: string, body: Json) =>
  call(path, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export const usd = (n: number | null | undefined, cents = false) =>
  n == null
    ? "—"
    : n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: cents ? 2 : 0 });
