import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

// The onboarding chat runs on OpenAI via OPENAI_API_KEY — a capable model that works the same
// locally and in production. We deliberately DON'T route this through the Vercel AI Gateway:
// the gateway here is on the free tier, which blocks the stronger Claude models (sonnet 403s;
// only haiku is allowed). gpt-4.1 is the sweet spot for a real-time conversation — strong
// reasoning + empathy + tool-calling, with lower latency than gpt-5.
//
// If gateway credits are added later (or you prefer Claude), swap the return to a gateway model
// string like "anthropic/claude-sonnet-4.6" — streamText accepts either.
export function onboardingModel(): LanguageModel {
  if (process.env.OPENAI_API_KEY) return openai("gpt-4.1");
  return "anthropic/claude-haiku-4.5"; // free-tier-allowed gateway fallback if no OpenAI key
}
