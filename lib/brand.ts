// lib/brand.ts — the 5-dimension brand framework, PURE LOGIC (no DB, no React, no Serper calls).
//
// This module turns a set of already-gathered `BrandSignals` into a calm, trauma-informed
// read of a practitioner's presence. It is the single source of truth for the framework's
// shape — five dimensions in a fixed order, each with a plain-spoken intro, a worst-truthful
// state, and 1–3 gentle insights.
//
// BRAND LAW encoded here: no scores / %, no grades, no comparison to others, never "behind",
// never a fake AI score. The Lift axis is about energy (gentle / moderate / deeper), not size.
// "Why care" is always seeker-centered — who it helps the right person find them. Serper-backed
// signals (`coverage`, `inAnyMapPack`, `knowledgeGraphPresent`) are OPTIONAL: when undefined we
// surface a calm "not checked yet" invitation at state `not_started`, never an invented value.

export type DimensionState = "not_started" | "forming" | "on_its_way" | "settled";
export type Lift = "gentle" | "moderate" | "deeper";
export type DimensionId =
  | "who_you_are"
  | "who_youre_for"
  | "where_found"
  | "why_trusted"
  | "how_remembered";

export type Insight = {
  id: string;
  what: string; // a plain observation of THEIR data, kind not a verdict (≤ ~14 words)
  whyCare: string; // one sentence, seeker-centered ("the right person finds you"), never "you're behind"
  whatNext: string; // one soft action, starts with a verb (≤ ~18 words)
  lift: Lift;
  state: DimensionState;
  ctaHref?: string; // e.g. "/practitioner/edit"
  ctaLabel?: string; // e.g. "Open my profile"
};

export type Dimension = {
  id: DimensionId;
  name: string;
  intro: string;
  /** Plain-language "why this part matters" — for the guided experience. */
  why: string;
  state: DimensionState;
  /** Personal PROGRESS, 0–100 — how formed THIS part of their brand is. Never a grade, never a
   *  comparison to other practitioners. The moon `state` is just this score, banded. */
  score: number;
  insights: Insight[];
};

/** What a dimension builder returns; buildBrand layers on the score + banded state + `why`. */
type DimensionCore = Omit<Dimension, "why" | "score">;

export type BrandSignals = {
  published: boolean;
  completeness: number; // 0–100, from completenessOf
  hasBio: boolean;
  hasValues: boolean;
  hasPhoto: boolean;
  hasModality: boolean;
  hasWebsite: boolean;
  hasRegion: boolean;
  specialtiesCount: number;
  coverage?: { appeared: number; total: number }; // undefined = not checked yet (Serper, on-demand)
  inAnyMapPack?: boolean;
  knowledgeGraphPresent?: boolean;
  reviewsKnown?: boolean;
  weeklyViews?: { thisWeek: number; total: number };
};

/** The single most-grounding next step — what to begin with, given where they are now. */
export type NextStep = { dimensionId: DimensionId; insight: Insight };

export type Brand = {
  dimensions: Dimension[]; // 5 dimensions, fixed order
  overall: string;
  /** Personal progress across the whole brand, 0–100 (the average of the five parts). */
  overallScore: number;
  /** The one foundational step to lead with — or null when nothing's pressing (tend it). */
  nextStep: NextStep | null;
};

// The fixed order the product surfaces them in. Exported so tests + UI can assert order.
export const DIMENSION_ORDER: DimensionId[] = [
  "who_you_are",
  "who_youre_for",
  "where_found",
  "why_trusted",
  "how_remembered",
];

const PROFILE_CTA = { ctaHref: "/practitioner/edit", ctaLabel: "Open my profile" } as const;

// ── small pure helpers ──────────────────────────────────────────────────────

/** The "worst-truthful" of several states — so a dimension never reads further along
 * than its least-ready part. Order: not_started < forming < on_its_way < settled. */
const STATE_RANK: Record<DimensionState, number> = {
  not_started: 0,
  forming: 1,
  on_its_way: 2,
  settled: 3,
};

