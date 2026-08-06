// Auth glue between Clerk (identity) and our local User/Practitioner tables.
//
// Importing this module pulls in the Prisma client (lib/db) — so only import it
// from routes that actually need the database, never from the root layout or the
// proxy (use lib/clerk-enabled there instead).

import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

import { db } from "@/lib/db";
import { clerkEnabled } from "@/lib/clerk-enabled";
import type { Practitioner, User } from "@/lib/generated/prisma/client";

export { clerkEnabled };

// ── E2E test-auth bypass (the "get around Clerk" workaround) ──────────────────
// Playwright can't drive a real Clerk sign-in (bot detection, hosted UI, real creds),
// so the E2E run starts the app with Clerk DISABLED and this flag ON, then "signs in"
// by setting an `e2e_uid` cookie (a test user's clerkUserId). getCurrentDbUser resolves
// it to a real User row, so every downstream gate (practitioner, admin) just works.
//
// SAFETY — three independent guards make this unreachable in production:
//   1. The E2E_AUTH_BYPASS env var is set ONLY by the Playwright webServer (never in Vercel).
//   2. It also requires a non-production NODE_ENV, so it can't fire in a production build even
//      if that flag were somehow set.
//   3. It only reads inside the `!clerkEnabled` branch below — production runs with Clerk
//      ENABLED, so that branch never executes there regardless of the flag.
const E2E_AUTH_BYPASS =
  process.env.E2E_AUTH_BYPASS === "1" && process.env.NODE_ENV !== "production";

async function e2eUserFromCookie(): Promise<User | null> {
  const jar = await cookies();
  const uid = jar.get("e2e_uid")?.value;
  if (!uid) return null;
  const existing = await db.user.findUnique({ where: { clerkUserId: uid } });
  if (existing) return existing;
  // Mirror the real create-on-first-sight path so brand-new-user flows are testable too.
  const email = jar.get("e2e_email")?.value ?? `${uid}@e2e.test`;
  return db.user.create({ data: { clerkUserId: uid, email } });
}

/**
 * Resolve the signed-in Clerk user to our local `User` row, creating it on first
 * sight (a backstop so we don't depend solely on the Clerk webhook). Returns null
 * when nobody is signed in. Call only inside a request scope (server component /
 * route handler) — `auth()` needs the Clerk proxy to have run.
 */
export async function getCurrentDbUser(): Promise<User | null> {
  if (!clerkEnabled) {
    return E2E_AUTH_BYPASS ? e2eUserFromCookie() : null;
  }
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (existing) return existing;

  const cu = await currentUser();
  const email =
    cu?.primaryEmailAddress?.emailAddress ??
    cu?.emailAddresses?.[0]?.emailAddress ??
    null;

  return db.user.create({ data: { clerkUserId: userId, email } });
}

/**
 * Ensure the signed-in user is a practitioner with a (draft) profile row.
 * Promotes the role to PRACTITIONER on first claim and upserts the profile shell.
 * Returns null when nobody is signed in.
 */
export async function getOrCreatePractitioner(): Promise<
  { user: User; practitioner: Practitioner } | null
> {
  const user = await getCurrentDbUser();
  if (!user) return null;

  const practitioner = await db.practitioner.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  });

  if (user.role !== "PRACTITIONER" && user.role !== "ADMIN") {
    const promoted = await db.user.update({
      where: { id: user.id },
      data: { role: "PRACTITIONER" },
    });
    return { user: promoted, practitioner };
  }
  return { user, practitioner };
}

/**
 * Read-only resolve of the signed-in user + their practitioner profile, if any.
 * Unlike {@link getOrCreatePractitioner} this NEVER writes — no row creation, no
 * role promotion — so it is safe to call from a GET (page render). `practitioner`
 * is null when the signed-in user hasn't opted into a practitioner profile yet.
 * Returns null when nobody is signed in.
 *
 * Use this for page renders; promotion happens only via an explicit action
 * (`becomePractitioner`) so merely visiting `/practitioner` never turns a seeker
 * into a practitioner.
 */
export async function getPractitioner(): Promise<
  { user: User; practitioner: Practitioner | null } | null
> {
  const user = await getCurrentDbUser();
  if (!user) return null;
  const practitioner = await db.practitioner.findUnique({
    where: { userId: user.id },
  });
  return { user, practitioner };
}

/** Comma-separated email allowlist (env `ADMIN_EMAILS`). Grants admin WITHOUT a DB
 *  write — the simplest way to bootstrap admins and to manage them when the DB isn't
 *  conveniently writable. Emails come from Clerk (verified), so they're trustworthy.
 *  Exported so admin *notifications* (lib/seeker-notify.ts) reach exactly the people
 *  this gate lets in — one list, not two that can drift apart. */
export function adminEmailAllowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * The signed-in user IF they're an admin, else null — the gate for admin surfaces
 * (e.g. `/admin`). Call it in the server component and `notFound()` on null. A user is
 * admin if their `User.role === ADMIN` OR their (Clerk-verified) email is in the
 * `ADMIN_EMAILS` env allowlist.
 */
export async function requireAdmin(): Promise<User | null> {
  const user = await getCurrentDbUser();
  if (!user) return null;
  if (user.role === "ADMIN") return user;
  const email = user.email?.trim().toLowerCase();
  if (email && adminEmailAllowlist().includes(email)) return user;
  return null;
}
