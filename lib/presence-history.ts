// lib/presence-history.ts — a small rolling history of past presence scans, so the brand center
// can show MOVEMENT over time ("two more searches find you than when you started"), not just a
// point-in-time read. PURE + one reserved fieldValues key (__presenceScanHistory), same migration-
// free pattern as __presenceScan / __hold.
//
// GAIN-ONLY (brand law): we surface what's opened up, never what slipped. A flat or lower reading
// reads as "steady / still tending," never as a loss or a number going down.

import type { PresenceScan } from "@/lib/presence-scan";

export const PRESENCE_HISTORY_KEY = "__presenceScanHistory";

/** One compact point in time — just enough to draw the trend + diff the doors that opened. */
export type PresenceSnapshot = {
  checkedAt: string; // ISO
  appeared: number;
  total: number;
  foundTerms: string[];
};

const MAX_SNAPSHOTS = 8; // ~1–2 weeks of checks (one point per day); cap keeps the sparkline readable.

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function dayOf(iso: string): string {
  return iso.slice(0, 10); // YYYY-MM-DD
}

/** A compact snapshot of one completed scan, for the history. */
export function snapshotOf(scan: PresenceScan): PresenceSnapshot {
  return {
    checkedAt: scan.checkedAt,
    appeared: scan.coverage.appeared,
    total: scan.coverage.total,
    foundTerms: scan.foundTerms,
  };
}

/** Read the rolling history (or []) off a fieldValues blob — defensive, never throws. */
export function readPresenceHistory(fieldValues: unknown): PresenceSnapshot[] {
  const raw = (fieldValues as Record<string, unknown> | null | undefined)?.[PRESENCE_HISTORY_KEY];
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isObj)
    .filter((s) => typeof s.checkedAt === "string" && s.checkedAt)
    .map((s) => ({
      checkedAt: s.checkedAt as string,
      appeared: typeof s.appeared === "number" ? s.appeared : 0,
      total: typeof s.total === "number" ? s.total : 0,
      foundTerms: Array.isArray(s.foundTerms)
        ? s.foundTerms.filter((t): t is string => typeof t === "string")
        : [],
    }));
}

/**
 * Append a snapshot, keeping at most MAX_SNAPSHOTS. Multiple checks on the SAME day replace
 * that day's entry rather than piling up — so the trend reads as one point per day, not per click.
 */
export function appendSnapshot(
  history: PresenceSnapshot[],
  snap: PresenceSnapshot,
  cap = MAX_SNAPSHOTS,
): PresenceSnapshot[] {
  const last = history[history.length - 1];
  const base =
    last && dayOf(last.checkedAt) === dayOf(snap.checkedAt) ? history.slice(0, -1) : history;
  return [...base, snap].slice(-cap);
}

export type MomentumState = "new" | "growing" | "steady" | "quiet";

export type Momentum = {
  state: MomentumState;
  checks: number;
  firstCheckedAt: string;
  /** appeared-count per check, oldest → newest (for a calm sparkline). */
  appearedSeries: number[];
  /** Terms the right person finds you for now but didn't at the first check (gain-only). */
  newlyFound: string[];
};

/**
 * Read the trend from the history — gain-framed. "growing" ONLY when MORE searches find them than
 * at the first check (so the "more searches finding you" copy is literally true); "steady" when
 * holding or a gentle dip (never framed as a loss — and a new door that opened at a flat count is
 * still celebrated separately via `newlyFound`); "quiet" when nothing appears yet; "new" until
 * there are two checks to compare.
 */
export function buildMomentum(history: PresenceSnapshot[]): Momentum {
  if (!history.length) {
    return { state: "new", checks: 0, firstCheckedAt: "", appearedSeries: [], newlyFound: [] };
  }
  const first = history[0];
  const last = history[history.length - 1];
  const firstSet = new Set(first.foundTerms);
  const newlyFound = last.foundTerms.filter((t) => !firstSet.has(t));

  let state: MomentumState;
  if (history.length < 2) state = "new";
  else if (last.appeared === 0) state = "quiet";
  else if (last.appeared > first.appeared) state = "growing";
  else state = "steady";

  return {
    state,
    checks: history.length,
    firstCheckedAt: first.checkedAt,
    appearedSeries: history.map((h) => h.appeared),
    newlyFound,
  };
}