function worstOf(states: DimensionState[]): DimensionState {
  if (states.length === 0) return "not_started";
  return states.reduce((worst, s) =>
    STATE_RANK[s] < STATE_RANK[worst] ? s : worst,
  );
}

/** Roll the dimension's own state up from its insights' states (worst-truthful). NOTE: a builder's
 * state is provisional — buildBrand REPLACES it with the score-banded state (stateFromScore) so the
 * moon and the number can never contradict. Kept here because DimensionCore needs a state. */
function stateFromInsights(insights: Insight[]): DimensionState {
  return worstOf(insights.map((i) => i.state));
}

// ── progress scoring (0–100) ─────────────────────────────────────────────────
// A personal PROGRESS read of how formed each part is — never a grade, never a comparison. Each
// insight contributes its state's worth; the dimension score is their average. "not_started" keeps
// a small base because being here at all is the start (and a stark 0 would read as judgment). The
// moon `state` is just this score, banded — so the number and the moon can never contradict.

const STATE_POINTS: Record<DimensionState, number> = {
  not_started: 8,
  forming: 38,
  on_its_way: 68,
  settled: 100,
};

function scoreFromInsights(insights: Insight[]): number {
  if (insights.length === 0) return STATE_POINTS.not_started;
  const total = insights.reduce((sum, i) => sum + STATE_POINTS[i.state], 0);
  return Math.round(total / insights.length);
}

/** The moon state for a score — bands chosen so a single-insight part lands on its own state. */
export function stateFromScore(score: number): DimensionState {
  if (score >= 85) return "settled";
  if (score >= 55) return "on_its_way";
  if (score >= 25) return "forming";
  return "not_started";
}

/** Plain-language "why this part matters for being found" — the guided layer, per dimension. */
const DIMENSION_WHY: Record<DimensionId, string> = {
  who_you_are: "It's the first thing a seeker feels — whether you're someone they can trust enough to reach out to.",
  who_youre_for: "It's how the right person recognizes their own need in your words, and knows you're for them.",
  where_found: "It's whether someone searching for the kind of care you offer actually finds their way to you.",
  why_trusted: "It's what helps a nervous seeker feel safe enough to take the first step toward you.",
  how_remembered: "It's whether your name stays with someone while they're deciding who to reach out to.",
};

// ── dimension: who you are ──────────────────────────────────────────────────
// Identity — bio, values, photo, modality, overall completeness.

function whoYouAre(s: BrandSignals): DimensionCore {
  const insights: Insight[] = [];

  // Bio — the voice.
  if (!s.hasBio) {
    insights.push({
      id: "who-bio",
      what: "Your profile doesn't have a few words from you yet.",
      whyCare: "A seeker reads your bio to feel whether you're someone they can open up to.",
      whatNext: "Add a short bio in your own voice — a paragraph is plenty to start.",
      lift: "moderate",
      state: "not_started",
      ...PROFILE_CTA,
    });
  }

  // Values — what healing means to them.
  if (!s.hasValues) {
    insights.push({
      id: "who-values",
      what: "What healing means to you isn't shared yet.",
      whyCare: "The right person recognizes themselves in your values before they ever reach out.",
      whatNext: "Share a line or two on what healing means to you.",
      lift: "gentle",
      state: "not_started",
      ...PROFILE_CTA,
    });
  }

  // Photo — a face to meet.
  if (!s.hasPhoto) {
    insights.push({
      id: "who-photo",
      what: "There's no photo on your profile yet.",
      whyCare: "Seeing your face helps a nervous seeker feel safe enough to take the first step.",
      whatNext: "Add a warm, recent photo whenever you're ready.",
      lift: "gentle",
      state: "not_started",
      ...PROFILE_CTA,
    });
  }

  // When the core of identity is present, reflect that back warmly.
  if (insights.length === 0) {
    const settled = s.hasModality && s.completeness >= 80;
    insights.push({
      id: "who-present",
      what: "Your bio, values, and photo are all here.",
      whyCare: "A seeker can already sense who you are before the first message.",
      whatNext: settled
        ? "Revisit your bio now and then as your practice grows."
        : "Add how you work to round out your profile when you have a moment.",
      lift: "gentle",
      state: settled ? "settled" : "on_its_way",
      ...PROFILE_CTA,
    });
  }

  return {
    id: "who_you_are",
    name: "Who you are",
    intro:
      "This is the part of you a seeker meets first — your voice, your values, your face. It's how someone senses, before a single word is exchanged, whether you're a person they can trust.",
    state: stateFromInsights(insights),
    insights,
  };
}

