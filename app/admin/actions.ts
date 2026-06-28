"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { RESERVED_BADGES_KEY, sanitizeGrant, grantedBadgesFrom } from "@/app/_lib/verification";
import { VERIFICATION_KEY, type VerificationStatus } from "@/app/_lib/credentials";
import { isValidStatus, type FeedbackStatus } from "@/lib/feedback";
import { applyHold, applyRelease, coercePrev, readHold } from "@/app/_lib/moderation";
import { newInviteToken, readPrefill, MAX_BULK_INVITES, type InvitePrefill } from "@/lib/invites";
import { SITE_URL } from "@/lib/site";
import { sendEmail, emailConfigured } from "@/lib/email";
import { claimInviteEmail, completenessReminderEmail } from "@/lib/email-templates";
import { selectReminderRecipients, REMINDER_KEY } from "@/lib/completeness-reminders";
import { getReminderCandidates } from "./_data";
import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * Create a claim invite for a waitlist practitioner. ADMIN-ONLY. Persists the invite and,
 * when the email layer is configured, sends the claim link to them. Always returns the URL
 * so the admin can copy/resend it by hand — `emailed` says whether the auto-send landed.
 * Email is best-effort: a send failure never fails the invite (the row is the source of truth).
 * Does NOT create a Practitioner row, so an un-claimed invite never hits the directory.
 */
type MintResult =
  | { ok: true; url: string; emailed: boolean; emailReason?: "not_configured" | "http_error" | "exception" }
  | { ok: false; error: string };

/**
 * Core invite mint: validate → persist the row → best-effort send the claim email. NO auth + NO
 * revalidate (callers do those once). Shared by `createInvite` (single) and `createInvitesFromRows` (many)
 * so the email/prefill behavior can't drift between the two paths.
 */
async function mintAndEmailInvite(input: {
  email: string;
  displayName?: string;
  prefill?: InvitePrefill;
}): Promise<MintResult> {
  const email = input.email.trim().toLowerCase();
  if (!email) return { ok: false, error: "An email is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "That doesn't look like a valid email address." };
  }

  const token = newInviteToken();
  const displayName = input.displayName?.trim() || null;
  try {
    await db.invite.create({
      data: { token, email, displayName, prefill: (input.prefill ?? {}) as Prisma.InputJsonValue },
    });
  } catch {
    return { ok: false, error: "Couldn't create the invite — please try again." };
  }

  const url = `${SITE_URL}/claim/${token}`;
  let emailed = false;
  let emailReason: "not_configured" | "http_error" | "exception" | undefined;
  if (emailConfigured()) {
    const content = claimInviteEmail({ name: displayName, url, email, importUrl: readPrefill(input.prefill).importUrl });
    const sent = await sendEmail({ to: email, ...content });
    emailed = sent.ok;
    if (!sent.ok) emailReason = sent.reason; // 'http_error' | 'exception' — it tried and failed
  } else {
    emailReason = "not_configured"; // email layer is off; the link still works by hand
  }

  return { ok: true, url, emailed, emailReason };
}

export async function createInvite(input: {
  email: string;
  displayName?: string;
  prefill?: InvitePrefill;
}): Promise<MintResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Not authorized." };
  const res = await mintAndEmailInvite(input);
  if (res.ok) revalidatePath("/admin");
  return res;
}

export type BulkInviteRow = { email: string; ok: boolean; url?: string; emailed?: boolean; error?: string };
export type BulkInviteResult =
  | { ok: false; error: string }
  | {
      ok: true;
      summary: {
        created: number;
        emailed: number;
        failed: number;
        skippedExisting: number;
        invalid: number;
        duplicates: number;
      };
      rows: BulkInviteRow[];
      invalid: { line: number; raw: string; reason: string }[];
    };

/**
 * Invite many practitioners from hand-edited rows (the admin pastes a list, it's parsed into editable
 * rows client-side, they tweak, then submit). ADMIN-ONLY. Normalizes + de-dupes by email, skips emails
 * that already have a PENDING invite (so a re-submit can't double-email anyone), then mints +
 * best-effort emails each. Returns a per-row result + summary so the admin sees what sent, what's a
 * copyable link, and what was skipped/failed.
 */
