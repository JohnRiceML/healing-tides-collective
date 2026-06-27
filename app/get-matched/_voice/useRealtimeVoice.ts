"use client";

// OpenAI Realtime + WebRTC hook for the spoken Get-matched onboarding agent. Ported from
// counsel-post's voice-lab. Tools execute via an injected `executeTool` (the caller posts to
// /api/get-matched/voice/tool so the DB work happens server-side) — same shape as the source.
//
// Lifecycle:
//   1. Fetch ephemeral token from /api/get-matched/voice/session.
//   2. RTCPeerConnection + mic track + remote <audio>.
//   3. "oai-events" data channel for JSON control messages.
//   4. SDP offer -> api.openai.com/v1/realtime/calls -> answer.
//   5. Data-channel events drive transcripts, tool calls, speaking state.

import { useCallback, useEffect, useRef, useState } from "react";

import { createResponseLoop, type ResponseLoop } from "@/lib/onboarding/voice/response-loop";

export type VoiceToolResult = { summary?: string; error?: string; [k: string]: unknown };

type Status = "idle" | "connecting" | "connected" | "error";

// Cost controls — gpt-realtime bills per audio minute on a PUBLIC endpoint, so cap tight.
export const SESSION_CAP_MS = 10 * 60 * 1000;
const IDLE_TIMEOUT_MS = 2 * 60 * 1000;
const TOOL_TIMEOUT_MS = 30 * 1000;

type Props = {
  executeTool: (name: string, args: unknown) => Promise<VoiceToolResult>;
  onAssistantText?: (text: string) => void;
  onUserText?: (text: string) => void;
  onSessionEnd?: (reason: "cap" | "idle" | "manual" | "error") => void;
};

