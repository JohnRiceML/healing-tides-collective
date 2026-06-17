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

import { searchSerp } from "@/lib/serper";
import { buildAuditQueries, evaluateQuery } from "@/lib/visibility";

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
