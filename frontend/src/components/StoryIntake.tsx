"use client";

import { useRef, useState } from "react";
import { Json, post } from "@/lib/api";
import { Button, Notice, inputCls } from "./ui";

type RecognitionEvent = { resultIndex: number; results: ArrayLike<{ isFinal: boolean } & ArrayLike<{ transcript: string }>> };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };

export type StoryAnswer = { key: string; answer: boolean; quote: string };

/**
 * The owner tells what happened, by voice or typing. Claude reads it into a timeline and answers to the four
 * questions, each tied to their exact words. Private: it goes to the attorney package, not to the insurer.
 */
export default function StoryIntake({ id, onAnswers, onUseNote }: {
  id: string; onAnswers: (answers: StoryAnswer[]) => void; onUseNote: (note: string) => void;
}) {
  const [text, setText] = useState("");
  const [interim, setInterim] = useState("");
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [read, setRead] = useState<Json | null>(null);
  const [noteUsed, setNoteUsed] = useState(false);
  const recognition = useRef<Recognition | null>(null);

  function listen() {
    const w = window as SpeechWindow;
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) {
      setError("Voice input is not available in this browser. Type what happened instead.");
      return;
    }
    setError(null);
    const r = new SR();
    r.lang = "en-US";
    r.continuous = true;  // keep listening through pauses until the owner stops
    r.interimResults = true;
    r.onresult = (event) => {
      let done = "";
      let live = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) done += t;
        else live += t;
      }
      if (done) setText((prev) => `${prev}${prev && !prev.endsWith(" ") ? " " : ""}${done.trim()}`);
      setInterim(live);
    };
    r.onerror = (event) => setError(`Microphone error: ${event.error}. You can type instead.`);
    r.onend = () => { setListening(false); setInterim(""); };
    recognition.current = r;
    setListening(true);
    r.start();
  }

  async function readIt() {
    recognition.current?.stop();
    setBusy(true);
    setError(null);
    try {
      const r = await post(`/api/claims/${id}/story`, { text: text.trim() });
      setRead(r);
      setNoteUsed(false);
      onAnswers(r.answers);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-l-[5px] border-brand bg-brand-soft px-4 py-4">
      <h3 className="text-lg font-bold text-ink">Tell us what happened</h3>
      <p className="mt-1 max-w-prose text-base text-ink">
        Say it in your own words: when and where, what hit what, who was hurt, what the other side says. We fill in the questions
        below from what you say, and you check each one.
      </p>
      <p className="mt-1 max-w-prose text-sm text-muted">
        Private. This goes into your attorney case package, not to your insurer. Voice uses your browser&apos;s speech recognition,
        which may send audio to the browser maker.
      </p>

      <div className="mt-3 flex flex-wrap gap-3">
        {listening ? (
          <Button variant="secondary" onClick={() => recognition.current?.stop()}>Stop listening</Button>
        ) : (
          <Button variant="secondary" onClick={listen}>{text ? "Keep talking" : "Speak"}</Button>
        )}
        {listening && <span role="status" className="self-center text-base font-semibold text-brand">Listening…</span>}
      </div>

      <label htmlFor="story-text" className="mt-3 block text-base font-medium text-ink">Your account (you can edit it)</label>
      <textarea
        id="story-text"
        className={`${inputCls} mt-1`}
        rows={5}
        maxLength={4000}
        value={listening && interim ? `${text} ${interim}` : text}
        readOnly={listening}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button onClick={readIt} disabled={busy || listening || text.trim().length < 3}>{busy ? "Reading…" : "Fill in from my account"}</Button>
        <span className="text-sm text-muted">{text.length}/4000</span>
      </div>
      {error && <div className="mt-3"><Notice tone="bad"><p>{error}</p></Notice></div>}

      {read && (
        <div className="mt-4 space-y-3 border-t border-line pt-3">
          {!String(read.by).startsWith("claude") ? (  // "claude" or "claude (saved demo run)"
            <p className="text-base text-ink">Saved for your attorney package. Claude is not configured here, so answer the questions below yourself.</p>
          ) : (
            <>
              <p className="text-base text-ink">
                Found {read.timeline.length} events and {read.answers.length} of the 4 answers in your words.
                {read.dropped > 0 && ` We left out ${read.dropped} that did not match what you said.`} Check the answers below.
              </p>
              {read.timeline.length > 0 && (
                <ol className="list-decimal space-y-1 pl-5 text-base text-ink">
                  {read.timeline.map((e: Json, i: number) => (
                    <li key={i}>
                      {e.when && <span className="font-semibold">{e.when}: </span>}{e.event}
                      <span className="block text-sm text-muted">You said: “{e.quote}”</span>
                    </li>
                  ))}
                </ol>
              )}
              {read.letter_note && (
                <div className="border-t border-line pt-3">
                  <p className="text-base font-semibold text-ink">A neutral sentence you could send your insurer</p>
                  <p className="mt-1 text-base text-ink">“{read.letter_note}”</p>
                  <div className="mt-2">
                    <Button variant="secondary" onClick={() => { onUseNote(read.letter_note); setNoteUsed(true); }} disabled={noteUsed}>
                      {noteUsed ? "Added to your letter note" : "Use this in my letter"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
