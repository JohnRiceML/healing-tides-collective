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
