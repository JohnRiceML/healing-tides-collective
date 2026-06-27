// Shared E2E identities + seed data. Pure (no imports) so both the Node global-setup
// and the browser specs reference the same constants — no drift between seed and assertion.

export const SEED = {
  // Signed-in admin. role ADMIN *and* the webServer's ADMIN_EMAILS — both admin paths covered.
  admin: { clerkUserId: "e2e-admin", email: "e2e-admin@healingtides.test" },

  // A published practitioner — shows in the public directory + has a profile page.
  published: {
    clerkUserId: "e2e-pub",
    email: "river@e2e.test",
    slug: "river-stone-therapy",
    displayName: "River Stone Therapy",
    bio: "A calm, trauma-informed practice in the Twin Cities.",
    region: "Twin Cities",
  },

  // A plain seeker — proves the admin gate rejects non-admins.
  seeker: { clerkUserId: "e2e-seeker", email: "seeker@e2e.test" },

  // A submitted intake the matching workspace works against. Region matches the published
  // practitioner above so the candidate shows at least one overlap chip.
  intake: {
    name: "Jordan Rivers",
    email: "jordan-intake@e2e.test",
    story: "I've been feeling stretched thin and want trauma-informed support that isn't just talk therapy.",
    region: "Twin Cities",
  },
} as const;

// A feedback row the admin queue should surface.
export const SEED_FEEDBACK = {
  message: "E2E seeded feedback — the directory filter felt great.",
  kind: "PRAISE",
  status: "NEW",
} as const;
