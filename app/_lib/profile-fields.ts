// The rich practitioner profile form — Nora's "Join the Collective" question set
// (docs/product/PRODUCT-SPEC.md §1). These fields are stored in the flexible
// `Practitioner.fieldValues` JSON column (no schema migration). The core, filterable
// fields (name, region, format, specialties, insurance, gender) stay as columns and
// are edited separately. When a field needs to become filterable, promote it to a
// column then.
//
// This config drives BOTH the editor (render + save) and the public profile (render).

export type ProfileFieldType = "text" | "textarea" | "tags" | "chips";

export type ProfileFieldOption = { id: string; label: string };

export type ProfileField = {
  id: string;
  label: string;
  type: ProfileFieldType;
  hint?: string;
  placeholder?: string;
  /** for `chips` */
  options?: ProfileFieldOption[];
  /** `chips`: single-select instead of multi */
  single?: boolean;
};

export type ProfileSection = {
  id: string;
  title: string;
  fields: ProfileField[];
};

export const PROFILE_SECTIONS: ProfileSection[] = [
  {
    id: "story",
    title: "Your story",
    fields: [
      { id: "about_you", label: "Tell us about yourself", type: "textarea", hint: "What led you to this work? A personal connection or calling you're comfortable sharing." },
      { id: "why_healing_tides", label: "Why Healing Tides?", type: "textarea", hint: "What draws you to a collaborative community of care?" },
      { id: "video_url", label: "Video introduction", type: "text", placeholder: "https://…", hint: "Optional — a short intro so clients sense your energy." },
    ],
  },
  {
    id: "background",
    title: "Background & training",
    fields: [
      { id: "title", label: "Professional title", type: "text", placeholder: "e.g. Licensed Independent Clinical Social Worker" },
      { id: "credentials", label: "Credentials & licensure", type: "tags", hint: "Comma-separated. e.g. LICSW, LADC" },
      { id: "years_experience", label: "Years of experience", type: "text", placeholder: "e.g. 12" },
      { id: "education", label: "Education & training", type: "textarea" },
      { id: "languages", label: "Languages spoken", type: "tags", hint: "Comma-separated. e.g. English, Spanish" },
    ],
  },
  {
    id: "approach",
    title: "Your approach",
    fields: [
      { id: "client_expectations", label: "What can clients expect?", type: "textarea", hint: "What might working with you feel like? How do people describe feeling during or after a session?" },
      {
        id: "style",
        label: "Your style",
        type: "chips",
        hint: "Pick what fits.",
        options: ["Warm", "Direct", "Collaborative", "Structured", "Intuitive", "Strengths-based", "Trauma-informed", "Educational", "Playful"].map((l) => ({ id: l.toLowerCase().replace(/[^a-z]+/g, "_"), label: l })),
      },
      { id: "approaches", label: "Modalities & approaches", type: "tags", hint: "Techniques you use, comma-separated. e.g. EMDR, Somatic Experiencing, IFS, Reiki" },
    ],
  },
  {
    id: "who",
    title: "Who you support",
    fields: [
      { id: "populations", label: "Populations served", type: "text", hint: "Who do you most enjoy working with?" },
      {
        id: "age_groups",
        label: "Age groups",
        type: "chips",
        options: ["Children", "Adolescents", "Adults", "Older Adults", "Couples", "Families", "Groups"].map((l) => ({ id: l.toLowerCase().replace(/[^a-z]+/g, "_"), label: l })),
      },
      { id: "ideal_client", label: "Who thrives working with you?", type: "textarea", hint: "The clients, goals, or experiences that tend to be a strong fit." },
    ],
  },
  {
    id: "availability",
    title: "Availability",
    fields: [
      {
        id: "availability_state",
        label: "Currently",
        type: "chips",
        single: true,
        options: [
          { id: "accepting", label: "Accepting new clients" },
          { id: "limited", label: "Limited openings" },
          { id: "waitlist", label: "Waitlist" },
        ],
      },
      { id: "typical_availability", label: "Typical availability", type: "text", placeholder: "e.g. Weekday mornings, evenings" },
      { id: "earliest_start", label: "Earliest start for new clients", type: "text", placeholder: "e.g. Within 2 weeks" },
    ],
  },
  {
    id: "investment",
    title: "Investment & logistics",
    fields: [
      { id: "session_cost", label: "Session cost", type: "text", placeholder: "e.g. $150 / 50 min" },
      { id: "sliding_scale", label: "Sliding scale", type: "text", placeholder: "e.g. Yes — a few spots" },
      { id: "booking_link", label: "Booking link", type: "text", placeholder: "https://… (Calendly, SimplePractice)" },
      { id: "socials", label: "Social media", type: "text", placeholder: "Optional" },
    ],
  },
  {
    id: "final",
    title: "Final reflection",
    fields: [
      { id: "client_message", label: "What would you like potential clients to know before reaching out?", type: "textarea" },
    ],
  },
];

/** All field ids, for typing the fieldValues bag. */
export type ProfileFieldValues = Record<string, string | string[]>;

const FIELD_LABELS: Record<string, string> = {};
for (const s of PROFILE_SECTIONS) for (const f of s.fields) FIELD_LABELS[f.id] = f.label;

/** Human label for a field id. */
export function fieldLabel(id: string): string {
  return FIELD_LABELS[id] ?? id;
}

/** Human label for a chip-option id within a field (e.g. style "trauma_informed" → "Trauma-informed"). */
export function optionLabel(fieldId: string, optionId: string): string {
  for (const s of PROFILE_SECTIONS) {
    for (const f of s.fields) {
      if (f.id === fieldId && f.options) {
        const o = f.options.find((x) => x.id === optionId);
        if (o) return o.label;
      }
    }
  }
  return optionId;
}
