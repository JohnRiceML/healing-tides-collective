// Canonical care taxonomy for practitioner profiles + the public directory/filters.
// Source: Nora's category spec (2026-06) — see docs/product/taxonomy.md.
//
// Three levels: CATEGORY → subcategory → topics (search/SEO keywords).
// Practitioners pick their "Areas of Focus" from the top-level CATEGORIES (Nora's
// rule: 3–8). The directory filters by category. `SPECIALTY_OPTIONS` exposes those
// top categories in the existing `{ id, label }` shape so the editor / filters /
// read layer keep working unchanged; subcategories + topics are here for richer
// profiles, finer filtering, and SEO later.
//
// NOTE (open product decision): selection is at the CATEGORY level today. If Nora
// wants practitioners to pick at the SUBCATEGORY level instead, swap the derivation
// of SPECIALTY_OPTIONS to the subcategories — no schema change (specialties stay a
// String[] of ids).

export type SpecialtyOption = { id: string; label: string };
export type Subcategory = { id: string; label: string; topics: string[] };
export type Category = { id: string; label: string; subcategories: Subcategory[] };

export const CATEGORIES: Category[] = [
  {
    id: "emotional_wellbeing",
    label: "Emotional Wellbeing",
    subcategories: [
      { id: "anxiety_stress", label: "Anxiety & Stress", topics: ["General anxiety", "Overwhelm", "Panic attacks", "Health anxiety", "Chronic worry", "Nervous system regulation"] },
      { id: "depression_mood", label: "Depression & Emotional Health", topics: ["Low mood", "Motivation", "Emotional numbness", "Self-worth", "Isolation", "Life satisfaction"] },
      { id: "burnout", label: "Burnout & Overachievement", topics: ["Perfectionism", "Caregiver fatigue", "Compassion fatigue", "Work stress", "People pleasing", "High-achiever burnout"] },
    ],
  },
  {
    id: "trauma_recovery",
    label: "Trauma & Recovery",
    subcategories: [
      { id: "trauma_healing", label: "Trauma Healing", topics: ["PTSD", "Complex trauma", "Childhood trauma", "Attachment wounds", "Emotional abuse recovery"] },
      { id: "nervous_system", label: "Nervous System Healing", topics: ["Fight/flight/freeze/fawn", "Somatic healing", "Polyvagal-informed care", "Emotional regulation", "Safety and embodiment"] },
      { id: "addiction_recovery", label: "Addiction & Recovery", topics: ["Alcohol recovery", "Substance use", "Behavioral addictions", "Relapse prevention", "Family recovery"] },
    ],
  },
  {
    id: "relationships_connection",
    label: "Relationships & Connection",
    subcategories: [
      { id: "dating", label: "Dating & Relationships", topics: ["Dating support", "Relationship anxiety", "Attachment styles", "Communication", "Emotional intimacy"] },
      { id: "marriage", label: "Marriage & Partnerships", topics: ["Couples work", "Conflict resolution", "Trust rebuilding", "Premarital support"] },
      { id: "family_parenting", label: "Family & Parenting", topics: ["Parenting support", "Co-parenting", "Family dynamics", "Blended families"] },
      { id: "divorce", label: "Divorce & Separation", topics: ["Breakups", "Relationship loss", "Life restructuring", "Custody stress"] },
    ],
  },
  {
    id: "grief_transitions",
    label: "Grief & Life Transitions",
    subcategories: [
      { id: "grief_loss", label: "Grief & Loss", topics: ["Death of loved ones", "Pet loss", "Anticipatory grief", "Miscarriage", "Complicated grief"] },
      { id: "life_changes", label: "Major Life Changes", topics: ["Career transitions", "Empty nest", "Retirement", "Moving", "Identity shifts"] },
    ],
  },
  {
    id: "mind_body",
    label: "Mind-Body Healing",
    subcategories: [
      { id: "somatic", label: "Somatic Healing", topics: ["Body awareness", "Embodiment", "Trauma release", "Mind-body connection"] },
      { id: "yoga_movement", label: "Yoga & Mindful Movement", topics: ["Gentle yoga", "Restorative yoga", "Trauma-informed yoga", "Adaptive movement"] },
      { id: "dance_arts", label: "Dance & Expressive Arts", topics: ["Dance therapy", "Creative expression", "Movement meditation", "Embodied healing"] },
      { id: "breathwork_meditation", label: "Breathwork & Meditation", topics: ["Mindfulness", "Breathwork", "Relaxation techniques", "Presence practices"] },
    ],
  },
  {
    id: "identity_growth",
    label: "Identity & Personal Growth",
    subcategories: [
      { id: "self_discovery", label: "Self-Discovery", topics: ["Purpose", "Identity", "Values clarification", "Authenticity"] },
      { id: "confidence", label: "Confidence & Self-Esteem", topics: ["Self-worth", "Boundaries", "Assertiveness", "Imposter syndrome"] },
      { id: "spiritual", label: "Spiritual Exploration", topics: ["Meaning and purpose", "Faith transitions", "Mindfulness", "Spiritual wellness"] },
    ],
  },
  {
    id: "womens_wellness",
    label: "Women's Wellness",
    subcategories: [
      { id: "hormonal", label: "Hormonal Health", topics: ["Menopause", "Perimenopause", "PMS", "Hormonal transitions"] },
      { id: "motherhood", label: "Motherhood", topics: ["Fertility", "Pregnancy", "Postpartum", "Parenting identity"] },
    ],
  },
  {
    id: "mens_wellness",
    label: "Men's Wellness",
    subcategories: [
      { id: "mens_mental_health", label: "Men's Mental Health", topics: ["Emotional expression", "Identity", "Relationships", "Fatherhood"] },
    ],
  },
  {
    id: "physical_wellness",
    label: "Physical Wellness",
    subcategories: [
      { id: "sleep", label: "Sleep & Restoration", topics: ["Sleep struggles", "Insomnia", "Rest practices"] },
      { id: "nutrition", label: "Nutrition & Gut Health", topics: ["Emotional eating", "Gut-brain connection", "Mindful eating"] },
      { id: "fitness", label: "Movement & Fitness", topics: ["Functional movement", "Longevity", "Strength and mobility"] },
    ],
  },
  {
    id: "community_belonging",
    label: "Community & Belonging",
    subcategories: [
      { id: "support_groups", label: "Support Groups", topics: ["Grief groups", "Recovery groups", "Men's groups", "Women's circles"] },
      { id: "community_healing", label: "Community Healing", topics: ["Group workshops", "Retreats", "Shared healing experiences"] },
    ],
  },
  {
    id: "alternative_integrative",
    label: "Alternative & Integrative Healing",
    subcategories: [
      { id: "energy_holistic", label: "Energy & Holistic Healing", topics: ["Reiki", "Acupuncture", "Sound healing", "Craniosacral therapy"] },
      { id: "integrative_wellness", label: "Integrative Wellness", topics: ["Functional medicine", "Health coaching", "Holistic wellness"] },
    ],
  },
];

