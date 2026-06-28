"use server";

import { headers } from "next/headers";

import { db } from "@/lib/db";
import { getCurrentDbUser } from "@/lib/auth";
import { validateIntake, type IntakeInput } from "@/lib/seeker-intake";
import { createRateLimiter } from "@/lib/onboarding/voice/rate-limit";

// Best-effort per-IP guard on the public intro write (same posture as the voice endpoints).
const introLimiter = createRateLimiter(8, 60 * 60 * 1000); // 8 intro requests / IP / hour

/**
 * Store a seeker's intake. Anonymous-friendly (no account needed — most seekers don't want one).
 * Resilient: validation errors + a DB failure both return a gentle { ok:false } so the flow never
 * throws into the page. Minimal PII by design (name + email only) — see the schema's HIPAA note.
 */
export async function submitIntake(input: IntakeInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const clean = validateIntake(input);
  if (!clean.ok) return clean;

  // Best-effort signed-in user id for context — never block on it (seekers are usually anonymous).
  let userId: string | null = null;
  try {
    userId = (await getCurrentDbUser())?.id ?? null;
  } catch {
    /* anonymous is fine */
  }

  try {
    await db.seekerIntake.create({ data: { ...clean.value, userId } });
    return { ok: true };
  } catch {
    return { ok: false, error: "We couldn't send that just now — please try again in a moment." };
  }
}

/**
 * The "have Nora introduce you" path: the seeker built a shortlist anonymously (client-side), and
 * NOW consents to share name + email so a person can warmly introduce them. THIS is the consent +
 * server-storage moment (nothing was stored while they browsed). Creates an intake pre-loaded with
 * their chosen practitioners as the shortlist, landing in Nora's matching workspace. Resilient.
 */
export async function requestIntro(input: {
  name: string;
  email: string;
  slugs: string[];
  consent: boolean;
  note?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  // Consent is the boundary for this storage event — verify + record it server-side, not just in
  // the UI, so there's a durable, provable consent trail (matters for the HIPAA posture).
  if (input.consent !== true) {
    return { ok: false, error: "Please check the consent box so we know it's okay to reach out." };
  }

  const slugs = (Array.isArray(input.slugs) ? input.slugs : []).filter((s) => typeof s === "string").slice(0, 20);
  if (slugs.length === 0) return { ok: false, error: "Add at least one practitioner to your list first." };

  try {
    const ip = ((await headers()).get("x-forwarded-for")?.split(",")[0] || "unknown").trim();
    if (!introLimiter.check(ip, Date.now()).ok) {
      return { ok: false, error: "That's a lot of requests in a short time — please try again a little later." };
    }
  } catch {
    /* headers unavailable → skip the guard rather than block a legitimate request */
  }

  const story =
    input.note?.trim() ||
    "Reached out via guided discovery — would like a warm introduction to the practitioners they saved.";
  const clean = validateIntake({ name: input.name, email: input.email, story });
  if (!clean.ok) return clean;

  let userId: string | null = null;
  try {
    userId = (await getCurrentDbUser())?.id ?? null;
  } catch {
    /* anonymous is fine */
  }

  try {
    // Only PUBLISHED practitioners can be matched to.
    const pracs = await db.practitioner.findMany({
      where: { slug: { in: slugs }, visibility: "PUBLISHED" },
      select: { id: true },
    });
    // Persist the FULL intended list (incl. any since-unpublished) so the seeker's choices are never
    // silently lost; flag for Nora when some couldn't be matched. Record the consent fact.
    const adminNote =
      pracs.length < slugs.length
        ? `Seeker saved ${slugs.length} practitioner(s); ${pracs.length} currently published. Full list in fieldValues.savedSlugs.`
        : null;
    const intake = await db.seekerIntake.create({
      data: {
        ...clean.value,
        adminNote,
        fieldValues: { __source: "considering", savedSlugs: slugs, consentedAt: new Date().toISOString(), consentVersion: "v1" },
        userId,
      },
    });
    if (pracs.length > 0) {
      await db.match.createMany({
        data: pracs.map((p) => ({
          seekerIntakeId: intake.id,
          practitionerId: p.id,
          status: "SUGGESTED" as const,
          reason: "Saved by the seeker during guided discovery.",
        })),
        skipDuplicates: true,
      });
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "We couldn't send that just now — please try again in a moment." };
  }
}
