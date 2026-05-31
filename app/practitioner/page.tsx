import type { Metadata } from "next";
import Link from "next/link";

import { getOrCreatePractitioner } from "@/lib/auth";
import { clerkEnabled } from "@/lib/clerk-enabled";

export const metadata: Metadata = {
  title: "Your practitioner profile — Healing Tides Collective",
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" className="min-h-screen bg-sand px-6 py-16 text-charcoal">
      <div className="mx-auto max-w-2xl">{children}</div>
    </main>
  );
}

export default async function PractitionerHome() {
  if (!clerkEnabled) {
    return (
      <Shell>
        <p className="text-charcoal/70">
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
        <p className="text-charcoal/70">
          You’re not signed in.{" "}
          <Link href="/join" className="underline">
            Join or sign in
          </Link>
          .
        </p>
      </Shell>
    );
  }

  const { practitioner } = result;
  return (
    <Shell>
      <p className="font-[family-name:var(--font-inter)] text-xs uppercase tracking-[0.2em] text-charcoal/60">
        Your profile
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-fraunces)] text-3xl font-light leading-tight">
        Welcome — let’s build your profile
      </h1>
      <p className="mt-3 text-charcoal/70">
        Your listing is <strong>{practitioner.visibility.toLowerCase()}</strong> and{" "}
        <strong>{practitioner.completeness}%</strong> complete.
      </p>
      <p className="mt-6 rounded-lg border border-charcoal/15 bg-white/50 p-4 text-sm text-charcoal/70">
        Profile editor coming next — photo, bio, specialties, the “what healing means
        to me” values prompt, modality, location, insurance, and gender.
      </p>
    </Shell>
  );
}
