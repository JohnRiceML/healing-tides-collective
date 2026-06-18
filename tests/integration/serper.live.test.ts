// Live Serper integration check — makes a REAL call to google.serper.dev, so it's
// gated on SERPER_API_KEY and needs network. Part of the integration suite (excluded
// from `npm test`); run with the key set:
//
//   set -a; source .env.local; set +a; npm run test:integration
//
// Skips (green) when SERPER_API_KEY is unset. Exercises the whole chain the dashboard
// card uses — buildAuditQueries → searchSerp → evaluateQuery — and logs the results so
// you can eyeball that real SERP data comes back.

import { describe, it, expect } from "vitest";

import { searchSerp, searchSerpPage, searchPlaces } from "@/lib/serper";
import { buildAuditQueries, buildCoverageQueries, buildCoverage, evaluateQuery, evaluateMapPack } from "@/lib/visibility";

const hasKey = Boolean(process.env.SERPER_API_KEY);

describe.skipIf(!hasKey)("Serper live integration", () => {
  it(
    "returns real organic results for a local-intent query",
    async () => {
      const [query] = buildAuditQueries(["grief_loss"], "Saint Paul, Minnesota");
      expect(query).toBe("Grief & Loss Saint Paul, Minnesota");

      const results = await searchSerp(query, { num: 5 });

      // eslint-disable-next-line no-console
      console.log(
        `\n[serper] "${query}" → ${results.length} results:\n` +
          results.slice(0, 5).map((r) => `  ${r.position}. ${r.title}  —  ${r.link}`).join("\n") +
          "\n",
      );

      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty("link");
      expect(results[0].link).toMatch(/^https?:\/\//);
    },
    20_000,
  );

  it("captures the SERP signals we used to discard (people-also-ask + related searches)", async () => {
    const page = await searchSerpPage("somatic therapy Saint Paul, Minnesota", { num: 10 });
    // eslint-disable-next-line no-console
    console.log(
      `\n[serpPage] organic=${page.organic.length} · knowledgeGraph=${page.knowledgeGraphPresent}\n` +
        `  people also ask:\n${page.peopleAlsoAsk.slice(0, 4).map((q) => `    · ${q}`).join("\n")}\n` +
        `  related searches: ${page.relatedSearches.slice(0, 6).join(" · ")}\n`,
    );
    expect(page.organic.length).toBeGreaterThan(0);
  }, 20_000);

  it("builds a real coverage read for a multi-specialty practitioner", async () => {
    const queries = buildCoverageQueries(["trauma_recovery", "relationships_connection"], "Saint Paul, Minnesota");
    const perTerm = [];
    for (const q of queries.slice(0, 4)) {
      perTerm.push({ query: q.query, label: q.label, page: await searchSerpPage(q.query, { num: 10 }) });
    }
    const cov = buildCoverage(perTerm, { name: "Psychology Today", domain: "psychologytoday.com", profilePath: "" });
    // eslint-disable-next-line no-console
    console.log(
      `\n[coverage] appears for ${cov.appeared} of ${cov.total} searches:\n` +
        cov.terms.map((t) => `    ${t.found ? "●" : "○"} ${t.label} — ${t.found ? `#${t.position}` : "not yet"}`).join("\n") +
        `\n  questions seekers ask: ${cov.questions.length} · related terms: ${cov.relatedSearches.length}\n`,
    );
    expect(cov.total).toBeGreaterThan(0);
  }, 30_000);

  it("reads the local Google map pack (3-pack) for a term", async () => {
    const places = await searchPlaces("trauma therapy Saint Paul, Minnesota");
    const pack = evaluateMapPack(places, { name: "Psychology Today", domain: "psychologytoday.com", profilePath: "" });
    // eslint-disable-next-line no-console
    console.log(
      `\n[mapPack] ${places.length} places · youInPack=${pack.youInPack}\n` +
        pack.entries.slice(0, 3).map((e) => `    ${e.isYou ? "● you" : "  ·"} ${e.title} — ${e.ratingCount ?? 0} reviews · ${e.rating ?? "—"} · ${e.category ?? ""}`).join("\n") +
        "\n",
    );
    expect(Array.isArray(places)).toBe(true);
  }, 20_000);

  it("evaluates whether a sample practitioner appears", async () => {
    const query = buildAuditQueries(["anxiety_stress"], "Saint Paul, Minnesota")[0];
    const results = await searchSerp(query, { num: 10 });
    const verdict = evaluateQuery(query, results, {
      name: "Psychology Today",
      domain: "psychologytoday.com",
      profilePath: "",
    });
    // eslint-disable-next-line no-console
    console.log(`[serper] "${query}" → psychologytoday.com found=${verdict.found} position=${verdict.position}`);
    expect(typeof verdict.found).toBe("boolean");
  }, 20_000);
});
