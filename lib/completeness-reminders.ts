// Who should get a "your profile is X% — finish when you're ready" nudge, and the migration-free
// reserved key that records when we last reminded them. PURE LOGIC (no DB, no email) so the
// selection rules are unit-tested. The actual send is an admin-triggered action (Nora chooses
// when) — see app/admin/actions.ts sendCompletenessReminders.

/** Reserved fieldValues key: ISO timestamp of the last completeness reminder we sent them.
 *  Written by direct spread (NEVER mergeFieldValues, which strips `__` keys) — read defensively. */
export const REMINDER_KEY = "__completenessReminder";

export function readLastReminder(fieldValues: unknown): string | null {
  if (!fieldValues || typeof fieldValues !== "object") return null;
  const v = (fieldValues as Record<string, unknown>)[REMINDER_KEY];
  return typeof v === "string" ? v : null;
}

export type ReminderCandidate = {
  id: string;
  displayName: string | null;
  email: string | null;
  completeness: number;
  lastReminderAt: string | null; // from readLastReminder
  held: boolean; // on a moderation hold
};

export type ReminderOpts = { now: Date; cooldownDays?: number; maxCompleteness?: number };

/**
 * Filter to the practitioners worth nudging: they have an email, aren't on hold, their profile is
 * still under `maxCompleteness` (default 80%), and we haven't reminded them within `cooldownDays`
 * (default 7) — the cooldown is what stops a double-click from spamming anyone.
 */
export function selectReminderRecipients(
  candidates: ReminderCandidate[],
  opts: ReminderOpts,
): ReminderCandidate[] {
  const cooldownMs = (opts.cooldownDays ?? 7) * 86_400_000;
  const max = opts.maxCompleteness ?? 80;
  return candidates.filter((c) => {
    if (!c.email) return false; // can't reach them
    if (c.held) return false; // never nudge a held/moderated profile
    if (c.completeness >= max) return false; // complete enough — leave them be
    if (c.lastReminderAt) {
      const last = Date.parse(c.lastReminderAt);
      if (Number.isFinite(last) && opts.now.getTime() - last < cooldownMs) return false; // in cooldown
    }
    return true;
  });
}