export async function createInvitesFromRows(
  inputRows: { email: string; displayName?: string; importUrl?: string }[],
): Promise<BulkInviteResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Not authorized." };

  // Normalize + de-dupe by email (the row could carry blanks / casing / dupes after hand-editing).
  const seen = new Set<string>();
  const clean: { email: string; displayName?: string; importUrl?: string }[] = [];
  let duplicates = 0;
  for (const r of Array.isArray(inputRows) ? inputRows.slice(0, MAX_BULK_INVITES) : []) {
    const email = (r?.email ?? "").trim().toLowerCase();
    if (!email) continue;
    if (seen.has(email)) {
      duplicates++;
      continue;
    }
    seen.add(email);
    clean.push({
      email,
      displayName: r.displayName?.trim() || undefined,
      importUrl: r.importUrl?.trim() || undefined,
    });
  }
  if (clean.length === 0) return { ok: false, error: "Add at least one practitioner with an email." };

  // Skip emails that already have an UNCLAIMED invite — a re-submit shouldn't email anyone twice.
  let alreadyInvited = new Set<string>();
  try {
    const existing = await db.invite.findMany({
      where: { email: { in: clean.map((r) => r.email) }, claimedAt: null },
      select: { email: true },
    });
    alreadyInvited = new Set(existing.map((e) => e.email.toLowerCase()));
  } catch {
    /* a read failure shouldn't block inviting — just lose the dedupe safety this run */
  }

  const rows: BulkInviteRow[] = [];
  let skippedExisting = 0;
  for (const r of clean) {
    if (alreadyInvited.has(r.email)) {
      skippedExisting++;
      rows.push({ email: r.email, ok: false, error: "Already has a pending invite — skipped." });
      continue;
    }
    const res = await mintAndEmailInvite({
      email: r.email,
      displayName: r.displayName,
      prefill: r.importUrl ? { importUrl: r.importUrl } : undefined,
    });
    rows.push(
      res.ok
        ? { email: r.email, ok: true, url: res.url, emailed: res.emailed }
        : { email: r.email, ok: false, error: res.error },
    );
  }

  revalidatePath("/admin");
  const created = rows.filter((r) => r.ok).length;
  const emailed = rows.filter((r) => r.ok && r.emailed).length;
  return {
    ok: true,
    summary: {
      created,
      emailed,
      failed: rows.length - created - skippedExisting,
      skippedExisting,
      invalid: 0,
      duplicates,
    },
    rows,
    invalid: [],
  };
}

/**
 * Re-send the claim email for an existing UNCLAIMED invite. ADMIN-ONLY. Best-effort email (same
 * contract as createInvite); refuses a claimed invite so a sent welcome can't be re-triggered.
 */
export async function resendInvite(
  token: string,
): Promise<
  | { ok: true; emailed: boolean; emailReason?: "not_configured" | "http_error" | "exception" }
  | { ok: false; error: string }
> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Not authorized." };

  const invite = await db.invite.findUnique({ where: { token } });
  if (!invite) return { ok: false, error: "Invite not found." };
  if (invite.claimedAt) return { ok: false, error: "Already claimed — nothing to resend." };

  const url = `${SITE_URL}/claim/${invite.token}`;
  let emailed = false;
  let emailReason: "not_configured" | "http_error" | "exception" | undefined;
  if (emailConfigured()) {
    const sent = await sendEmail({
      to: invite.email,
      ...claimInviteEmail({ name: invite.displayName, url, email: invite.email, importUrl: readPrefill(invite.prefill).importUrl }),
    });
    emailed = sent.ok;
    if (!sent.ok) emailReason = sent.reason;
  } else {
    emailReason = "not_configured";
  }
  return { ok: true, emailed, emailReason };
}

/**
 * Revoke an UNCLAIMED invite (delete the row). ADMIN-ONLY. Never deletes a CLAIMED invite — that's
 * a real claim record — so the `claimedAt: null` guard is load-bearing, not cosmetic.
 */
export async function revokeInvite(token: string): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Not authorized." };

  const res = await db.invite.deleteMany({ where: { token, claimedAt: null } });
  if (res.count === 0) return { ok: false, error: "Couldn't revoke — it may already be claimed." };
  revalidatePath("/admin");
  return { ok: true };
}

/**
 * Send a calm "finish your profile" nudge to every under-complete practitioner who's due one
 * (the pure selectReminderRecipients decides who — under 80%, has email, not held, not reminded in
 * the last 7 days). ADMIN-TRIGGERED (Nora chooses when). Records the reminder timestamp on a
 * reserved key so a double-click can't re-spam. Best-effort per recipient; never throws.
 */
