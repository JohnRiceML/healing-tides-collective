import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

import { Container } from "@/app/_components/ui";
import { joinClerkAppearance } from "@/app/_components/clerk-appearance";
import { clerkEnabled } from "@/lib/clerk-enabled";

export const metadata: Metadata = {
  title: "Save your list — Healing Tides Collective",
  description:
    "Create a free account to keep your saved practitioners in one calm place you can return to anytime.",
};

const Check = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
    <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BENEFITS = [
  "Keep your saved practitioners in one place",
  "Come back to them whenever you're ready",
  "Reach out directly, at your own pace",
  "Free, private, and yours alone",
];

export default function SaveAccountPage() {
  return (
    <main id="main-content" className="relative min-h-screen overflow-hidden bg-sand text-charcoal">
      <Container size="wide" className="relative z-10 pb-12 pt-6 sm:pb-14 md:pb-16 md:pt-10">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_minmax(0,440px)] lg:gap-14">
          {/* ── Left: why an account ── */}
          <div>
            <p className="meta text-teal">For you</p>
            <h1 className="font-display mt-4 text-[clamp(28px,4.2vw,44px)] font-light leading-[1.05] tracking-[-0.025em] text-charcoal">
              Save your list.
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-[1.6] text-ink-soft sm:text-[16px]">
              Create a free account to keep the practitioners you&rsquo;ve saved in one calm place. Nothing is
              shared with anyone, and there&rsquo;s no obligation — it&rsquo;s simply yours to come back to.
            </p>

            <ul className="mt-6 grid max-w-md grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-[14px] leading-[1.45] text-charcoal">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-seafoam/70 text-teal">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Right: the sign-up card ── */}
          <div className="lg:sticky lg:top-24">
            {clerkEnabled ? (
              <div className="rounded-3xl border border-rule/80 bg-white p-5 shadow-[0_1px_0_rgba(31,58,95,0.02),0_28px_60px_-38px_rgba(31,58,95,0.3)] sm:p-6">
                <div className="text-center">
                  <h2 className="font-display text-[21px] leading-tight tracking-[-0.01em] text-charcoal">
                    Create your free account
                  </h2>
                  <p className="mt-1.5 text-[13.5px] leading-[1.5] text-ink-soft">
                    Your saved list will be waiting on the other side.
                  </p>
                </div>
                <div className="mt-5">
                  <SignUp
                    path="/save-account"
                    signInUrl="/sign-in"
                    forceRedirectUrl="/dashboard"
                    signInForceRedirectUrl="/welcome"
                    appearance={joinClerkAppearance}
                  />
                </div>
              </div>
            ) : (
              <p className="rounded-3xl border border-rule bg-white/70 p-6 text-[14px] leading-[1.6] text-ink-soft">
                Accounts aren&rsquo;t connected yet — add the Clerk keys to{" "}
                <code className="rounded bg-charcoal/5 px-1">.env.local</code> to turn this on. Your saved list still
                works locally in the meantime.
              </p>
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}
