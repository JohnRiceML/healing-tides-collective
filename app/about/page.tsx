import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Meet Nora — Healing Tides Collective",
  description:
    "Nora L. Hollenkamp, MSW, LICSW — therapist, founder of Healing Tides Collective, with 20+ years across hospitals, schools, hospice, and community settings. Saint Paul, MN, and telehealth across Minnesota.",
};

const approaches = [
  "Mindfulness-Based CBT",
  "Sensorimotor / Somatic",
  "Dance / Movement",
  "Strength-Based",
];

const expertise = [
  "Body image",
  "Codependency",
  "Coping skills",
  "Depression",
  "Divorce",
  "LGBTQ+",
  "Perfectionism",
  "Stress",
  "Women's issues",
];

const atAGlance: Array<{ label: string; lines: string[] }> = [
  {
    label: "Sessions",
    lines: ["$160 per session", "Sliding scale by application"],
  },
  {
    label: "Insurance",
    lines: ["Out of network", "Superbills provided for reimbursement"],
  },
  {
    label: "Format",
    lines: ["In-person — Saint Paul, MN", "Telehealth across Minnesota"],
  },
  {
    label: "Working with",
    lines: ["Teens, adults, elders", "Individual therapy"],
  },
  {
    label: "Credentials",
    lines: ["LICSW · Minnesota #25149", "MSW, University of Minnesota, 2016"],
  },
  {
    label: "Payment",
    lines: [
      "AmEx · Visa · Mastercard · Discover",
      "Cash · Check · Venmo",
    ],
  },
];

