// Fields that count toward profile "completeness" — drives the editor nudge now
// and the upsell later ("you got X views; complete your profile to get more").
export const COMPLETENESS_FIELDS = [
  "displayName",
  "bio",
  "values",
  "modality",
  "region",
  "gender",
  "specialties",
  "insuranceAccepted",
  "website",
] as const;

/** 0–100: percentage of the completeness fields that are filled (arrays count
 * when non-empty). Pure. */
export function completenessOf(p: Record<string, unknown>): number {
  const filled = COMPLETENESS_FIELDS.filter((f) => {
    const v = p[f];
    return Array.isArray(v) ? v.length > 0 : Boolean(v);
  }).length;
  return Math.round((filled / COMPLETENESS_FIELDS.length) * 100);
}
