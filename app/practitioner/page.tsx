import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/app/_components/ui";
import { getOrCreatePractitioner } from "@/lib/auth";
import { clerkEnabled } from "@/lib/clerk-enabled";

import { ProfileEditor } from "./ProfileEditor";

export const metadata: Metadata = {
  title: "Your practitioner profile — Healing Tides Collective",
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" className="min-h-screen bg-sand text-charcoal">
      <Container size="narrow" className="py-16 md:py-24">
        {children}
      </Container>
    </main>
  );
}

export default async function PractitionerHome() {
  if (!clerkEnabled) {
    return (
      <Shell>
        <p className="text-ink-soft">
          Auth isn’t configured yet. Add Clerk keys to{" "}
          <code className="rounded bg-charcoal/5 px-1">.env.local</code>.
        </p>
      </Shell>
    );
  }

  const result = await getOrCreatePractitioner();
  if (!result) {
    return (
      <Shell>
        <p className="text-ink-soft">
          You’re not signed in.{" "}
          <Link href="/join" className="underline">
            Join or sign in
          </Link>
          .
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <ProfileEditor practitioner={result.practitioner} />
    </Shell>
  );
}
