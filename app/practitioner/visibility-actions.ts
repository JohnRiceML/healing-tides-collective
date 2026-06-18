"use server";

import { revalidatePath } from "next/cache";

import { getPractitioner } from "@/lib/auth";
import { db } from "@/lib/db";
import { searchSerpPage, searchPlaces, type SerpPage } from "@/lib/serper";
import {
  buildCoverageQueries,
  buildCoverage,
  evaluateMapPack,
  hostOf,
  type Coverage,
  type MapPack,
} from "@/lib/visibility";
import {
  applyPresenceScan,
  buildPresenceScan,
  presenceDelta,
  readPresenceScan,
  type PresenceDelta,
  type PresenceScan,
} from "@/lib/presence-scan";
import type { Prisma } from "@/lib/generated/prisma/client";

// How many coverage terms we also check the local map pack for during a full scan. Bounded so
// one scan stays cheap (8 /search + up to this many /places Serper calls). The terms are
// appear-first ordered, so these are the most relevant few.
const MAP_PACK_SAMPLE = 3;

export type AuditResult =
  | { ok: false; reason: "unauthenticated" | "not_practitioner" | "no_region" | "unconfigured" }
  | { ok: true; coverage: Coverage; scan: PresenceScan; delta: PresenceDelta };

/** The calm identity used to recognise the practitioner in a SERP / map pack. */
function identityOf(p: { displayName: string | null; website: string | null; slug: string | null }) {
  return {
    name: (p.displayName ?? "").trim(),
    domain: p.website ? hostOf(p.website) : null,
    profilePath: p.slug ? `/practitioners/${p.slug}` : "",
  };
}

/**
 * On-demand "how people find you" coverage scan for the signed-in practitioner. Expands
 * their Areas of Focus into the real local searches seekers type, checks each via Serper
 * (one /search call per term — also harvesting the "people also ask" + related-search
 * signals we used to discard), samples the local map pack for the most relevant few terms,
 * and returns a calm, appear-first coverage read.
 *
 * Side effect (deliberate, user-triggered): the result is cached under the reserved
 * `__presenceScan` fieldValues key so the brand page's moon states reflect it on every later
 * visit without re-paying Serper. The cache write is best-effort — a DB hiccup never breaks
 * the live read below. getPractitioner stays read-only (never promotes a seeker).
 */
export async function runVisibilityAudit(): Promise<AuditResult> {
  const result = await getPractitioner();
  if (!result) return { ok: false, reason: "unauthenticated" };
  if (!result.practitioner) return { ok: false, reason: "not_practitioner" };

  const p = result.practitioner;
  const queries = buildCoverageQueries(p.specialties ?? [], p.region ?? null);
  if (!queries.length) return { ok: false, reason: "no_region" };
  if (!process.env.SERPER_API_KEY) return { ok: false, reason: "unconfigured" };

  const identity = identityOf(p);

  const perTerm: Array<{ query: string; label: string; page: SerpPage }> = [];
  for (const q of queries) {
    const page = await searchSerpPage(q.query, { num: 10 });
    perTerm.push({ query: q.query, label: q.label, page });
  }

  const coverage = buildCoverage(perTerm, identity);

  // Sample the local map pack for the most relevant few terms (appear-first ordered) so "are
  // you on the local map" + "do you have reviews" can move too, at a bounded extra cost.
  const sampledMapPacks: MapPack[] = [];
  for (const term of coverage.terms.slice(0, MAP_PACK_SAMPLE)) {
    sampledMapPacks.push(evaluateMapPack(await searchPlaces(term.query), identity));
  }

  // All the signal aggregation lives in the pure (unit-tested) buildPresenceScan.
  const scan = buildPresenceScan({
    coverage,
    perTermKnowledgeGraph: perTerm.map((t) => t.page.knowledgeGraphPresent),
    sampledMapPacks,
    checkedAt: new Date().toISOString(),
  });

  // Persist the scan (best-effort). Reserved `__` key, written directly via applyPresenceScan
  // (NOT mergeFieldValues, which strips `__` keys) so it preserves __hold / __verified siblings.
  // Re-read fieldValues immediately before the write: the scan above spends seconds in Serper,
  // and merging onto that stale snapshot could clobber a concurrent admin hold or profile save.
  let delta: PresenceDelta = { firstCheck: true, newlyAppeared: [] };
  try {
    const fresh = await db.practitioner.findUnique({
      where: { id: p.id },
      select: { fieldValues: true },
    });
    const current = fresh?.fieldValues ?? p.fieldValues;
    delta = presenceDelta(readPresenceScan(current), scan);
    await db.practitioner.update({
      where: { id: p.id },
      data: { fieldValues: applyPresenceScan(current, scan) as Prisma.InputJsonValue },
    });
    revalidatePath("/practitioner/brand");
    revalidatePath("/practitioner");
  } catch {
    // Caching is best-effort; the live result below still renders. We couldn't persist, so
    // there's no reliable "since last time" baseline — show a neutral (no-delta) reading
    // rather than a delta computed against a snapshot that may already be stale.
    delta = { firstCheck: false, newlyAppeared: [] };
  }

  return { ok: true, coverage, scan, delta };
}

export type MapPackResult =
  | { ok: true; mapPack: MapPack }
  | { ok: false; reason: "unauthenticated" | "not_practitioner" | "unconfigured" };

/**
 * The local Google "map pack" (Places 3-pack) for one coverage term — the calm terrain
 * behind a single search. Per-row disclosure on the visibility card: a seeker expands one
 * term, we fetch that term's Places results and mark which row (if any) is the practitioner.
 *
 * Read-only (getPractitioner never promotes); lazily triggered per row — Serper /places
 * costs per call, so this only runs when a practitioner opens a specific term.
 */
export async function getTermMapPack(query: string): Promise<MapPackResult> {
  const result = await getPractitioner();
  if (!result) return { ok: false, reason: "unauthenticated" };
  if (!result.practitioner) return { ok: false, reason: "not_practitioner" };
  if (!process.env.SERPER_API_KEY) return { ok: false, reason: "unconfigured" };

  const places = await searchPlaces(query);
  return { ok: true, mapPack: evaluateMapPack(places, identityOf(result.practitioner)) };
}