export async function sendCompletenessReminders(): Promise<
  | { ok: true; sent: number; eligible: number }
  | { ok: false; error: string }
> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Not authorized." };
  if (!emailConfigured()) {
    return { ok: false, error: "Email isn't switched on yet (set RESEND_API_KEY + EMAIL_FROM)." };
  }

  const recipients = selectReminderRecipients(await getReminderCandidates(), { now: new Date() });
  const editUrl = `${SITE_URL}/practitioner/edit`;

  let sent = 0;
  for (const r of recipients) {
    if (!r.email) continue;
    const content = completenessReminderEmail({ name: r.displayName, completeness: r.completeness, editUrl });
    const result = await sendEmail({ to: r.email, ...content });
    if (!result.ok) continue;
    // Record the reminder (reserved key, direct spread — re-read fresh to avoid clobbering a
    // concurrent __hold/save, same pattern as the presence scan).
    const fresh = await db.practitioner.findUnique({ where: { id: r.id }, select: { fieldValues: true } });
    const current = (fresh?.fieldValues ?? {}) as Record<string, unknown>;
    await db.practitioner.update({
      where: { id: r.id },
      data: { fieldValues: { ...current, [REMINDER_KEY]: new Date().toISOString() } as Prisma.InputJsonValue },
    });
    sent += 1;
  }

  revalidatePath("/admin");
  return { ok: true, sent, eligible: recipients.length };
}

/**
 * Record an admin-assisted credential verification. ADMIN-ONLY. Writes the due-diligence
 * audit (who/when/notes/what-was-seen) under the reserved `__credentialVerification` key, and
 * — on "verified" — grants the `licensed_professional` badge; on "not_found" removes it.
 * Notes are required (the legal record). All reserved keys are written by direct spread so a
 * practitioner save can never forge them.
 */
export async function recordCredentialVerification(
  practitionerId: string,
  input: { status: VerificationStatus; notes: string },
): Promise<{ ok: true; status: VerificationStatus } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Not authorized." };

  const notes = input.notes.trim();
  if (!notes) return { ok: false, error: "Add a short note on what you saw — it's the record." };

  const current = await db.practitioner.findUnique({
    where: { id: practitionerId },
    select: { fieldValues: true },
  });
  if (!current) return { ok: false, error: "Practitioner not found." };

  const existing = (current.fieldValues ?? {}) as Record<string, unknown>;
  const rawCreds = existing.credentials;
  const stated = Array.isArray(rawCreds)
    ? rawCreds.filter((c): c is string => typeof c === "string")
    : typeof rawCreds === "string" && rawCreds.trim()
      ? [rawCreds.trim()]
      : [];

  const attempt = {
    status: input.status,
    by: admin.email?.trim() || "admin",
    at: new Date().toISOString(),
    notes,
    credentials: stated,
  };

  // Badge follows the verdict: verified → grant licensed_professional; not_found → remove it;
  // pending → leave existing badges untouched. Other badges (founding, etc.) are preserved.
  const granted = new Set(grantedBadgesFrom(existing));
  if (input.status === "verified") granted.add("licensed_professional");
  if (input.status === "not_found") granted.delete("licensed_professional");
  const nextBadges = sanitizeGrant([...granted]);

  const next = { ...existing, [VERIFICATION_KEY]: attempt, [RESERVED_BADGES_KEY]: nextBadges };
  try {
    await db.practitioner.update({
      where: { id: practitionerId },
      data: { fieldValues: next as Prisma.InputJsonValue },
    });
  } catch {
    return { ok: false, error: "Couldn't save — please try again." };
  }
  revalidatePath("/admin");
  revalidatePath("/practitioners", "layout"); // the badge shows publicly
  return { ok: true, status: input.status };
}

/**
 * Grant/revoke a practitioner's verification badges. ADMIN-ONLY. Writes the reserved
 * `__verified` key inside the practitioner's fieldValues, preserving all of their own
 * fields. The practitioner's save path can never touch this key (see mergeFieldValues).
 */
