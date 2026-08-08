import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

import { Container } from "@/app/_components/ui";
import { joinClerkAppearance } from "@/app/_components/clerk-appearance";
import { clerkEnabled } from "@/lib/clerk-enabled";

export const metadata: Metadata = {
  title: "Start your practitioner profile — Healing Tides Collective",
  description:
    "Create a free account to begin building your Healing Tides practitioner profile. Save your progress, preview your page, and publish when you're ready.",
  robots: { index: false, follow: true },
};

const STEPS: { title: string; body: string }[] = [
  { title: "Create your account", body: "Save your place and start your profile." },
  { title: "Build your profile", body: "Add your story, specialties, location, and approach." },
  { title: "Preview before going live", body: "See your page before seekers can find it." },
  { title: "Publish when you're ready", body: "You're in control — nothing is public until you publish." },
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

function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const BENEFITS = [
  "A profile clients find on Google",
  "Your own way of working, honored",
  "A small, curated community",
  "Free during early access",
];

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
            // Two masks intersected: full only at the very bottom-left corner, then
            // dissolving FAST toward the top + right so only a hint of the image shows.
            maskImage:
              "linear-gradient(to top, #000 8%, transparent 46%), linear-gradient(to right, #000 12%, transparent 48%)",
            maskComposite: "intersect",
            WebkitMaskImage:
              "linear-gradient(to top, #000 8%, transparent 46%), linear-gradient(to right, #000 12%, transparent 48%)",
            WebkitMaskComposite: "source-in",
          }}
        />
      </div>

      <Container size="wide" className="relative z-10 pb-12 pt-5 sm:pb-14 sm:pt-6 md:pb-16 md:pt-8">
        <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_minmax(0,460px)] lg:gap-14">
          {/* ───── Left: the pitch + "what happens" ───── */}
          <div>
            <p className="meta text-teal">For practitioners</p>
            <h1 className="font-display mt-4 text-[clamp(30px,4.4vw,46px)] font-light leading-[1.04] tracking-[-0.025em] text-charcoal">
              Start your practitioner profile.
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-[1.6] text-ink-soft sm:text-[16px]">
              Create a free account to begin building your Healing Tides profile. You can save your
              progress, preview your page, and publish when you&rsquo;re ready.
            </p>

            {/* Benefits — the value of joining, called out up front. */}
            <ul className="mt-6 grid max-w-md grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {BENEFITS.map((b, i) => (
                <li
                  key={b}
                  className="rise flex items-start gap-2.5 text-[14px] leading-[1.45] text-charcoal"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-seafoam/70 text-teal">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <p className="meta mt-9 rise text-ink-muted" style={{ animationDelay: "300ms" }}>
              What happens after you sign up
            </p>
            <ol className="relative mt-4 max-w-md">
              {/* the connecting line behind the numbers */}
              <span aria-hidden className="absolute bottom-6 left-[13.5px] top-3 w-px bg-rule" />
              {STEPS.map((s, i) => (
                <li
                  key={s.title}
                  className="rise relative flex gap-3.5 pb-4 last:pb-0"
                  style={{ animationDelay: `${360 + i * 110}ms` }}
                >
                  <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-seafoam/60 text-[12.5px] font-medium text-ocean">
                    {i + 1}
                  </span>
                  <div className="pt-0.5">
                    <p className="text-[15px] font-medium leading-tight text-charcoal">{s.title}</p>
                    <p className="mt-0.5 text-[13.5px] leading-[1.5] text-ink-soft">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* ───── Right: the sign-up card ───── */}
          <div className="lg:sticky lg:top-24">
            {clerkEnabled ? (
              <div className="rounded-3xl border border-rule/80 bg-white p-5 shadow-[0_1px_0_rgba(31,58,95,0.02),0_28px_60px_-38px_rgba(31,58,95,0.3)] sm:p-6">
                <div className="text-center">
                  <h2 className="font-display text-[21px] leading-tight tracking-[-0.01em] text-charcoal">
                    Create your free practitioner account
                  </h2>
                  <p className="mt-1.5 text-[13.5px] leading-[1.5] text-ink-soft">
                    Nothing goes public until you publish it yourself.
                  </p>
                </div>

                {/* This route is an optional catch-all ([[...sign-up]]) so Clerk can route
                    its multi-step flow (email verification at /join/verify-email-address). */}
                <div className="mt-5">
                  <SignUp
                    path="/join"
                    signInUrl="/sign-in"
                    forceRedirectUrl="/practitioner"
                    appearance={joinClerkAppearance}
                  />
                </div>

                <p className="mt-4 flex items-center justify-center gap-2 text-center text-[13px] leading-[1.5] text-ink-muted">
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
            <div className="mt-5 flex justify-center">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-rule/70 bg-white/90 px-4 py-2 text-[12.5px] shadow-sm backdrop-blur-sm">
                <Leaf className="h-4 w-4 shrink-0 text-sage" />
                <span className="text-ink-muted">After signup:</span>
                <span className="text-charcoal">
                  Build profile <span className="text-teal">→</span> Preview{" "}
                  <span className="text-teal">→</span> Publish
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
