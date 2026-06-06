"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getOrCreatePractitioner } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { readHold } from "@/app/_lib/moderation";

// An admin hold is a hard stop: while held, the practitioner can edit but cannot change
// their own published status (publish OR unpublish). Only an admin release lifts it.
const HELD_MESSAGE =
  "Your profile is on hold with the Healing Tides team, so it can’t be published right now. Please reach out to hello@healingtides.co — we’re happy to help.";

// Minimum bar to go public: a name + something to read. Keeps empty shells out of
// the directory. (The completeness % is a separate, softer nudge — not a gate.)
function readyToPublish(p: { displayName: string | null; bio: string | null }) {
  return Boolean(p.displayName?.trim() && p.bio?.trim());
}

// Collision-safe unique slug, ignoring the practitioner's own row.
async function uniqueSlug(base: string, selfId: string): Promise<string> {
  let candidate = base;
  for (let i = 2; i < 100; i++) {
    const clash = await db.practitioner.findFirst({
      where: { slug: candidate, NOT: { id: selfId } },
      select: { id: true },
    });
    if (!clash) return candidate;
    candidate = `${base}-${i}`;
  }
  return `${base}-${selfId.slice(0, 6)}`;
}

// A Prisma unique-constraint violation — here, two practitioners racing onto the
// same slug between the uniqueSlug check and the write.
function isUniqueClash(e: unknown): boolean {
  return Boolean(e && typeof e === "object" && (e as { code?: string }).code === "P2002");
}

/** Publish the signed-in practitioner's profile (DRAFT/HIDDEN → PUBLISHED). */
export async function publishProfile() {
  const result = await getOrCreatePractitioner();
  if (!result) return { ok: false as const, error: "You're not signed in." };
  const p = result.practitioner;

  if (readHold(p.fieldValues)) {
    return { ok: false as const, error: HELD_MESSAGE, held: true as const };
  }

  if (!readyToPublish(p)) {
    return {
      ok: false as const,
      error: "Add at least your name and a short bio before publishing.",
    };
  }

  // Keep an existing slug stable (it may already be shared/indexed); mint one once.
  let slug = p.slug ?? (await uniqueSlug(slugify(p.displayName as string), p.id));

  // The uniqueSlug check + write isn't atomic: a concurrent publish could claim the
  // same slug and trip the DB unique constraint. Mint a fresh slug and retry once.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await db.practitioner.update({
        where: { id: p.id },
        data: { visibility: "PUBLISHED", slug },
      });
      revalidatePath("/practitioner");
      revalidatePath("/practitioners");
      revalidatePath(`/practitioners/${slug}`);
      return { ok: true as const, slug };
    } catch (e) {
      if (isUniqueClash(e) && attempt === 0 && !p.slug) {
        slug = await uniqueSlug(slugify(p.displayName as string), p.id);
        continue;
      }
      return {
        ok: false as const,
        error: "Something went wrong publishing your profile — please try again.",
      };
    }
  }
  return {
    ok: false as const,
    error: "Couldn't reserve a profile link — please try again.",
  };
}

/** Take the profile back to DRAFT (off the public directory + slug page). */
export async function unpublishProfile() {
  const result = await getOrCreatePractitioner();
  if (!result) return { ok: false as const, error: "You're not signed in." };
  const p = result.practitioner;

  if (readHold(p.fieldValues)) {
    return { ok: false as const, error: HELD_MESSAGE, held: true as const };
  }

  try {
    await db.practitioner.update({
      where: { id: p.id },
      data: { visibility: "DRAFT" },
    });
  } catch {
    return { ok: false as const, error: "Something went wrong — please try again." };
  }

  revalidatePath("/practitioner");
  revalidatePath("/practitioners");
  if (p.slug) revalidatePath(`/practitioners/${p.slug}`);
  return { ok: true as const };
}
