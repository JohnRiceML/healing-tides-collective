import Image from "next/image";
import { photos } from "@/app/_lib/images";

const navLinks = [
  ["MISSION", "#mission"],
  ["HOW", "#how"],
  ["FAQ", "#faq"],
  ["BEGIN", "#begin"],
] as const;

const modalities = [
  "Therapy",
  "Acupuncture",
  "Reiki",
  "Movement-based care",
  "Trauma-informed support",
];

const personas = [
  {
    name: "The Overwhelmed Optimizer",
    line: "You have read the studies and own the spreadsheet. You still cannot choose.",
  },
  {
    name: "The Practical Seeker",
    line: "You want a record. You want a real person. You are skeptical of vibes.",
  },
  {
    name: "The Curious Seeker",
    line: "You are open and uncertain. You want a guide, not a gauntlet.",
  },
];

const steps = [
  {
    n: "01",
    title: "Tell us where you are.",
    body: "A short, plain conversation. Two paragraphs is plenty. We do not send you a form.",
  },
  {
    n: "02",
    title: "Read the shortlist.",
    body: "Three to five practitioners, chosen by a person. Each named with a reason.",
  },
  {
    n: "03",
    title: "Begin in your time.",
    body: "Reply to the practitioner directly. Your relationship is yours from the first message.",
  },
];

const faqs = [
  {
    q: "Is this a directory?",
    a: "No. A directory hands you a list and walks away. We hand you a shortlist with the reasoning, written by a person.",
  },
  {
    q: "How are practitioners vetted?",
    a: "License where applicable, training where it matters, working relationship where neither is enough. We turn away more than we accept.",
  },
  {
    q: "Clinical or holistic?",
    a: "Both, side by side, without a hierarchy. A licensed therapist and a craniosacral practitioner can both be the right answer.",
  },
  {
    q: "What about my privacy?",
    a: "Your story belongs to you. We never sell your information. Practitioners only learn what you choose to share with them.",
  },
];

