// Single source of truth for the onboarding agent's tools — shared by the TEXT chat
// (lib/onboarding/tools.ts wraps these as AI SDK tools) and the VOICE agent (the realtime
// tool endpoint calls executeOnboardingTool). Server-only (reads the DB). Each tool returns a
// structured object whose `summary` instructs the model's next move (the voice-lab lesson).

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

// ── Schemas + descriptions (the realtime session route advertises these too) ──────────
export const TOOL_SCHEMAS = {
  search_practitioners: z.object({
    keywords: z.string().max(200).describe("What to search for — focus, approach, or need, e.g. 'trauma somatic'"),
    region: z.string().max(120).optional().describe("Minnesota city/region, e.g. 'Saint Paul'"),
    acceptingNew: z.boolean().optional().describe("Only those accepting new clients"),
  }),
  get_practitioner: z.object({ slug: z.string().max(200) }),
  reflect_priorities: z.object({
    priorities: z
      .array(z.object({ label: z.string().max(80), weight: z.number().min(0).max(100) }))
      .min(2)
      .max(6)
      .describe("2–6 things that matter to them, with a rough weight each"),
    note: z.string().max(300).describe("One warm sentence framing the reflection, in your voice"),
  }),
  show_crisis_resources: z.object({}),
  save_intake: z.object({
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
} as const;

export type OnboardingToolName = keyof typeof TOOL_SCHEMAS;

export const TOOL_DESCRIPTIONS: Record<OnboardingToolName, string> = {
  search_practitioners:
    "Find published Healing Tides practitioners that may fit. Use free-text keywords (focus, modality, what the " +
    "person is looking for) and optionally a Minnesota region. Returns up to 4 to introduce warmly as suggestions — " +
    "a person confirms fit.",
  get_practitioner: "Get a fuller picture of one practitioner by slug, to share more when the person is curious.",
  reflect_priorities:
    "Show the person a small visual of what you're hearing matters most to them, so they feel understood and can " +
    "correct you. Call it once you've heard a few real signals — keep weights honest (0–100).",
  show_crisis_resources:
    "Surface immediate crisis resources. Call this the moment you sense acute risk (suicidal/self-harm thoughts, " +
    "harm to others, abuse in progress, mania, immediate danger). Be gentle; stop collecting matching details.",
  save_intake:
    "Write up what you heard so Nora can follow up. Only call this once you have their name and email and have " +
    "confirmed with them. Pass focus areas as taxonomy ids when they clearly apply.",
};

// ── Tool implementations (the actual behavior) ────────────────────────────────────────
export async function runSearchPractitioners({
  keywords,
  region,
  acceptingNew,
}: z.infer<(typeof TOOL_SCHEMAS)["search_practitioners"]>): Promise<{ practitioners: PractitionerHit[]; summary: string }> {
  const q = [keywords, region].filter(Boolean).join(" ").trim();
  const fetch = async (filters: Parameters<typeof getPublishedPractitioners>[0]) => {
    try {
      return await getPublishedPractitioners(filters, "recommended");
    } catch {
      return [];
    }
  };

  // Try the keyword/region query first; if that's empty (common in a small/seeded directory or on a
  // too-narrow query), BROADEN so the agent always has real people to introduce + talk through —
  // never dead-end into "no match" while published practitioners actually exist.
  let cards = await fetch({ q: q || undefined, acceptingNew: acceptingNew || undefined });
  let broadened = false;
  if (cards.length === 0 && acceptingNew) {
    cards = await fetch({ q: q || undefined });
    broadened = cards.length > 0;
  }
  if (cards.length === 0) {
    cards = await fetch({});
    broadened = cards.length > 0;
  }

  const practitioners = cards.slice(0, 4).map((c) => toHit(c));
  const summary =
    practitioners.length === 0
      ? "Our Minnesota network has no published practitioners to show yet — gently say it's still growing and a person will reach out as soon as there's a good fit."
      : broadened
        ? `No exact keyword match, so here are ${practitioners.length} from our network. Introduce them warmly and naturally — say these are who's available right now — and see if any resonate. Don't say "no match."`
        : `Surfaced ${practitioners.length}. Introduce them warmly, one at a time, as suggestions a person will confirm — not a final match.`;
  return { practitioners, summary };
}

export async function runGetPractitioner({
  slug,
}: z.infer<(typeof TOOL_SCHEMAS)["get_practitioner"]>): Promise<
  { practitioner: PractitionerDetail; summary: string } | { error: string }
> {
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
  const detail: PractitionerDetail = { ...toHit(p), bio: p.bio, values: p.values, website: p.website, credentials };
  return { practitioner: detail, summary: "Share a bit about them in your own warm words — don't just recite the bio." };
}

export async function runReflectPriorities({
  priorities,
  note,
}: z.infer<(typeof TOOL_SCHEMAS)["reflect_priorities"]>): Promise<PriorityReflection & { summary: string }> {
  return { priorities, note, summary: "Reflection shown. Invite them to correct or add anything — don't assume it's complete." };
}

export async function runShowCrisisResources(): Promise<CrisisResources & { summary: string }> {
  return {
    note: "What you're carrying matters, and you deserve support right now — more than a directory can give in this moment.",
    lines: [
      { label: "988 Suicide & Crisis Lifeline", detail: "Call or text 988 (24/7, free, confidential)" },
      { label: "Crisis Text Line", detail: "Text HOME to 741741" },
      { label: "Emergency", detail: "If you're in immediate danger, call 911" },
    ],
    summary:
      "Crisis resources are now on screen. Acknowledge their courage in sharing and gently encourage them to reach " +
      "out. IMPORTANT: say the key numbers OUT LOUD too — that they can call or text 988 right now, any time, and " +
      "911 if they're in immediate danger — don't rely on the screen alone (they may not be looking). Then let them " +
      "lead; do not pivot back to matching unless they clearly want to.",
  };
}

export async function runSaveIntake(
  input: z.infer<(typeof TOOL_SCHEMAS)["save_intake"]>,
  source: "chat" | "voice" = "chat",
): Promise<IntakeSaved> {
  const clean = validateIntake(input as IntakeInput);
  if (!clean.ok) return { ok: false, error: clean.error };
  try {
    await db.seekerIntake.create({ data: { ...clean.value, fieldValues: { __source: source }, userId: null } });
    return { ok: true, name: clean.value.name };
  } catch {
    return { ok: false, error: "I couldn't send that just now — could you try once more in a moment?" };
  }
}

/**
 * Validate raw args + run a tool by name — the entry point for the VOICE agent's realtime
 * tool calls (the model's args arrive as untyped JSON over the data channel). Always resolves
 * to a JSON-serializable result; never throws, so a function_call_output always lands.
 */
export async function executeOnboardingTool(name: string, rawArgs: unknown): Promise<unknown> {
  try {
    switch (name) {
      case "search_practitioners": {
        const p = TOOL_SCHEMAS.search_practitioners.safeParse(rawArgs ?? {});
        return p.success ? await runSearchPractitioners(p.data) : { error: "Bad arguments for search." };
      }
      case "get_practitioner": {
        const p = TOOL_SCHEMAS.get_practitioner.safeParse(rawArgs ?? {});
        return p.success ? await runGetPractitioner(p.data) : { error: "Bad arguments." };
      }
      case "reflect_priorities": {
        const p = TOOL_SCHEMAS.reflect_priorities.safeParse(rawArgs ?? {});
        return p.success ? await runReflectPriorities(p.data) : { error: "Bad arguments." };
      }
      case "show_crisis_resources":
        return await runShowCrisisResources();
      case "save_intake": {
        const p = TOOL_SCHEMAS.save_intake.safeParse(rawArgs ?? {});
        return p.success ? await runSaveIntake(p.data, "voice") : { ok: false, error: "I still need your name and email." };
      }
      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch {
    return { error: "That didn't work just now — let's keep going and try again." };
  }
}
