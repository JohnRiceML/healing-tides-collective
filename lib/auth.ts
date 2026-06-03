// Auth glue between Clerk (identity) and our local User/Practitioner tables.
//
// Importing this module pulls in the Prisma client (lib/db) — so only import it
// from routes that actually need the database, never from the root layout or the
// proxy (use lib/clerk-enabled there instead).

import { auth, currentUser } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { clerkEnabled } from "@/lib/clerk-enabled";
import type { Practitioner, User } from "@/lib/generated/prisma/client";

export { clerkEnabled };

/**
 * Resolve the signed-in Clerk user to our local `User` row, creating it on first
 * sight (a backstop so we don't depend solely on the Clerk webhook). Returns null
 * when nobody is signed in. Call only inside a request scope (server component /
 * route handler) — `auth()` needs the Clerk proxy to have run.
 */
export async function getCurrentDbUser(): Promise<User | null> {
  if (!clerkEnabled) return null;
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

/** Comma-separated email allowlist (env `ADMIN_EMAILS`). Grants admin WITHOUT a DB
 *  write — the simplest way to bootstrap admins and to manage them when the DB isn't
 *  conveniently writable. Emails come from Clerk (verified), so they're trustworthy. */
function adminEmailAllowlist(): string[] {
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
