import { redirect } from "next/navigation";

import { getPractitioner } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Role-aware post-sign-in router. A single "Sign in" entry serves two audiences, so we resolve
 * who they are and send them to the right home: practitioners → their profile; everyone else
 * (seekers) → their saved-list dashboard. Read-only — getPractitioner never promotes a role.
 */
export default async function WelcomeRouter() {
  const res = await getPractitioner();
  if (!res) redirect("/sign-in");
  redirect(res.practitioner ? "/practitioner" : "/dashboard");
}
