"use client";

// Where the value comes from: a bridge from the insurer's offer to the counteroffer, and the
// live market behind it. Hand-rolled SVG; colors are role tokens defined in globals.css (.viz-root).
import { useState } from "react";
import { Json, usd } from "@/lib/api";

type Tip = { x: number; y: number; lines: string[] } | null;

function Tooltip({ tip }: { tip: Tip }) {
  if (!tip) return null;
  return (
    <div
      className="pointer-events-none absolute z-10 rounded border px-2 py-1 text-xs shadow-sm"
      style={{ left: tip.x + 12, top: tip.y + 12, background: "var(--viz-surface)", borderColor: "var(--viz-grid)", color: "var(--viz-text)" }}
    >
      {tip.lines.map((l, i) => <div key={i} className={i === 0 ? "font-medium" : ""} style={i ? { color: "var(--viz-text-2)" } : undefined}>{l}</div>)}
    </div>
  );
}

const niceStep = (span: number) => {
  const raw = span / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
};
const ticks = (lo: number, hi: number) => {
  const s = niceStep(hi - lo);
  const out = [];
  for (let v = Math.ceil(lo / s) * s; v <= hi; v += s) out.push(v);
  return out;
};
const kusd = (v: number) => `$${(v / 1000).toFixed(v % 1000 ? 1 : 0)}k`;

/* ---- Bridge: insurer's offer -> counteroffer -------------------------------------------- */

export function Bridge({ steps }: { steps: Json[] }) {
  const [tip, setTip] = useState<Tip>(null);
  if (!steps.length) return null;
  // Running position of each step; totals are levels, steps float from the previous level.
  const rows = steps.reduce<Json[]>((acc, s) => {
    const level = acc.length ? acc[acc.length - 1].to : 0;
    return [...acc, s.kind === "total" ? { ...s, from: s.amount, to: s.amount } : { ...s, from: level, to: level + s.amount }];
  }, []);
  const vals = rows.flatMap((r) => [r.from, r.to]);
  const pad = (Math.max(...vals) - Math.min(...vals)) * 0.12 || 500;
  const lo = Math.min(...vals) - pad, hi = Math.max(...vals) + pad;
  const W = 640, L = 210, R = 24, rowH = 34, T = 8, H = T + rows.length * rowH + 26;
  const x = (v: number) => L + ((v - lo) / (hi - lo)) * (W - L - R);

  return (
    <figure className="viz-root relative">
      <figcaption className="mb-1 text-sm font-medium">Where the extra {usd(steps[steps.length - 1].amount - steps[0].amount)} comes from</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
        aria-label={rows.map((r) => `${r.label} ${usd(r.amount)}`).join(", ")} onMouseLeave={() => setTip(null)}>
        {ticks(lo, hi).map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={T} y2={H - 22} stroke="var(--viz-grid)" />
            <text x={x(t)} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--viz-text-3)">{kusd(t)}</text>
          </g>
        ))}
        {rows.map((r, i) => {
          const y = T + i * rowH;
          const cy = y + rowH / 2;
          const isTotal = r.kind === "total";
          const x0 = x(Math.min(r.from, r.to)), x1 = x(Math.max(r.from, r.to));
          const color = r.amount >= 0 ? "var(--viz-up)" : "var(--viz-down)";
          const show = (e: React.MouseEvent) => {
            const box = (e.currentTarget.closest("figure") as HTMLElement).getBoundingClientRect();
            setTip({ x: e.clientX - box.left, y: e.clientY - box.top, lines: isTotal
              ? [r.label, usd(r.amount, true)]
              : [r.label, `${r.amount >= 0 ? "+" : "−"}${usd(Math.abs(r.amount), true)}`, `${usd(r.from)} → ${usd(r.to)}`] });
          };
          return (
            <g key={r.label} onMouseMove={show}>
              <rect x={0} y={y} width={W} height={rowH} fill="transparent" />
              <text x={L - 10} y={cy + 4} textAnchor="end" fontSize="12" fill={isTotal ? "var(--viz-text)" : "var(--viz-text-2)"}
                fontWeight={isTotal ? 600 : 400}>{r.label}</text>
              {isTotal ? (
                <>
                  <line x1={x(r.to)} x2={x(r.to)} y1={y + 6} y2={y + rowH - 6} stroke="var(--viz-total)" strokeWidth="3" strokeLinecap="round" />
                  <text x={x(r.to) + 8} y={cy + 4} fontSize="12" fontWeight={600} fill="var(--viz-text)">{usd(r.amount)}</text>
                </>
              ) : (
                <>
                  <rect x={x0} y={y + 8} width={Math.max(x1 - x0, 2)} height={rowH - 16} rx="4" fill={color} />
                  <text x={x1 + 6} y={cy + 4} fontSize="12" fill="var(--viz-text-2)">
                    {r.amount >= 0 ? "+" : "−"}{usd(Math.abs(r.amount))}
                  </text>
                </>
              )}
              {i < rows.length - 1 && (
                <line x1={x(r.to)} x2={x(r.to)} y1={y + rowH - 6} y2={y + rowH + 8} stroke="var(--viz-text-3)" strokeDasharray="2 2" />
              )}
            </g>
          );
        })}
      </svg>
      <Tooltip tip={tip} />
      <p className="text-xs" style={{ color: "var(--viz-text-3)" }}>
        Totals are marked as levels; each bar is one correction, computed by code from the report and live listings.
      </p>
    </figure>
  );
}

/* ---- Market: price vs mileage ------------------------------------------------------------ */

