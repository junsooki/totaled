"use client";

// Live components wrapped in the shared SpacetimeDB provider; import these with next/dynamic (ssr: false).
import { Json } from "@/lib/api";
import { LiveProvider } from "@/lib/live";
import AgentFeed from "./AgentFeed";
import LiveAuction from "./LiveAuction";

export function LiveAgentFeed({ claimId }: { claimId: string }) {
  return <LiveProvider><AgentFeed claimId={claimId} /></LiveProvider>;
}

export function LiveAuctionPanel({ claimId, onAwarded }: { claimId: string; onAwarded: (win: Json) => void }) {
  return <LiveProvider><LiveAuction claimId={claimId} onAwarded={onAwarded} /></LiveProvider>;
}
