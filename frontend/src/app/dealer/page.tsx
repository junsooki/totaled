"use client";

import dynamic from "next/dynamic";

// The SpacetimeDB client opens a socket and generates ids on creation, so it renders in the browser only.
const DealerClient = dynamic(() => import("./DealerClient"), { ssr: false });

export default function DealerPage() {
  return <DealerClient />;
}
