"use client";

// Split-screen render of the production landing copy.
// 01 Mission   — hero: two VideoWells + centered headline overlay
// 02 Modalities — split: VideoWell left, 5 cards (name + line) right
// 03 How        — split: 3 steps left, VideoWell right (rhythm break)
// 04 Practitioners — split: VideoWell left, headline + stats + CTA right
// 05 Questions  — full-bleed sand FAQ band (breathing room)
// 06 Begin      — two flanking VideoWells, centered dual CTA cards

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { photos, type PhotoKey } from "@/app/_lib/images";

const modalityCards = [
  { name: "Therapy", line: "Licensed clinicians who pick up the phone before the pitch." },
  { name: "Acupuncture", line: "Practitioners with a real clinical record. Not a weekend course." },
  { name: "Reiki", line: "Energy work, held with care. Clear consent, no mysticism." },
  { name: "Movement", line: "Teachers who work with adult bodies. Yoga, somatics, breath." },
  { name: "Trauma-informed", line: "Across every modality. You set the pace. Not the practitioner." },
];

const steps = [
  { n: "01", title: "Tell us where you are.", body: "Two paragraphs is plenty. Plain language. No forms." },
  { n: "02", title: "Read the shortlist.", body: "Three to five practitioners, chosen by a person. Each one with a reason." },
  { n: "03", title: "Begin.", body: "Reply to the practitioner directly. The relationship is yours from the first message." },
];

const stats = [
  { n: "1:1", l: "Every introduction reviewed by a person" },
  { n: "0%", l: "Per-lead fees, ever" },
  { n: "5d", l: "Median time to first reply" },
];

const faqs = [
  {
    q: "Is this a directory?",
    a: "No. A directory hands you a list and walks away. We hand you a shortlist with the reasoning, written by a person who read what you sent.",
  },
  {
    q: "How are practitioners vetted?",
    a: "Licensing when it applies. Training when it matters. A working relationship when neither is enough. We turn away more practitioners than we accept.",
  },
  {
    q: "Clinical or holistic?",
    a: "Both, side by side, without a hierarchy. A licensed therapist and a craniosacral practitioner can both be the right answer.",
  },
  {
    q: "What about my privacy?",
    a: "Your story is yours. We never sell it. Practitioners only learn what you decide to share.",
  },
];

function VideoWell({
  keys,
  interval = 5500,
  priority = false,
  className = "",
}: {
  keys: PhotoKey[];
  interval?: number;
  priority?: boolean;
  className?: string;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    // Reduced-motion: hold the first frame, never start the rotation timer.
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const t = setInterval(() => setI((prev) => (prev + 1) % keys.length), interval);
    return () => clearInterval(t);
  }, [keys.length, interval]);

  return (
    <div className={`relative h-full w-full overflow-hidden bg-charcoal ${className}`}>
      <AnimatePresence>
        <motion.div
          key={keys[i]}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1.1 }}
          exit={{ opacity: 0, scale: 1.16 }}
          transition={{
            opacity: { duration: 1.6, ease: [0.22, 1, 0.36, 1] },
            scale: { duration: interval / 1000 + 1.6, ease: "linear" },
          }}
          className="absolute inset-0"
        >
          <Image
            src={photos[keys[i]].src}
            alt={photos[keys[i]].alt}
            fill
            priority={priority && i === 0}
            className="object-cover"
            sizes="50vw"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/10 via-transparent to-charcoal/40" />
    </div>
  );
}

