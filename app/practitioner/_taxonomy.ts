// PLACEHOLDER config for the profile editor.
//
// The real specialty taxonomy is ADMIN-OWNED config (Postgres) — see the
// practitioner brief §3d + docs/architecture/EXPERIENCE-MAP.md. These stand-ins
// make the editor buildable now; db-architect + the admin config UI wire the real
// source later. Do NOT treat these labels as final — they await Nora's taxonomy.

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
