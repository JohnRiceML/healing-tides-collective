// Pure helpers for the admin "who's active" read. No DB, no React — fully unit-tested.
//
// "Activity" = is the PRACTITIONER themselves engaged (their own last profile edit or
// sign-in). It is deliberately distinct from *audience traction* (profile views), which
// the admin shows in its own columns — a practitioner can be getting lots of views while
// never logging in, and Nora wants to see both.
//
// `now` and `lastSeenAt` are passed in (never read from the clock / DB here) so this stays
// pure and testable. `lastSeenAt` is optional: it's null until last-seen tracking is on
// (a migration), at which point it sharpens the read without any change here.

export type ActivityState = "new" | "active" | "quiet" | "dormant";

export type ActivitySignals = {
  createdAt: Date;
  updatedAt: Date; // last profile edit — always set
  lastSeenAt?: Date | null; // last sign-in — null until last-seen tracking lands
  now: Date;
};

export type Activity = {
  state: ActivityState;
  label: string;
  /** The most recent engagement signal (profile edit or sign-in). */
  lastSignalAt: Date;
};

const DAY = 24 * 60 * 60 * 1000;

const STATE_LABEL: Record<ActivityState, string> = {
  new: "New",
  active: "Active",
  quiet: "Quiet",
  dormant: "Dormant",
};

/**
 * Classify a practitioner's engagement:
 * - **new** — joined within the last 7 days (give them a beat before judging activity).
 * - **active** — last edit/sign-in within 14 days.
 * - **quiet** — last signal 15–30 days ago.
 * - **dormant** — no signal in 30+ days (a candidate for a gentle nudge).
 */
export function classifyActivity(s: ActivitySignals): Activity {
  const lastSignalAt =
    s.lastSeenAt && s.lastSeenAt.getTime() > s.updatedAt.getTime() ? s.lastSeenAt : s.updatedAt;

  const ageDays = (s.now.getTime() - s.createdAt.getTime()) / DAY;
  const idleDays = (s.now.getTime() - lastSignalAt.getTime()) / DAY;

  let state: ActivityState;
  if (ageDays <= 7) state = "new";
  else if (idleDays <= 14) state = "active";
  else if (idleDays <= 30) state = "quiet";
  else state = "dormant";

  return { state, label: STATE_LABEL[state], lastSignalAt };
}

/**
 * Compact, calm relative time: "now", "5m", "3h", "2d", "3w", "5mo", "1y", or "—" for
 * null/future. Used for "last active" and "last viewed" cells.
 */
export function relativeShort(date: Date | null | undefined, now: Date): string {
  if (!date) return "—";
  const ms = now.getTime() - date.getTime();
  if (ms < 0) return "—";
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (days < 30) return `${weeks}w`;
  const months = Math.floor(days / 30);
  if (days < 365) return `${months}mo`;
  return `${Math.floor(days / 365)}y`;
}
