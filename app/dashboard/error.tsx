"use client";

// Calm fallback if the dashboard can't load (e.g. a transient DB hiccup, or the brief window
// after a code deploy but before the SavedPractitioner migration is applied — the shared User
// read would otherwise surface a raw 500). Never blames the seeker; just offers to try again.

import { Container } from "@/app/_components/ui";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="main-content" className="min-h-screen bg-sand text-charcoal">
      <Container size="wide" className="py-16 md:py-24">
        <div className="mx-auto max-w-md text-center">
          <p className="meta text-teal">Your space</p>
          <h1 className="font-display mt-3 text-[clamp(22px,3vw,30px)] font-light leading-[1.1] text-charcoal">
            We couldn&rsquo;t load your saved list just now.
          </h1>
          <p className="mt-3 text-[15px] leading-[1.6] text-ink-soft">
            This is on our end, not yours — and nothing you saved is lost. Give it a moment and try again.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center rounded-full bg-ocean px-5 py-2.5 text-[14px] font-medium text-white transition hover:bg-ocean/90"
            >
              Try again
            </button>
            <a
              href="/practitioners"
              className="inline-flex items-center rounded-full px-4 py-2.5 text-[14px] text-teal ring-1 ring-rule transition hover:ring-teal/40"
            >
              Browse the directory
            </a>
          </div>
        </div>
      </Container>
    </main>
  );
}