export async function setVerificationBadges(
  practitionerId: string,
  badges: string[],
): Promise<{ ok: true; badges: string[] } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Not authorized." };

  const clean = sanitizeGrant(badges);
  const current = await db.practitioner.findUnique({
    where: { id: practitionerId },
    select: { fieldValues: true },
  });
  if (!current) return { ok: false, error: "Practitioner not found." };

  const existing = (current.fieldValues ?? {}) as Record<string, unknown>;
  const next = { ...existing, [RESERVED_BADGES_KEY]: clean };

  try {
    await db.practitioner.update({
      where: { id: practitionerId },
      data: { fieldValues: next as Prisma.InputJsonValue },
    });
  } catch {
    return { ok: false, error: "Couldn't update — please try again." };
  }
  revalidatePath("/admin");
  revalidatePath("/practitioners", "layout"); // directory + every profile under it
  return { ok: true, badges: clean };
}

/**
 * Place a practitioner ON HOLD (hide from the public) or RELEASE them. ADMIN-ONLY.
 *
 * Migration-free: a hold sets visibility=HIDDEN and stores the reason + prior visibility
 * under the reserved `__hold` key (see app/_lib/moderation.ts); release restores them to
 * that prior visibility and clears the hold. The practitioner can still edit while held
 * but can't publish/unpublish (enforced in publish-actions.ts). Every action is recorded
 * in the `__holdHistory` audit trail. Neither key is touchable by the practitioner's own
 * save (mergeFieldValues strips `__` keys).
 */
export async function setProfileHold(
  practitionerId: string,
  input: { held: boolean; message?: string; internalNote?: string },
): Promise<{ ok: true; held: boolean } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Not authorized." };

  const current = await db.practitioner.findUnique({
    where: { id: practitionerId },
    select: { visibility: true, fieldValues: true },
  });
  if (!current) return { ok: false, error: "Practitioner not found." };

  const by = admin.email?.trim() || "admin";
  const at = new Date().toISOString();

  try {
    if (input.held) {
      // Preserve the original prior-visibility if they're already held (re-holding to
      // edit the message shouldn't overwrite prev with HIDDEN).
      const alreadyHeld = readHold(current.fieldValues);
      const prev = alreadyHeld ? alreadyHeld.prev : coercePrev(current.visibility);
      const next = applyHold(current.fieldValues, {
        prev,
        message: input.message ?? "",
        internalNote: input.internalNote ?? "",
        by,
        at,
      });
      await db.practitioner.update({
        where: { id: practitionerId },
        data: { visibility: "HIDDEN", fieldValues: next as Prisma.InputJsonValue },
      });
    } else {
      const { fieldValues, restore } = applyRelease(current.fieldValues, { by, at });
      await db.practitioner.update({
        where: { id: practitionerId },
        data: { visibility: restore, fieldValues: fieldValues as Prisma.InputJsonValue },
      });
    }
  } catch {
    return { ok: false, error: "Couldn't update — please try again." };
  }

  revalidatePath("/admin");
  revalidatePath("/practitioners", "layout"); // directory + every profile under it
  revalidatePath("/practitioner"); // the held practitioner's own editor banner
  return { ok: true, held: input.held };
}

/**
 * Triage a feedback item through the fix-loop. ADMIN-ONLY. Sets the status + an optional note,
 * and stamps resolvedAt when it reaches a closed state (FIXED / WONT_FIX).
 */
export async function setFeedbackStatus(
  id: string,
  input: { status: string; adminNote?: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Not authorized." };
  if (!isValidStatus(input.status)) return { ok: false, error: "Unknown status." };

  const resolved = input.status === "FIXED" || input.status === "WONT_FIX";
  try {
    await db.feedback.update({
      where: { id },
      data: {
        status: input.status as FeedbackStatus,
        adminNote: input.adminNote?.trim() || null,
        resolvedAt: resolved ? new Date() : null,
      },
    });
  } catch {
    return { ok: false, error: "Couldn't update — please try again." };
  }
  revalidatePath("/admin/feedback");
  revalidatePath("/admin");
  return { ok: true };
}

/** Permanently delete a feedback item (spam / handled / noise). ADMIN-ONLY. Unlike invites
 *  there's no claim to protect, so a hard delete is fine. Resilient. */
export async function deleteFeedback(id: string): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Not authorized." };
  try {
    await db.feedback.delete({ where: { id } });
  } catch {
    return { ok: false, error: "Couldn't delete — it may already be gone." };
  }
  revalidatePath("/admin/feedback");
  revalidatePath("/admin");
  return { ok: true };
}
