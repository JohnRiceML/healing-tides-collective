// Test data factories — concise, typed builders so flow tests stay readable and
// adding a test never means hand-rolling a 12-field object. Every builder takes an
// `over` partial to tweak just the fields a test cares about.

import type { SerpResult } from "@/lib/serper";

let seq = 0;
const nextId = (p: string) => `${p}_${(seq += 1)}`;

export type TestUser = {
  id: string;
  clerkUserId: string;
  email: string | null;
  role: "SEEKER" | "PRACTITIONER" | "ADMIN";
};

export function aUser(over: Partial<TestUser> = {}): TestUser {
  const id = over.id ?? nextId("u");
  return { id, clerkUserId: `clerk_${id}`, email: `${id}@example.com`, role: "PRACTITIONER", ...over };
}

export type TestPractitioner = {
  id: string;
  userId: string;
  slug: string | null;
  displayName: string | null;
  bio: string | null;
  website: string | null;
  values: string | null;
  modality: string | null;
  region: string | null;
  gender: string | null;
  specialties: string[];
  insuranceAccepted: string[];
  fieldValues: Record<string, unknown>;
  visibility: "DRAFT" | "PUBLISHED" | "HIDDEN" | "NEEDS_REVIEW";
  completeness: number;
};

export function aPractitioner(over: Partial<TestPractitioner> = {}): TestPractitioner {
  const id = over.id ?? nextId("p");
  return {
    id,
    userId: over.userId ?? nextId("u"),
    slug: null,
    displayName: "Aspen Rivera",
    bio: "A short, real bio.",
    website: null,
    values: null,
    modality: null,
    region: "Saint Paul, Minnesota",
    gender: null,
    specialties: [],
    insuranceAccepted: [],
    fieldValues: {},
    visibility: "DRAFT",
    completeness: 40,
    ...over,
  };
}

export type TestInvite = {
  id: string;
  token: string;
  email: string;
  displayName: string | null;
  prefill: Record<string, unknown>;
  createdAt: Date;
  claimedAt: Date | null;
  claimedByUserId: string | null;
};

export function anInvite(over: Partial<TestInvite> = {}): TestInvite {
  const id = over.id ?? nextId("inv");
  return {
    id,
    token: `tok_${id}`,
    email: "waitlister@example.com",
    displayName: "Jordan Lake",
    prefill: {},
    createdAt: new Date("2026-06-01T00:00:00.000Z"),
    claimedAt: null,
    claimedByUserId: null,
    ...over,
  };
}

/** The shape getOrCreatePractitioner() resolves to — what server actions read. */
export function aSession(practitioner: Partial<TestPractitioner> = {}, user: Partial<TestUser> = {}) {
  const u = aUser(user);
  return { user: u, practitioner: aPractitioner({ userId: u.id, ...practitioner }) };
}

export function aSerpResult(over: Partial<SerpResult> = {}): SerpResult {
  return { title: "A Clinic", link: "https://example.com", snippet: "", position: 1, ...over };
}

/** A hold record shaped like moderation's __hold (enough to read as "on hold"). */
export function aHold(over: Record<string, unknown> = {}) {
  return { message: "On hold.", by: "system", at: "2026-06-01T00:00:00.000Z", prev: "PUBLISHED", ...over };
}
