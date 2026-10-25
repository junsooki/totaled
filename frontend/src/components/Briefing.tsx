"use client";

import { useState } from "react";
import { call, download, fileUrl, Json } from "@/lib/api";
import { Button, Notice } from "./ui";

/** A one-minute spoken summary for an attorney: the owner reads the script first, then chooses to make the audio. */
export default function Briefing({ id }: { id: string }) {
  const [brief, setBrief] = useState<Json | null>(null);
  const [audio, setAudio] = useState<string | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function run(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="mt-4 border-t border-line pt-4">
      <h4 className="text-lg font-bold text-ink">Spoken briefing for an attorney</h4>
      <p className="mt-1 max-w-prose text-base text-ink">
        About a minute, read in a stock AI voice that says it is AI at the start. Read the script first. You choose whether to
        make the audio, and you share it yourself.
      </p>
      {!brief && (
        <div className="mt-3">
          <Button variant="secondary" disabled={busy === "script"} onClick={() => run("script", async () => setBrief(await call(`/api/claims/${id}/briefing`)))}>
            {busy === "script" ? "Writing…" : "Show the script"}
          </Button>
        </div>
      )}
      {brief && (
        <div className="mt-3 space-y-3">
          <p className="border-l-2 border-ink pl-3 text-base text-ink">{brief.script}</p>
          {!brief.voice ? (
            <p className="text-base text-muted">Audio is off here: Cartesia is not configured. You can read the script out yourself.</p>
          ) : audio ? (
            <div className="flex flex-wrap items-center gap-3">
              <audio controls src={audio} className="max-w-full" />
              <Button variant="secondary" onClick={() => run("dl", () => download(`/api/claims/${id}/briefing.mp3`, "toto-case-briefing.mp3"))}>
                Download the audio
              </Button>
            </div>
          ) : (
            <Button disabled={busy === "audio"} onClick={() => run("audio", async () => setAudio(await fileUrl(`/api/claims/${id}/briefing.mp3`)))}>
              {busy === "audio" ? "Making the audio…" : "Make the audio"}
            </Button>
          )}
          <p className="text-sm text-muted">Voice by Cartesia. The script is built from your case file in code; no AI writes it.</p>
        </div>
      )}
      {error && <div className="mt-3"><Notice tone="bad"><p>{error}</p></Notice></div>}
    </div>
  );
}
