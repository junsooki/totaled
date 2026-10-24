export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const claimTokenKey = (id: string) => `totaled:claim-token:${id}`;

export function setClaimToken(id: string, token: string) {
  if (typeof window !== "undefined") window.localStorage.setItem(claimTokenKey(id), token);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Json = any;

/** Headers for a request, with the claim's access token when the path belongs to a claim. */
function withClaimToken(path: string, init?: RequestInit): Headers {
  const headers = new Headers(init?.headers);
  const claimId = /^\/api\/claims\/([^/]+)/.exec(path)?.[1];
  if (claimId && typeof window !== "undefined") {
    const token = window.localStorage.getItem(claimTokenKey(claimId));
    if (token) headers.set("X-Claim-Token", token);
  }
  return headers;
}

/** A file from a claim (report page, PDF, case package) as an object URL. Plain <img src> or links can't send the token. */
export async function fileUrl(path: string): Promise<string> {
  const res = await fetch(`${API}${path}`, { headers: withClaimToken(path) });
  if (!res.ok) throw new Error(res.status === 401 ? "This claim's access has expired. Start again." : res.statusText);
  return URL.createObjectURL(await res.blob());
}

/** Save a claim file to the user's device under `name`. */
export async function download(path: string, name: string) {
  const url = await fileUrl(path);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function call(path: string, init?: RequestInit): Promise<Json> {
  const res = await fetch(`${API}${path}`, { ...init, headers: withClaimToken(path, init) });
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
