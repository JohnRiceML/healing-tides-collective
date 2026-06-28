// Client-safe shared types for the Get-matched onboarding agent. NO db import — both the
// server tools (lib/onboarding/tools.ts) and the chat UI components import these, so the
// tool OUTPUT shapes stay in one place and render type-safely on the client.

/** A practitioner the agent surfaces mid-conversation (compact — model + card both read it). */
export type PractitionerHit = {
  slug: string;
  displayName: string;
  title: string | null;
  region: string | null;
  specialties: string[]; // human labels, not ids
  modality: string | null; // "In person" | "Virtual" | "Hybrid"
  acceptingNew: boolean;
  blurb: string | null; // a short, first-person-ish snippet
  photoUrl: string | null; // portrait
  coverDesign: string | null; // watercolor cover motif (for ProfileCover)
  coverColor: string | null; // watercolor cover palette
};

/** Fuller profile for "tell me more about them". */
export type PractitionerDetail = PractitionerHit & {
  bio: string | null;
  values: string | null;
  credentials: string[];
  website: string | null;
};

/** The agent's live "what matters to you" reflection — drives the chart. weight is 0–100. */
export type PriorityReflection = {
  priorities: { label: string; weight: number }[];
  note: string;
};

/** Static crisis-resource block the agent can surface if it hears acute risk. */
export type CrisisResources = {
  note: string;
  lines: { label: string; detail: string }[];
};

/** Result of writing the intake to the queue Nora reads. */
export type IntakeSaved = { ok: true; name: string } | { ok: false; error: string };
