"use client";

import { useEffect, useRef, useState } from "react";
import { call, fileUrl, Json } from "@/lib/api";
import { Button } from "./ui";

const WHO: Record<string, string> = { owner: "You", adjuster: "Adjuster (AI voice)" };

/** A simulated call to the insurer's adjuster, with a transcript. The words come from the case file; the speech is saved. */
export default function CallPlayback({ id, which }: { id: string; which: "sent" | "denied" }) {
  const [thisCall, setThisCall] = useState<Json | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stop = useRef(false);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    call(`/api/claims/${id}/calls`)
      .then((r) => setThisCall(r.calls.find((c: Json) => c.id === which) ?? null))
      .catch(() => setThisCall(null));
    return () => { stop.current = true; audio.current?.pause(); };
  }, [id, which]);

  if (!thisCall) return null;
  const turns: Json[] = thisCall.turns;
  const hasAudio = turns.some((t) => t.audio);

  async function play() {
    stop.current = false;
    setPlaying(true);
    setError(null);
    try {
      for (let i = 0; i < turns.length && !stop.current; i++) {
        if (!turns[i].audio) continue;
        setNow(i);
        const url = await fileUrl(`/api/claims/${id}/calls/audio/${turns[i].key}.mp3`);
        const a = new Audio(url);
        audio.current = a;
        await new Promise<void>((done, fail) => { a.onended = () => done(); a.onerror = () => fail(new Error("The audio could not play.")); a.play().catch(fail); });
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPlaying(false);
      setNow(null);
    }
  }

  function halt() {
    stop.current = true;
    audio.current?.pause();
    audio.current?.dispatchEvent(new Event("ended"));
  }

  return (
    <section className="space-y-3 border-t-4 border-rule pt-4" aria-label={`Simulated call: ${thisCall.title}`}>
      <div>
        <h3 className="text-lg font-bold text-ink">{which === "sent" ? "What the call could sound like" : "If they say no, a follow-up call"}</h3>
        <p className="mt-1 max-w-prose text-base text-muted">
          Simulated call. The adjuster is an AI voice of a made-up person, and the owner&apos;s voice is a clone of the presenter&apos;s
          own voice. No real insurer is called. Every number comes from your checked case file.
        </p>
      </div>
      {hasAudio ? (
        <Button variant="secondary" onClick={playing ? halt : play}>{playing ? "Stop the call" : "Hear the call"}</Button>
      ) : (
        <p className="text-base text-muted">Speech is not saved for this claim, so you can read the transcript.</p>
      )}
      {error && <p role="alert" className="text-base text-alert">{error}</p>}
      <ol className="space-y-2">
        {turns.map((t, i) => (
          <li key={t.key} className={`border-l-4 pl-3 ${now === i ? "border-brand bg-brand-soft" : "border-line"}`}>
            <span className="text-sm font-semibold text-ink">{WHO[t.speaker] ?? t.speaker}</span>
            <p className="max-w-prose text-base text-ink">{t.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
