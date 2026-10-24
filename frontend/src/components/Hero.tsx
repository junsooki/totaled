"use client";

import { Typewriter } from "./motion";

const PROMPTS = [
  "My insurer offered $17,104 for my 2019 Civic. Is that fair?",
  "Which of their comparable cars break California's rules?",
  "What do I walk away with after my car loan?",
  "Find me a replacement inside my budget, from a seller you checked.",
];

/** Dark first screen in Cruma's style: a prompt writing itself, a two-tone headline, one clear action. */
export default function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative isolate overflow-hidden bg-[#070f29] px-4 pt-28 pb-20 text-center text-white sm:pt-36 sm:pb-28">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_42%,rgba(22,51,201,0.55),transparent_70%)]" />
      <div aria-hidden="true" className="absolute -right-24 bottom-0 -z-10 size-[28rem] rounded-full bg-[radial-gradient(closest-side,rgba(255,150,90,0.35),transparent)]" />
      <div className="mx-auto max-w-4xl">
        <button type="button" onClick={onStart}
          className="animate-glow animate-rise mx-auto flex w-full max-w-xl cursor-pointer items-center gap-3 rounded-2xl bg-[linear-gradient(160deg,rgba(168,186,245,0.26),rgba(92,116,200,0.16)_45%,rgba(40,58,130,0.22))] py-3 pr-3 pl-5 text-left text-sm text-white/90 backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:text-base">
          <span aria-hidden="true" className="text-white/50">✦</span>
          <span className="min-w-0 flex-1 truncate"><Typewriter lines={PROMPTS} /></span>
          <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-brand">↑</span>
          <span className="sr-only">Start with your report</span>
        </button>
        <h1 className="animate-rise mt-10 text-5xl font-light leading-[1.05] tracking-[-0.03em] sm:text-7xl" style={{ animationDelay: "120ms" }}>
          <span className="text-white/45">Insurers use software to value your car.</span>{" "}
          <span>Now you can check theirs.</span>
        </h1>
        <p className="animate-rise mx-auto mt-6 max-w-xl text-lg text-white/75" style={{ animationDelay: "240ms" }}>
          For the weeks after a car accident in California. Every number is checked in code, every source is shown, and nothing
          happens without your OK.
        </p>
        <button type="button" onClick={onStart} style={{ animationDelay: "360ms" }}
          className="animate-rise mt-8 inline-flex min-h-12 cursor-pointer items-center rounded-full bg-white px-7 text-base font-medium text-ink hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#070f29]">
          Check my offer
        </button>
      </div>
    </section>
  );
}
