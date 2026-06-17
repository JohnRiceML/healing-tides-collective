"use server";

import { getPractitioner } from "@/lib/auth";
import { searchSerp } from "@/lib/serper";
import { buildAuditQueries, evaluateQuery, hostOf, type QueryVisibility } from "@/lib/visibility";

export type VisibilityReport =
  | { ok: false; reason: "unauthenticated" | "not_practitioner" | "no_region" | "unconfigured" }
  | { ok: true; queries: QueryVisibility[] };

/**
 * On-demand local-visibility check for the signed-in practitioner: "do you show up
 * when a seeker searches '{your specialty} {your city}' on Google?" Runs a few SERP
 * queries via Serper and reports whether they appear (and who's ahead of them).
 *
 * Read-only on our side (getPractitioner never promotes). Triggered by an explicit
 * button, so it never runs on a plain page load — Serper costs money per call.
 */
export async function runVisibilityAudit(): Promise<VisibilityReport> {
  const result = await getPractitioner();
  if (!result) return { ok: false, reason: "unauthenticated" };
  if (!result.practitioner) return { ok: false, reason: "not_practitioner" };

  const p = result.practitioner;
  const queries = buildAuditQueries(p.specialties ?? [], p.region ?? null);
  if (!queries.length) return { ok: false, reason: "no_region" };
  if (!process.env.SERPER_API_KEY) return { ok: false, reason: "unconfigured" };

  const identity = {
    name: (p.displayName ?? "").trim(),
    domain: p.website ? hostOf(p.website) : null,
    profilePath: p.slug ? `/practitioners/${p.slug}` : "",
  };

  const reports: QueryVisibility[] = [];
  for (const q of queries) {
    const serp = await searchSerp(q, { num: 10 });
    reports.push(evaluateQuery(q, serp, identity));
  }
  return { ok: true, queries: reports };
}
