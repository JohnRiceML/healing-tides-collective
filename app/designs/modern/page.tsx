import Link from "next/link";
import Image from "next/image";
import { photos } from "@/app/_lib/images";

const modalities = [
  "Therapy",
  "Acupuncture",
  "Reiki",
  "Movement-based care",
  "Trauma-informed support",
];

const valueTiles = [
  {
    eyebrow: "By a person",
    title: "Matches written by humans, not algorithms.",
    body: "Three to five practitioners chosen by name. Each pick comes with a sentence on why they fit you.",
    photoKey: "handsBook" as const,
    accent: "ocean",
  },
  {
    eyebrow: "Clinical + holistic",
    title: "Therapy and reiki, side by side.",
    body: "We hold both, without a hierarchy. The right answer is the one that breathes right for you.",
    accent: "sage",
  },
  {
    eyebrow: "Trust first",
    title: "Free until it fits.",
    body: "We charge a small fee only after your first session. Refundable if the fit is wrong.",
    accent: "teal",
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

const personas = [
  { name: "The Overwhelmed Optimizer", line: "You have read the studies and own the spreadsheet. You still cannot choose." },
  { name: "The Practical Seeker", line: "You want a record. You want a real person. You are skeptical of vibes." },
  { name: "The Curious Seeker", line: "You are open and uncertain. You want a guide, not a gauntlet." },
];

const practitionerStats = [
  { n: "1:1", label: "Every introduction reviewed by a person" },
  { n: "0%", label: "Per-lead fees, ever" },
  { n: "5d", label: "Median time to first reply" },
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

function PillNav() {
  return (
    <div className="sticky top-4 z-40 mx-auto flex w-max items-center gap-2 rounded-full border border-charcoal/10 bg-sand/80 px-2 py-2 shadow-[0_10px_40px_-15px_rgba(47,47,47,0.25)] backdrop-blur-md md:gap-3 md:px-3">
      <Link
        href="#top"
        className="font-display rounded-full px-4 py-2 text-sm leading-none text-charcoal hover:bg-charcoal/5"
      >
        Healing Tides
      </Link>
      <div className="hidden items-center gap-1 md:flex">
        {[
          ["How", "how"],
          ["Practitioners", "practitioners"],
          ["FAQ", "faq"],
        ].map(([l, h]) => (
          <a
            key={h}
            href={`#${h}`}
            className="rounded-full px-4 py-2 text-sm text-ink-soft hover:bg-charcoal/5"
          >
            {l}
          </a>
        ))}
      </div>
      <a
        href="#begin"
        className="group inline-flex items-center gap-2 rounded-full bg-ocean py-2 pl-5 pr-2 text-sm text-sand transition-colors hover:bg-charcoal"
      >
        Get matched
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sand/15 transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </a>
    </div>
  );
}

function CardShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  // Double-bezel: outer hairline + inner card with soft shadow.
  return (
    <div className={`rounded-[2rem] border border-charcoal/[0.06] bg-charcoal/[0.02] p-1.5 ${className}`}>
      <div className="rounded-[calc(2rem-0.375rem)] bg-white shadow-[0_20px_60px_-30px_rgba(47,47,47,0.18)]">
        {children}
      </div>
    </div>
  );
}

const accentBg: Record<string, string> = {
  ocean: "bg-ocean/5 text-ocean",
  sage: "bg-sage/15 text-charcoal",
  teal: "bg-teal/10 text-teal",
};

export default function ModernDesign() {
  return (
    <main id="top" className="relative min-h-screen overflow-x-hidden bg-sand text-charcoal">
      {/* Ambient gradient bloom in background */}
      <div
        className="pointer-events-none absolute inset-x-0 top-[-10%] h-[80vh]"
        aria-hidden
        style={{
          background:
            "radial-gradient(60% 60% at 30% 20%, rgba(214,237,232,0.45) 0%, transparent 70%), radial-gradient(40% 40% at 80% 30%, rgba(168,191,163,0.25) 0%, transparent 70%)",
        }}
      />

      <div className="relative pt-6">
        <PillNav />
      </div>

      {/* Hero */}
      <section className="relative px-4 pt-12 md:px-8 md:pt-20">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid grid-cols-1 items-end gap-12 md:grid-cols-12">
            <div className="md:col-span-7">
              <span className="inline-flex items-center rounded-full bg-charcoal/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-charcoal">
                A modern front door to wellness
              </span>
              <h1 className="font-display mt-6 text-[clamp(48px,8vw,104px)] leading-[0.95] tracking-[-0.03em]">
                Find the right care.
                <br />
                <span className="italic text-ocean">Faster than you thought.</span>
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft md:text-xl">
                A modern, thoughtfully designed platform that makes finding care simple. Instead of overwhelming
                directories, we guide you to the right fit — across therapy, acupuncture, reiki, movement, and
                trauma-informed support.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href="#begin"
                  className="group inline-flex items-center gap-2 rounded-full bg-ocean py-3 pl-7 pr-2 text-base text-sand shadow-[0_18px_40px_-20px_rgba(31,58,95,0.55)] transition-colors hover:bg-charcoal"
                >
                  Get matched, free to start
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sand/15 transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </a>
                <a
                  href="#how"
                  className="group inline-flex items-center gap-2 rounded-full border border-charcoal/20 px-6 py-3 text-base text-charcoal transition-colors hover:bg-charcoal hover:text-sand"
                >
                  How it works
                  <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
                </a>
              </div>
              <ul className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-muted">
                <li>5-day median reply</li>
                <li className="opacity-50">·</li>
                <li>Refundable if it doesn&rsquo;t fit</li>
                <li className="opacity-50">·</li>
                <li>Reviewed by a person</li>
              </ul>
            </div>
            <div className="md:col-span-5">
              <CardShell>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[calc(2rem-0.375rem)]">
                  <Image
                    src={photos.threshold.src}
                    alt={photos.threshold.alt}
                    fill
                    priority
                    className="object-cover"
                    sizes="(min-width: 768px) 40vw, 100vw"
                  />
                </div>
              </CardShell>
            </div>
          </div>
        </div>
      </section>

      {/* Modalities pill row */}
      <section className="relative px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-center text-sm uppercase tracking-[0.18em] text-ink-muted">
            Care, held side by side
          </p>
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {modalities.map((m) => (
              <li
                key={m}
                className="rounded-full border border-charcoal/10 bg-white px-5 py-2 text-sm text-charcoal shadow-[0_4px_14px_-6px_rgba(47,47,47,0.1)]"
              >
                {m}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Bento value tiles */}
      <section className="relative px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-5 md:grid-cols-12">
          {/* Large feature tile */}
          <CardShell className="md:col-span-7">
            <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
              <div className="p-8 md:p-10">
                <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] ${accentBg[valueTiles[0].accent]}`}>
                  {valueTiles[0].eyebrow}
                </span>
                <h3 className="font-display mt-6 text-3xl leading-tight md:text-[34px]">
                  {valueTiles[0].title}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-ink-soft">{valueTiles[0].body}</p>
              </div>
              <div className="relative min-h-[260px] overflow-hidden rounded-b-[calc(2rem-0.375rem)] md:rounded-bl-none md:rounded-r-[calc(2rem-0.375rem)]">
                <Image
                  src={photos.handsBook.src}
                  alt={photos.handsBook.alt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 35vw, 100vw"
                />
              </div>
            </div>
          </CardShell>

          {/* Two stacked tiles */}
          <div className="grid grid-cols-1 gap-5 md:col-span-5">
            {valueTiles.slice(1).map((t) => (
              <CardShell key={t.eyebrow}>
                <div className="p-8 md:p-10">
                  <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] ${accentBg[t.accent]}`}>
                    {t.eyebrow}
                  </span>
                  <h3 className="font-display mt-6 text-2xl leading-tight md:text-[28px]">{t.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-ink-soft">{t.body}</p>
                </div>
              </CardShell>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative px-4 py-20 md:px-8 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-charcoal/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-charcoal">
              How it works
            </span>
            <h2 className="font-display mt-6 text-[clamp(36px,5vw,64px)] leading-[1] tracking-[-0.025em]">
              Three steps. <span className="italic text-ocean">No theatre.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">
              We do not send forms or push notifications. We do not insert ourselves between you and the
              practitioner once we have made the introduction.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <CardShell key={s.n}>
                <div className="p-8 md:p-10">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ocean text-sm text-sand">
                    {s.n}
                  </span>
                  <h3 className="font-display mt-8 text-2xl leading-tight">{s.title}</h3>
                  <p className="mt-4 text-base leading-relaxed text-ink-soft">{s.body}</p>
                </div>
              </CardShell>
            ))}
          </div>
        </div>
      </section>

      {/* Personas */}
      <section className="relative px-4 py-20 md:px-8 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid grid-cols-1 items-end gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <span className="inline-flex items-center rounded-full bg-charcoal/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-charcoal">
                Who it is for
              </span>
              <h2 className="font-display mt-6 text-[clamp(32px,4.5vw,56px)] leading-[1.05] tracking-[-0.02em]">
                Three different ways
                <br />
                <span className="italic text-ocean">to feel stuck.</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-ink-soft">
                The flow is the same for everyone. The voice adapts to where you are.
              </p>
            </div>
            <div className="md:col-span-7">
              <CardShell>
                <ul className="divide-y divide-charcoal/[0.06]">
                  {personas.map((p) => (
                    <li key={p.name} className="grid grid-cols-12 gap-6 p-6 md:p-8">
                      <p className="font-display col-span-12 text-lg leading-snug md:col-span-5">{p.name}</p>
                      <p className="col-span-12 text-base leading-relaxed text-ink-soft md:col-span-7">
                        {p.line}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardShell>
            </div>
          </div>
        </div>
      </section>

      {/* For practitioners */}
      <section id="practitioners" className="relative px-4 py-20 md:px-8 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <CardShell>
            <div className="grid grid-cols-1 gap-0 md:grid-cols-12">
              <div className="relative min-h-[320px] overflow-hidden rounded-t-[calc(2rem-0.375rem)] md:col-span-5 md:rounded-l-[calc(2rem-0.375rem)] md:rounded-tr-none">
                <Image
                  src={photos.practitionerHands.src}
                  alt={photos.practitionerHands.alt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 40vw, 100vw"
                />
              </div>
              <div className="p-8 md:col-span-7 md:p-12">
                <span className="inline-flex items-center rounded-full bg-teal/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-teal">
                  For practitioners
                </span>
                <h2 className="font-display mt-6 text-[clamp(28px,3.6vw,42px)] leading-tight">
                  Fewer leads. <span className="italic text-ocean">Better fits.</span>
                </h2>
                <p className="mt-5 text-base leading-relaxed text-ink-soft">
                  We streamline your referral pipeline. Each introduction arrives with context: what the seeker
                  is working on, what they have tried, why we picked you. Your calendar fills with well-matched
                  consultations, not lead lists.
                </p>
                <dl className="mt-8 grid grid-cols-3 gap-4">
                  {practitionerStats.map((s) => (
                    <div key={s.label} className="rounded-2xl bg-charcoal/[0.03] p-4">
                      <dt className="font-display text-3xl text-ocean md:text-4xl">{s.n}</dt>
                      <dd className="mt-2 text-xs leading-snug text-ink-soft">{s.label}</dd>
                    </div>
                  ))}
                </dl>
                <a
                  href="mailto:practitioners@healingtides.co"
                  className="group mt-8 inline-flex items-center gap-2 rounded-full border border-charcoal/20 px-6 py-3 text-base text-charcoal transition-colors hover:bg-charcoal hover:text-sand"
                >
                  Apply to join the collective
                  <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
                </a>
              </div>
            </div>
          </CardShell>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative px-4 py-20 md:px-8 md:py-32">
        <div className="mx-auto max-w-[900px]">
          <div className="text-center">
            <span className="inline-flex items-center rounded-full bg-charcoal/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-charcoal">
              Questions
            </span>
            <h2 className="font-display mt-6 text-[clamp(32px,4.5vw,56px)] leading-[1.05] tracking-[-0.02em]">
              Things to ask before you write.
            </h2>
          </div>
          <CardShell className="mt-12">
            <ul className="divide-y divide-charcoal/[0.06]">
              {faqs.map((f) => (
                <li key={f.q} className="p-6 md:p-8">
                  <h3 className="font-display text-xl leading-snug md:text-2xl">{f.q}</h3>
                  <p className="mt-3 text-base leading-relaxed text-ink-soft">{f.a}</p>
                </li>
              ))}
            </ul>
          </CardShell>
        </div>
      </section>

      {/* Final CTA */}
      <section id="begin" className="relative px-4 py-20 md:px-8 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <div className="relative overflow-hidden rounded-[2rem] bg-charcoal text-sand shadow-[0_30px_80px_-30px_rgba(31,58,95,0.6)]">
            <div
              className="absolute inset-0 opacity-60"
              aria-hidden
              style={{
                background:
                  "radial-gradient(60% 60% at 80% 30%, rgba(31,58,95,0.7) 0%, transparent 60%), radial-gradient(40% 40% at 20% 70%, rgba(95,143,139,0.5) 0%, transparent 60%)",
              }}
            />
            <div className="relative grid grid-cols-1 items-center gap-10 p-10 md:grid-cols-12 md:p-16">
              <div className="md:col-span-7">
                <span className="inline-flex items-center rounded-full bg-sand/15 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-sand">
                  Begin here
                </span>
                <h2 className="font-display mt-6 text-[clamp(36px,5vw,64px)] leading-[1] tracking-[-0.025em]">
                  Two paragraphs.
                  <br />
                  <span className="italic text-seafoam">A real reply within five days.</span>
                </h2>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-sand/80">
                  Tell us where you are. We answer with names, by name. The first match is free.
                </p>
              </div>
              <div className="flex flex-col items-start gap-4 md:col-span-5 md:items-end">
                <a
                  href="mailto:hello@healingtides.co?subject=Begin"
                  className="group inline-flex items-center gap-2 rounded-full bg-seafoam py-3 pl-7 pr-2 text-base text-charcoal shadow-[0_18px_40px_-20px_rgba(214,237,232,0.4)] transition-colors hover:bg-sand"
                >
                  Get matched
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-charcoal/10 transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </a>
                <p className="text-xs text-sand/60">hello@healingtides.co</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-charcoal/10 px-4 py-10 md:px-8">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-6">
          <p className="font-display text-base">Healing Tides Collective</p>
          <p className="text-xs text-ink-muted">© 2026 / Care, matched. By a person.</p>
          <div className="flex gap-6 text-sm text-ink-soft">
            <a href="#how" className="hover:text-charcoal">
              How
            </a>
            <a href="#practitioners" className="hover:text-charcoal">
              Practitioners
            </a>
            <a href="#faq" className="hover:text-charcoal">
              FAQ
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
