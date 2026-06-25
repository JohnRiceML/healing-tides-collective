"use server";

import { auth } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { clerkEnabled } from "@/lib/clerk-enabled";
import { validateFeedback, type FeedbackInput } from "@/lib/feedback";

/**
 * Public feedback submission — anyone, signed in or not. Validates + normalizes (pure
 * validateFeedback), captures a best-effort signed-in user id for context, and writes the row.
 * Resilient: a DB error (e.g. the table not migrated yet) returns a gentle failure instead of
 * throwing, so the widget can never break the page it's on.
 */
export async function submitFeedback(input: FeedbackInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const clean = validateFeedback(input);
  if (!clean.ok) return clean;

  let userId: string | null = null;
  if (clerkEnabled) {
    try {
      userId = (await auth()).userId ?? null;
    } catch {
      /* not signed in / no Clerk context — anonymous feedback is fine */
    }
  }

  try {
    await db.feedback.create({ data: { ...clean.value, userId } });
    return { ok: true };
  } catch {
    return { ok: false, error: "We couldn't save that just now — please try again shortly." };
  }
}
