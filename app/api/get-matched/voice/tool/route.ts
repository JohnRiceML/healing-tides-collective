// Executes a tool the voice agent called. The Realtime model runs in the browser; when it calls
// a tool, the client posts {name, args} here so the work happens server-side (DB reads, the
// intake write), then sends the result back to the model over the data channel. Mirrors the
// text chat's server-side tools — same shared logic, same result shapes the UI renders.
//
// This is a PUBLIC, unauthenticated mutation surface (it can write an intake via save_intake), so
// it carries its own abuse guards: a body-size cap + a per-IP rate limit, independent of the
// session-mint limiter. (A signed session-token binding is a tracked follow-up for stronger
// coupling to a real minted session.)

import { NextResponse } from "next/server";

import { executeOnboardingTool } from "@/lib/onboarding/tool-logic";
import { voiceToolLimiter, clientIp } from "@/lib/onboarding/voice/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_BODY_BYTES = 32_000;

export async function POST(req: Request) {
  const len = Number(req.headers.get("content-length") ?? "0");
  if (len > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }

  const rl = voiceToolLimiter.check(clientIp(req), Date.now());
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests — slow down a moment." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  let body: { name?: unknown; args?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (typeof body.name !== "string") {
    return NextResponse.json({ error: "Missing tool name." }, { status: 400 });
  }
  const result = await executeOnboardingTool(body.name, body.args);
  return NextResponse.json(result);
}
