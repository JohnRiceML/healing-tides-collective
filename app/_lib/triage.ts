// AI triage of a practitioner account — pure + client-safe (NO db, NO ai import), so the table +
// detail UI can read categories/labels and the server action can build the prompt from one place.
// The AI's output is stored migration-free in the reserved `__aiTriage` fieldValues key (same
// pattern as __verified / __hold). Practitioner profile data is PII, not client PHI, so summarizing
// it for triage is low-risk. The "system handles this automatically later" is just running this pass
// on a schedule instead of on demand.

export const TRIAGE_KEY = "__aiTriage";

/** The small, fixed set of triage buckets Nora sorts incoming practitioners into. */
export const TRIAGE_CATEGORIES = [
  { value: "feature", label: "Ready to feature", tone: "good" },
  { value: "strong", label: "Strong profile", tone: "good" },
  { value: "polish", label: "Needs polish", tone: "warn" },
  { value: "outreach", label: "Needs a nudge", tone: "warn" },
  { value: "unclear", label: "Worth a look", tone: "neutral" },
] as const;

export const TRIAGE_CATEGORY_VALUES = ["feature", "strong", "polish", "outreach", "unclear"] as const;
export type TriageCategory = (typeof TRIAGE_CATEGORY_VALUES)[number];
export type TriageTone = "good" | "warn" | "neutral";

export type TriageResult = {
  category: TriageCategory;
  tags: string[]; // short focus/specialty themes, ≤5
  insights: string[]; // short plain-language flags for Nora, ≤3
  at: string; // ISO timestamp of the run
  model: string;
};

/** Label + tone for a stored category value, with a safe fallback. */
export function categoryMeta(c: string | null | undefined): { label: string; tone: TriageTone } {
  const hit = TRIAGE_CATEGORIES.find((x) => x.value === c);
  return hit ? { label: hit.label, tone: hit.tone } : { label: "Worth a look", tone: "neutral" };
}

/** The profile facts the AI reasons over (assembled server-side from the practitioner row). */
export type TriageProfileInput = {
  displayName: string | null;
  title: string | null;
  bio: string | null;
  values: string | null;
  specialties: string[]; // human labels
  credentials: string[];
  region: string | null;
  modality: string | null;
  completeness: number; // 0–100
  acceptingNew: boolean;
  published: boolean;
};

/** Build the (deterministic, PII-only) prompt text the AI triage reasons over. Pure → testable. */
export function buildTriagePrompt(p: TriageProfileInput): string {
  const line = (label: string, v: string | null | undefined) => (v && v.trim() ? `${label}: ${v.trim()}` : null);
  const lines = [
    line("Name", p.displayName),
    line("Title", p.title),
    line("Region", p.region),
    line("Format", p.modality),
    `Status: ${p.published ? "published (live)" : "not yet published"}`,
    `Profile completeness: ${p.completeness}%`,
    `Accepting new clients: ${p.acceptingNew ? "yes" : "no/unstated"}`,
    p.specialties.length ? `Focus areas: ${p.specialties.join(", ")}` : "Focus areas: none listed",
    p.credentials.length ? `Stated credentials: ${p.credentials.join(", ")}` : "Stated credentials: none listed",
    line("Bio", p.bio),
    line("Values / what healing means to them", p.values),
  ].filter(Boolean);
  return lines.join("\n");
}

/** Defensive read of the stored triage blob — never trusts its shape. */
export function readTriage(fieldValues: unknown): TriageResult | null {
  const raw = (fieldValues as Record<string, unknown> | null)?.[TRIAGE_KEY];
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const category = TRIAGE_CATEGORY_VALUES.includes(r.category as TriageCategory)
    ? (r.category as TriageCategory)
    : "unclear";
  const strs = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "").slice(0, 5) : [];
  const at = typeof r.at === "string" ? r.at : "";
  if (!at) return null;
  return { category, tags: strs(r.tags), insights: strs(r.insights).slice(0, 3), at, model: typeof r.model === "string" ? r.model : "" };
}
