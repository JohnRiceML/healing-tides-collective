"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

import type { PractitionerHit, PractitionerDetail, PriorityReflection, CrisisResources } from "@/lib/onboarding/types";
import { PractitionerChatCard } from "../_chat/PractitionerChatCard";
import { PriorityChart } from "../_chat/PriorityChart";
import { CrisisCard } from "../_chat/CrisisCard";
import { useRealtimeVoice, SESSION_CAP_MS, type VoiceToolResult } from "./useRealtimeVoice";

const fmt = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export function VoiceOnboarding({ onSwitchToText }: { onSwitchToText: () => void }) {
  const [cards, setCards] = useState<(PractitionerHit | PractitionerDetail)[]>([]);
  const [priorities, setPriorities] = useState<PriorityReflection | null>(null);
  const [crisis, setCrisis] = useState<CrisisResources | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [turns, setTurns] = useState<{ role: "user" | "assistant"; text: string }[]>([]);

  // Tool calls run server-side (/voice/tool) so the DB work happens there; the result is both
  // returned to the model (over the data channel) AND stashed here to render on screen.
  const executeTool = useCallback(async (name: string, args: unknown): Promise<VoiceToolResult> => {
    try {
      const res = await fetch("/api/get-matched/voice/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, args }),
      });
      const result = (await res.json()) as VoiceToolResult;
      if (name === "search_practitioners" && Array.isArray(result.practitioners)) {
        setCards(result.practitioners as PractitionerHit[]);
      } else if (name === "get_practitioner" && result.practitioner) {
        const d = result.practitioner as PractitionerDetail;
        setCards((c) => [d, ...c.filter((x) => x.slug !== d.slug)]);
      } else if (name === "reflect_priorities" && Array.isArray(result.priorities)) {
        setPriorities(result as unknown as PriorityReflection);
      } else if (name === "show_crisis_resources") {
        setCrisis(result as unknown as CrisisResources);
      } else if (name === "save_intake" && result.ok) {
        setSaved(typeof result.name === "string" ? result.name : "friend");
      }
      return result;
    } catch {
      return { error: "that didn't go through — let's keep going" };
    }
  }, []);

  const onUserText = useCallback((text: string) => setTurns((t) => [...t, { role: "user", text }]), []);
  const onAssistantText = useCallback((text: string) => setTurns((t) => [...t, { role: "assistant", text }]), []);

  const { status, error, isMicMuted, isAssistantSpeaking, isThinking, assistantCaption, startedAt, connect, disconnect, toggleMute, audioElRef } =
    useRealtimeVoice({ executeTool, onUserText, onAssistantText });

  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startedAt) {
      setElapsed(0);
      return;
    }
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const connected = status === "connected";
  const stateLabel = !connected
    ? status === "connecting"
      ? "Connecting…"
      : status === "error"
        ? "Couldn't connect"
        : "Tap to start talking"
    : isAssistantSpeaking
      ? "Speaking"
      : isThinking
        ? "Thinking…"
        : "Listening — your turn";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4">
      <header className="flex items-center justify-between border-b border-rule/60 py-4">
        <div>
          <p className="font-display text-[18px] font-light text-charcoal">Talk it through</p>
          <p className="text-[12px] text-ink-muted">A spoken conversation — a real person reads the summary.</p>
        </div>
        <button onClick={onSwitchToText} className="text-[12px] text-teal underline-offset-2 hover:underline">
          Prefer to type?
        </button>
      </header>

      {/* The orb + state */}
      <div className="flex flex-col items-center gap-4 py-10">
        <button
          type="button"
          onClick={() => (connected ? toggleMute() : connect())}
          disabled={status === "connecting"}
          aria-label={connected ? (isMicMuted ? "Unmute microphone" : "Mute microphone") : "Start the voice conversation"}
          className="relative grid h-32 w-32 place-items-center rounded-full bg-seafoam/40 ring-1 ring-teal/30 transition disabled:opacity-60"
        >
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full bg-teal/20"
            animate={
              connected && isAssistantSpeaking
                ? { scale: [1, 1.18, 1], opacity: [0.5, 0.2, 0.5] }
                : connected
                  ? { scale: [1, 1.06, 1], opacity: [0.35, 0.5, 0.35] }
                  : { scale: 1, opacity: 0.3 }
            }
            transition={{ duration: isAssistantSpeaking ? 1.1 : 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="relative text-[28px]">{!connected ? "🎙️" : isMicMuted ? "🔇" : "🌊"}</span>
        </button>

        <p className="text-[14px] text-ink-soft">{stateLabel}</p>

        {connected ? (
          <div className="flex items-center gap-3 text-[12px] text-ink-muted">
            <span>
              {fmt(elapsed)} / {fmt(SESSION_CAP_MS)}
            </span>
            <button onClick={toggleMute} className="rounded-full px-2.5 py-1 ring-1 ring-rule hover:ring-teal/40">
              {isMicMuted ? "Unmute" : "Mute"}
            </button>
            <button
              onClick={() => disconnect("manual")}
              className="rounded-full px-2.5 py-1 text-clay ring-1 ring-clay/30 hover:bg-clay/5"
            >
              End
            </button>
          </div>
        ) : null}

        {/* Live caption of what the guide is saying now */}
        {connected && assistantCaption ? (
          <p className="max-w-[90%] text-center text-[15px] leading-[1.6] text-charcoal">{assistantCaption}</p>
        ) : null}

        {error && !connected ? (
          <p className="text-[13px] text-clay">
            {/iceconnection|getusermedia|permission|denied|notallowed/i.test(error)
              ? "I couldn't reach your microphone — check the browser's mic permission and try again."
              : "Something went wrong connecting. You can try again, or type instead."}
          </p>
        ) : null}

        {status === "idle" && turns.length === 0 ? (
          <p className="max-w-md text-center text-[13px] leading-[1.6] text-ink-muted">
            Tap the circle and just talk — there&rsquo;s no script. The guide will listen, ask a little, and put
            practitioner suggestions on your screen as you go. You can mute or end anytime.
          </p>
        ) : null}
      </div>

      {/* What the guide surfaced (tool results render here) */}
      {(cards.length > 0 || priorities || crisis || saved) && (
        <div className="flex flex-col gap-3 pb-6">
          {crisis ? <CrisisCard data={crisis} /> : null}
          {priorities ? <PriorityChart data={priorities} /> : null}
          {cards.map((p) => (
            <PractitionerChatCard key={p.slug} p={p} />
          ))}
          {saved ? (
            <div className="rounded-2xl border border-teal/30 bg-seafoam/20 px-4 py-3 text-[14px] leading-[1.6] text-ocean">
              <span className="font-medium">We have it from here, {saved}.</span> A real person will read your summary
              and send back a small, considered shortlist — usually within a few days.
            </div>
          ) : null}
        </div>
      )}

      {/* Quiet transcript of completed turns */}
      {turns.length > 0 ? (
        <details className="pb-8 text-[13px] text-ink-soft">
          <summary className="cursor-pointer text-ink-muted">Transcript</summary>
          <div className="mt-2 flex flex-col gap-2">
            {turns.map((t, i) => (
              <p key={i} className={t.role === "user" ? "text-charcoal" : "text-ink-soft"}>
                <span className="text-ink-muted">{t.role === "user" ? "You" : "Guide"}:</span> {t.text}
              </p>
            ))}
          </div>
        </details>
      ) : null}

      <p className="pb-6 text-center text-[11px] text-ink-muted">
        Not emergency care. If you&rsquo;re in crisis, call or text 988. A person reviews everything you share.
      </p>

      {/* Remote audio sink */}
      <audio ref={audioElRef} autoPlay className="hidden" />
    </div>
  );
}
