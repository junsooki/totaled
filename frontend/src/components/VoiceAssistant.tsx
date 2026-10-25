"use client";

import { useRef, useState, type FormEvent } from "react";
import { call, Json, post } from "@/lib/api";
import { Badge, Button, Notice, inputCls } from "./ui";

type RecognitionEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type Recognition = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type RecognitionConstructor = new () => Recognition;
type SpeechWindow = Window & {
  SpeechRecognition?: RecognitionConstructor;
  webkitSpeechRecognition?: RecognitionConstructor;
};

function extractVin(text: string): string | null {
  const upper = text.toUpperCase().trim();
  const marker = upper.lastIndexOf("VIN");
  if (marker < 0) {
    const compact = upper.replace(/[^A-Z0-9]/g, "");
    return /^[A-HJ-NPR-Z0-9]{17}$/.test(compact) ? compact : null;
  }

  const tokens = upper.slice(marker + 3).trim().split(/\s+/)
    .map((token) => token.replace(/^[^A-Z0-9]+|[^A-Z0-9]+$/g, ""))
    .filter(Boolean);
  while (["IS", "PLEASE", "NUMBER", "OF", "COLON"].includes(tokens[0])) tokens.shift();
  let candidate = "";
  for (const token of tokens) {
    if (!/^[A-Z0-9-]+$/.test(token)) break;
    candidate += token.replace(/-/g, "");
    if (candidate.length >= 17) break;
  }
  const vin = candidate.slice(0, 17);
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin) ? vin : null;
}

export default function VoiceAssistant({ claimId }: { claimId: string }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<Json | null>(null);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognition = useRef<Recognition | null>(null);

  async function ask(text: string) {
    if (!text.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const vin = extractVin(text);
      if (vin) {
        const decoded = await call(`/api/vin/${encodeURIComponent(vin)}`);
        const answerText = `This VIN decodes to a ${decoded.year ?? "year unavailable"} ${decoded.make} ${decoded.model}${decoded.trim ? ` ${decoded.trim}` : ""}. ${decoded.warning ? `${decoded.warning}. ` : ""}NHTSA decoding identifies the vehicle; it does not verify title history or condition.`;
        setAnswer({ answer: answerText, references: [], retrieval_ms: null });
        if ("speechSynthesis" in window && "SpeechSynthesisUtterance" in window) {
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(answerText));
        }
        return;
      }
      const result = await post(`/api/claims/${claimId}/voice-answer`, { question: text.trim() });
      setAnswer(result);
      if ("speechSynthesis" in window && "SpeechSynthesisUtterance" in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(result.answer));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function listen() {
    const speechWindow = window as SpeechWindow;
    const SpeechRecognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not available in this browser. Type your question instead.");
      return;
    }
    setError(null);
    const next = new SpeechRecognition();
    next.lang = "en-US";
    next.interimResults = false;
    next.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) {
        setQuestion(transcript);
        void ask(transcript);
      }
    };
    next.onerror = (event) => setError(`Microphone error: ${event.error}. You can type your question instead.`);
    next.onend = () => setListening(false);
    recognition.current = next;
    setListening(true);
    next.start();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(question);
  }

  return (
    <section className="border-t-4 border-brand pt-4" aria-labelledby="voice-guide-title">
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="voice-guide-title" className="font-serif text-2xl font-semibold text-ink">Ask your claim guide</h2>
        <Badge tone="green">Moss retrieval</Badge>
      </div>
      <p className="mt-2 max-w-prose text-base text-muted">
        Ask about a failed check, the estimate, or what a number means. Moss finds the relevant guidance; Totaled answers from that guidance and your claim facts. Your transcript is not saved.
      </p>
      <p className="mt-1 max-w-prose text-sm text-muted">Say or type “VIN” followed by 17 characters to look up the vehicle automatically.</p>
      <p className="mt-1 max-w-prose text-sm text-muted">Speech uses your browser&apos;s recognition and voice playback. If microphone support is unavailable, type below.</p>

      <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="claim-voice-question">Your question</label>
        <input
          id="claim-voice-question"
          className={`${inputCls} min-w-0 flex-1`}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Why was my condition deduction flagged?"
          maxLength={500}
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" disabled={busy} onClick={() => {
            if (listening) recognition.current?.stop();
            else listen();
          }}>
            {listening ? "Stop listening" : "Ask by voice"}
          </Button>
          <Button type="submit" disabled={busy || question.trim().length < 3}>
            {busy ? "Finding an answer…" : "Ask"}
          </Button>
        </div>
      </form>

      {busy && <p role="status" className="mt-4 text-base text-muted">Looking up the VIN or searching guidance…</p>}
      {error && <div className="mt-4"><Notice tone="bad"><p>{error}</p></Notice></div>}
      {answer && !busy && (
        <div className="mt-6 border-l-[5px] border-brand bg-brand-soft px-4 py-3">
          <h3 className="font-semibold text-ink">Answer</h3>
          <p className="mt-1 text-lg text-ink">{answer.answer}</p>
          <p className="mt-3 text-sm text-muted">
            {answer.references.length > 0
              ? <>Retrieved {answer.references.length} Moss references{answer.retrieval_ms != null ? ` in ${Number(answer.retrieval_ms).toFixed(1)} ms` : ""}.</>
              : "VIN decoded through NHTSA."}
          </p>
          {answer.references.length > 0 && <details className="mt-2 text-sm">
            <summary className="cursor-pointer font-medium text-brand underline">Show retrieved guidance</summary>
            <ul className="mt-2 space-y-2">
              {answer.references.map((ref: Json) => <li key={ref.id}>{ref.text}</li>)}
            </ul>
          </details>}
        </div>
      )}
    </section>
  );
}
