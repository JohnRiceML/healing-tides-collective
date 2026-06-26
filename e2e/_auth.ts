import type { BrowserContext } from "@playwright/test";

// The app runs at 127.0.0.1 during E2E (see playwright.config.ts baseURL).
const E2E_HOST = "127.0.0.1";

/**
 * "Sign in" for E2E — the Clerk workaround. Plants the bypass cookies that
 * getCurrentDbUser reads (only honored because the webServer runs with
 * E2E_AUTH_BYPASS=1 and Clerk disabled). No real Clerk round-trip.
 */
export async function signInAs(
  context: BrowserContext,
  user: { clerkUserId: string; email?: string },
): Promise<void> {
  const cookies = [{ name: "e2e_uid", value: user.clerkUserId, domain: E2E_HOST, path: "/" }];
  if (user.email) {
    cookies.push({ name: "e2e_email", value: user.email, domain: E2E_HOST, path: "/" });
  }
  await context.addCookies(cookies);
}

/** Clear the bypass cookies — back to a signed-out visitor. */
export async function signOut(context: BrowserContext): Promise<void> {
  await context.clearCookies();
}