/**
 * The selectable "Areas of Focus" + the directory's specialty filter — the top
 * categories. Practitioners pick 3–8 (enforcement is a profile-editor concern).
 */
export const SPECIALTY_OPTIONS: SpecialtyOption[] = CATEGORIES.map((c) => ({
  id: c.id,
  label: c.label,
}));

/** Session FORMAT (not "modality" in Nora's clinical sense — see docs/product). */
export const MODALITY_OPTIONS = [
  { id: "IN_PERSON", label: "In person" },
  { id: "HYBRID", label: "Hybrid" },
  { id: "VIRTUAL", label: "Virtual" },
] as const;

// ── id → label lookups (categories AND subcategories, so either resolves) ──
const SPECIALTY_LABELS: Record<string, string> = {};
for (const c of CATEGORIES) {
  SPECIALTY_LABELS[c.id] = c.label;
  for (const s of c.subcategories) SPECIALTY_LABELS[s.id] = s.label;
}

/** Human label for a category/subcategory id; falls back to the raw id if unknown. */
export function specialtyLabel(id: string): string {
  return SPECIALTY_LABELS[id] ?? id;
}

const MODALITY_LABELS: Record<string, string> = Object.fromEntries(
  MODALITY_OPTIONS.map((m) => [m.id, m.label]),
);

/** Human label for a session-format value (IN_PERSON → "In person"). */
export function modalityLabel(id: string | null | undefined): string {
  return id ? MODALITY_LABELS[id] ?? id : "";
}
