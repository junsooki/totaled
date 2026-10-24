"use client";

import { useEffect, useRef } from "react";
import { API } from "@/lib/api";

export type Match = { page: number; x: number; y: number; w: number; h: number };

export default function ReportPane({
  id, pageCount, matches, notFound,
}: { id: string; pageCount: number; matches: Match[]; notFound: boolean }) {
  const pages = useRef<Record<number, HTMLDivElement | null>>({});
  const box = useRef<HTMLDivElement>(null);

  // Scroll only the pane, so the window stays put and the match is centered.
  useEffect(() => {
    const m = matches[0];
    const pageEl = m && pages.current[m.page];
    if (!m || !pageEl || !box.current) return;
    box.current.scrollTo({ top: pageEl.offsetTop + m.y * pageEl.offsetHeight - box.current.clientHeight / 2, behavior: "smooth" });
  }, [matches]);

  return (
    <div className="flex max-h-[70vh] flex-col border border-line bg-surface lg:max-h-[calc(100vh-2rem)]">
      <div className="border-b border-line px-4 py-2">
        <h2 className="font-serif text-lg font-semibold text-ink">Your report</h2>
        <p className="min-h-6 text-base text-muted" aria-live="polite">
          {notFound ? "Not found on the report" : "Click a field to see where it is on the report."}
        </p>
      </div>
      <div ref={box} className="relative flex-1 space-y-4 overflow-y-auto p-4">
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
          <div key={n} ref={(el) => { pages.current[n] = el; }} className="relative border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${API}/api/claims/${id}/page/${n}.png`} alt={`Report page ${n} of ${pageCount}`} className="block w-full" loading="lazy" />
            {matches.filter((m) => m.page === n).map((m, j) => (
              <div
                key={j}
                aria-hidden="true"
                className="pointer-events-none absolute border-2 border-ink bg-yellow-300/50"
                style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%`, width: `${m.w * 100}%`, height: `${m.h * 100}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
