"use client";

import { useEffect, useState } from "react";
import { API, call, Json } from "@/lib/api";
import { Reveal } from "./motion";
import { Badge, Button } from "./ui";

const linkCls = "font-semibold text-brand underline underline-offset-4 hover:text-brand-dark";

export default function IfNo({ id }: { id: string }) {
  const [plan, setPlan] = useState<Json | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    call(`/api/claims/${id}/if-no`).then(setPlan).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p role="alert" className="text-base text-alert">{error}</p>;
  if (!plan) return <p role="status" className="text-base text-muted">Building your next steps…</p>;
  const esc = plan.escalation;

  return (
    <Reveal>
    <section className="space-y-6 rounded-[28px] bg-surface p-5 shadow-[0_0_0_1px_rgba(11,31,77,0.07),0_14px_30px_-14px_rgba(11,31,77,0.25)] sm:p-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-ink">If they say no</h2>
        <p className="mt-1 max-w-prose text-base text-muted">Your next steps, in order, with the dates that apply to your claim.</p>
      </div>

      <ol className="space-y-4">
        {plan.steps.map((s: Json, i: number) => (
          <li key={s.step} className="flex gap-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-semibold text-brand">{i + 1}</span>
            <div>
              <p className="text-base font-semibold text-ink">
                {s.step}
                {s.date && <span className="ml-2 font-normal text-muted">by {new Date(`${s.date}T12:00`).toLocaleDateString([], { month: "short", day: "numeric" })}</span>}
              </p>
              <p className="mt-0.5 max-w-prose text-base text-muted">{s.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <details className="rounded-xl bg-cream p-4">
        <summary className="cursor-pointer text-base font-semibold text-ink">Department of Insurance complaint draft</summary>
        <pre className="mt-3 whitespace-pre-wrap font-sans text-base leading-7 text-ink">{plan.complaint.text}</pre>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <Button variant="secondary" onClick={() => { navigator.clipboard.writeText(plan.complaint.text); setCopied(true); }}>
            {copied ? "Copied" : "Copy draft"}
          </Button>
          <a className={linkCls} href={plan.complaint.url} target="_blank" rel="noreferrer">File with the Department of Insurance</a>
        </div>
      </details>

      {esc.recommended && (
        <div className="rounded-xl bg-amber-soft p-5">
          <h3 className="font-serif text-xl font-semibold text-ink">A lawyer is worth talking to, and here is why</h3>
          <ul className="mt-3 space-y-2 text-base text-ink">
            {esc.reasons.map((r: Json) => (
              <li key={r.because}><span className="font-semibold">{r.because}.</span> {r.why}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm font-semibold text-ink">Questions to ask an attorney</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-base text-ink">
            {plan.questions.map((q: string) => <li key={q}>{q}</li>)}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <a className={`${linkCls}`} href={`${API}/api/claims/${id}/case-package.md`}>Download the attorney-ready case package</a>
            <a className={linkCls} href={plan.state_bar_url} target="_blank" rel="noreferrer">Check a lawyer&apos;s license on the State Bar site</a>
          </div>
          <p className="mt-3 text-sm text-muted">
            The package lists what is documented, with sources, and what is missing. It does not rate your case. Not a referral service.
          </p>
        </div>
      )}
      {!esc.recommended && (
        <p className="flex flex-wrap items-center gap-2 text-base text-muted">
          <Badge>Routine</Badge> None of your answers or the gap point to a lawyer. You can still{" "}
          <a className={linkCls} href={`${API}/api/claims/${id}/case-package.md`}>download the case package</a>.
        </p>
      )}
      <p className="text-sm text-muted">Not legal advice.</p>
    </section>
    </Reveal>
  );
}