// ── dimension: who you're for ───────────────────────────────────────────────
// Specialties / areas of focus (+ optional coverage as supporting context).

function whoYoureFor(s: BrandSignals): DimensionCore {
  const insights: Insight[] = [];

  if (s.specialtiesCount === 0) {
    insights.push({
      id: "for-specialties",
      what: "Your areas of focus aren't named yet.",
      whyCare: "Someone searching for exactly your kind of help can only find you once it's named.",
      whatNext: "Add the few areas you most love to work in.",
      lift: "moderate",
      state: "not_started",
      ...PROFILE_CTA,
    });
  } else if (s.specialtiesCount < 3) {
    insights.push({
      id: "for-specialties",
      what: `You've named ${s.specialtiesCount} area${s.specialtiesCount === 1 ? "" : "s"} of focus.`,
      whyCare: "A couple more makes it easier for the right person to recognize their need in your words.",
      whatNext: "Add one or two more areas you feel at home working in.",
      lift: "gentle",
      state: "forming",
      ...PROFILE_CTA,
    });
  } else {
    insights.push({
      id: "for-specialties",
      what: `You've named ${s.specialtiesCount} areas of focus.`,
      whyCare: "A seeker can see clearly that you're for them.",
      whatNext: "Keep these current as your practice shifts.",
      lift: "gentle",
      state: "settled",
      ...PROFILE_CTA,
    });
  }

  // Coverage, when checked, gently confirms whether those focus words actually surface.
  if (s.coverage) {
    const { appeared, total } = s.coverage;
    const someAppear = appeared > 0;
    insights.push({
      id: "for-coverage",
      what: someAppear
        ? "Some of your focus areas already surface in search."
        : "Your focus areas haven't shown up in search yet.",
      whyCare: "When your words match a seeker's words, the right person lands on you.",
      whatNext: someAppear
        ? "Echo your focus areas in your bio so they show up more often."
        : "Weave your focus areas into your bio so search can connect them to you.",
      lift: "moderate",
      // appeared===0 across a real check is still "forming" (not a verdict) — never not_started here.
      state: appeared >= total && total > 0 ? "settled" : someAppear ? "on_its_way" : "forming",
    });
  }

  return {
    id: "who_youre_for",
    name: "Who you're for",
    intro:
      "Not everyone is your person — and that's the point. When you name who you're for, the seeker who needs exactly your kind of care can recognize themselves and exhale.",
    state: stateFromInsights(insights),
    insights,
  };
}

// ── dimension: where you're found ───────────────────────────────────────────
// Published + region, plus the OPTIONAL Serper coverage / map-pack / weekly views.

