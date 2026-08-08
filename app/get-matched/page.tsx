import type { Metadata } from "next";

import { GetMatchedExperience } from "./GetMatchedExperience";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Find your fit — Healing Tides Collective",
  description:
    "A calm conversation that helps you find the right practitioner. Tell us where you are, in your own words — a real person reads it and sends back a small, considered shortlist.",
  alternates: { canonical: `${SITE_URL}/get-matched` },
  openGraph: { url: `${SITE_URL}/get-matched` },
};

export default function GetMatchedPage() {
  return (
    <main id="main-content" className="bg-sand py-8 text-charcoal md:py-12">
      <h1 className="sr-only">Get matched with a Minnesota care practitioner</h1>
      <GetMatchedExperience />
    </main>
  );
}
