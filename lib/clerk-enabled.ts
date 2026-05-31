// The whole auth layer is gated on whether Clerk keys are present, so the app
// runs fine WITHOUT Clerk configured (the proxy + <ClerkProvider> both no-op).
// Keep this module dependency-free (NO db import) so it's safe to import from
// the root layout and the proxy without pulling in the Prisma client.
export const clerkEnabled =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY;
