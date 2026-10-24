"use client";

import dynamic from "next/dynamic";

// The SpacetimeDB client opens a socket and generates ids on creation, so it renders in the browser only.
const TrackClient = dynamic(() => import("./TrackClient"), { ssr: false });

export default function TrackPage() {
  return <TrackClient />;
}