export default function MeetNoraPage() {
  return (
    <main id="main-content" className="bg-sand text-charcoal">
      {/* ───── Intro ───── */}
      <section className="px-6 pt-12 md:px-16 md:pt-16">
        <div className="mx-auto max-w-[1200px]">
          <Link
            href="/"
            className="meta text-ink-muted transition-colors hover:text-charcoal"
          >
            ← Healing Tides Collective
          </Link>
        </div>
      </section>

      <section className="px-6 pb-16 pt-12 md:px-16 md:pb-24 md:pt-20">
        <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-12 md:grid-cols-[5fr_6fr] md:items-end md:gap-16">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2rem] bg-sand-deep">
            <Image
              src="/nora-portrait.jpg"
              alt="Nora L. Hollenkamp seated on a yoga mat beside a houseplant"
              fill
              priority
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          </div>

          <div>
            <span className="meta text-teal">Meet</span>
            <h1 className="font-display mt-6 text-[clamp(52px,9vw,128px)] leading-[0.92] tracking-[-0.035em]">
              Nora
              <span className="italic text-teal"> Hollenkamp.</span>
            </h1>
            <p className="font-display mt-7 text-xl text-ink-soft md:text-2xl">
              MSW, LICSW · she / her
            </p>
            <p className="mt-3 text-base text-ink-muted">
              Licensed clinical therapist — Saint Paul, MN, and telehealth
              across Minnesota.
            </p>

            <p className="meta mt-10 text-charcoal">
              Now accepting new clients in Minnesota
            </p>
          </div>
        </div>
      </section>

      {/* ───── Bio ───── */}
      <section className="px-6 md:px-16">
        <div className="mx-auto max-w-[820px] border-t border-rule pt-16 md:pt-20">
          <span className="meta text-teal">In practice</span>
          <h2 className="font-display mt-6 text-[clamp(34px,5vw,60px)] leading-[1.02] tracking-[-0.025em]">
            Sometimes life quietly drifts
            <span className="italic text-teal"> off course.</span>
          </h2>
          <div className="mt-10 space-y-6 text-[17px] leading-[1.75] text-ink-soft md:text-lg">
            <p>
              Many people come to therapy during times of change — in career,
              in relationships, or after a loss. Others arrive carrying
              emotional or psychological weight that makes it hard to live
              fully. I work with people who feel caught in negative thinking
              patterns, self-criticism, or the pressure to meet others&rsquo;
              expectations.
            </p>
            <p>
              The work is a supportive space to explore your experience and
              reconnect with yourself. I integrate mindfulness, breath,
              meditation, and gentle movement to cultivate greater calm,
              awareness, and ease.
            </p>
            <p>
              As a dancer and devoted yogi, I&rsquo;ve experienced firsthand
              the healing power of movement — and the way it gently releases
              the thought patterns that weigh on us each day.
            </p>
          </div>
        </div>
      </section>

      {/* ───── Approach + Specialties ───── */}
      <section className="mt-20 px-6 md:mt-28 md:px-16">
        <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-16 border-t border-rule pt-16 md:grid-cols-[5fr_6fr] md:gap-20 md:pt-20">
          <div>
            <span className="meta text-teal">Approach</span>
            <h3 className="font-display mt-6 text-3xl leading-[1.1] tracking-[-0.02em] md:text-[40px]">
              Mind, body, and the systems we live in.
            </h3>
            <p className="mt-6 text-[16px] leading-[1.7] text-ink-soft md:text-lg">
              Treatment is highly individualized. I integrate mindfulness-based
              CBT and sensorimotor methods that honor the connection between
              mind, body, and spirit — helping clients regulate their nervous
              systems and gently release pain carried in both.
            </p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {approaches.map((a) => (
                <li
                  key={a}
                  className="rounded-full border border-charcoal/20 px-4 py-2 text-sm text-charcoal"
                >
                  {a}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="meta text-teal">Specialties</span>
            <h3 className="font-display mt-6 text-3xl leading-[1.1] tracking-[-0.02em] md:text-[40px]">
              Anxiety. Life transitions. Relationships.
            </h3>
            <p className="mt-6 text-[16px] leading-[1.7] text-ink-soft md:text-lg">
              I work especially with people navigating anxiety, perfectionism,
              self-criticism, or feeling stuck — and those who feel constant
              pressure to perform or meet others&rsquo; expectations.
            </p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {expertise.map((e) => (
                <li
                  key={e}
                  className="rounded-full bg-charcoal/[0.05] px-4 py-2 text-sm text-ink-soft"
                >
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───── At a glance ───── */}
      <section className="mt-20 px-6 md:mt-28 md:px-16">
        <div className="mx-auto max-w-[1200px] border-t border-rule pt-16 md:pt-20">
          <span className="meta text-teal">At a glance</span>
          <div className="mt-12 grid grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
            {atAGlance.map((b) => (
              <div key={b.label}>
                <p className="meta text-ink-muted">{b.label}</p>
                <div className="mt-4 space-y-1.5 text-[15px] leading-[1.65] text-charcoal">
                  {b.lines.map((l) => (
                    <p key={l}>{l}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Endorsement ───── */}
      <section className="mt-20 px-6 md:mt-28 md:px-16">
        <div className="mx-auto max-w-[820px] border-t border-rule pt-16 md:pt-20">
          <span className="meta text-teal">An endorsement</span>
          <blockquote className="font-display mt-8 text-[clamp(24px,3.5vw,40px)] leading-[1.2] tracking-[-0.015em] text-charcoal">
            “An exceptional therapist who is knowledgeable, honest, and one of
            the kindest people I know. She creates an environment that is
            comforting, free from judgement, and{" "}
            <span className="italic text-teal">safe for all.</span>”
          </blockquote>
          <p className="meta mt-8 text-ink-muted">
            Shari L. Marik-Roach, LICSW
          </p>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="mt-24 px-6 pb-20 md:mt-32 md:px-16 md:pb-28">
        <div className="mx-auto max-w-[820px] border-t border-rule pt-16 text-center md:pt-20">
          <span className="meta text-teal">Let&rsquo;s connect</span>
          <h2 className="font-display mt-6 text-[clamp(36px,6vw,72px)] leading-[0.96] tracking-[-0.025em]">
            A free fifteen-minute
            <br />
            <span className="italic text-teal">consultation.</span>
          </h2>
          <p className="mx-auto mt-8 max-w-md text-base leading-[1.7] text-ink-soft md:text-lg">
            Reach out and we&rsquo;ll see if it feels like a fit. No forms, no
            theatre — a real conversation.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <a
              href="tel:+16513215835"
              className="group inline-flex items-center gap-3 rounded-full bg-charcoal px-6 py-3.5 text-sand shadow-[0_18px_40px_-20px_rgba(0,0,0,0.45)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-sand"
            >
              <span className="meta">(651) 321-5835</span>
              <span
                aria-hidden
                className="flex h-6 w-6 items-center justify-center rounded-full bg-sand/15 text-[11px] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5"
              >
                →
              </span>
            </a>
            <a
              href="mailto:nora@healingtides.co?subject=Consultation%20with%20Nora"
              className="group inline-flex items-center gap-3 rounded-full border border-charcoal/25 px-6 py-3.5 text-charcoal transition-colors hover:border-charcoal/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-sand"
            >
              <span className="meta">Email Nora</span>
              <span
                aria-hidden
                className="flex h-6 w-6 items-center justify-center rounded-full bg-charcoal/10 text-[11px] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5"
              >
                →
              </span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
