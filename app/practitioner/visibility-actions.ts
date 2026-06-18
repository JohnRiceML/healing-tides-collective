"use server";

import { getPractitioner } from "@/lib/auth";
import { searchSerpPage, searchPlaces, type SerpPage } from "@/lib/serper";
import {
  buildCoverageQueries,
  buildCoverage,
  evaluateMapPack,
  hostOf,
  type Coverage,
  type MapPack,
} from "@/lib/visibility";

export type AuditResult =
  | { ok: false; reason: "unauthenticated" | "not_practitioner" | "no_region" | "unconfigured" }
  | { ok: true; coverage: Coverage };

/**
 * On-demand "how people find you" coverage scan for the signed-in practitioner. Expands
 * their Areas of Focus into the real local searches seekers type, checks each via Serper
 * (one /search call per term — also harvesting the "people also ask" + related-search
 * signals we used to discard), and returns a calm, appear-first coverage read.
 *
 * Read-only on our side (getPractitioner never promotes); button-triggered only — Serper
 * costs per call, so this never runs on a plain page load.
 */
export async function runVisibilityAudit(): Promise<AuditResult> {
  const result = await getPractitioner();
  if (!result) return { ok: false, reason: "unauthenticated" };
  if (!result.practitioner) return { ok: false, reason: "not_practitioner" };

  const p = result.practitioner;
  const queries = buildCoverageQueries(p.specialties ?? [], p.region ?? null);
  if (!queries.length) return { ok: false, reason: "no_region" };
  if (!process.env.SERPER_API_KEY) return { ok: false, reason: "unconfigured" };

  const identity = {
    name: (p.displayName ?? "").trim(),
    domain: p.website ? hostOf(p.website) : null,
    profilePath: p.slug ? `/practitioners/${p.slug}` : "",
  };

  const perTerm: Array<{ query: string; label: string; page: SerpPage }> = [];
  for (const q of queries) {
    const page = await searchSerpPage(q.query, { num: 10 });
    perTerm.push({ query: q.query, label: q.label, page });
  }

  return { ok: true, coverage: buildCoverage(perTerm, identity) };
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

  const p = result.practitioner;
  const identity = {
    name: (p.displayName ?? "").trim(),
    domain: p.website ? hostOf(p.website) : null,
    profilePath: p.slug ? `/practitioners/${p.slug}` : "",
  };

  const places = await searchPlaces(query);
  return { ok: true, mapPack: evaluateMapPack(places, identity) };
}
