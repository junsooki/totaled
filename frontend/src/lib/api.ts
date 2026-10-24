export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const claimTokenKey = (id: string) => `totaled:claim-token:${id}`;

export function setClaimToken(id: string, token: string) {
  if (typeof window !== "undefined") window.localStorage.setItem(claimTokenKey(id), token);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Json = any;

export async function call(path: string, init?: RequestInit): Promise<Json> {
  const headers = new Headers(init?.headers);
  const claimId = /^\/api\/claims\/([^/]+)/.exec(path)?.[1];
  if (claimId && typeof window !== "undefined") {
    const token = window.localStorage.getItem(claimTokenKey(claimId));
    if (token) headers.set("X-Claim-Token", token);
  }
  const res = await fetch(`${API}${path}`, { ...init, headers });
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
