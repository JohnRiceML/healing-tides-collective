// Server-side tools for the Get-matched onboarding agent. These run inside the streamText
// call on the API route (never the client), so they can read the DB. Each tool returns a
// structured object: the model reads it as JSON (so include a `summary` that instructs its
// next move — the voice-lab lesson), and the chat UI renders the typed data parts.

import { tool } from "ai";
import { z } from "zod";

import { db } from "@/lib/db";
import { getPublishedPractitioners, getPractitionerBySlug } from "@/lib/practitioners";
import { specialtyLabel, modalityLabel } from "@/app/_lib/taxonomy";
import { validateIntake, type IntakeInput } from "@/lib/seeker-intake";
import type { PractitionerHit, PractitionerDetail, PriorityReflection, CrisisResources, IntakeSaved } from "./types";

const snippet = (s: string | null, max = 180): string | null =>
  s ? (s.length > max ? s.slice(0, max).trimEnd() + "…" : s) : null;

const toHit = (p: {
  slug: string;
  displayName: string;
  title: string | null;
  region: string | null;
  specialties: string[];
  modality: string | null;
  acceptingNew: boolean;
  bio: string | null;
}): PractitionerHit => ({
  slug: p.slug,
  displayName: p.displayName,
  title: p.title,
  region: p.region,
  specialties: p.specialties.map(specialtyLabel),
  modality: p.modality ? modalityLabel(p.modality) : null,
  acceptingNew: p.acceptingNew,
  blurb: snippet(p.bio),
});

export const onboardingTools = {
  search_practitioners: tool({
    description:
      "Find published Healing Tides practitioners that may fit. Use free-text keywords (focus, modality, " +
      "what the person is looking for) and optionally a Minnesota region. Returns up to 4 to introduce warmly " +
      "as suggestions — a person confirms fit.",
    inputSchema: z.object({
      keywords: z.string().describe("What to search for — focus, approach, or need, e.g. 'trauma somatic'"),
      region: z.string().optional().describe("Minnesota city/region, e.g. 'Saint Paul'"),
      acceptingNew: z.boolean().optional().describe("Only those accepting new clients"),
    }),
    execute: async ({ keywords, region, acceptingNew }): Promise<{ practitioners: PractitionerHit[]; summary: string }> => {
      const q = [keywords, region].filter(Boolean).join(" ").trim();
      let cards: Awaited<ReturnType<typeof getPublishedPractitioners>> = [];
      try {
        cards = await getPublishedPractitioners({ q: q || undefined, acceptingNew: acceptingNew || undefined }, "recommended");
      } catch {
        cards = [];
      }
      const practitioners = cards.slice(0, 4).map((c) => toHit(c));
      const summary =
        practitioners.length === 0
          ? "No clear matches surfaced. Don't force it — reassure them a person will look by hand and reach out."
          : `Surfaced ${practitioners.length}. Introduce them warmly, one at a time, as suggestions a person will confirm — not a final match.`;
      return { practitioners, summary };
    },
  }),

  get_practitioner: tool({
    description: "Get a fuller picture of one practitioner by slug, to share more when the person is curious.",
    inputSchema: z.object({ slug: z.string() }),
    execute: async ({ slug }): Promise<{ practitioner: PractitionerDetail; summary: string } | { error: string }> => {
      let p: Awaited<ReturnType<typeof getPractitionerBySlug>> = null;
      try {
        p = await getPractitionerBySlug(slug);
      } catch {
        p = null;
      }
      if (!p) return { error: "I couldn't pull their profile just now." };
      const credentials = Array.isArray((p.fieldValues as Record<string, unknown> | null)?.credentials)
        ? ((p.fieldValues as Record<string, unknown>).credentials as unknown[]).filter((x): x is string => typeof x === "string")
        : [];
      const detail: PractitionerDetail = {
        ...toHit(p),
        bio: p.bio,
        values: p.values,
        website: p.website,
        credentials,
      };
      return { practitioner: detail, summary: "Share a bit about them in your own warm words — don't just recite the bio." };
    },
  }),

  reflect_priorities: tool({
    description:
      "Show the person a small visual of what you're hearing matters most to them, so they feel understood and " +
      "can correct you. Call it once you've heard a few real signals — keep weights honest (0–100).",
    inputSchema: z.object({
      priorities: z
        .array(z.object({ label: z.string(), weight: z.number().min(0).max(100) }))
        .min(2)
        .max(6)
        .describe("2–6 things that matter to them, with a rough weight each"),
      note: z.string().describe("One warm sentence framing the reflection, in your voice"),
    }),
    execute: async ({ priorities, note }): Promise<PriorityReflection & { summary: string }> => ({
      priorities,
      note,
      summary: "Reflection shown. Invite them to correct or add anything — don't assume it's complete.",
    }),
  }),

  show_crisis_resources: tool({
    description:
      "Surface immediate crisis resources. Call this the moment you sense acute risk (suicidal/self-harm " +
      "thoughts, harm to others, abuse in progress, mania, immediate danger). Be gentle; stop collecting matching details.",
    inputSchema: z.object({}),
    execute: async (): Promise<CrisisResources & { summary: string }> => ({
      note: "What you're carrying matters, and you deserve support right now — more than a directory can give in this moment.",
      lines: [
        { label: "988 Suicide & Crisis Lifeline", detail: "Call or text 988 (24/7, free, confidential)" },
        { label: "Crisis Text Line", detail: "Text HOME to 741741" },
        { label: "Emergency", detail: "If you're in immediate danger, call 911" },
      ],
      summary:
        "Crisis resources are now on screen. Acknowledge their courage in sharing, gently encourage them to reach out, " +
        "and let them lead — do not pivot back to matching unless they clearly want to.",
    }),
  }),

  save_intake: tool({
    description:
      "Write up what you heard so Nora can follow up. Only call this once you have their name and email and have " +
      "confirmed with them. Pass focus areas as taxonomy ids when they clearly apply.",
    inputSchema: z.object({
      name: z.string(),
      email: z.string(),
      story: z.string().describe("What's bringing them here, in their words (you may lightly summarize)"),
      priorTherapy: z.string().optional().describe("What they've tried, what helped/didn't"),
      stylePreference: z.enum(["practical", "exploratory", "not_sure"]).optional(),
      lookingFor: z.array(z.string()).optional().describe("Care types from the list"),
      specialties: z.array(z.string()).optional().describe("Focus-area taxonomy ids"),
      region: z.string().optional(),
      format: z.enum(["in_person", "virtual", "either"]).optional(),
      ageGroup: z.enum(["myself", "teen", "child", "couple", "family"]).optional(),
      genderPreference: z.string().optional(),
      usesInsurance: z.boolean().optional(),
      insuranceName: z.string().optional(),
      budgetNote: z.string().optional(),
      availability: z.string().optional(),
      urgency: z.enum(["soon", "this_month", "open"]).optional(),
    }),
    execute: async (input): Promise<IntakeSaved> => {
      const clean = validateIntake(input as IntakeInput);
      if (!clean.ok) return { ok: false, error: clean.error };
      try {
        await db.seekerIntake.create({
          data: { ...clean.value, fieldValues: { __source: "chat" }, userId: null },
        });
        return { ok: true, name: clean.value.name };
      } catch {
        return { ok: false, error: "I couldn't send that just now — could you try once more in a moment?" };
      }
    },
  }),
};

export type OnboardingTools = typeof onboardingTools;
