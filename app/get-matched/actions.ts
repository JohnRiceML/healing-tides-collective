"use server";

import { db } from "@/lib/db";
import { getCurrentDbUser } from "@/lib/auth";
import { validateIntake, type IntakeInput } from "@/lib/seeker-intake";

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
  note?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const slugs = (Array.isArray(input.slugs) ? input.slugs : []).filter((s) => typeof s === "string").slice(0, 20);
  if (slugs.length === 0) return { ok: false, error: "Add at least one practitioner to your list first." };

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
    const intake = await db.seekerIntake.create({
      data: { ...clean.value, fieldValues: { __source: "considering" }, userId },
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