function whereFound(s: BrandSignals): DimensionCore {
  const insights: Insight[] = [];

  // The foundation: is the profile live, with a place attached?
  if (!s.published) {
    insights.push({
      id: "found-published",
      what: "Your profile isn't visible to seekers yet.",
      whyCare: "A seeker can only find you once your profile is out in the world.",
      whatNext: "Publish your profile when it feels ready — you can keep refining after.",
      lift: "moderate",
      state: "not_started",
      ...PROFILE_CTA,
    });
  }
  if (!s.hasRegion) {
    insights.push({
      id: "found-region",
      what: "Your profile doesn't say where you're based.",
      whyCare: "Many seekers look for someone near them, or who knows their corner of the world.",
      whatNext: "Add your region so nearby seekers can find you.",
      lift: "gentle",
      state: "not_started",
      ...PROFILE_CTA,
    });
  }

  // OPTIONAL Serper coverage — undefined means we simply haven't looked yet.
  if (s.coverage === undefined) {
    insights.push({
      id: "found-coverage-uninvited",
      what: "We haven't looked at how you show up in search yet.",
      whyCare: "A gentle look shows where a seeker might already be finding you online.",
      whatNext: "Run a presence check whenever you're curious — there's no rush.",
      lift: "gentle",
      state: "not_started",
    });
  } else {
    const { appeared, total } = s.coverage;
    insights.push({
      id: "found-coverage",
      what:
        appeared > 0
          ? "You already appear in some search results."
          : "You don't surface in search results yet.",
      whyCare: "Each place you appear is another doorway for the right person to find you.",
      whatNext:
        appeared > 0
          ? "Keep your profile fresh so these doorways stay open."
          : "Give it a little time — presence builds gently as your profile settles in.",
      lift: "moderate",
      state: appeared >= total && total > 0 ? "settled" : appeared > 0 ? "on_its_way" : "forming",
    });
  }

  // OPTIONAL map-pack — only speak to it if we actually checked.
  if (s.inAnyMapPack !== undefined) {
    insights.push({
      id: "found-mappack",
      what: s.inAnyMapPack
        ? "You show up in a local map result."
        : "You're not in a local map result yet.",
      whyCare: "Seekers looking for someone nearby often start with the map.",
      whatNext: s.inAnyMapPack
        ? "Keep your location details current so the map keeps you."
        : "A complete location and an active web presence help the map find you over time.",
      lift: s.inAnyMapPack ? "gentle" : "deeper",
      state: s.inAnyMapPack ? "on_its_way" : "forming",
    });
  }

  // Weekly views — quiet encouragement, never a metric to chase.
  if (s.weeklyViews && s.weeklyViews.total > 0) {
    insights.push({
      id: "found-views",
      what: "People have been finding their way to your profile.",
      whyCare: "Each visit is a person quietly considering whether you're their person.",
      whatNext: "Keep your profile warm and current for everyone who arrives.",
      lift: "gentle",
      state: "on_its_way",
    });
  }

  return {
    id: "where_found",
    name: "Where you're found",
    intro:
      "This is about being findable, not promotional. When a seeker goes looking — on a map, in a search, through a friend — these are the quiet doorways that lead them gently to you.",
    state: stateFromInsights(insights),
    insights,
  };
}

// ── dimension: why you're trusted ───────────────────────────────────────────
// Reviews (known) + website as a place that vouches for them.

function whyTrusted(s: BrandSignals): DimensionCore {
  const insights: Insight[] = [];

  // Reviews — only speak to them as known/unknown, never as a count or rating to chase.
  if (s.reviewsKnown) {
    insights.push({
      id: "trusted-reviews",
      what: "People have left words about working with you.",
      whyCare: "A seeker leans on others' experiences to feel safe choosing you.",
      whatNext: "Let happy clients know a few words would mean a lot, whenever it feels right.",
      lift: "gentle",
      state: "on_its_way",
    });
  } else {
    insights.push({
      id: "trusted-reviews",
      what: "We don't see any reviews tied to you yet.",
      whyCare: "A few honest words from past clients help a seeker trust the leap.",
      whatNext: "When the moment feels right, invite a client or two to share their experience.",
      lift: "moderate",
      state: "not_started",
    });
  }

  // Website — a home of their own that vouches for them.
  if (!s.hasWebsite) {
    insights.push({
      id: "trusted-website",
      what: "There's no website linked from your profile.",
      whyCare: "A seeker often visits your own space to feel they know you before reaching out.",
      whatNext: "Link your website if you have one — even a simple page helps.",
      lift: "gentle",
      state: "not_started",
      ...PROFILE_CTA,
    });
  } else {
    insights.push({
      id: "trusted-website",
      what: "Your website is linked from your profile.",
      whyCare: "A seeker can step into your own space and feel they know you.",
      whatNext: "Keep your website in step with your profile so the two feel like one.",
      lift: "gentle",
      state: "on_its_way",
      ...PROFILE_CTA,
    });
  }

  return {
    id: "why_trusted",
    name: "Why you're trusted",
    intro:
      "Trust is what lets a seeker take the leap. The words others have shared, and the spaces that carry your name, all quietly reassure someone that they're in good hands.",
    state: stateFromInsights(insights),
    insights,
  };
}

