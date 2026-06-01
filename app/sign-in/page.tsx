import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

import { Container } from "@/app/_components/ui";
import { clerkAppearance } from "@/app/_components/clerk-appearance";
import { clerkEnabled } from "@/lib/clerk-enabled";

export const metadata: Metadata = {
  title: "Sign in — Healing Tides Collective",
  description: "Sign in to manage your practitioner profile.",
};

export default function SignInPage() {
  return (
    <main id="main-content" className="min-h-screen bg-sand text-charcoal">
      <Container size="narrow" className="py-14 sm:py-16 md:py-24">
        <div className="mx-auto max-w-md">
          <p className="meta text-ink-muted">Practitioners</p>
          <h1 className="font-display mt-3 text-[clamp(28px,7vw,40px)] font-light leading-[1.08] tracking-[-0.02em]">
            Welcome back.
          </h1>
          <p className="mt-3 text-[15px] leading-[1.6] text-ink-soft">
            Sign in to manage your profile.
          </p>

          <div className="mt-8">
            {clerkEnabled ? (
              <SignIn
                routing="hash"
                signUpUrl="/join"
                fallbackRedirectUrl="/practitioner"
                appearance={clerkAppearance}
              />
            ) : (
              <p className="rounded-2xl border border-rule bg-sand/60 p-4 text-[14px] leading-[1.55] text-ink-soft">
                Sign-in isn’t connected yet — add the Clerk keys to{" "}
                <code className="rounded bg-charcoal/5 px-1">.env.local</code> to turn it on.
              </p>
            )}
          </div>

          <p className="mt-8 text-[14px] text-ink-muted">
            New here?{" "}
            <a href="/join" className="link-underline font-medium text-charcoal">
              claim your place
            </a>
          </p>
        </div>
      </Container>
    </main>
  );
}