export default function SacredWomanStyleDesign() {
  return (
    <main id="top" className="min-h-screen bg-sand text-charcoal">
      {/* HERO — full-bleed atmospheric sunset */}
      <section className="relative h-[100svh] min-h-[680px] w-full overflow-hidden">
        <Image
          src={photos.sunsetGather.src}
          alt={photos.sunsetGather.alt}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Warm tonal wash to lift overlay text */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,12,6,0.35) 0%, rgba(20,12,6,0.05) 28%, rgba(20,12,6,0.0) 55%, rgba(20,12,6,0.55) 100%)",
          }}
        />

        {/* Top nav overlay */}
        <header className="absolute inset-x-0 top-0 z-20">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-6 md:px-10 md:py-8">
            <a
              href="#top"
              className="text-[11px] tracking-[0.32em] text-sand/95 hover:text-sand"
              style={{ textShadow: "0 1px 12px rgba(0,0,0,0.35)" }}
            >
              HEALING TIDES
            </a>
            <nav className="hidden items-center gap-8 md:flex">
              {navLinks.map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  className="text-[11px] tracking-[0.28em] text-sand/85 transition-colors hover:text-sand"
                  style={{ textShadow: "0 1px 10px rgba(0,0,0,0.35)" }}
                >
                  {label}
                </a>
              ))}
            </nav>
            <a
              href="#begin"
              className="inline-flex items-center rounded-full border border-sand/60 bg-sand/10 px-4 py-2 text-[10px] tracking-[0.28em] text-sand backdrop-blur-md transition-colors hover:bg-sand hover:text-charcoal"
            >
              JOIN US
            </a>
          </div>
        </header>

        {/* Display headline */}
        <div className="relative z-10 flex h-full items-center justify-center px-6 md:px-10">
          <h1
            className="font-display text-center leading-[0.95] text-sand/85"
            style={{
              fontSize: "clamp(60px, 9vw, 160px)",
              letterSpacing: "0.06em",
              textShadow: "0 2px 30px rgba(0,0,0,0.25)",
            }}
          >
            FIND YOUR FIT
          </h1>
        </div>

        {/* Floating "join the collective" card in lower-third */}
        <div className="absolute inset-x-0 bottom-10 z-10 flex justify-center px-6 md:bottom-16 md:px-10">
          <div className="w-full max-w-md rounded-2xl border border-sand/15 bg-charcoal/55 p-6 text-sand shadow-[0_30px_80px_-30px_rgba(0,0,0,0.55)] backdrop-blur-xl md:p-7">
            <p className="text-[11px] tracking-[0.28em] text-sand/75">
              JOIN THE COLLECTIVE
            </p>
            <p className="font-display mt-3 text-2xl leading-snug text-sand md:text-[26px]">
              Care, matched by a person. Begin with two paragraphs.
            </p>
            <form
              className="mt-5 flex flex-col gap-3 sm:flex-row"
              action="mailto:hello@healingtides.co"
              method="post"
              encType="text/plain"
            >
              <label className="sr-only" htmlFor="hero-email">
                Email
              </label>
              <input
                id="hero-email"
                type="email"
                name="email"
                placeholder="your email"
                className="min-w-0 flex-1 rounded-full border border-sand/25 bg-sand/10 px-5 py-3 text-sm text-sand placeholder:text-sand/55 focus:border-sand/60 focus:outline-none"
              />
              <a
                href="mailto:hello@healingtides.co?subject=Begin"
                className="inline-flex items-center justify-center rounded-full bg-charcoal px-6 py-3 text-[11px] tracking-[0.24em] text-sand transition-colors hover:bg-ocean"
              >
                BEGIN
              </a>
            </form>
            <p className="mt-3 text-[11px] text-sand/55">
              No noise, no newsletter pile. One reply, by a person.
            </p>
          </div>
        </div>
      </section>

      {/* SECONDARY ATMOSPHERIC BAND — sunset walk with italic overlay */}
      <section className="relative h-[80svh] min-h-[520px] w-full overflow-hidden">
        <Image
          src={photos.sunsetWalk.src}
          alt={photos.sunsetWalk.alt}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(40,10,8,0.25) 0%, rgba(40,10,8,0.0) 40%, rgba(40,10,8,0.5) 100%)",
          }}
        />
        <div className="relative z-10 flex h-full items-center px-6 md:px-16">
          <div className="max-w-2xl">
            <p className="text-[11px] tracking-[0.32em] text-sand/80">
              THE INVITATION
            </p>
            <p
              className="font-display mt-6 text-sand italic"
              style={{
                fontSize: "clamp(36px, 5.6vw, 72px)",
                lineHeight: 1.05,
                textShadow: "0 2px 24px rgba(0,0,0,0.35)",
              }}
            >
              Begin at the tide.
              <br />
              The right care meets you here.
            </p>
          </div>
        </div>
      </section>

      {/* THE MISSION */}
      <section id="mission" className="relative bg-sand px-6 py-24 md:px-10 md:py-36">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="text-[11px] tracking-[0.28em] text-ink-muted">
              THE MISSION
            </p>
          </div>
          <div className="md:col-span-8">
            <h2
              className="font-display leading-[1.02] tracking-[-0.01em] text-charcoal"
              style={{ fontSize: "clamp(36px, 4.8vw, 64px)" }}
            >
              A care-matching platform for everyone, across clinical and holistic practice.
            </h2>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-soft">
              Healing Tides Collective is the alternative to scrolling a directory at midnight. Tell us where you are, and a person reads it. We send back a shortlist of practitioners with a sentence on why each one fits, by name.
            </p>
            <ul className="mt-10 flex flex-wrap gap-2">
              {modalities.map((m) => (
                <li
                  key={m}
                  className="rounded-full border border-charcoal/15 bg-white px-4 py-2 text-sm text-charcoal"
                >
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative bg-sand-deep px-6 py-24 md:px-10 md:py-36">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] tracking-[0.28em] text-ink-muted">
                THE PRACTICE
              </p>
              <h2
                className="font-display mt-4 leading-[1.02] tracking-[-0.01em]"
                style={{ fontSize: "clamp(36px, 4.8vw, 64px)" }}
              >
                Three steps. No theatre.
              </h2>
            </div>
            <p className="max-w-md text-base leading-relaxed text-ink-soft md:text-right">
              We do not insert ourselves between you and the practitioner once the introduction is made.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-x-12 gap-y-12 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="border-t border-charcoal/15 pt-8">
                <p className="font-display text-sm tracking-[0.2em] text-ocean">
                  {s.n}
                </p>
                <h3 className="font-display mt-6 text-2xl leading-snug md:text-[26px]">
                  {s.title}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-ink-soft">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PERSONAS — quiet warm portrait split */}
      <section className="relative bg-sand px-6 py-24 md:px-10 md:py-36">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-stretch gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2px]">
              <Image
                src={photos.threshold.src}
                alt={photos.threshold.alt}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 40vw, 100vw"
              />
            </div>
            <p className="mt-4 text-[11px] tracking-[0.24em] text-ink-muted">
              THE THRESHOLD
            </p>
          </div>
          <div className="md:col-span-7">
            <p className="text-[11px] tracking-[0.28em] text-ink-muted">
              WHO IT IS FOR
            </p>
            <h2
              className="font-display mt-4 leading-[1.02] tracking-[-0.01em]"
              style={{ fontSize: "clamp(32px, 4.4vw, 56px)" }}
            >
              Three different ways to feel stuck. One way through.
            </h2>
            <ul className="mt-10 divide-y divide-charcoal/10 border-y border-charcoal/10">
              {personas.map((p) => (
                <li key={p.name} className="grid grid-cols-12 gap-4 py-6">
                  <p className="font-display col-span-12 text-lg leading-snug md:col-span-5">
                    {p.name}
                  </p>
                  <p className="col-span-12 text-base leading-relaxed text-ink-soft md:col-span-7">
                    {p.line}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* INTIMATE TEA-POUR EDITORIAL BAND */}
      <section className="relative bg-sand px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={photos.teaPour.src}
                alt={photos.teaPour.alt}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 55vw, 100vw"
              />
            </div>
          </div>
          <div className="md:col-span-5">
            <p className="text-[11px] tracking-[0.28em] text-ink-muted">
              A SMALL CEREMONY
            </p>
            <p className="font-display mt-6 text-2xl italic leading-snug text-charcoal md:text-[28px]">
              The first conversation is short. The shortlist is exact. Your reply is yours alone.
            </p>
          </div>
        </div>
      </section>

      {/* FOR PRACTITIONERS */}
      <section className="relative bg-charcoal px-6 py-24 text-sand md:px-10 md:py-36">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={photos.acupuncture.src}
                alt={photos.acupuncture.alt}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 45vw, 100vw"
              />
            </div>
          </div>
          <div className="md:col-span-6">
            <p className="text-[11px] tracking-[0.28em] text-sand/65">
              FOR PRACTITIONERS
            </p>
            <h2
              className="font-display mt-4 leading-[1.02] tracking-[-0.01em]"
              style={{ fontSize: "clamp(32px, 4.4vw, 56px)" }}
            >
              Aligned clients, not lead lists.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-sand/80">
              We streamline your referral pipeline. Each introduction arrives with context: what the seeker is working on, what they have tried, why we picked you. Your calendar fills with well-matched consultations.
            </p>
            <a
              href="mailto:practitioners@healingtides.co"
              className="mt-10 inline-flex items-center gap-3 border-b border-sand/40 pb-1 text-[11px] tracking-[0.28em] text-sand transition-colors hover:border-sand"
            >
              APPLY TO JOIN THE COLLECTIVE
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative bg-sand px-6 py-24 md:px-10 md:py-36">
        <div className="mx-auto max-w-[900px]">
          <p className="text-[11px] tracking-[0.28em] text-ink-muted">
            QUESTIONS BEFORE YOU WRITE
          </p>
          <h2
            className="font-display mt-4 leading-[1.02] tracking-[-0.01em]"
            style={{ fontSize: "clamp(32px, 4.4vw, 56px)" }}
          >
            Things to ask first.
          </h2>
          <ul className="mt-12 divide-y divide-charcoal/10 border-y border-charcoal/10">
            {faqs.map((f) => (
              <li key={f.q} className="grid grid-cols-12 gap-6 py-8">
                <h3 className="font-display col-span-12 text-xl leading-snug md:col-span-5">
                  {f.q}
                </h3>
                <p className="col-span-12 text-base leading-relaxed text-ink-soft md:col-span-7">
                  {f.a}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FINAL CTA — atmospheric closing */}
      <section
        id="begin"
        className="relative h-[80svh] min-h-[520px] w-full overflow-hidden"
      >
        <Image
          src={photos.sunsetGather.src}
          alt={photos.sunsetGather.alt}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,12,6,0.55) 0%, rgba(20,12,6,0.25) 50%, rgba(20,12,6,0.7) 100%)",
          }}
        />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center md:px-10">
          <p className="text-[11px] tracking-[0.32em] text-sand/80">
            BEGIN HERE
          </p>
          <h2
            className="font-display mt-6 max-w-3xl text-sand"
            style={{
              fontSize: "clamp(40px, 6vw, 88px)",
              lineHeight: 1.02,
              letterSpacing: "0.01em",
              textShadow: "0 2px 30px rgba(0,0,0,0.35)",
            }}
          >
            Find your circle.
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-sand/85">
            Two paragraphs. A real reply within five days. The first match is free.
          </p>
          <a
            href="mailto:hello@healingtides.co?subject=Begin"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-sand px-8 py-3 text-[11px] tracking-[0.28em] text-charcoal transition-colors hover:bg-seafoam"
          >
            BEGIN
            <span aria-hidden>→</span>
          </a>
          <p className="mt-4 text-[11px] tracking-[0.2em] text-sand/65">
            hello@healingtides.co
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-charcoal px-6 py-10 text-sand md:px-10">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4">
          <p className="text-[11px] tracking-[0.32em] text-sand/85">
            HEALING TIDES COLLECTIVE
          </p>
          <p className="text-[11px] tracking-[0.18em] text-sand/55">
            © 2026 / CARE, MATCHED. BY A PERSON.
          </p>
          <div className="flex gap-6 text-[11px] tracking-[0.24em] text-sand/70">
            <a href="#mission" className="hover:text-sand">MISSION</a>
            <a href="#how" className="hover:text-sand">HOW</a>
            <a href="#faq" className="hover:text-sand">FAQ</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