// ── dimension: how you're remembered ────────────────────────────────────────
// Knowledge-graph / entity presence. NEVER a fake AI score — undefined/false ⇒
// a calm "build an entity over time" invitation at not_started.

function howRemembered(s: BrandSignals): DimensionCore {
  const insights: Insight[] = [];

  if (s.knowledgeGraphPresent === true) {
    insights.push({
      id: "remembered-entity",
      what: "Search engines recognize you as a distinct person.",
      whyCare: "When you're a known name, a seeker who half-remembers you can find their way back.",
      whatNext: "Keep your name and details consistent everywhere so this recognition holds.",
      lift: "gentle",
      state: "on_its_way",
    });
  } else {
    // Covers both undefined (not checked) and false (checked, not present yet).
    // Either way: a calm, no-number invitation — never an invented score.
    insights.push({
      id: "remembered-entity",
      what: "You're not yet recognized as a distinct name online.",
      whyCare: "Becoming a known name means someone who half-remembers you can still find their way back.",
      whatNext: "Build an entity over time — consistent name, links, and mentions, with no rush.",
      lift: "deeper",
      state: "not_started",
    });
  }

  return {
    id: "how_remembered",
    name: "How you're remembered",
    intro:
      "This is the slowest, most patient layer — becoming a name the world recognizes. It grows over time, on its own quiet schedule, and there's nothing to force here.",
    state: stateFromInsights(insights),
    insights,
  };
}

// ── overall ─────────────────────────────────────────────────────────────────
// A single calm sentence — NO number, no grade, no comparison. Reflects the
// general shape of where things are without ranking the practitioner.

function buildOverall(dimensions: Dimension[]): string {
  const states = dimensions.map((d) => d.state);
  const allSettled = states.every((st) => st === "settled");
  const noneStarted = states.every((st) => st === "not_started");
  const someMoving = states.some(
    (st) => st === "on_its_way" || st === "settled" || st === "forming",
  );

  if (allSettled) {
    return "Your presence is settled and whole — the right people can find their way to you.";
  }
  if (noneStarted) {
    return "Your presence is just beginning, and that's a gentle, hopeful place to start.";
  }
  if (someMoving) {
    return "Your presence is taking shape, and each small step helps the right person find you.";
  }
  return "Your presence is finding its form, one calm step at a time.";
}

// ── public entry point ──────────────────────────────────────────────────────

/**
 * The single step to lead with — grounding the page in where they are *now*. The most
 * foundational gap first: the first `not_started` insight in dimension order, else the
 * first `forming`. Null when nothing's pressing — then we invite them to simply tend it.
 */
function pickNextStep(dimensions: Dimension[]): NextStep | null {
  for (const rank of ["not_started", "forming"] as DimensionState[]) {
    for (const d of dimensions) {
      const insight = d.insights.find((i) => i.state === rank);
      if (insight) return { dimensionId: d.id, insight };
    }
  }
  return null;
}

export function buildBrand(signals: BrandSignals): Brand {
  const builders: Record<DimensionId, (s: BrandSignals) => DimensionCore> = {
    who_you_are: whoYouAre,
    who_youre_for: whoYoureFor,
    where_found: whereFound,
    why_trusted: whyTrusted,
    how_remembered: howRemembered,
  };

  const dimensions: Dimension[] = DIMENSION_ORDER.map((id) => {
    const dim = builders[id](signals);
    // Defensive: never surface more than 3 insights per dimension.
    const insights = dim.insights.slice(0, 3);
    const score = scoreFromInsights(insights);
    // The moon is just the score, banded — so the number and the moon can never contradict.
    return { ...dim, insights, score, state: stateFromScore(score), why: DIMENSION_WHY[id] };
  });

  const overallScore = Math.round(
    dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length,
  );

  return {
    dimensions,
    overall: buildOverall(dimensions),
    overallScore,
    nextStep: pickNextStep(dimensions),
  };
}
