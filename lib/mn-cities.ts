// Canonical Minnesota city registry + free-text normalizer — the geo backbone for the
// programmatic content layer (/care/[specialty]/[city]) and for matching practitioners'
// free-text `region` values ("St. Paul", "Saint Paul, MN", "Minneapolis, Minnesota") to a
// canonical city. Pure + client-safe (no db). The list is the demand-map's priority set:
// the Twin Cities metro + the outstate anchors — not every MN town (thin pages get no route).

export type MnCity = {
  /** URL slug, e.g. "saint-paul" */
  slug: string;
  /** Display name, e.g. "Saint Paul" */
  name: string;
  /** Loose match tokens (lowercased) that identify this city in free text. */
  aliases: string[];
  /** Metro = Twin Cities metro area; outstate = the regional anchors. */
  area: "metro" | "outstate";
};

export const MN_CITIES: readonly MnCity[] = [
  { slug: "minneapolis", name: "Minneapolis", aliases: ["minneapolis", "mpls"], area: "metro" },
  { slug: "saint-paul", name: "Saint Paul", aliases: ["saint paul", "st paul", "st. paul"], area: "metro" },
  { slug: "bloomington", name: "Bloomington", aliases: ["bloomington"], area: "metro" },
  { slug: "edina", name: "Edina", aliases: ["edina"], area: "metro" },
  { slug: "minnetonka", name: "Minnetonka", aliases: ["minnetonka"], area: "metro" },
  { slug: "eden-prairie", name: "Eden Prairie", aliases: ["eden prairie"], area: "metro" },
  { slug: "st-louis-park", name: "St. Louis Park", aliases: ["st louis park", "st. louis park", "saint louis park"], area: "metro" },
  { slug: "plymouth", name: "Plymouth", aliases: ["plymouth"], area: "metro" },
  { slug: "maple-grove", name: "Maple Grove", aliases: ["maple grove"], area: "metro" },
  { slug: "woodbury", name: "Woodbury", aliases: ["woodbury"], area: "metro" },
  { slug: "eagan", name: "Eagan", aliases: ["eagan"], area: "metro" },
  { slug: "burnsville", name: "Burnsville", aliases: ["burnsville"], area: "metro" },
  { slug: "roseville", name: "Roseville", aliases: ["roseville"], area: "metro" },
  { slug: "duluth", name: "Duluth", aliases: ["duluth"], area: "outstate" },
  { slug: "rochester", name: "Rochester", aliases: ["rochester"], area: "outstate" },
  { slug: "st-cloud", name: "St. Cloud", aliases: ["st cloud", "st. cloud", "saint cloud"], area: "outstate" },
  { slug: "mankato", name: "Mankato", aliases: ["mankato"], area: "outstate" },
  { slug: "moorhead", name: "Moorhead", aliases: ["moorhead"], area: "outstate" },
];

const bySlug = new Map(MN_CITIES.map((c) => [c.slug, c]));

export function mnCityBySlug(slug: string): MnCity | null {
  return bySlug.get(slug.toLowerCase().trim()) ?? null;
}

/** Strip punctuation + collapse whitespace so alias matching is resilient to commas/periods. */
function fold(text: string): string {
  return ` ${text.toLowerCase().replace(/[.,]/g, " ").replace(/\s+/g, " ").trim()} `;
}

/**
 * EVERY listed city a free-text region matches — the set semantics of the directory query
 * (`region contains <any alias>`), so a practitioner in "Minneapolis and St. Paul" counts toward
 * both city pages. Use this wherever supply is COUNTED (the sitemap), so it can never disagree
 * with what the page itself renders. Use mnCityFromText when you need a single best city.
 */
export function mnCitiesFromText(text: string | null | undefined): MnCity[] {
  if (!text || !text.trim()) return [];
  const hay = fold(text);
  return MN_CITIES.filter((city) => city.aliases.some((alias) => hay.includes(` ${alias} `)));
}

/**
 * Find the canonical MN city in a free-text region string ("St. Paul, MN", "Minneapolis,
 * Minnesota, United States", "Telehealth from Edina"). Longest alias wins so "st louis park"
 * beats "st paul"-style prefix collisions. Null when no listed city matches — callers must
 * treat that as "no city page", never guess.
 */
export function mnCityFromText(text: string | null | undefined): MnCity | null {
  if (!text || !text.trim()) return null;
  const hay = fold(text);
  let best: MnCity | null = null;
  let bestLen = 0;
  for (const city of MN_CITIES) {
    for (const alias of city.aliases) {
      if (alias.length > bestLen && hay.includes(` ${alias} `)) {
        best = city;
        bestLen = alias.length;
      }
    }
  }
  return best;
}
