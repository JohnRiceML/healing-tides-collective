// Pure config + validation for the seeker intake (the "Get matched" front door). Client-safe
// (no db import). The question SET lives here so it's easy to adjust; Nora's final additions can
// also flow into the intake's fieldValues JSON (migration-free). Matching STAYS HUMAN — this only
// captures what the seeker volunteers, in their own words.

export const CARE_TYPES = [
  "Therapy",
  "Acupuncture",
  "Reiki / energy work",
  "Movement / somatic",
  "Trauma-informed support",
  "Not sure yet",
] as const;

export const FORMATS = [
  { value: "in_person", label: "In person" },
  { value: "virtual", label: "Virtual" },
  { value: "either", label: "Either" },
] as const;

export const AGE_GROUPS = [
  { value: "myself", label: "Myself (adult)" },
  { value: "teen", label: "A teen" },
  { value: "child", label: "A child" },
  { value: "couple", label: "Us as a couple" },
  { value: "family", label: "Our family" },
] as const;

// Maps to the model's `usesInsurance` BOOLEAN (we never store a plan or member id).
export const INSURANCE = [
  { value: "yes", label: "I'd like to use insurance" },
  { value: "no", label: "Out-of-pocket is okay" },
  { value: "either", label: "Not sure / either is fine" },
] as const;

export const URGENCY = [
  { value: "soon", label: "Within a week or so" },
  { value: "this_month", label: "This month" },
  { value: "open", label: "Open-ended" },
] as const;

export const MIN_STORY = 10;
export const MAX_STORY = 4000;

/** UI insurance choice ("yes"/"no"/"either") → the model's nullable boolean. */
export function insuranceToBool(v: string | undefined): boolean | null {
  if (v === "yes") return true;
  if (v === "no") return false;
  return null; // "either" / unset
}

export type IntakeInput = {
  name?: string;
  email?: string;
  story?: string;
  lookingFor?: string[];
  specialties?: string[];
  region?: string;
  format?: string;
  ageGroup?: string;
  genderPreference?: string;
  usesInsurance?: boolean | null;
  budgetNote?: string;
  availability?: string;
  urgency?: string;
};

export type CleanIntake = {
  name: string;
  email: string;
  story: string;
  lookingFor: string[];
  specialties: string[];
  region: string | null;
  format: string | null;
  ageGroup: string | null;
  genderPreference: string | null;
  usesInsurance: boolean | null;
  budgetNote: string | null;
  availability: string | null;
  urgency: string | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s.slice(0, max) : null;
}

function strList(v: unknown, max = 20): string[] {
  if (!Array.isArray(v)) return [];
  const seen = v.filter((x): x is string => typeof x === "string" && x.trim() !== "").map((s) => s.trim());
  return [...new Set(seen)].slice(0, max);
}

/** Validate + normalize a seeker intake. Required: name, valid email, a real story. Prefs optional. */
export function validateIntake(input: IntakeInput): { ok: true; value: CleanIntake } | { ok: false; error: string } {
  const name = clean(input.name, 120);
  if (!name) return { ok: false, error: "Please add your name so we know who to write back to." };

  const email = clean(input.email, 200)?.toLowerCase() ?? null;
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Please add a valid email — that's where your shortlist goes." };
  }

  const story = clean(input.story, MAX_STORY);
  if (!story || story.length < MIN_STORY) {
    return { ok: false, error: "Tell us a little about what's bringing you here — even a sentence or two helps." };
  }

  return {
    ok: true,
    value: {
      name,
      email,
      story,
      lookingFor: strList(input.lookingFor),
      specialties: strList(input.specialties),
      region: clean(input.region, 120),
      format: clean(input.format, 40),
      ageGroup: clean(input.ageGroup, 40),
      genderPreference: clean(input.genderPreference, 80),
      usesInsurance: typeof input.usesInsurance === "boolean" ? input.usesInsurance : null,
      budgetNote: clean(input.budgetNote, 500),
      availability: clean(input.availability, 300),
      urgency: clean(input.urgency, 40),
    },
  };
}

export const INTAKE_STATUSES = [
  { value: "NEW", label: "New" },
  { value: "REVIEWING", label: "Reviewing" },
  { value: "MATCHED", label: "Matched" },
  { value: "CLOSED", label: "Closed" },
] as const;

export function intakeStatusLabel(status: string): string {
  return INTAKE_STATUSES.find((s) => s.value === status)?.label ?? status;
}
