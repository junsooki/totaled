"use client";

// One SpacetimeDB connection per browser, shared by every live component. The SDK pools connections by
// uri + database, so nesting several providers reuses the same socket. Render only in the browser.
import { useMemo, type ReactNode } from "react";
import { SpacetimeDBProvider } from "spacetimedb/react";
import { DbConnection, tables } from "@/module_bindings";

export const LIVE_HOST = process.env.NEXT_PUBLIC_SPACETIME_HOST ?? "wss://maincloud.spacetimedb.com";
export const LIVE_DB = process.env.NEXT_PUBLIC_SPACETIME_DB;
const TOKEN_KEY = `totaled-live-token:${LIVE_DB}`;

function storedToken(): string | undefined {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

export function LiveProvider({ children }: { children: ReactNode }) {
  const builder = useMemo(
    () =>
      LIVE_DB
        ? DbConnection.builder()
            .withUri(LIVE_HOST)
            .withDatabaseName(LIVE_DB)
            .withToken(storedToken()) // keeps a dealer's identity (and their bids) across reloads
            .onConnect((conn, _identity, token) => {
              try {
                localStorage.setItem(TOKEN_KEY, token);
              } catch {}
              conn.subscriptionBuilder().subscribe([
                tables.claim, tables.claimEvent, tables.agentStep, tables.auction, tables.dealer, tables.bid,
              ]);
            })
        : null,
    [],
  );
  if (!builder) return <p className="text-sm text-alert">Live features are off: NEXT_PUBLIC_SPACETIME_DB is not set.</p>;
  return <SpacetimeDBProvider connectionBuilder={builder}>{children}</SpacetimeDBProvider>;
}

export const micros = (t: { microsSinceUnixEpoch: bigint }) => Number(t.microsSinceUnixEpoch) / 1000; // ms
