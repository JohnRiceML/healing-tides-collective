// lib/brand-next-step.ts — pick the single most GROUNDED "where to begin" action. The framework's
// own nextStep is profile-completion-based (add a bio, a photo…). But once a practitioner's profile
// is in good shape, the biggest REAL lever for being found locally is a Google Business Profile —
// it's what puts them on the local map pack, the surface most nearby seekers look at first. So when
// they're set up but not on that map, this leads with it instead of a smaller profile nudge. PURE.

import type { NextStep } from "@/lib/brand";

/** The single highest-ROI findability action once the profile itself is solid. */
export const LOCAL_MAP_NEXT_STEP: NextStep = {
  dimensionId: "where_found",
  insight: {
    id: "map-gbp",
    what: "You're not on the local map near you yet.",
    whyCare:
      "When someone nearby searches for care like yours, the local map — the few practices Google shows at the very top — is where most people look first.",
    whatNext:
      "Set up a free Google Business Profile. It's the single biggest step toward appearing on that local map.",
    lift: "moderate",
    state: "forming",
    ctaHref: "https://www.google.com/business/",
    ctaLabel: "Start a Google Business Profile",
  },
};

export type GroundedContext = {
  /** Did the last scan actually check the local map pack? */
  mapChecked: boolean;
  /** Does the practitioner appear on the local map (any sampled term)? */
  onMap: boolean;
  /** Is the profile complete enough that local findability is the real lever now? */
  profileReady: boolean;
};

/**
 * The grounded next step: when the profile is solid but they're checked-and-NOT-on the local map,
 * a Google Business Profile is a bigger real lever than any remaining profile nudge — so it leads.
 * Otherwise we keep the framework's most-foundational gap (you need a real profile before the map
 * matters, and we never push the map step on someone we haven't actually checked).
 */
export function pickGroundedNextStep(
  frameworkNextStep: NextStep | null,
  ctx: GroundedContext,
): NextStep | null {
  if (ctx.profileReady && ctx.mapChecked && !ctx.onMap) return LOCAL_MAP_NEXT_STEP;
  return frameworkNextStep;
}
