// The whole auth layer is gated on whether Clerk keys are present, so the app
// runs fine WITHOUT Clerk configured (the proxy + <ClerkProvider> both no-op).
// Keep this module dependency-free (NO db import) so it's safe to import from
// the root layout and the proxy without pulling in the Prisma client.
export const clerkEnabled =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY;

// True when a user identity is RESOLVABLE — real Clerk, or the E2E cookie bypass
// (E2E_AUTH_BYPASS, set only by the Playwright webServer; see lib/auth.ts). In production
// this is exactly === clerkEnabled, since E2E_AUTH_BYPASS is never set there.
//
// Use this for "is auth available, should I resolve the signed-in user" gates (the
// practitioner pages). Keep using `clerkEnabled` for "render Clerk UI" (ClerkProvider,
// UserButton, the hosted sign-in/up widgets) — those must stay off without real Clerk.
export const authEnabled = clerkEnabled || process.env.E2E_AUTH_BYPASS === "1";
