// lib/presence-scan.ts — the cached "presence scan" that lets the brand page's moon states
// move for real. PURE LOGIC + one reserved fieldValues key (no DB, no React, no Serper here).
//
// A presence scan is the result of the on-demand Serper visibility check, persisted under the
// migration-free reserved key `__presenceScan` on the practitioner's fieldValues (same pattern
// as `__hold` / `__verified`). The brand page reads it and feeds the four Serper-backed signals
// into buildBrand, so where_found / who_youre_for / how_remembered advance from "not checked yet".
//
// HONESTY LAW (mirrors brand.ts): we never invent a signal. A field we didn't actually measure
// stays undefined so buildBrand keeps showing the calm "not checked yet" invitation. The delta is
// gain-framed only — we surface what opened up, never what slipped.

import type { BrandSignals } from "@/lib/brand";
import type { Coverage, MapPack } from "@/lib/visibility";

export const PRESENCE_SCAN_KEY = "__presenceScan";

/** What one persisted Serper scan remembers. Stored verbatim in fieldValues.__presenceScan. */
export type PresenceScan = {
  checkedAt: string; // ISO timestamp of the scan
  coverage: { appeared: number; total: number };
  /** Labels of the terms the practitioner currently appears for — used to show what opened up. */
  foundTerms: string[];
  knowledgeGraphPresent: boolean;
  /** Optional: only set when a /places map-pack actually ran during the scan. */
  inAnyMapPack?: boolean;
  reviewsKnown?: boolean;
};

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Read the persisted scan (or null) off a fieldValues blob — defensive, mirrors readHold.
 * Anything malformed reads as "no scan yet" rather than throwing.
 */
export function readPresenceScan(fieldValues: unknown): PresenceScan | null {
  const raw = (fieldValues as Record<string, unknown> | null | undefined)?.[PRESENCE_SCAN_KEY];
  if (!isObj(raw)) return null;
  const cov = isObj(raw.coverage) ? raw.coverage : null;
  if (!cov) return null;
  return {
    checkedAt: typeof raw.checkedAt === "string" ? raw.checkedAt : "",
    coverage: {
      appeared: typeof cov.appeared === "number" ? cov.appeared : 0,
      total: typeof cov.total === "number" ? cov.total : 0,
    },
    foundTerms: Array.isArray(raw.foundTerms)
      ? raw.foundTerms.filter((t): t is string => typeof t === "string")
      : [],
    knowledgeGraphPresent: raw.knowledgeGraphPresent === true,
    inAnyMapPack: typeof raw.inAnyMapPack === "boolean" ? raw.inAnyMapPack : undefined,
    reviewsKnown: typeof raw.reviewsKnown === "boolean" ? raw.reviewsKnown : undefined,
  };
}

/**
 * Pure merge: set the reserved __presenceScan key while preserving every sibling key
 * (incl. other reserved keys like __hold / __verified). Mirrors applyHold's spread.
 * NOTE: write this directly — never route it through mergeFieldValues, which strips `__` keys.
 */
export function applyPresenceScan(existing: unknown, scan: PresenceScan): Record<string, unknown> {
  const ex = isObj(existing) ? existing : {};
  return { ...ex, [PRESENCE_SCAN_KEY]: scan };
}

/**
 * Assemble a PresenceScan from the raw materials of one Serper scan — PURE, so the risky
 * aggregation lives in one unit-tested place instead of inside the server action: the
 * knowledge-graph OR across every searched term, "are you in ANY sampled map pack", and
 * "does YOUR entry carry reviews". Map-pack signals reflect only the terms actually sampled.
 */
export function buildPresenceScan(args: {
  coverage: Coverage;
  /** knowledgeGraphPresent per searched term (Google showed a knowledge panel). */
  perTermKnowledgeGraph: boolean[];
  /** The map packs we actually sampled (the top few coverage terms). */
  sampledMapPacks: MapPack[];
  checkedAt: string;
}): PresenceScan {
  const { coverage, perTermKnowledgeGraph, sampledMapPacks, checkedAt } = args;
  return {
    checkedAt,
    coverage: { appeared: coverage.appeared, total: coverage.total },
    foundTerms: coverage.terms.filter((t) => t.found).map((t) => t.label),
    knowledgeGraphPresent: perTermKnowledgeGraph.some(Boolean),
    inAnyMapPack: sampledMapPacks.some((p) => p.youInPack),
    reviewsKnown: sampledMapPacks.some((p) =>
      p.entries.some((e) => e.isYou && e.ratingCount != null && e.ratingCount > 0),
    ),
  };
}

/**
 * Derive the Serper-backed slice of BrandSignals from a cached scan. Honest about gaps:
 * a field we didn't measure is left undefined so the brand page keeps its calm invitation.
 * coverage is only surfaced when we actually checked terms (total > 0).
 */
export function brandSignalsFromScan(
  scan: PresenceScan | null,
): Pick<BrandSignals, "coverage" | "inAnyMapPack" | "knowledgeGraphPresent" | "reviewsKnown"> {
  if (!scan) return {};
  return {
    ...(scan.coverage.total > 0 ? { coverage: scan.coverage } : {}),
    knowledgeGraphPresent: scan.knowledgeGraphPresent,
    ...(scan.inAnyMapPack !== undefined ? { inAnyMapPack: scan.inAnyMapPack } : {}),
    ...(scan.reviewsKnown !== undefined ? { reviewsKnown: scan.reviewsKnown } : {}),
  };
}

export type PresenceDelta = {
  firstCheck: boolean;
  /** Term labels that appear now but didn't at the previous check. */
  newlyAppeared: string[];
};

/** What opened up between two scans — gain-framed only (we never surface what slipped). */
export function presenceDelta(prev: PresenceScan | null, next: PresenceScan): PresenceDelta {
  if (!prev) return { firstCheck: true, newlyAppeared: [] };
  const before = new Set(prev.foundTerms);
  return {
    firstCheck: false,
    newlyAppeared: next.foundTerms.filter((t) => !before.has(t)),
  };
}

/** Calm one-line copy for the delta, or null when there's nothing encouraging to say. */
export function describeDelta(delta: PresenceDelta): string | null {
  if (delta.firstCheck || delta.newlyAppeared.length === 0) return null;
  if (delta.newlyAppeared.length === 1) {
    return `A new search you’re showing up for since last time: ${delta.newlyAppeared[0]}.`;
  }
  return `${delta.newlyAppeared.length} new searches you’re showing up for since last time.`;
}
