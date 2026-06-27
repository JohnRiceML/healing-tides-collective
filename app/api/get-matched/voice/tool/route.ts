// Executes a tool the voice agent called. The Realtime model runs in the browser; when it calls
// a tool, the client posts {name, args} here so the work happens server-side (DB reads, the
// intake write), then sends the result back to the model over the data channel. Mirrors the
// text chat's server-side tools — same shared logic, same result shapes the UI renders.

import { NextResponse } from "next/server";

import { executeOnboardingTool } from "@/lib/onboarding/tool-logic";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
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
