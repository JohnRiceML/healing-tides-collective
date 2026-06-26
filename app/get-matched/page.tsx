import type { Metadata } from "next";

import { IntakeFlow } from "./IntakeFlow";

export const metadata: Metadata = {
  title: "Find your fit — Healing Tides Collective",
  description:
    "Tell us where you are, in plain language. One person reads it and sends back a small, considered shortlist of practitioners — each with a reason.",
};

export default function GetMatchedPage() {
  return (
    <main id="main-content" className="min-h-screen bg-sand py-16 text-charcoal md:py-24">
      <IntakeFlow />
    </main>
  );
}
