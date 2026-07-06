"use server";

import { headers } from "next/headers";

import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";

import { db } from "@/lib/db";
import { clerkEnabled } from "@/lib/clerk-enabled";
import { validateFeedback, type FeedbackInput } from "@/lib/feedback";
import { createRateLimiter } from "@/lib/onboarding/voice/rate-limit";

// Best-effort per-IP guards on these public anonymous writes (same posture as the intro/intake
// actions). The screenshot cap is tighter — each upload is up to 6 MB of paid Blob storage.
const feedbackLimiter = createRateLimiter(10, 60 * 60 * 1000); // 10 notes / IP / hour
const screenshotLimiter = createRateLimiter(5, 60 * 60 * 1000); // 5 uploads / IP / hour

/** Per-IP throttle check for the actions below. `null` = fine; else the gentle refusal to return. */
async function throttled(limiter: ReturnType<typeof createRateLimiter>): Promise<string | null> {
  try {
    const ip = ((await headers()).get("x-forwarded-for")?.split(",")[0] || "unknown").trim();
    if (!limiter.check(ip, Date.now()).ok) {
      return "That's a lot of requests in a short time — please try again a little later.";
    }
  } catch {
    /* headers unavailable → skip the guard rather than block a legitimate request */
  }
  return null;
}

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

  const blocked = await throttled(feedbackLimiter);
  if (blocked) return { ok: false, error: blocked };

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

  const blocked = await throttled(screenshotLimiter);
  if (blocked) return { ok: false, error: blocked };

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
