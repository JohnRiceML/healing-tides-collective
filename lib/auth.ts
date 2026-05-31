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