export default function SplitDesign() {
  return (
    <MotionConfig reducedMotion="user">
      <main className="relative bg-sand text-charcoal">
        {/* Fixed nav — mix-blend-difference inverts against any background */}
        <header className="fixed inset-x-0 top-0 z-50 px-6 py-4 md:px-10 md:py-5">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between text-sand mix-blend-difference">
            <p className="meta">Miami / Est. 2026</p>
            <p className="font-display text-lg tracking-[0.42em]">HEALING TIDES</p>
            <a href="#begin" className="meta link-underline">
              Get matched
            </a>
          </div>
        </header>

        {/* 01 Mission — hero split with centered headline overlay */}
        <section className="relative h-screen w-full overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-2">
            <VideoWell keys={["heroMeditation", "careSideBySide", "studio"]} interval={5500} priority />
            <VideoWell keys={["teaPour", "acupuncture", "threshold"]} interval={6500} />
          </div>

          {/* Center vertical hairline */}
          <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-px bg-sand/20" />

          {/* Headline overlay, bottom-left */}
          <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-16 md:px-10 md:pb-20">
            <div className="mx-auto max-w-[1500px]">
              <p className="meta text-sand/70">01 / Mission</p>
              <h1
                className="font-display mt-6 text-sand leading-[0.92] tracking-[-0.035em]"
                style={{ fontSize: "clamp(56px, 11vw, 200px)" }}
              >
                Less searching.
                <br />
                <span className="italic text-seafoam">More healing.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-[1.7] text-sand/85 md:text-lg">
                Therapy, acupuncture, reiki, movement, trauma-informed care.
                Held side by side, without a hierarchy. A person reads what
                you sent and writes back with three to five names.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href="#begin"
                  className="meta inline-flex items-center gap-3 border border-sand bg-transparent px-7 py-4 text-sand transition-colors hover:bg-sand hover:text-charcoal"
                >
                  Get matched &rarr;
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 02 Modalities — VideoWell left, 5 cards right */}
        <section className="relative min-h-[90vh] w-full overflow-hidden md:h-[90vh]">
          <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2">
            <div className="h-[50vh] md:h-full">
              <VideoWell keys={["practice", "acupuncture", "studio"]} interval={5000} />
            </div>
            <div className="flex items-center justify-center bg-sand p-10 md:p-16">
              <div className="max-w-md">
                <p className="meta text-ink-muted">02 / Modalities</p>
                <h2
                  className="font-display mt-8 leading-[0.95] tracking-[-0.025em]"
                  style={{ fontSize: "clamp(34px, 5vw, 68px)" }}
                >
                  Care, held
                  <br />
                  <span className="italic text-ocean">side by side.</span>
                </h2>
                <ul className="mt-10 divide-y divide-rule border-t border-rule">
                  {modalityCards.map((m) => (
                    <li key={m.name} className="py-5">
                      <h3 className="font-display text-2xl leading-tight md:text-[28px]">{m.name}</h3>
                      <p className="mt-2 text-[15px] leading-[1.65] text-ink-soft">{m.line}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 03 How — steps left, VideoWell right (alternates the rhythm) */}
        <section className="relative min-h-[90vh] w-full overflow-hidden md:h-[90vh]">
          <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2">
            <div className="order-2 flex items-center justify-center bg-sand p-10 md:order-1 md:p-16">
              <div className="max-w-md">
                <p className="meta text-ink-muted">03 / How</p>
                <h2
                  className="font-display mt-8 leading-[0.95] tracking-[-0.025em]"
                  style={{ fontSize: "clamp(34px, 5vw, 68px)" }}
                >
                  Three steps.
                  <br />
                  <span className="italic text-ocean">No theatre.</span>
                </h2>
                <p className="mt-6 text-[15px] leading-[1.65] text-ink-soft">
                  No forms. No theatre. No algorithm pretending to know you.
                </p>
                <ol className="mt-10 space-y-8">
                  {steps.map((s) => (
                    <li key={s.n} className="grid grid-cols-12 gap-4">
                      <p className="font-display col-span-2 text-3xl text-ocean">{s.n}</p>
                      <div className="col-span-10">
                        <h3 className="font-display text-xl leading-tight">{s.title}</h3>
                        <p className="mt-2 text-[15px] leading-[1.65] text-ink-soft">{s.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="order-1 h-[50vh] md:order-2 md:h-full">
              <VideoWell keys={["windowView", "desk", "landing"]} interval={5800} />
            </div>
          </div>
        </section>

        {/* 04 Practitioners — VideoWell left, headline + stats + CTA right */}
        <section className="relative min-h-[95vh] w-full overflow-hidden md:h-[95vh]">
          <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2">
            <div className="h-[50vh] md:h-full">
              <VideoWell keys={["acupuncture", "teaPour", "attic"]} interval={6000} />
            </div>
            <div className="flex items-center justify-center bg-sand p-10 md:p-16">
              <div className="max-w-md">
                <p className="meta text-ink-muted">04 / Practitioners</p>
                <h2
                  className="font-display mt-8 leading-[0.95] tracking-[-0.025em]"
                  style={{ fontSize: "clamp(34px, 5vw, 68px)" }}
                >
                  Fewer leads.
                  <br />
                  <span className="italic text-ocean">Better fits.</span>
                </h2>
                <p className="mt-8 text-[16px] leading-[1.7] text-ink-soft">
                  Real referrals, not lead lists. Each introduction arrives with
                  context &mdash; what the seeker is working on, what they have tried,
                  why we picked you.
                </p>
                <div className="mt-10 grid grid-cols-3 gap-3">
                  {stats.map((s) => (
                    <div
                      key={s.l}
                      className="rounded-2xl border border-rule bg-sand-deep/40 p-4"
                    >
                      <p className="font-display text-2xl text-ocean md:text-3xl">{s.n}</p>
                      <p className="mt-2 text-[11px] leading-snug text-ink-soft">{s.l}</p>
                    </div>
                  ))}
                </div>
                <a
                  href="mailto:nora@healingtidestherapy.com?subject=Apply%20to%20the%20collective"
                  className="meta mt-10 inline-flex items-center gap-3 border border-charcoal px-6 py-3 transition-colors hover:bg-charcoal hover:text-sand"
                >
                  Apply to join the collective &rarr;
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 05 Questions — full-bleed FAQ on sand */}
        <section className="bg-sand py-24 md:py-32">
          <div className="mx-auto max-w-[900px] px-6 md:px-10">
            <p className="meta text-ink-muted">05 / Questions</p>
            <h2
              className="font-display mt-8 leading-[0.95] tracking-[-0.025em]"
              style={{ fontSize: "clamp(34px, 5vw, 68px)" }}
            >
              Things to ask
              <br />
              <span className="italic text-ocean">before you write.</span>
            </h2>
            <ul className="mt-12 divide-y divide-rule border-y border-rule">
              {faqs.map((f) => (
                <li key={f.q} className="grid grid-cols-12 gap-6 py-7">
                  <p className="font-display col-span-12 text-xl leading-snug md:col-span-5 md:text-2xl">
                    {f.q}
                  </p>
                  <p className="col-span-12 text-[15px] leading-[1.7] text-ink-soft md:col-span-7">
                    {f.a}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 06 Begin — two flanking VideoWells, centered dual CTAs */}
        <section id="begin" className="relative h-screen min-h-[760px] w-full overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-2">
            <VideoWell keys={["sunsetGather", "sunsetWalk", "threshold"]} interval={6500} />
            <VideoWell keys={["landing", "windowView", "studio"]} interval={7000} />
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-px bg-sand/20" />
          <div className="absolute inset-0 z-10 bg-charcoal/55" />

          <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
            <div className="w-full max-w-3xl text-center text-sand">
              <p className="meta text-sand/70">06 / Begin</p>
              <h2
                className="font-display mt-6 leading-[0.92] tracking-[-0.03em]"
                style={{ fontSize: "clamp(56px, 10vw, 160px)" }}
              >
                Begin.
              </h2>

              <div className="mx-auto mt-12 grid w-full max-w-2xl grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Primary — seeker */}
                <a
                  href="mailto:nora@healingtidestherapy.com?subject=Get%20matched"
                  className="group relative flex flex-col rounded-3xl bg-seafoam p-7 text-left text-charcoal shadow-[0_18px_40px_-20px_rgba(0,0,0,0.6)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal sm:p-8"
                >
                  <span className="meta text-charcoal/70">For seekers</span>
                  <span className="font-display mt-4 text-2xl leading-tight md:text-[26px]">
                    I&rsquo;m seeking care
                  </span>
                  <span className="mt-4 text-[14px] leading-[1.6] text-charcoal/80">
                    Two paragraphs. We choose the right person.
                  </span>
                  <span
                    aria-hidden
                    className="absolute bottom-6 right-6 flex h-9 w-9 items-center justify-center rounded-full bg-charcoal/10 text-charcoal transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:bg-charcoal/15"
                  >
                    &rarr;
                  </span>
                </a>

                {/* Secondary — practitioner */}
                <a
                  href="mailto:nora@healingtidestherapy.com?subject=Practitioner%20inquiry"
                  className="group relative flex flex-col rounded-3xl border border-sand/35 bg-charcoal/55 p-7 text-left text-sand backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)] transition-colors hover:border-sand/70 hover:bg-charcoal/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-seafoam focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal sm:p-8"
                >
                  <span className="meta text-sand/70">For practitioners</span>
                  <span className="font-display mt-4 text-2xl leading-tight md:text-[26px]">
                    I&rsquo;m a practitioner
                  </span>
                  <span className="mt-4 text-[14px] leading-[1.6] text-sand/80">
                    Tell us about your practice. We&rsquo;ll read it.
                  </span>
                  <span
                    aria-hidden
                    className="absolute bottom-6 right-6 flex h-9 w-9 items-center justify-center rounded-full bg-sand/10 text-sand transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:bg-sand/20"
                  >
                    &rarr;
                  </span>
                </a>
              </div>

              <p className="meta mt-10 text-sand/70">
                or write directly to{" "}
                <a
                  href="mailto:nora@healingtidestherapy.com"
                  className="text-seafoam underline-offset-4 hover:underline"
                >
                  nora@healingtidestherapy.com
                </a>
              </p>
            </div>
          </div>
        </section>

        <footer className="bg-charcoal text-sand">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-8 md:px-10">
            <p className="meta text-sand/70">Healing Tides Collective / 2026</p>
            <p className="meta text-sand/60">Care, matched. By a person.</p>
          </div>
        </footer>
      </main>
    </MotionConfig>
  );
}
