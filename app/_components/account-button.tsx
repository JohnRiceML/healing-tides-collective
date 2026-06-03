"use client";

import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

import { clerkAppearance } from "./clerk-appearance";

/**
 * Fixed top-right account menu — shown ONLY on the landing ("/"), which has no site
 * nav of its own. Everywhere else `SiteNav` carries account access (avoiding a double
 * UserButton). `<UserButton>` renders nothing when signed out, so logged-out visitors
 * see nothing here.
 */
export function AccountButton() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
      <UserButton appearance={clerkAppearance} />
    </div>
  );
}
