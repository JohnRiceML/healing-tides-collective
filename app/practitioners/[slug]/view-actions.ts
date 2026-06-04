"use server";

import { db } from "@/lib/db";
import { getCurrentDbUser } from "@/lib/auth";

/**
 * Record a single public-profile view for the PUBLISHED practitioner at `slug`:
 * append a ProfileView row and bump the denormalized `viewCount`. Self-views (the
 * owner looking at their own page) are skipped so the count reflects real visitors.
 *
 * Fire-and-forget from the page's <ViewBeacon> — everything is wrapped so a failure
 * (e.g. an unconfigured DB locally) never throws into the render or the client.
 */
export async function recordProfileView(slug: string): Promise<void> {
  try {
    const practitioner = await db.practitioner.findFirst({
      where: { slug, visibility: "PUBLISHED" },
      select: { id: true, userId: true },
    });
    if (!practitioner) return;

    // Don't count the owner viewing their own profile.
    const viewer = await getCurrentDbUser();
    if (viewer && viewer.id === practitioner.userId) return;

    await db.profileView.create({ data: { practitionerId: practitioner.id } });
    await db.practitioner.update({
      where: { id: practitioner.id },
      data: { viewCount: { increment: 1 } },
    });
  } catch {
    // Never surface a counting failure to the page — views are best-effort.
  }
}
