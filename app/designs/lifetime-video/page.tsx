"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { photos, type PhotoKey } from "@/app/_lib/images";

const modalities = [
  "Therapy",
  "Acupuncture",
  "Reiki",
  "Movement-based care",
  "Trauma-informed support",
];

const personas = [
  { tag: "01", name: "The Overwhelmed Optimizer", line: "You have read the studies. You own the spreadsheet. You still cannot choose." },
  { tag: "02", name: "The Practical Seeker", line: "You want a record. You want a real person. You are skeptical of vibes." },
  { tag: "03", name: "The Curious Seeker", line: "You are open and uncertain. You want a guide, not a gauntlet." },
];

const steps = [
  { n: "01", title: "Tell us where you are.", body: "A short, plain conversation. Two paragraphs is plenty. We do not send you a form." },
  { n: "02", title: "Read the shortlist.", body: "Three to five practitioners chosen by a person, each named with a sentence on why." },
  { n: "03", title: "Begin in your time.", body: "Reply to the practitioner directly. Your relationship is yours from the first message." },
];

const faqs = [
  { q: "Is this a directory?", a: "No. A directory hands you a list and walks away. We hand you a shortlist with the reasoning." },
  { q: "How are practitioners vetted?", a: "License where applicable, training where it matters, working relationship where neither is enough." },
  { q: "Clinical or holistic?", a: "Both, side by side, without a hierarchy." },
  { q: "What about my privacy?", a: "Your story belongs to you. We do not share it with anyone you have not chosen." },
];

/**
 * VideoWell — a crossfading photo well that reads as ambient video.
 * Rotates through `keys` every `interval` ms, with a soft opacity + scale
 * crossfade. Reduced-motion users see only the first frame.
 *
 * To swap to real video later: replace this component's body with a
 * `<video autoplay muted loop playsInline poster="..."><source src="..." type="video/mp4" /></video>`.
 */
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

