import type { Metadata } from "next";
import Link from "next/link";
import { LinkButton } from "@/app/_components/ui";

const TITLE = "For practitioners — Healing Tides Collective";
const DESCRIPTION =
  "A calm, curated home for therapists and wellness practitioners. A beautiful profile clients can find on Google, a considered community, and your own way of working honored. List your practice.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const whatYouGet: Array<{ label: string; title: string; body: string }> = [
  {
    label: "Found",
    title: "A profile clients can find on Google.",
    body:
      "A beautiful, search-friendly page of your own — your approach, your specialties, your words. Built to be found by the people already looking for someone like you.",
  },
  {
    label: "Belonging",
    title: "A considered community.",
    body:
      "Not a directory wall of ten thousand names. A small, curated collective of clinicians and holistic practitioners, gathered with care — so being listed here means something.",
  },
  {
    label: "Trust",
    title: "Credentials, shown plainly.",
    body:
      "License, training, and the way you work, presented with quiet confidence. Clients arrive already understanding who you are — and trusting how you got here.",
  },
  {
    label: "Yours",
    title: "Your own way of working, honored.",
    body:
      "Somatic, clinical, movement-based, or somewhere in between — your practice is presented on its own terms. We don't flatten you into a category.",
  },
];

const howItWorks: Array<{ step: string; title: string; body: string }> = [
  {
    step: "01",
    title: "Sign up.",
    body: "Make an account in a moment. No long forms, no theatre — just enough to begin.",
  },
  {
    step: "02",
    title: "Drop a link.",
    body:
      "Share where you already live online — your site, your booking page. We draft your profile from it in seconds, in your voice, ready to shape.",
  },
  {
    step: "03",
    title: "Add a photo.",
    body:
      "One warm, natural portrait — you in the room where you work. It's the difference between a listing and a person.",
  },
  {
    step: "04",
    title: "Publish.",
    body:
      "Read it over, make it yours, and go live when it feels right. Take it down any time — nothing is permanent.",
  },
];

export default function ForPractitionersPage() {
  return (
    <main id="main-content" className="bg-sand text-charcoal">
      {/* ───── Back link ───── */}
      <section className="px-6 pt-12 md:px-16 md:pt-16">
        <div className="mx-auto max-w-[1200px]">
          <Link
            href="/"
            className="meta inline-block rounded-full text-ink-muted transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15 focus-visible:ring-offset-4 focus-visible:ring-offset-sand"
          >
            ← Healing Tides Collective
          </Link>
        </div>
      </section>

      {/* ───── Hero ───── */}
      <section className="px-6 pb-16 pt-12 md:px-16 md:pb-24 md:pt-20">
        <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-12 md:grid-cols-[6fr_5fr] md:items-end md:gap-16">
          <div>
            <span className="meta text-teal">For practitioners</span>
            <h1 className="font-display mt-6 text-[clamp(48px,8vw,116px)] leading-[0.92] tracking-[-0.035em]">
              A calmer place
              <span className="italic text-teal"> to be found.</span>
            </h1>
            <p className="mt-8 max-w-xl text-[17px] leading-[1.7] text-ink-soft md:text-lg">
              Healing Tides is a small, curated collective for therapists and
              wellness practitioners — a human alternative to the endless
              directory. Clients come here to find the right person, not to
              scroll past a thousand. We'd love for that person to be you.
            </p>
          </div>

          <div className="md:pb-3">
            <p className="meta text-charcoal">Now welcoming practitioners</p>
            <p className="mt-4 text-base leading-[1.7] text-ink-soft">
              Listing is free to begin. Your profile, your words, your pace.
            </p>
          </div>
        </div>
      </section>

      {/* ───── What you get ───── */}
      <section className="px-6 md:px-16">
        <div className="mx-auto max-w-[1200px] border-t border-rule pt-16 md:pt-20">
          <span className="meta text-teal">What you get</span>
          <h2 className="font-display mt-6 max-w-3xl text-[clamp(34px,5vw,60px)] leading-[1.02] tracking-[-0.025em]">
            A home for your practice — not a
            <span className="italic text-teal"> listing in a list.</span>
          </h2>

          <div className="mt-14 grid grid-cols-1 gap-x-16 gap-y-12 md:mt-16 md:grid-cols-2">
            {whatYouGet.map((item) => (
              <div key={item.label}>
                <span className="meta text-ink-muted">{item.label}</span>
                <h3 className="font-display mt-4 text-2xl leading-[1.12] tracking-[-0.02em] md:text-[28px]">
                  {item.title}
                </h3>
                <p className="mt-5 text-[16px] leading-[1.7] text-ink-soft md:text-lg">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── How it works ───── */}
      <section className="mt-20 px-6 md:mt-28 md:px-16">
        <div className="mx-auto max-w-[1200px] border-t border-rule pt-16 md:pt-20">
          <span className="meta text-teal">How it works</span>
          <h2 className="font-display mt-6 max-w-3xl text-[clamp(34px,5vw,60px)] leading-[1.02] tracking-[-0.025em]">
            Live in minutes,
            <span className="italic text-teal"> not weeks.</span>
          </h2>

          <ol className="mt-14 grid grid-cols-1 gap-x-12 gap-y-12 md:mt-16 md:grid-cols-2">
            {howItWorks.map((item) => (
              <li
                key={item.step}
                className="border-t border-rule/70 pt-7 md:grid md:grid-cols-[auto_1fr] md:gap-7"
              >
                <span className="font-display text-3xl leading-none text-teal md:text-4xl">
                  {item.step}
                </span>
                <div className="mt-4 md:mt-0">
                  <h3 className="font-display text-2xl leading-[1.12] tracking-[-0.02em] md:text-[26px]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[16px] leading-[1.7] text-ink-soft md:text-lg">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="mt-24 px-6 pb-20 md:mt-32 md:px-16 md:pb-28">
        <div className="mx-auto max-w-[820px] border-t border-rule pt-16 text-center md:pt-20">
          <span className="meta text-teal">Join the collective</span>
          <h2 className="font-display mt-6 text-[clamp(36px,6vw,72px)] leading-[0.96] tracking-[-0.025em]">
            Let people find
            <br />
            <span className="italic text-teal">the real you.</span>
          </h2>
          <p className="mx-auto mt-8 max-w-md text-base leading-[1.7] text-ink-soft md:text-lg">
            Start your profile today. It costs nothing to begin, and you decide
            what to share and when.
          </p>
          <div className="mt-12 flex justify-center">
            <LinkButton href="/join" tone="primary" className="px-7 py-3.5">
              List your practice
              <span aria-hidden>→</span>
            </LinkButton>
          </div>
        </div>
      </section>
    </main>
  );
}
