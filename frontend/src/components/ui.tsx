import type { ReactNode } from "react";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-cream";

export function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}) {
  const styles =
    variant === "primary"
      ? "bg-brand text-white hover:bg-brand-dark shadow-sm"
      : "bg-surface text-brand ring-1 ring-inset ring-brand/40 hover:bg-brand-soft";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${focusRing} ${styles}`}
    >
      {children}
    </button>
  );
}

export function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: string }) {
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-sm">
      <div className="text-sm text-muted">{label}</div>
      <div className={`mt-1 font-serif text-3xl font-semibold tracking-tight ${tone ?? "text-ink"}`}>{value}</div>
    </div>
  );
}

export function Badge({ children, tone = "zinc" }: { children: ReactNode; tone?: "zinc" | "red" | "green" | "amber" }) {
  const t = {
    zinc: "bg-line/60 text-ink",
    red: "bg-alert-soft text-alert",
    green: "bg-brand-soft text-brand",
    amber: "bg-amber-soft text-amber",
  }[tone];
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-sm font-medium ${t}`}>{children}</span>;
}

export const inputCls =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-base text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";

export type StepperStep = { label: string; done?: boolean; locked?: boolean };

/** Progress bar. `current` is a 0-based index. Done and unlocked steps are clickable; locked ones are not. */
export function Stepper({
  steps,
  current,
  onSelect,
}: {
  steps: StepperStep[];
  current: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav aria-label="Progress">
      {/* Narrow screens: compact bar */}
      <div className="sm:hidden">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold text-ink">
            Step {current + 1} of {steps.length}
          </span>
          <span className="text-sm text-muted">{steps[current]?.label}</span>
        </div>
        <div className="mt-2 flex gap-1.5" aria-hidden="true">
          {steps.map((s, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= current || s.done ? "bg-brand" : "bg-line"}`} />
          ))}
        </div>
      </div>
      {/* Wider screens: numbered steps */}
      <ol className="hidden items-start sm:flex">
        {steps.map((s, i) => {
          const isCurrent = i === current;
          const disabled = !!s.locked && !isCurrent;
          const circle = isCurrent
            ? "bg-brand text-white ring-4 ring-brand-soft"
            : s.done
              ? "bg-brand-soft text-brand"
              : disabled
                ? "bg-line/60 text-muted"
                : "bg-surface text-brand ring-1 ring-inset ring-brand/40";
          return (
            <li key={i} className="flex flex-1 items-start last:flex-none">
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(i)}
                aria-current={isCurrent ? "step" : undefined}
                className={`group flex w-24 shrink-0 cursor-pointer flex-col items-center gap-2 rounded-lg py-1 text-center disabled:cursor-not-allowed ${focusRing}`}
              >
                <span className={`flex size-9 items-center justify-center rounded-full text-sm font-semibold ${circle}`}>
                  {s.done && !isCurrent ? (
                    <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={`text-sm leading-tight ${isCurrent ? "font-semibold text-ink" : disabled ? "text-muted" : "font-medium text-ink"}`}
                >
                  {s.label}
                </span>
              </button>
              {i < steps.length - 1 && (
                <span aria-hidden="true" className={`mt-[18px] h-0.5 flex-1 ${s.done ? "bg-brand" : "bg-line"}`} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** White-ish card for one wizard screen. `footer` holds Back / Continue. */
export function StepCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-surface p-6 shadow-sm ring-1 ring-line sm:p-10">
      <h1 tabIndex={-1} className="font-serif text-3xl font-semibold tracking-tight text-ink outline-none sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-prose text-lg text-muted">{subtitle}</p>}
      {children && <div className="mt-8">{children}</div>}
      {footer && (
        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          {footer}
        </div>
      )}
    </section>
  );
}

export type SummaryRow = { label: string; value: ReactNode; tone?: "good" | "bad" | "warn"; big?: boolean };

/**
 * Order-summary style panel. Put it first in the DOM; at lg and up it is sticky
 * (give the parent grid `lg:order-2` on its wrapper). Below lg it is a compact two-column block.
 */
export function SummaryPanel({ title = "Your case", rows, children }: { title?: string; rows: SummaryRow[]; children?: ReactNode }) {
  const toneCls = { good: "text-brand", bad: "text-alert", warn: "text-amber" };
  return (
    <aside aria-label={title} className="rounded-3xl bg-brand-soft p-5 lg:sticky lg:top-6 lg:p-6">
      <h2 className="font-serif text-xl font-semibold text-ink">{title}</h2>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-1 lg:gap-y-4">
        {rows.map((r, i) => (
          <div key={i} className={r.big ? "col-span-2 lg:col-span-1" : ""}>
            <dt className="text-sm text-muted">{r.label}</dt>
            <dd
              className={`${r.big ? "font-serif text-3xl font-semibold tracking-tight" : "text-base font-medium"} ${r.tone ? toneCls[r.tone] : "text-ink"}`}
            >
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
      {children}
    </aside>
  );
}
