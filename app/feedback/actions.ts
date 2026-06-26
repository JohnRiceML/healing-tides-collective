"use server";

import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";

import { db } from "@/lib/db";
import { clerkEnabled } from "@/lib/clerk-enabled";
import { validateFeedback, type FeedbackInput } from "@/lib/feedback";

const MAX_BYTES = 6 * 1024 * 1024; // 6 MB
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

/**
 * Public feedback submission — anyone, signed in or not. Validates + normalizes (pure
 * validateFeedback), captures context (signed-in user id + role: SEEKER / PRACTITIONER /
 * ADMIN, else ANONYMOUS), and writes the row. Resilient: a DB error (e.g. table not migrated)
 * returns a gentle failure instead of throwing, so the widget can never break the page.
 */
export async function submitFeedback(input: FeedbackInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const clean = validateFeedback(input);
  if (!clean.ok) return clean;

  let userId: string | null = null;
  let role: string | null = "ANONYMOUS";
  if (clerkEnabled) {
    try {
      const a = await auth();
      if (a.userId) {
        userId = a.userId;
        role = "SIGNED_IN"; // signed in, but no local mirror yet
        const u = await db.user.findUnique({ where: { clerkUserId: a.userId }, select: { role: true } });
        if (u) role = u.role; // SEEKER / PRACTITIONER / ADMIN
      }
    } catch {
      /* no Clerk context — anonymous feedback is fine */
    }
  }

  try {
    await db.feedback.create({ data: { ...clean.value, userId, role } });
    return { ok: true };
  } catch {
    return { ok: false, error: "We couldn't save that just now — please try again shortly." };
  }
}

/**
 * Upload a screenshot to attach to feedback. Public (anonymous-friendly — feedback comes from
 * anyone). Image-only, capped at 6 MB. Stored in Vercel Blob; the URL is handed back for the
 * submit. Best-effort — a failure just means the note goes without the image.
 */
export async function uploadFeedbackScreenshot(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const file = formData.get("screenshot");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Pick an image to attach." };
  const ext = ALLOWED[file.type];
  if (!ext) return { ok: false, error: "Use a PNG, JPG, WebP, or GIF image." };
  if (file.size > MAX_BYTES) return { ok: false, error: "That image is over 6 MB — try a smaller one." };

  try {
    const blob = await put(`feedback/shot.${ext}`, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: true,
    });
    return { ok: true, url: blob.url };
  } catch {
    return { ok: false, error: "Couldn't upload that — you can still send your note without it." };
  }
}
