"use server";

// Seeker-account actions for the saved "basket". Gated to the signed-in user; resilient
// (resolve to {ok:false} rather than throwing) so a pre-migration call degrades quietly.

import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { getCurrentDbUser, clerkEnabled } from "@/lib/auth";
import { emailConfigured, sendEmail } from "@/lib/email";
import { seekerWelcomeEmail } from "@/lib/email-templates";
import { SITE_URL } from "@/lib/site";

/**
 * Merge a set of practitioner slugs (the anonymous client-side basket) into the signed-in
 * user's account. Idempotent via skipDuplicates; only PUBLISHED practitioners are saved.
 * Called once when a fresh account lands on the dashboard.
 */
export async function syncSaved(slugs: string[]): Promise<{ ok: boolean; added: number }> {
  const user = await getCurrentDbUser();
  if (!user) return { ok: false, added: 0 };

  const clean = Array.from(
    new Set((Array.isArray(slugs) ? slugs : []).filter((s) => typeof s === "string" && s.length < 200)),
  ).slice(0, 50);
  if (clean.length === 0) return { ok: true, added: 0 };

  try {
    const pracs = await db.practitioner.findMany({
      where: { slug: { in: clean }, visibility: "PUBLISHED" },
      select: { id: true },
    });
    if (pracs.length === 0) return { ok: true, added: 0 };
    // `added` is the TRUE number of new rows (createMany's count), not how many slugs matched —
    // so SaveSync only refreshes when something actually changed (already-saved → added: 0).
    const res = await db.savedPractitioner.createMany({
      data: pracs.map((p) => ({ userId: user.id, practitionerId: p.id })),
      skipDuplicates: true,
    });
    revalidatePath("/dashboard");
    return { ok: true, added: res.count };
  } catch {
    return { ok: false, added: 0 };
  }
}

/**
 * Send the seeker welcome email once, on first dashboard visit (after syncSaved, so the
 * count is accurate). Idempotent via User.welcomedAt; a no-op when email isn't configured
 * or the user has no address. Fully resilient — never throws into the client.
 */
export async function ensureWelcomed(): Promise<{ ok: boolean; sent: boolean }> {
  const user = await getCurrentDbUser();
  if (!user) return { ok: false, sent: false };
  try {
    if (user.welcomedAt || !user.email || !emailConfigured()) return { ok: true, sent: false };

    // Build the content first — a failure here (e.g. pre-migration count) happens before we claim,
    // so it never leaves a stuck "welcomed" stamp with no email sent.
    const cu = clerkEnabled ? await currentUser() : null;
    const savedCount = await db.savedPractitioner.count({ where: { userId: user.id } });
    const content = seekerWelcomeEmail({
      name: cu?.firstName ?? null,
      dashboardUrl: `${SITE_URL}/dashboard`,
      savedCount,
    });

    // Atomic claim: a conditional UPDATE ... WHERE welcomed_at IS NULL. Exactly one concurrent
    // first-visit wins the right to send, so two tabs / a double-render can't double-send.
    const claimed = await db.user.updateMany({
      where: { id: user.id, welcomedAt: null },
      data: { welcomedAt: new Date() },
    });
    if (claimed.count === 0) return { ok: true, sent: false }; // someone else already claimed it

    const res = await sendEmail({ to: user.email, ...content });
    if (!res.ok) {
      // sendEmail never throws — it RESOLVES to {ok:false} on a transient http/network failure.
      // Release the claim so the next dashboard visit retries instead of silently never sending.
      await db.user.updateMany({ where: { id: user.id }, data: { welcomedAt: null } });
      return { ok: false, sent: false };
    }
    return { ok: true, sent: true };
  } catch {
    return { ok: false, sent: false };
  }
}

/** Remove one practitioner (by slug) from the signed-in user's saved list. */
export async function unsaveBySlug(slug: string): Promise<{ ok: boolean }> {
  const user = await getCurrentDbUser();
  if (!user || typeof slug !== "string") return { ok: false };
  try {
    await db.savedPractitioner.deleteMany({ where: { userId: user.id, practitioner: { slug } } });
    revalidatePath("/dashboard");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
