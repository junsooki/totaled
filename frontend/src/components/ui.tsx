import type { ReactNode } from "react";

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
      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
      : "border border-zinc-300 dark:border-zinc-700";
  return (
    <button onClick={onClick} disabled={disabled} className={`rounded px-4 py-2 text-sm font-medium disabled:opacity-50 ${styles}`}>
      {children}
    </button>
  );
}

export function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: string }) {
  return (
    <div className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${tone ?? ""}`}>{value}</div>
    </div>
  );
}

export function Badge({ children, tone = "zinc" }: { children: ReactNode; tone?: "zinc" | "red" | "green" | "amber" }) {
  const t = {
    zinc: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    red: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    green: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  }[tone];
  return <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${t}`}>{children}</span>;
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export const inputCls = "w-full rounded border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-700";
