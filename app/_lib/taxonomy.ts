// Canonical (placeholder) taxonomy for practitioner profiles AND the public
// directory/filters — promoted from app/practitioner/_taxonomy.ts so both the
// editor and the public surfaces share ONE source.
//
// PLACEHOLDER: the real specialty taxonomy is admin-owned config (Postgres) — see
// the practitioner brief §3d + docs/architecture/EXPERIENCE-MAP.md. Do NOT treat
// these labels as final; they await Nora's taxonomy.

export type SpecialtyOption = { id: string; label: string };

export const SPECIALTY_OPTIONS: SpecialtyOption[] = [
  { id: "anxiety_stress", label: "Anxiety & stress" },
  { id: "depression_mood", label: "Depression & mood" },
  { id: "trauma_ptsd", label: "Trauma & PTSD" },
  { id: "relationships", label: "Relationships & family" },
  { id: "grief_loss", label: "Grief & loss" },
  { id: "body_somatic", label: "Body & somatic work" },
  { id: "identity_life", label: "Identity & life transitions" },
];

export const MODALITY_OPTIONS = [
  { id: "IN_PERSON", label: "In person" },
  { id: "HYBRID", label: "Hybrid" },
  { id: "VIRTUAL", label: "Virtual" },
] as const;

// ── id → label lookups (for rendering cards, profile pages, active filters) ──
const SPECIALTY_LABELS: Record<string, string> = Object.fromEntries(
  SPECIALTY_OPTIONS.map((s) => [s.id, s.label]),
);

/** Human label for a specialty id; falls back to the raw id if unknown. */
export function specialtyLabel(id: string): string {
  return SPECIALTY_LABELS[id] ?? id;
}

const MODALITY_LABELS: Record<string, string> = Object.fromEntries(
  MODALITY_OPTIONS.map((m) => [m.id, m.label]),
);

/** Human label for a modality enum value (IN_PERSON → "In person"). */
export function modalityLabel(id: string | null | undefined): string {
  return id ? MODALITY_LABELS[id] ?? id : "";
}
