"use client";

import { useEffect, useState } from "react";
import { call, download, Json } from "@/lib/api";
import Briefing from "./Briefing";
import CallPlayback from "./CallPlayback";
import { Button, Notice } from "./ui";

const linkCls = "font-semibold text-brand underline underline-offset-4 hover:text-brand-dark";

export default function IfNo({ id }: { id: string }) {
  const [plan, setPlan] = useState<Json | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pkgError, setPkgError] = useState<string | null>(null);
  const getPackage = () => download(`/api/claims/${id}/case-package.md`, "toto-case-package.md")
    .catch((e) => setPkgError(e instanceof Error ? e.message : String(e)));

  useEffect(() => {
    call(`/api/claims/${id}/if-no`).then(setPlan).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p role="alert" className="text-base text-alert">{error}</p>;
  if (!plan) return <p role="status" className="text-base text-muted">Building your next steps…</p>;
  const esc = plan.escalation;

  return (
    <section className="space-y-6 border-t-4 border-rule pt-6">
      <div>
        <h2>If they say no</h2>
        <p className="mt-1 max-w-prose text-base text-muted">Your next steps, in order, with the dates that apply to your claim.</p>
      </div>

      <ol className="space-y-4">
        {plan.steps.map((s: Json, i: number) => (
          <li key={s.step} className="flex gap-4">
            <span className="flex size-8 shrink-0 items-center justify-center border-2 border-ink text-base font-bold text-ink">{i + 1}</span>
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

      <CallPlayback id={id} which="denied" />

      <details className="border-2 border-ink p-4">
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
        <Notice tone="warn" title="A lawyer is worth talking to, and here is why">
          <ul className="space-y-2 text-base text-ink">
            {esc.reasons.map((r: Json) => (
              <li key={r.because}><span className="font-semibold">{r.because}.</span> {r.why}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm font-semibold text-ink">Questions to ask an attorney</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-base text-ink">
            {plan.questions.map((q: string) => <li key={q}>{q}</li>)}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Button variant="secondary" onClick={getPackage}>Download the attorney-ready case package</Button>
          </div>
          <p className="mt-3 text-sm text-muted">
            The package lists what is documented, with sources, and what is missing. It does not rate your case. Not a referral service.
          </p>
          <Briefing id={id} />
        </Notice>
      )}
      {!esc.recommended && (
        <p className="flex flex-wrap items-center gap-2 text-base text-muted">
          None of your answers or the gap point to a lawyer. You can still{" "}
          <button type="button" onClick={getPackage} className={`cursor-pointer ${linkCls}`}>download the case package</button>.
        </p>
      )}
      <details className="border-2 border-ink p-4">
        <summary className="cursor-pointer text-base font-semibold text-ink">Find a lawyer</summary>
        <p className="mt-2 max-w-prose text-base text-ink">
          California&apos;s State Bar certifies lawyer referral services. Many offer a free or low-cost first consultation. Bring
          your case package.
        </p>
        <div className="mt-3 flex flex-wrap gap-4">
          <a className={linkCls} href={plan.referral_services_url} target="_blank" rel="noreferrer">State Bar certified referral services</a>
          <a className={linkCls} href={plan.state_bar_url} target="_blank" rel="noreferrer">Check a lawyer&apos;s license</a>
        </div>
        <p className="mt-3 text-sm text-muted">
          We don&apos;t list, rank or recommend lawyers, and we receive nothing from any lawyer. Not a referral service. Not legal advice.
        </p>
      </details>
      {pkgError && <Notice tone="bad"><p>{pkgError}</p></Notice>}
      <p className="text-sm text-muted">Not legal advice.</p>
    </section>
  );
}
