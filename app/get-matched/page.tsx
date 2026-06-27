import type { Metadata } from "next";

import { ChatOnboarding } from "./ChatOnboarding";

export const metadata: Metadata = {
  title: "Find your fit — Healing Tides Collective",
  description:
    "A calm conversation that helps you find the right practitioner. Tell us where you are, in your own words — a real person reads it and sends back a small, considered shortlist.",
};

export default function GetMatchedPage() {
  return (
    <main id="main-content" className="bg-sand py-8 text-charcoal md:py-12">
      <ChatOnboarding />
    </main>
  );
}