export function Market({ listings, fair, mileage, insurer }: { listings: Json[]; fair: Json; mileage: number; insurer: Json[] }) {
  const [tip, setTip] = useState<Tip>(null);
  const pts = listings.filter((l) => l.price && l.mileage != null);
  const comps = insurer.filter((c) => c.odometer != null && c.adjusted_value != null);
  if (!pts.length || !fair) return null;
  const xs = [...pts.map((p) => p.mileage), ...comps.map((c) => c.odometer), mileage];
  const ys = [...pts.map((p) => p.price), ...comps.map((c) => c.adjusted_value), fair.estimate];
  const xlo = 0, xhi = Math.max(...xs) * 1.05;
  const ypad = (Math.max(...ys) - Math.min(...ys)) * 0.1;
  const ylo = Math.max(0, Math.min(...ys) - ypad), yhi = Math.max(...ys) + ypad;
  const W = 640, H = 320, L = 56, R = 16, T = 12, B = 34;
  const x = (v: number) => L + ((v - xlo) / (xhi - xlo)) * (W - L - R);
  const y = (v: number) => T + (1 - (v - ylo) / (yhi - ylo)) * (H - T - B);
  const slope = fair.per_mile;
  // Draw the fit only across the mileage range the listings cover.
  const span = [Math.min(...pts.map((p) => p.mileage)), Math.max(...pts.map((p) => p.mileage))];
  const line = slope != null ? span.map((m) => [m, fair.estimate + slope * (m - mileage)]) : null;

  const hover = (lines: string[]) => (e: React.MouseEvent) => {
    const box = (e.currentTarget.closest("figure") as HTMLElement).getBoundingClientRect();
    setTip({ x: e.clientX - box.left, y: e.clientY - box.top, lines });
  };

  return (
    <figure className="viz-root relative">
      <figcaption className="mb-1 text-sm font-medium">Live market: price against mileage</figcaption>
      <div className="mb-1 flex flex-wrap gap-4 text-xs" style={{ color: "var(--viz-text-2)" }}>
        <span><svg width="10" height="10" className="mr-1 inline"><circle cx="5" cy="5" r="4" fill="var(--viz-series-1)" /></svg>Listings now ({pts.length})</span>
        <span><svg width="10" height="10" className="mr-1 inline"><rect x="1" y="1" width="8" height="8" fill="var(--viz-series-2)" /></svg>Insurer&apos;s comparables (adjusted)</span>
        <span><svg width="14" height="10" className="mr-1 inline"><line x1="0" y1="5" x2="14" y2="5" stroke="var(--viz-text-2)" strokeWidth="2" /></svg>Market line</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" onMouseLeave={() => setTip(null)}
        aria-label={`${pts.length} listings; market estimate ${usd(fair.estimate)} at ${mileage.toLocaleString()} miles`}>
        {ticks(ylo, yhi).map((t) => (
          <g key={`y${t}`}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="var(--viz-grid)" />
            <text x={L - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--viz-text-3)">{kusd(t)}</text>
          </g>
        ))}
        {ticks(xlo, xhi).map((t) => (
          <text key={`x${t}`} x={x(t)} y={H - 14} textAnchor="middle" fontSize="11" fill="var(--viz-text-3)">{(t / 1000).toFixed(0)}k mi</text>
        ))}
        {line && <line x1={x(line[0][0])} y1={y(line[0][1])} x2={x(line[1][0])} y2={y(line[1][1])} stroke="var(--viz-text-2)" strokeWidth="2" />}
        <line x1={x(mileage)} x2={x(mileage)} y1={T} y2={H - B} stroke="var(--viz-text-3)" strokeDasharray="3 3" />
        {pts.map((p, i) => (
          <circle key={p.vin ?? i} cx={x(p.mileage)} cy={y(p.price)} r="5" fill="var(--viz-series-1)" stroke="var(--viz-surface)" strokeWidth="2"
            className={p.url ? "cursor-pointer" : ""} onClick={() => p.url && window.open(p.url, "_blank", "noreferrer")}
            onMouseMove={hover([`${p.year} ${p.make} ${p.model} ${p.trim ?? ""}`, `${usd(p.price)} · ${p.mileage.toLocaleString()} mi`,
              `${p.seller_name ?? "Seller"}${p.distance_mi != null ? ` · ${p.distance_mi} mi away` : ""}`, ...(p.url ? ["Click to open listing"] : [])])} />
        ))}
        {comps.map((c) => (
          <g key={c.id} onMouseMove={hover([`Insurer's ${c.id}: ${c.year} ${c.trim ?? ""}`, `Adjusted ${usd(c.adjusted_value)} · ${c.odometer.toLocaleString()} mi`,
            `Market line here: ${line ? usd(fair.estimate + slope * (c.odometer - mileage)) : "—"}`])}>
            <rect x={x(c.odometer) - 6} y={y(c.adjusted_value) - 6} width="12" height="12" fill="var(--viz-series-2)" stroke="var(--viz-surface)" strokeWidth="2" />
            <text x={x(c.odometer) + 9} y={y(c.adjusted_value) + 4} fontSize="11" fill="var(--viz-text-2)">{c.id}</text>
          </g>
        ))}
        <g onMouseMove={hover(["Your car (Estimate)", `${usd(fair.estimate)} at ${mileage.toLocaleString()} mi`, fair.method])}>
          <circle cx={x(mileage)} cy={y(fair.estimate)} r="8" fill="var(--viz-surface)" stroke="var(--viz-text)" strokeWidth="3" />
          <text x={x(mileage) + 12} y={y(fair.estimate) - 10} fontSize="12" fontWeight={600} fill="var(--viz-text)">Your car {usd(fair.estimate)}</text>
        </g>
      </svg>
      <Tooltip tip={tip} />
    </figure>
  );
}
