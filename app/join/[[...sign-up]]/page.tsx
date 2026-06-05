import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

import { Container } from "@/app/_components/ui";
import { joinClerkAppearance } from "@/app/_components/clerk-appearance";
import { clerkEnabled } from "@/lib/clerk-enabled";

export const metadata: Metadata = {
  title: "Start your practitioner profile — Healing Tides Collective",
  description:
    "Create a free account to begin building your Healing Tides practitioner profile. Save your progress, preview your page, and submit for review when you're ready.",
};

const STEPS: { title: string; body: string }[] = [
  { title: "Create your account", body: "Save your place and start your profile." },
  { title: "Build your profile", body: "Add your story, specialties, location, and approach." },
  { title: "Preview before going live", body: "See your page before seekers can find it." },
  { title: "Submit for review", body: "Profiles are reviewed before joining the collective." },
];

function Leaf({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M4 20C4 12 9 5 20 4c0 11-7 16-15 16-1 0-1-3-1-3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 16c2-3 5-6 9-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Shield({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function JoinPage() {
  return (
    <main id="main-content" className="relative min-h-screen overflow-hidden bg-sand text-charcoal">
      {/* Coastal cliffs + ocean — contained to the bottom-LEFT corner, faded + masked,
          bleeding off the left + bottom edges. */}
      <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 z-0 w-[min(46%,600px)] select-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/join-cove.png"
          alt=""
          className="h-auto w-full opacity-[0.95]"
          style={{
            // Two masks intersected: fade out toward the TOP and toward the RIGHT, so
            // those inward edges dissolve while the left + bottom (off-page) stay full.
            maskImage:
              "linear-gradient(to top, #000 40%, transparent 90%), linear-gradient(to right, #000 48%, transparent 90%)",
            maskComposite: "intersect",
            WebkitMaskImage:
              "linear-gradient(to top, #000 40%, transparent 90%), linear-gradient(to right, #000 48%, transparent 90%)",
            WebkitMaskComposite: "source-in",
          }}
        />
      </div>

      <Container size="wide" className="relative z-10 pb-14 pt-6 sm:pb-16 sm:pt-8 md:pb-20 md:pt-10">
        <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_minmax(0,460px)] lg:gap-16">
          {/* ───── Left: the pitch + "what happens" ───── */}
          <div>
            <p className="meta text-teal">For practitioners</p>
            <h1 className="font-display mt-5 text-[clamp(38px,6vw,64px)] font-light leading-[1.02] tracking-[-0.025em] text-charcoal">
              Start your practitioner profile.
            </h1>
            <p className="mt-6 max-w-md text-[16px] leading-[1.7] text-ink-soft sm:text-[17px]">
              Create a free account to begin building your Healing Tides profile. You can save your
              progress, preview your page, and submit for review when you&rsquo;re ready.
            </p>

            <p className="meta mt-12 text-ink-muted">What happens after you sign up</p>
            <ol className="relative mt-6 max-w-md">
              {/* the connecting line behind the numbers */}
              <span aria-hidden className="absolute bottom-8 left-4 top-4 w-px bg-rule" />
              {STEPS.map((s, i) => (
                <li key={s.title} className="relative flex gap-4 pb-7 last:pb-0">
                  <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-seafoam/60 text-[13px] font-medium text-ocean">
                    {i + 1}
                  </span>
                  <div className="pt-1">
                    <p className="text-[15px] font-medium leading-tight text-charcoal">{s.title}</p>
                    <p className="mt-1 text-[14px] leading-[1.55] text-ink-soft">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <p className="mt-10 flex items-center gap-2 text-[14px] italic text-ink-muted">
              <Leaf className="h-4 w-4 shrink-0 text-sage" />
              Free to start during early access.
            </p>
          </div>

          {/* ───── Right: the sign-up card ───── */}
          <div className="lg:sticky lg:top-24">
            {clerkEnabled ? (
              <div className="rounded-3xl border border-rule/80 bg-white p-6 shadow-[0_1px_0_rgba(31,58,95,0.02),0_28px_60px_-38px_rgba(31,58,95,0.3)] sm:p-8">
                <div className="text-center">
                  <h2 className="font-display text-[24px] leading-tight tracking-[-0.01em] text-charcoal">
                    Create your free practitioner account
                  </h2>
                  <p className="mt-2 text-[14px] leading-[1.5] text-ink-soft">
                    Nothing goes public until you submit and are approved.
                  </p>
                </div>

                {/* This route is an optional catch-all ([[...sign-up]]) so Clerk can route
                    its multi-step flow (email verification at /join/verify-email-address). */}
                <div className="mt-6">
                  <SignUp
                    path="/join"
                    signInUrl="/sign-in"
                    fallbackRedirectUrl="/practitioner"
                    appearance={joinClerkAppearance}
                  />
                </div>

                <p className="mt-5 flex items-center justify-center gap-2 text-center text-[13px] leading-[1.5] text-ink-muted">
                  <Shield className="h-4 w-4 shrink-0 text-sage" />
                  Takes about 2 minutes to start. You can finish your profile later.
                </p>
              </div>
            ) : (
              <p className="rounded-3xl border border-rule bg-white/70 p-6 text-[14px] leading-[1.6] text-ink-soft">
                Practitioner sign-up isn&rsquo;t connected yet — add the Clerk keys to{" "}
                <code className="rounded bg-charcoal/5 px-1">.env.local</code> and enable Google in the
                Clerk dashboard to turn it on.
              </p>
            )}

            {/* Floating reassurance chip */}
            <div className="mt-6 flex justify-center">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-rule/70 bg-white/90 px-4 py-2 text-[12.5px] shadow-sm backdrop-blur-sm">
                <Leaf className="h-4 w-4 shrink-0 text-sage" />
                <span className="text-ink-muted">After signup:</span>
                <span className="text-charcoal">
                  Build profile <span className="text-teal">→</span> Preview{" "}
                  <span className="text-teal">→</span> Submit for review
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
