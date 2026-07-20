// "Your presence" logic — the calm, findable-not-promotional surface. All pure +
// unit-tested; the dashboard fetches the raw rows and hands them in. Framing rules
// (from the research): findable not promotional, the score reflects only the
// practitioner's OWN presence (never a rival), gains/possibility never loss/shame.

export type FindabilityStage = "setup" | "findable" | "established";

export type FindabilitySignals = {
  published: boolean;
  completeness: number; // 0–100
  hasContactLink: boolean; // own website OR booking link
  specialtiesCount: number;
  hasRegion: boolean;
};

export type Findability = {
  stage: FindabilityStage;
  /** Bar fill 0–100 — a calm position, NOT a precise grade. */
  pct: number;
  label: string;
  line: string;
};

/**
 * A 3-stage, self-referential read of how easily the right people can find this
 * practitioner. Depends ONLY on their own profile — so it can never punish them for
 * a competitor's move, and always offers a path up.
 */
export function findabilityStage(s: FindabilitySignals): Findability {
  // Established: published, rich, reachable, clearly positioned.
  if (s.published && s.completeness >= 80 && s.hasContactLink && s.specialtiesCount >= 3) {
    return {
      stage: "established",
      pct: 95,
      label: "Well-established",
      line: "The right people can find you across the web — keep it gently current.",
    };
  }
  // Findable: live, with the basics a seeker searches on.
  if (s.published && s.completeness >= 50 && s.hasRegion && s.specialtiesCount >= 1) {
    return {
      stage: "findable",
      pct: 68,
      label: "Findable",
      line: "How easily the right people can find you right now.",
    };
  }
  return {
    stage: "setup",
    pct: 26,
    label: "Getting set up",
    line: "A few small steps and people looking for your care can find you.",
  };
}

export type StageCriteria = {
  stage: FindabilityStage;
  label: string;
  /** What earns this stage, in plain language — derived from findabilityStage's own thresholds. */
  criteria: string[];
};

/**
 * The plain-language answer to "what earns each stage?", kept right beside findabilityStage
 * so the UI copy and the logic can't drift. Digit-free on purpose: the presence/brand surfaces
 * avoid raw numbers, and the descriptions map the thresholds to what a person would actually do
 * (completeness ≥ 50 → "more than half complete", ≥ 80 → "nearly complete", specialties ≥ 1/≥ 3 →
 * "at least one" / "a few", hasRegion → location, hasContactLink → website or booking link).
 */
export const FINDABILITY_CRITERIA: readonly StageCriteria[] = [
  {
    stage: "setup",
    label: "Getting set up",
    criteria: [
      "You’ve started your profile — a name and a short bio are all it takes to begin.",
    ],
  },
  {
    stage: "findable",
    label: "Findable",
    criteria: [
      "Your profile is published",
      "Your location is added",
      "At least one focus area is named",
      "Your profile is more than half complete",
    ],
  },
  {
    stage: "established",
    label: "Well-established",
    criteria: [
      "Your profile is published and nearly complete",
      "A website or booking link is added",
      "A few focus areas are named",
    ],
  },
];

export type WeeklyViews = {
  /** Oldest → newest, one count per week. Length === weeks. */
  buckets: number[];
  thisWeek: number;
  lastWeek: number;
  total: number;
};

/**
 * Bucket raw view timestamps into the last `weeks` 7-day windows ending at `now`.
 * `now` is passed in (not read) so this stays pure + testable.
 */
export function weeklyViewBuckets(viewedAt: Date[], now: Date, weeks = 6): WeeklyViews {
  const end = now.getTime();
  const week = 7 * 24 * 60 * 60 * 1000;
  const buckets = new Array(weeks).fill(0);
  let total = 0;
  for (const d of viewedAt) {
    const ago = end - d.getTime();
    if (ago < 0) continue; // future — ignore
    const idx = Math.floor(ago / week); // 0 = most recent 7 days
    if (idx < weeks) {
      buckets[weeks - 1 - idx] += 1; // newest goes last
      total += 1;
    }
  }
  return { buckets, thisWeek: buckets[weeks - 1], lastWeek: buckets[weeks - 2] ?? 0, total };
}

export type PresenceStep = { label: string; hint: string; href: string };

/**
 * The single gentlest, highest-leverage next step — an invitation, never a backlog.
 * Returns null when there's nothing pressing (graduate them, don't invent a treadmill).
 */
export function presenceNextStep(s: {
  published: boolean;
  hasBio: boolean;
  specialtiesCount: number;
  hasIdealClient: boolean;
  hasContactLink: boolean;
  hasRegion: boolean;
}): PresenceStep | null {
  const edit = "/practitioner/edit";
  if (!s.published) {
    return { label: "Publish your profile", hint: "It only takes a name and a short bio to become findable.", href: edit };
  }
  if (!s.hasRegion) {
    return { label: "Add your location", hint: "It's how people searching nearby find you — and what puts you on the local map.", href: edit };
  }
  if (s.specialtiesCount < 3) {
    return { label: "Name a few more of your focuses", hint: "Profiles with a clear sense of who they help are found by about twice as many of the right people.", href: edit };
  }
  if (!s.hasIdealClient) {
    return { label: "Add a sentence about who you help most", hint: "A clear “who” helps the right people recognize themselves in you.", href: edit };
  }
  if (!s.hasContactLink) {
    return { label: "Add your website or booking link", hint: "It gives seekers a direct next step — and helps search engines connect you.", href: edit };
  }
  return null;
}
