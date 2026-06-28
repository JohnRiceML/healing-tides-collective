"use server";

import { getPractitioner } from "@/lib/auth";

/**
 * Lightweight yes/no for client UI (the nav's "Your profile" link). True only when the signed-in
 * user actually has a Practitioner row — so pure seekers don't get pointed at the practitioner
 * editor. Read-only (getPractitioner never promotes); reveals only a boolean.
 */
export async function isCurrentUserPractitioner(): Promise<boolean> {
  const res = await getPractitioner();
  return Boolean(res?.practitioner);
}
