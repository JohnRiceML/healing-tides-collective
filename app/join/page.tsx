import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

import { clerkEnabled } from "@/lib/clerk-enabled";

export const metadata: Metadata = {
  title: "Join as a practitioner — Healing Tides Collective",
  description:
    "Create your free practitioner profile and join the Healing Tides collective.",
};

export default function JoinPage() {
  return (
    <main id="main-content" className="min-h-screen bg-sand px-6 py-16 text-charcoal">
      <div className="mx-auto max-w-md">
        <p className="text-xs uppercase tracking-[0.2em] text-charcoal/60">
          Healing Tides Collective
        </p>
        <h1 className="mt-3 font-display text-3xl font-light leading-tight">
          Claim your place in the collective
        </h1>
        <p className="mt-3 text-charcoal/70">
          Create your free practitioner profile — a real presence with your story,
          specialties, and a page people can actually find.
        </p>

        <div className="mt-8">
          {clerkEnabled ? (
            <SignUp
              routing="hash"
              signInUrl="/join"
              fallbackRedirectUrl="/practitioner"
            />
          ) : (
            <p className="rounded-lg border border-charcoal/15 bg-white/50 p-4 text-sm text-charcoal/70">
              Practitioner sign-up isn’t connected yet — add the Clerk keys to{" "}
              <code className="rounded bg-charcoal/5 px-1">.env.local</code> and enable
              Google in the Clerk dashboard to turn it on.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
