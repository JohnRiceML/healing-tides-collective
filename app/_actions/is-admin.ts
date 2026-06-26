"use server";

import { requireAdmin } from "@/lib/auth";

/**
 * Lightweight yes/no for client UI (the nav's Admin link). Reveals only a boolean — never
 * any admin data — so it's safe to call from a public client component. Pages stay static:
 * the client calls this at runtime rather than the layout doing a server-side auth read.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  return Boolean(await requireAdmin());
}
