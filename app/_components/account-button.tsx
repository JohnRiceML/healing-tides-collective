"use client";

import { UserButton } from "@clerk/nextjs";

import { clerkAppearance } from "./clerk-appearance";

/**
 * The persistent account menu (avatar → manage account / sign out), fixed top-right.
 * `<UserButton>` renders nothing when no one is signed in, so the wrapper is invisible
 * for logged-out visitors. Client component so Clerk's `UserButton` resolves correctly.
 */
export function AccountButton() {
  return (
    <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
      <UserButton appearance={clerkAppearance} />
    </div>
  );
}