export function useRealtimeVoice({ executeTool, onAssistantText, onUserText, onSessionEnd }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [assistantCaption, setAssistantCaption] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const capTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const captionRef = useRef("");

  // One active response, one continuation per batched-tool turn, releasable on error.
  const responseLoopRef = useRef<ResponseLoop | null>(null);
  if (!responseLoopRef.current) {
    responseLoopRef.current = createResponseLoop(() => {
      const dc = dcRef.current;
      if (!dc || dc.readyState !== "open") return false;
      dc.send(JSON.stringify({ type: "response.create" }));
      return true;
    });
  }

  const executeToolRef = useRef(executeTool);
  const onAssistantTextRef = useRef(onAssistantText);
  const onUserTextRef = useRef(onUserText);
  const onSessionEndRef = useRef(onSessionEnd);
  useEffect(() => {
    executeToolRef.current = executeTool;
    onAssistantTextRef.current = onAssistantText;
    onUserTextRef.current = onUserText;
    onSessionEndRef.current = onSessionEnd;
  }, [executeTool, onAssistantText, onUserText, onSessionEnd]);

  const disconnect = useCallback((reason: "cap" | "idle" | "manual" | "error" = "manual") => {
    if (capTimerRef.current) clearTimeout(capTimerRef.current);
    capTimerRef.current = null;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = null;
    dcRef.current?.close();
    dcRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (audioElRef.current) audioElRef.current.srcObject = null;
    setStatus((prev) => {
      if (prev === "connected" || prev === "connecting") onSessionEndRef.current?.(reason);
      // Don't clobber a just-set terminal "error" status (the connect-failure path sets it
      // immediately before calling disconnect("error")).
      return prev === "error" ? "error" : "idle";
    });
    setIsAssistantSpeaking(false);
    setIsThinking(false);
    // Reset mute so a fresh reconnect (new MediaStream defaults to enabled) can't show a muted
    // icon while the mic is actually live.
    setIsMicMuted(false);
    setStartedAt(null);
    captionRef.current = "";
    setAssistantCaption("");
    responseLoopRef.current?.reset();
  }, []);

  const bumpIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => disconnect("idle"), IDLE_TIMEOUT_MS);
  }, [disconnect]);

  const requestResponse = useCallback(() => {
    responseLoopRef.current?.requestResponse();
  }, []);

  const handleToolCall = useCallback(
    async (callId: string, name: string, args: unknown) => {
      responseLoopRef.current?.onToolStart();
      let payload: VoiceToolResult;
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        payload = await Promise.race([
          executeToolRef.current(name, args),
          new Promise<VoiceToolResult>((resolve) => {
            timer = setTimeout(() => resolve({ error: "that took too long — let's try again" }), TOOL_TIMEOUT_MS);
          }),
        ]);
      } catch (err) {
        payload = { error: err instanceof Error ? err.message : String(err) };
      } finally {
        if (timer) clearTimeout(timer);
      }

      const isLastTool = responseLoopRef.current?.onToolSettled() ?? true;
      const dc = dcRef.current;
      if (!dc || dc.readyState !== "open") return;
      dc.send(
        JSON.stringify({
          type: "conversation.item.create",
          item: { type: "function_call_output", call_id: callId, output: JSON.stringify(payload) },
        }),
      );
      if (isLastTool) requestResponse();
    },
    [requestResponse],
  );

  const handleDataChannelMessage = useCallback(
    (ev: MessageEvent<string>) => {
      bumpIdleTimer();
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(ev.data) as Record<string, unknown>;
      } catch {
        return;
      }
      switch (msg.type) {
        case "conversation.item.input_audio_transcription.completed": {
          const t = typeof msg.transcript === "string" ? msg.transcript : "";
          if (t) onUserTextRef.current?.(t);
          break;
        }
        case "response.created":
          responseLoopRef.current?.onResponseCreated();
          setIsThinking(true);
          captionRef.current = "";
          setAssistantCaption("");
          break;
        case "response.output_audio_transcript.delta":
        case "response.audio_transcript.delta": {
          const delta = typeof msg.delta === "string" ? msg.delta : "";
          if (delta) {
            captionRef.current += delta;
            setAssistantCaption(captionRef.current);
          }
          break;
        }
        case "response.output_audio_transcript.done":
        case "response.audio_transcript.done": {
          const t = typeof msg.transcript === "string" ? msg.transcript : "";
          if (t) {
            captionRef.current = t;
            setAssistantCaption(t);
            onAssistantTextRef.current?.(t);
          }
          break;
        }
        case "response.function_call_arguments.done": {
          const callId = typeof msg.call_id === "string" ? msg.call_id : "";
          const name = typeof msg.name === "string" ? msg.name : "";
          const argsStr = typeof msg.arguments === "string" ? msg.arguments : "{}";
          let args: unknown = {};
          try {
            args = JSON.parse(argsStr);
          } catch {
            args = {};
          }
          if (callId && name) void handleToolCall(callId, name, args);
          break;
        }
        case "output_audio_buffer.started":
          setIsThinking(false);
          setIsAssistantSpeaking(true);
          break;
        case "output_audio_buffer.stopped":
          setIsThinking(false);
          setIsAssistantSpeaking(false);
          break;
        case "response.done":
          setIsThinking(false);
          setIsAssistantSpeaking(false);
          responseLoopRef.current?.onResponseDone();
          break;
        case "error":
          setError((msg.error as { message?: string } | undefined)?.message ?? "Voice connection error");
          // A bare error (e.g. rejected response.create) emits no response.done, so clear the
          // speaking/thinking flags here too or the orb can stick on "Thinking…".
          setIsThinking(false);
          setIsAssistantSpeaking(false);
          responseLoopRef.current?.onError();
          break;
      }
    },
    [handleToolCall, bumpIdleTimer],
  );

  const connect = useCallback(async () => {
    if (status === "connecting" || status === "connected") return;
    setError(null);
    setStatus("connecting");
    try {
      const sessionRes = await fetch("/api/get-matched/voice/session", { method: "POST" });
      if (!sessionRes.ok) throw new Error(await sessionRes.text());
      const { clientSecret, model } = (await sessionRes.json()) as { clientSecret: string; model: string };

      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      pc.ontrack = (event) => {
        if (audioElRef.current) {
          audioElRef.current.srcObject = event.streams[0] ?? null;
          void audioElRef.current.play().catch(() => {});
        }
      };

      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      localStreamRef.current = localStream;
      for (const track of localStream.getTracks()) pc.addTrack(track, localStream);

      const dc = pc.createDataChannel("oai-events");
      dcRef.current = dc;
      dc.addEventListener("message", handleDataChannelMessage);
      dc.addEventListener("open", () => {
        responseLoopRef.current?.onResponseCreated();
        dc.send(JSON.stringify({ type: "response.create", response: { output_modalities: ["audio"] } }));
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const sdpRes = await fetch(`https://api.openai.com/v1/realtime/calls?model=${encodeURIComponent(model)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${clientSecret}`, "Content-Type": "application/sdp" },
        body: offer.sdp,
      });
      if (!sdpRes.ok) throw new Error(`SDP exchange failed: ${sdpRes.status}`);
      const answerSdp = await sdpRes.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

      capTimerRef.current = setTimeout(() => disconnect("cap"), SESSION_CAP_MS);
      bumpIdleTimer();
      setStartedAt(Date.now());
      setStatus("connected");
    } catch (err) {
      // Keep the DOMException NAME (NotAllowedError / NotFoundError / NotReadableError) — it's the
      // stable, locale-independent signal the UI branches on; .message is browser/locale-specific.
      setError(err instanceof Error ? `${err.name}: ${err.message}` : String(err));
      setStatus("error");
      disconnect("error");
    }
  }, [status, handleDataChannelMessage, disconnect, bumpIdleTimer]);

  useEffect(() => () => disconnect("manual"), [disconnect]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const next = !isMicMuted;
    for (const t of stream.getAudioTracks()) t.enabled = !next;
    setIsMicMuted(next);
  }, [isMicMuted]);

  return {
    status,
    error,
    isMicMuted,
    isAssistantSpeaking,
    isThinking,
    assistantCaption,
    startedAt,
    connect,
    disconnect,
    toggleMute,
    audioElRef,
  };
}