export default function LifetimeVideoDesign() {
  return (
    <MotionConfig reducedMotion="user">
      <main className="relative bg-sand text-charcoal">
        {/* Top fixed nav (Lifetime pattern: small left link + center wordmark + right CTA) */}
        <header className="fixed inset-x-0 top-0 z-50 px-6 py-4 md:px-10 md:py-5">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between text-sand mix-blend-difference">
            <p className="meta">Miami / Est. 2026</p>
            <p className="font-display text-lg tracking-[0.42em]">HEALING TIDES</p>
            <a
              href="#begin"
              className="meta link-underline"
            >
              Get matched
            </a>
          </div>
        </header>

        {/* HERO — full-viewport vertical split with two crossfading photo wells */}
        <section className="relative h-screen w-full overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-2">
            <VideoWell
              keys={["studio", "attic", "desk"]}
              interval={5500}
              priority
            />
            <VideoWell
              keys={["teaPour", "acupuncture", "threshold"]}
              interval={6500}
            />
          </div>

          {/* Center vertical hairline separating the two wells (Lifetime quirk) */}
          <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-px bg-sand/20" />

          {/* Headline overlay, bottom-left */}
          <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-16 md:px-10 md:pb-20">
            <div className="mx-auto max-w-[1500px]">
              <p className="meta text-sand/70">Healing Tides Collective / Spring 2026</p>
              <h1
                className="font-display mt-6 text-sand leading-[0.92] tracking-[-0.035em]"
                style={{ fontSize: "clamp(56px, 11vw, 200px)" }}
              >
                Find your fit.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-[1.7] text-sand/85 md:text-lg">
                A guided care-matching service across therapy, acupuncture, reiki,
                movement-based care, and trauma-informed support. Replacing
                directories with a shortlist written by a person.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href="#begin"
                  className="meta inline-flex items-center gap-3 border border-sand bg-transparent px-7 py-4 text-sand transition-colors hover:bg-sand hover:text-charcoal"
                >
                  Become a member →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* SPLIT SECTION — Modalities, with one VideoWell on the left, type on the right */}
        <section className="relative h-[80vh] w-full overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2">
            <VideoWell keys={["practice", "acupuncture", "studio"]} interval={5000} />
            <div className="flex items-center justify-center bg-sand p-10 md:p-16">
              <div className="max-w-md">
                <p className="meta text-ink-muted">02 / What we hold</p>
                <h2
                  className="font-display mt-8 leading-[0.95] tracking-[-0.025em]"
                  style={{ fontSize: "clamp(34px, 5vw, 68px)" }}
                >
                  Five care types.
                  <br />
                  <span className="italic text-ocean">Held side by side.</span>
                </h2>
                <ul className="mt-10 divide-y divide-rule">
                  {modalities.map((m) => (
                    <li key={m} className="font-display py-4 text-2xl leading-snug md:text-3xl">
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SPLIT SECTION — How it works (text left, video right) */}
        <section className="relative h-[80vh] w-full overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2">
            <div className="order-2 flex items-center justify-center bg-sand p-10 md:order-1 md:p-16">
              <div className="max-w-md">
                <p className="meta text-ink-muted">03 / How it works</p>
                <h2
                  className="font-display mt-8 leading-[0.95] tracking-[-0.025em]"
                  style={{ fontSize: "clamp(34px, 5vw, 68px)" }}
                >
                  Three steps.
                  <br />
                  <span className="italic text-ocean">No theatre.</span>
                </h2>
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
            <div className="order-1 md:order-2">
              <VideoWell keys={["windowView", "desk", "landing"]} interval={5800} />
            </div>
          </div>
        </section>

        {/* PERSONAS — full-bleed band on a single video well, content overlaid */}
        <section className="relative h-screen w-full overflow-hidden">
          <VideoWell keys={["threshold", "windowView", "studio"]} interval={6500} />
          <div className="absolute inset-0 z-10 bg-charcoal/40" />
          <div className="absolute inset-0 z-20 flex items-end px-6 pb-16 md:px-10 md:pb-24">
            <div className="mx-auto w-full max-w-[1500px]">
              <p className="meta text-sand/70">04 / Who it is for</p>
              <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
                {personas.map((p) => (
                  <div key={p.name} className="text-sand">
                    <p className="meta text-sand/60">{p.tag}</p>
                    <h3 className="font-display mt-4 text-2xl leading-tight md:text-3xl">{p.name}</h3>
                    <p className="mt-3 text-[15px] leading-[1.65] text-sand/85">{p.line}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SPLIT SECTION — For practitioners */}
        <section className="relative h-[80vh] w-full overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2">
            <VideoWell keys={["acupuncture", "teaPour", "attic"]} interval={6000} />
            <div className="flex items-center justify-center bg-sand p-10 md:p-16">
              <div className="max-w-md">
                <p className="meta text-ink-muted">05 / For practitioners</p>
                <h2
                  className="font-display mt-8 leading-[0.95] tracking-[-0.025em]"
                  style={{ fontSize: "clamp(34px, 5vw, 68px)" }}
                >
                  Fewer leads.
                  <br />
                  <span className="italic text-ocean">Better fits.</span>
                </h2>
                <p className="mt-8 text-[16px] leading-[1.7] text-ink-soft">
                  We streamline your referral pipeline. Each introduction arrives with
                  context. You decide whether to take the consultation. We never charge
                  per lead, and we never sell your information.
                </p>
                <a
                  href="mailto:practitioners@healingtides.co"
                  className="meta mt-10 inline-flex items-center gap-3 border border-charcoal px-6 py-3 transition-colors hover:bg-charcoal hover:text-sand"
                >
                  Apply to join the collective →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ — clean restraint on sand */}
        <section className="bg-sand py-24 md:py-32">
          <div className="mx-auto max-w-[900px] px-6 md:px-10">
            <p className="meta text-ink-muted">06 / Things you might be wondering</p>
            <ul className="mt-12 divide-y divide-rule border-y border-rule">
              {faqs.map((f) => (
                <li key={f.q} className="grid grid-cols-12 gap-6 py-7">
                  <p className="font-display col-span-12 text-xl leading-snug md:col-span-5 md:text-2xl">{f.q}</p>
                  <p className="col-span-12 text-[15px] leading-[1.7] text-ink-soft md:col-span-7">{f.a}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FINAL CTA — single full-bleed video well */}
        <section id="begin" className="relative h-screen w-full overflow-hidden">
          <VideoWell keys={["sunsetGather", "sunsetWalk", "studio"]} interval={6500} />
          <div className="absolute inset-0 z-10 bg-charcoal/45" />
          <div className="absolute inset-0 z-20 flex items-center justify-center px-6 text-center">
            <div className="max-w-3xl text-sand">
              <p className="meta text-sand/70">07 / Begin here</p>
              <h2
                className="font-display mt-8 leading-[0.92] tracking-[-0.03em]"
                style={{ fontSize: "clamp(48px, 9vw, 144px)" }}
              >
                Send a paragraph.
                <br />
                <span className="italic text-seafoam">We answer with names.</span>
              </h2>
              <p className="mt-8 text-base leading-[1.7] text-sand/85 md:text-lg">
                Two paragraphs is plenty. A real person answers, by name, within five business days.
              </p>
              <a
                href="mailto:hello@healingtides.co?subject=Begin"
                className="meta mt-12 inline-flex items-center gap-3 border border-sand bg-transparent px-8 py-4 text-sand transition-colors hover:bg-sand hover:text-charcoal"
              >
                hello@healingtides.co →
              </a>
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
