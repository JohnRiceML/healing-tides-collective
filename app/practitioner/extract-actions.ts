"use server";

import { generateObject } from "ai";

import { getOrCreatePractitioner } from "@/lib/auth";
import { profileExtractSchema } from "@/app/_lib/profile-extract-schema";

// Vercel AI Gateway model id (plain "provider/model" string — no provider SDK).
// On Vercel it auths via OIDC; locally set AI_GATEWAY_API_KEY. Swappable.
const MODEL = "anthropic/claude-haiku-4.5";

const SYSTEM =
  "You turn text a wellness practitioner wrote about themselves (a website bio, a " +
  "Psychology Today blurb, a CV) into a structured profile DRAFT. Only include facts " +
  "EXPLICITLY present in the text. Omit anything not stated — never invent credentials, " +
  "licenses, years of experience, names, prices, insurance, or contact details. For the " +
  "narrative fields (bio, values, about_you, client_expectations, ideal_client), you may " +
  "lightly rephrase what's written into warm first-person, but stay faithful to the source. " +
  "Leave any field empty when you're unsure.";

/**
 * Draft a profile from text the practitioner pastes. Returns the extracted partial —
 * the editor pre-fills it for HUMAN REVIEW. This never writes to the DB and never
 * publishes; it only assists the form. Gated to the signed-in practitioner.
 */
export async function extractProfileFromText(text: string) {
  const result = await getOrCreatePractitioner();
  if (!result) return { ok: false as const, error: "You're not signed in." };

  const input = (text ?? "").trim();
  if (input.length < 40) {
    return { ok: false as const, error: "Paste a bit more about your practice and we'll draft from it." };
  }

  try {
    const { object } = await generateObject({
      model: MODEL,
      schema: profileExtractSchema,
      system: SYSTEM,
      prompt: input.slice(0, 8000),
    });
    return { ok: true as const, data: object };
  } catch {
    return { ok: false as const, error: "Couldn't read that just now — you can fill the form in normally." };
  }
}
