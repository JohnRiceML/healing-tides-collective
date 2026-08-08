import type { Metadata } from "next";

import { IntakeFlow } from "../IntakeFlow";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Find your fit — the form — Healing Tides Collective",
  description:
    "Prefer a form to a conversation? Tell us where you are in a few short steps. One person reads it and sends back a small, considered shortlist.",
  alternates: { canonical: `${SITE_URL}/get-matched` },
  robots: { index: false, follow: true },
  openGraph: { url: `${SITE_URL}/get-matched` },
};

// The step-by-step form is the calm fallback to the conversational onboarding at /get-matched —
// for anyone who'd rather not chat, or when assistive tech makes a form easier.
export default function GetMatchedFormPage() {
  return (
    <main id="main-content" className="min-h-screen bg-sand py-16 text-charcoal md:py-24">
      <IntakeFlow />
    </main>
  );
}
