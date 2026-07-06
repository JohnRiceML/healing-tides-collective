import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/app/_components/ui";
import { getPractitioner } from "@/lib/auth";
import { authEnabled } from "@/lib/clerk-enabled";
import { toPractitionerEditorView } from "@/app/_lib/practitioner-view";

import { ProfileEditor } from "../ProfileEditor";

export const metadata: Metadata = {
  title: "Build your profile — Healing Tides Collective",
};

// Auth-gated + reads the DB per request.
export const dynamic = "force-dynamic";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" className="min-h-screen bg-sand text-charcoal">
      <Container size="wide" className="pb-16 pt-6 md:pb-24 md:pt-8">
        {children}
      </Container>
    </main>
  );
}

export default async function EditProfilePage() {
  if (!authEnabled) {
    return (
      <Shell>
        <p className="text-ink-soft">
          Auth isn&rsquo;t configured yet. Add Clerk keys to{" "}
          <code className="rounded bg-charcoal/5 px-1">.env.local</code>.
        </p>
      </Shell>
    );
  }

  const result = await getPractitioner();
  if (!result) {
    return (
      <Shell>
        <p className="text-ink-soft">
          You&rsquo;re not signed in.{" "}
          <Link href="/join" className="underline">
            Join or sign in
          </Link>
          .
        </p>
      </Shell>
    );
  }

  // Not a practitioner yet — send them to the dashboard, where opting in is an
  // explicit choice (rather than promoting on this GET).
  if (!result.practitioner) redirect("/practitioner");

  // Project the row before it crosses the client boundary — reserved (`__`) fieldValues
  // keys (admin notes, hold internals, scans, …) must never reach the browser payload.
  return (
    <Shell>
      <ProfileEditor practitioner={toPractitionerEditorView(result.practitioner)} />
    </Shell>
  );
}
