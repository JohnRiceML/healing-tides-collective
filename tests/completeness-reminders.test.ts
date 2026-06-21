import { describe, it, expect } from "vitest";

import {
  selectReminderRecipients,
  readLastReminder,
  REMINDER_KEY,
  type ReminderCandidate,
} from "@/lib/completeness-reminders";

const NOW = new Date("2026-06-20T12:00:00.000Z");
const base = (over: Partial<ReminderCandidate> = {}): ReminderCandidate => ({
  id: "p",
  displayName: "P",
  email: "p@example.com",
  completeness: 40,
  lastReminderAt: null,
  held: false,
  ...over,
});

describe("selectReminderRecipients", () => {
  it("includes an under-complete practitioner with an email and no recent reminder", () => {
    expect(selectReminderRecipients([base()], { now: NOW })).toHaveLength(1);
  });

  it("excludes anyone without an email (can't reach them)", () => {
    expect(selectReminderRecipients([base({ email: null })], { now: NOW })).toHaveLength(0);
  });

  it("never nudges a held / moderated profile", () => {
    expect(selectReminderRecipients([base({ held: true })], { now: NOW })).toHaveLength(0);
  });

  it("excludes anyone already complete enough (>= 80% by default)", () => {
    expect(selectReminderRecipients([base({ completeness: 80 })], { now: NOW })).toHaveLength(0);
    expect(selectReminderRecipients([base({ completeness: 79 })], { now: NOW })).toHaveLength(1);
  });

  it("respects the cooldown — skips a recent reminder, includes an old one", () => {
    const recent = new Date(NOW.getTime() - 2 * 86_400_000).toISOString(); // 2 days ago
    const old = new Date(NOW.getTime() - 10 * 86_400_000).toISOString(); // 10 days ago
    expect(selectReminderRecipients([base({ lastReminderAt: recent })], { now: NOW })).toHaveLength(0);
    expect(selectReminderRecipients([base({ lastReminderAt: old })], { now: NOW })).toHaveLength(1);
  });

  it("honors custom threshold + cooldown", () => {
    expect(selectReminderRecipients([base({ completeness: 50 })], { now: NOW, maxCompleteness: 40 })).toHaveLength(0);
    const oneDayAgo = new Date(NOW.getTime() - 86_400_000).toISOString();
    expect(selectReminderRecipients([base({ lastReminderAt: oneDayAgo })], { now: NOW, cooldownDays: 0 })).toHaveLength(1);
  });
});

describe("readLastReminder — defensive", () => {
  it("reads the reserved key, else null", () => {
    expect(readLastReminder({ [REMINDER_KEY]: "2026-06-01T00:00:00.000Z" })).toBe("2026-06-01T00:00:00.000Z");
    expect(readLastReminder({})).toBeNull();
    expect(readLastReminder(null)).toBeNull();
    expect(readLastReminder({ [REMINDER_KEY]: 123 })).toBeNull();
  });
});
