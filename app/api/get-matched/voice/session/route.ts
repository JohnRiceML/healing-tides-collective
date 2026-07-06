// Mint an ephemeral OpenAI Realtime client secret for the spoken Get-matched onboarding agent.
// The server holds the real OPENAI_API_KEY and trades it for a short-lived token the browser
// uses for the SDP handshake with api.openai.com/v1/realtime/calls — the key never reaches the
// client. Audio then flows browser <-> OpenAI directly.
//
// COST NOTE: this is a PUBLIC endpoint (seekers are anonymous), and gpt-realtime bills per audio
// minute. Per-session cost is bounded client-side (session cap + idle timeout in useRealtimeVoice).
// Session COUNT is not yet rate-limited — a per-IP mint throttle is a tracked follow-up before
// heavy promotion.

import { NextResponse } from "next/server";
import { z } from "zod";

import { buildVoiceOnboardingPrompt } from "@/lib/onboarding/voice-system-prompt";
import { TOOL_SCHEMAS, TOOL_DESCRIPTIONS, type OnboardingToolName } from "@/lib/onboarding/tool-logic";
import { voiceSessionLimiter, clientIp } from "@/lib/onboarding/voice/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const REALTIME_MODEL = process.env.OPENAI_REALTIME_MODEL ?? "gpt-realtime";
const REALTIME_VOICE = process.env.OPENAI_REALTIME_VOICE ?? "marin"; // calm, natural

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Voice isn't configured right now." }, { status: 503 });
  }

  // Best-effort per-IP guard on this per-minute-billed public endpoint (see rate-limit.ts).
  const rl = voiceSessionLimiter.check(clientIp(req), Date.now());
  if (!rl.ok) {
    return NextResponse.json(
      { error: "That's a lot of voice sessions in a short time — take a breather, or use the text chat." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const tools = (Object.keys(TOOL_SCHEMAS) as OnboardingToolName[]).map((name) => ({
    type: "function" as const,
    name,
    description: TOOL_DESCRIPTIONS[name],
    parameters: zodSchemaToOpenAIParameters(TOOL_SCHEMAS[name]),
  }));

  const res = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session: {
        type: "realtime",
        model: REALTIME_MODEL,
        instructions: buildVoiceOnboardingPrompt(),
        output_modalities: ["audio"],
        audio: {
          input: {
            transcription: { model: "whisper-1" },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              // A seeker pauses to find words — give them room before the agent jumps in.
              silence_duration_ms: 1100,
            },
          },
          output: { voice: REALTIME_VOICE },
        },
        tools,
        tool_choice: "auto",
      },
    }),
  });

  if (!res.ok) {
    // Log the upstream detail server-side only — never relay a provider error body to the client.
    const text = await res.text().catch(() => "");
    console.error(`[voice/session] OpenAI session error: ${res.status} ${text}`);
    return NextResponse.json(
      { error: "Voice couldn't start just now — please try again, or use the text chat." },
      { status: 502 },
    );
  }
  const secret = (await res.json()) as { value: string; expires_at: number; session?: { id?: string } };

  return NextResponse.json({
    clientSecret: secret.value,
    expiresAt: secret.expires_at,
    model: REALTIME_MODEL,
    voice: REALTIME_VOICE,
  });
}

/** Zod v4 → OpenAI Realtime tool parameters (strip $schema; require an object root). */
function zodSchemaToOpenAIParameters(schema: z.ZodType): Record<string, unknown> {
  const raw = z.toJSONSchema(schema) as Record<string, unknown>;
  delete raw.$schema;
  if (raw.type !== "object") {
    return { type: "object", properties: { value: raw }, required: ["value"], additionalProperties: false };
  }
  return raw;
}
