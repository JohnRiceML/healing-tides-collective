// Streaming chat endpoint for the Get-matched onboarding agent. Public (seekers are anonymous).
// Claude via the Vercel AI Gateway (same path as the bio importer — OIDC on Vercel,
// AI_GATEWAY_API_KEY locally). Server-side tools read the practitioner DB and write the intake.

import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type InferUITools,
  type UIDataTypes,
  type UIMessage,
} from "ai";

import { onboardingTools } from "@/lib/onboarding/tools";
import { buildOnboardingSystemPrompt } from "@/lib/onboarding/system-prompt";
import { onboardingModel } from "@/lib/onboarding/model";

export const maxDuration = 60;

// Exported so the client can type useChat<OnboardingUIMessage> (type-only import → no server
// code is bundled into the browser).
export type OnboardingUIMessage = UIMessage<never, UIDataTypes, InferUITools<typeof onboardingTools>>;

function errorMessage(error: unknown): string {
  if (error == null) return "Something went wrong.";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return JSON.stringify(error);
}

export async function POST(req: Request) {
  let messages: OnboardingUIMessage[];
  try {
    ({ messages } = await req.json());
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  // Cheap abuse guard — a genuine onboarding never runs this long.
  if (!Array.isArray(messages) || messages.length > 80) {
    return new Response("Too many messages", { status: 400 });
  }

  const result = streamText({
    model: onboardingModel(),
    system: buildOnboardingSystemPrompt(),
    messages: await convertToModelMessages(messages),
    tools: onboardingTools,
    stopWhen: stepCountIs(6), // let the model call a tool, read it, and keep talking in one turn
  });

  return result.toUIMessageStreamResponse({ onError: errorMessage });
}
