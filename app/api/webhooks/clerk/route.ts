// Clerk → our DB sync. This is the bridge that keeps account status and PUBLIC VISIBILITY
// from drifting: a Clerk ban only blocks login, so on its own it would leave the profile
// live. When Clerk bans/locks/deletes a user, we auto-HOLD (hide) their practitioner
// profile in our DB — which is the single source of truth for what's public.
//
// Security: unauthenticated endpoint, verified by the Svix signature (CLERK_WEBHOOK_SIGNING_SECRET).
// Setup: add the secret to env, then in the Clerk dashboard create a webhook to
//   POST https://<your-domain>/api/webhooks/clerk  subscribed to user.updated + user.deleted.
//
// Soft, never destructive: we hide, we don't delete — data + audit survive (an admin can
// Release later from /admin).
//
// OPEN DECISION (M0 "account deletion" + GDPR erasure): user.deleted currently HIDES,
// same as a ban — which is NOT true erasure. The schema is erasure-ready (Practitioner
// → User is onDelete: Cascade, so deleting the User row also removes ProfileView), but
// the Vercel Blob photo would still need explicit cleanup. Whether a voluntary deletion
// should hard-erase is a legal call (Christie). Recommended split, pending sign-off:
// ban/lock → hide (preserve audit); voluntary user.deleted → erase. See
// docs/BUILD-TRACKER.md § Open decisions #7.

import { Webhook } from "svix";

import { db } from "@/lib/db";
import { applyHold, coercePrev } from "@/app/_lib/moderation";
import type { Prisma } from "@/lib/generated/prisma/client";

export const runtime = "nodejs"; // svix + Prisma need the Node runtime

type ClerkEvent = { type: string; data: Record<string, unknown> };

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!secret) {
    // Not wired yet — fail loud-but-safe so it's obvious in logs, without 500-looping.
    return new Response("Clerk webhook not configured", { status: 501 });
  }

  const body = await req.text();
  const headers = {
    "svix-id": req.headers.get("svix-id") ?? "",
    "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
    "svix-signature": req.headers.get("svix-signature") ?? "",
  };

  let evt: ClerkEvent;
  try {
    evt = new Webhook(secret).verify(body, headers) as ClerkEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const data = evt.data ?? {};
  const clerkUserId = typeof data.id === "string" ? data.id : null;

  // Hide on delete, or on an update that flips the account to banned/locked.
  const bannedOrLocked = data.banned === true || data.locked === true;
  const shouldHide =
    evt.type === "user.deleted" || (evt.type === "user.updated" && bannedOrLocked);

  if (shouldHide && clerkUserId) {
    const p = await db.practitioner.findFirst({
      where: { user: { clerkUserId } },
      select: { id: true, visibility: true, fieldValues: true },
    });

    // Only act if there's a profile that isn't already hidden — keeps it idempotent.
    if (p && p.visibility !== "HIDDEN") {
      const reason = evt.type === "user.deleted" ? "Account deleted in Clerk." : "Account banned in Clerk.";
      const next = applyHold(p.fieldValues, {
        prev: coercePrev(p.visibility),
        message: reason,
        internalNote: reason,
        by: "system (Clerk webhook)",
        at: new Date().toISOString(),
      });
      await db.practitioner.update({
        where: { id: p.id },
        data: { visibility: "HIDDEN", fieldValues: next as Prisma.InputJsonValue },
      });
    }
  }

  return new Response("ok", { status: 200 });
}
