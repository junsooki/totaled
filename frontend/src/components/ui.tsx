import type { ReactNode } from "react";

const focusRing =
  "focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-brand";

export function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
}) {
  const styles =
    variant === "primary"
      ? "border-b-[3px] border-brand-dark bg-brand text-white hover:bg-brand-dark active:translate-y-0.5 active:border-b-[1px] disabled:border-b-0 disabled:bg-disabled disabled:text-disabled-text disabled:active:translate-y-0"
      : "border-2 border-ink bg-surface text-ink hover:bg-brand-soft active:translate-y-0.5 disabled:border-disabled-text/40 disabled:bg-disabled disabled:text-disabled-text disabled:active:translate-y-0";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 px-5 py-2 text-lg font-semibold disabled:cursor-not-allowed ${focusRing} ${styles}`}
    >
      {children}
    </button>
  );
}

/** Typographic figure: muted label, big serif number, 4px ink rule above. No box. */
export function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: string }) {
  return (
    <div className="border-t-4 border-rule pt-3">
      <div className="text-base text-muted">{label}</div>
      <div className={`mt-1 font-serif text-4xl font-semibold tracking-tight ${tone ?? "text-ink"}`}>{value}</div>
    </div>
  );
}

/** Square status tag. Use only for meaningful status. */
export function Badge({ children, tone = "zinc" }: { children: ReactNode; tone?: "zinc" | "red" | "green" | "amber" }) {
  const t = {
    zinc: "border-ink text-ink",
    red: "border-alert text-alert",
    green: "border-brand text-brand",
    amber: "border-amber text-amber",
  }[tone];
  return <span className={`inline-block border px-2 py-0.5 text-sm font-bold ${t}`}>{children}</span>;
}

/** Flat callout (GOV.UK inset text): 5px left border in the tone color and a light tint. Use sparingly. */
export function Notice({
  tone = "info",
  title,
  announce = tone === "bad",
  children,
}: {
  tone?: "info" | "good" | "warn" | "bad";
  title?: string;
  announce?: boolean;
  children?: ReactNode;
}) {
  const t = {
    info: "border-ink bg-line/40",
    good: "border-brand bg-brand-soft",
    warn: "border-amber bg-amber-soft",
    bad: "border-alert bg-alert-soft",
  }[tone];
  return (
    <div role={announce ? "alert" : undefined} className={`border-l-[5px] px-4 py-3 text-ink ${t}`}>
      {title && <h3 className="mb-1">{title}</h3>}
      {children !== undefined && children !== null && <div className="text-base [&>p]:text-base">{children}</div>}
    </div>
  );
}

export const inputCls =
  "block min-h-11 w-full border-2 border-ink bg-surface px-3 py-2 text-lg text-ink placeholder:text-muted focus-visible:outline-4 focus-visible:outline-offset-0 focus-visible:outline-brand";

export type StepperStep = { label: string; done?: boolean; locked?: boolean };

/** Numbered progress list. `current` is a 0-based index. Done and unlocked steps are clickable; locked ones are not. */
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
          <span className="text-base font-bold text-ink">
            Step {current + 1} of {steps.length}
          </span>
          <span className="text-base text-muted">{steps[current]?.label}</span>
        </div>
        <div className="mt-2 flex gap-1" aria-hidden="true">
          {steps.map((s, i) => (
            <span key={i} className={`h-1.5 flex-1 ${i <= current || s.done ? "bg-brand" : "bg-line"}`} />
          ))}
        </div>
      </div>
      {/* Wider screens: numbered steps */}
      <ol className="hidden sm:flex">
        {steps.map((s, i) => {
          const isCurrent = i === current;
          const disabled = !!s.locked && !isCurrent;
          const box = isCurrent
            ? "bg-brand text-white"
            : s.done
              ? "border border-brand text-brand"
              : disabled
                ? "border border-line text-muted"
                : "border border-ink text-ink";
          return (
            <li key={i} className={`flex-1 border-t-4 ${isCurrent ? "border-brand" : "border-line"} ${i > 0 ? "border-l-0" : ""}`}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(i)}
                aria-current={isCurrent ? "step" : undefined}
                className={`flex w-full cursor-pointer flex-col items-start gap-2 px-3 py-3 text-left disabled:cursor-not-allowed ${focusRing}`}
              >
                <span className={`flex size-7 items-center justify-center text-sm font-bold ${box}`}>
                  {s.done && !isCurrent ? (
                    <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <path d="M4 10.5l4 4 8-9" strokeLinecap="square" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={`text-base leading-tight ${isCurrent ? "font-bold text-ink" : disabled ? "text-muted" : "text-brand underline underline-offset-4"}`}
                >
                  {s.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** One wizard screen, no card. The title is the page h1. `footer` holds Back / Continue under a hairline rule. */
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
    <section>
      <h1 tabIndex={-1} className="outline-none">{title}</h1>
      {subtitle && <p className="mt-3 max-w-prose text-[1.1875rem] text-muted">{subtitle}</p>}
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

/** GOV.UK summary list: label left, value right (stacked when the list is narrow), hairline rules, no boxes. */
export function SummaryList({ rows }: { rows: SummaryRow[] }) {
  const toneCls = { good: "text-brand", bad: "text-alert", warn: "text-amber" };
  return (
    <dl className="@container">
      {rows.map((r, i) => (
        <div key={i} className="flex flex-col gap-0.5 border-t border-line py-3 first:border-t-0 @sm:flex-row @sm:gap-6">
          <dt className="text-base text-muted @sm:w-2/5 @sm:shrink-0">{r.label}</dt>
          <dd
            className={`m-0 min-w-0 ${r.big ? "font-serif text-4xl font-semibold leading-tight tracking-tight" : "text-lg font-medium"} ${r.tone ? toneCls[r.tone] : "text-ink"}`}
          >
            {r.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Case summary column: 4px brand rule on top, serif title, summary list. Put it first in the DOM; at lg and up
 * it is sticky (give its wrapper `lg:order-2`).
 */
export function SummaryPanel({ title = "Your case", rows, children }: { title?: string; rows: SummaryRow[]; children?: ReactNode }) {
  const key = rows.find((r) => r.big) ?? rows[0];
  return (
    <div>
      {/* Below lg: collapsed disclosure. The sticky panel below is display:none here. */}
      <details className="group border-t-4 border-brand lg:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 py-2 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-brand [&::-webkit-details-marker]:hidden">
          <span className="font-serif text-xl font-semibold text-ink">{title}</span>
          <span className="min-w-0 flex-1 truncate text-lg font-medium text-ink">
            {key ? (key.big ? <>{key.label}: {key.value}</> : key.value) : null}
          </span>
          <span className="shrink-0 text-base font-medium text-brand underline">
            <span className="group-open:hidden">Show</span>
            <span className="hidden group-open:inline">Hide</span>
          </span>
        </summary>
        <div className="border-t border-rule pt-2">
          <SummaryList rows={rows} />
          {children}
        </div>
      </details>
      <aside aria-label={title} className="hidden border-t-4 border-brand pt-3 lg:sticky lg:top-6 lg:block">
        <h2 className="text-2xl">{title}</h2>
        <div className="mt-2">
          <SummaryList rows={rows} />
        </div>
        {children}
      </aside>
    </div>
  );
}
