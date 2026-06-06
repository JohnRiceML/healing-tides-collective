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

/** Match-critical fields in DESCENDING impact, with human labels — names the next
 * best thing to add. Shared by the editor's nudge and the dashboard. Pure. */
export const MATCH_FIELD_LABELS: { key: string; label: string }[] = [
  { key: "specialties", label: "your areas of focus" },
  { key: "region", label: "your location" },
  { key: "modality", label: "how you work" },
  { key: "values", label: "what healing means to you" },
  { key: "insuranceAccepted", label: "insurance" },
  { key: "bio", label: "a short bio" },
  { key: "gender", label: "your gender" },
  { key: "displayName", label: "your name" },
  { key: "website", label: "your website" },
];

/** The labels of currently-empty match-critical fields, highest-impact first. */
export function missingFieldsByImpact(p: Record<string, unknown>): string[] {
  return MATCH_FIELD_LABELS.filter(({ key }) => {
    const v = p[key];
    return Array.isArray(v) ? v.length === 0 : !v;
  }).map((f) => f.label);
}
