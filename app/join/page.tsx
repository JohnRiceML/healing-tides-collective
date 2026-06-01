import type { Metadata } from "next";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

import { Card, Container } from "@/app/_components/ui";
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

// Light brand styling for Clerk's widget so it sits inside our Card, not on top of it.
const clerkAppearance = {
  variables: {
    colorPrimary: "#2f2f2f", // charcoal — matches our primary button
    colorText: "#2f2f2f",
    colorTextSecondary: "#8a8580", // ink-muted
    colorBackground: "#ffffff",
    borderRadius: "0.85rem",
    fontFamily: "var(--font-sans)",
  },
  elements: {
    rootBox: "w-full",
    card: "bg-transparent shadow-none border-0 p-0 w-full",
    header: "hidden",
    footer: "bg-transparent",
  },
};

export default function JoinPage() {
  return (
    <main id="main-content" className="min-h-screen bg-sand text-charcoal">
      <Container size="wide" className="py-16 md:py-24">
        <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          {/* Value — who this is for + why */}
          <div className="lg:pt-6">
            <p className="meta text-ink-muted">For practitioners</p>
            <h1 className="font-display mt-4 text-[clamp(36px,5vw,58px)] font-light leading-[1.05] tracking-[-0.02em]">
              Claim your place in the collective.
            </h1>
            <p className="mt-5 max-w-md text-[17px] leading-[1.65] text-ink-soft">
              A real profile — your story, your specialties, your way of working — on a
              page people can actually find. Free to join.
            </p>

            <dl className="mt-10 space-y-6">
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

            <p className="mt-12 text-[14px] text-ink-muted">
              Looking for care instead?{" "}
              <Link href="/" className="link-underline font-medium text-charcoal">
                find care
              </Link>
            </p>
          </div>

          {/* Sign-up */}
          <Card className="lg:sticky lg:top-10">
            <div className="mb-7">
              <h2 className="font-display text-2xl font-light leading-tight">Create your profile</h2>
              <p className="mt-1 text-[14px] text-ink-muted">
                Takes a minute — you can finish the details after.
              </p>
            </div>

            {clerkEnabled ? (
              <SignUp
                routing="hash"
                signInUrl="/join"
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
          </Card>
        </div>
      </Container>
    </main>
  );
}
