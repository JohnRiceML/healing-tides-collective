import type { Metadata } from "next";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

import { Container } from "@/app/_components/ui";
import { clerkAppearance } from "@/app/_components/clerk-appearance";
import { clerkEnabled } from "@/lib/clerk-enabled";

export const metadata: Metadata = {
  title: "Join as a practitioner — Healing Tides Collective",
  description:
    "Claim your place in the collective — a real, findable profile for your practice. Free to join.",
};

const BENEFITS: { title: string; body: string }[] = [
  {
    title: "Your own page",
    body: "Photo, bio, and the way you actually work — not a row in a directory.",
  },
  {
    title: "Found on Google",
    body: "Every profile is its own page, built to be found by the people looking for you.",
  },
  {
    title: "Curated, not crowded",
    body: "A considered collective — not a wall of ten thousand names.",
  },
  {
    title: "Free to list",
    body: "No cost to join while we grow.",
  },
];

export default function JoinPage() {
  return (
    <main id="main-content" className="min-h-screen bg-sand text-charcoal">
      <Container size="wide" className="py-14 sm:py-16 md:py-24">
        {/* Source order = mobile order: intro → sign-up → benefits.
            On desktop, col/row placement makes it value-left / form-right. */}
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          {/* Intro */}
          <div className="lg:col-start-1 lg:row-start-1 lg:pt-6">
            <p className="meta text-ink-muted">For practitioners</p>
            <h1 className="font-display mt-4 text-[clamp(32px,6vw,58px)] font-light leading-[1.06] tracking-[-0.02em]">
              Claim your place in the collective.
            </h1>
            <p className="mt-5 max-w-md text-[16px] leading-[1.65] text-ink-soft sm:text-[17px]">
              A real profile — your story, your specialties, your way of working — on a
              page people can actually find. Free to join.
            </p>
          </div>

          {/* Sign-up — Clerk's native card. This route is an optional catch-all
              ([[...sign-up]]) so Clerk can route its multi-step flow (e.g. email
              verification at /join/verify-email-address) with `path` routing. */}
          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:flex lg:justify-center lg:self-start lg:sticky lg:top-10">
            {clerkEnabled ? (
              <SignUp
                path="/join"
                signInUrl="/sign-in"
                fallbackRedirectUrl="/practitioner"
                appearance={clerkAppearance}
              />
            ) : (
              <p className="rounded-2xl border border-rule bg-sand/60 p-4 text-[14px] leading-[1.55] text-ink-soft">
                Practitioner sign-up isn’t connected yet — add the Clerk keys to{" "}
                <code className="rounded bg-charcoal/5 px-1">.env.local</code> and enable Google in
                the Clerk dashboard to turn it on.
              </p>
            )}
          </div>

          {/* Benefits */}
          <div className="lg:col-start-1 lg:row-start-2">
            <dl className="space-y-6">
              {BENEFITS.map((b) => (
                <div key={b.title} className="flex gap-4">
                  <span aria-hidden className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                  <div>
                    <dt className="text-[15px] font-medium text-charcoal">{b.title}</dt>
                    <dd className="mt-0.5 text-[14px] leading-[1.55] text-ink-soft">{b.body}</dd>
                  </div>
                </div>
              ))}
            </dl>

            <p className="mt-10 text-[14px] text-ink-muted">
              Looking for care instead?{" "}
              <Link href="/" className="link-underline font-medium text-charcoal">
                find care
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
}
