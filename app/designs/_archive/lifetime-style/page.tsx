import Image from "next/image";
import { photos } from "@/app/_lib/images";

const modalities = [
  "Therapy",
  "Acupuncture",
  "Reiki",
  "Movement-based care",
  "Trauma-informed support",
];

const steps = [
  {
    n: "01",
    title: "Tell us where you are.",
    body: "A short, plain conversation. Two paragraphs is plenty. We do not send a form.",
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
    a: "Your story belongs to you. We never sell your information. Practitioners only learn what you choose to share.",
  },
];

export default function LifetimeStyleDesign() {
  return (
    <main className="min-h-screen bg-sand text-charcoal">
      {/* ============================================================
          HERO — full-bleed cinematic palms, the photo IS the hero
          ============================================================ */}
      <section className="relative h-[85vh] min-h-[640px] w-full overflow-hidden bg-charcoal">
        <Image
          src={photos.palmRow.src}
          alt={photos.palmRow.alt}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Subtle bottom-weighted scrim so the wordmark and headline read */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(47,47,47,0.25) 0%, rgba(47,47,47,0) 22%, rgba(47,47,47,0) 55%, rgba(47,47,47,0.55) 100%)",
          }}
        />

        {/* Top nav */}
        <header className="absolute inset-x-0 top-0 z-10">
          <div className="mx-auto grid max-w-[1500px] grid-cols-3 items-center px-6 py-5 text-sand md:px-10 md:py-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-sand/85">
              Miami / Est. 2026
            </p>
            <p className="text-center text-[12px] font-semibold uppercase tracking-[0.55em] text-sand md:text-[13px] md:tracking-[0.7em]">
              Healing Tides
            </p>
            <a
              href="#begin"
              className="justify-self-end text-[10px] font-medium uppercase tracking-[0.28em] text-sand/85 transition-colors hover:text-sand"
            >
              Get Matched
            </a>
          </div>
          <div className="mx-auto h-px max-w-[1500px] bg-sand/20" />
        </header>

        {/* Bottom-left overlay headline */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-12 md:px-10 md:pb-16">
          <div className="mx-auto max-w-[1500px]">
            <h1 className="font-display text-sand text-[clamp(56px,11vw,180px)] font-light leading-[0.88] tracking-[-0.025em]">
              Find your fit.
            </h1>
            <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.32em] text-sand/85">
              A guided front door to wellness.
            </p>
            <a
              href="#begin"
              className="mt-7 inline-flex items-center justify-center border border-sand/55 bg-sand/10 px-9 py-3.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-sand backdrop-blur-sm transition-colors hover:bg-sand hover:text-charcoal"
            >
              Begin Here
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================
          MODALITY STRIP — thin horizontal type, hairlines between
          ============================================================ */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-[1500px] px-6 md:px-10">
          <div className="flex flex-col divide-y divide-rule md:flex-row md:divide-x md:divide-y-0">
            {modalities.map((m) => (
              <div
                key={m}
                className="flex-1 px-2 py-7 text-center text-[11px] font-medium uppercase tracking-[0.28em] text-charcoal md:px-4 md:py-8"
              >
                {m}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          INTRO STATEMENT — single quiet line under the hero
          ============================================================ */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-[1100px] px-6 py-24 text-center md:px-10 md:py-32">
          <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-ink-muted">
            A guided care-matching service
          </p>
          <p className="font-display mt-10 text-[clamp(28px,3.4vw,46px)] font-light leading-[1.18] tracking-[-0.015em] text-charcoal">
            We replace the wall of practitioners with a shortlist of three to five,
            chosen by a person, with the reasoning written down.
          </p>
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS — three numbered serif headings
          ============================================================ */}
      <section id="how" className="border-b border-rule">
        <div className="mx-auto max-w-[1500px] px-6 py-24 md:px-10 md:py-32">
          <div className="mb-16 flex items-baseline justify-between border-b border-rule pb-6 md:mb-20">
            <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-ink-muted">
              How it works
            </p>
            <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-ink-muted">
              Three steps
            </p>
          </div>
          <div className="grid grid-cols-1 gap-x-12 gap-y-16 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n}>
                <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-teal">
                  Step {s.n}
                </p>
                <h3 className="font-display mt-8 text-[clamp(28px,2.6vw,38px)] font-light leading-[1.05] tracking-[-0.015em]">
                  {s.title}
                </h3>
                <p className="mt-6 text-[15px] leading-[1.7] text-ink-soft">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          PERSONAS — quiet three-up
          ============================================================ */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-[1500px] px-6 py-24 md:px-10 md:py-32">
          <div className="grid grid-cols-1 gap-y-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-ink-muted">
                Who it is for
              </p>
              <h2 className="font-display mt-8 text-[clamp(36px,4.5vw,64px)] font-light leading-[0.95] tracking-[-0.02em]">
                Three ways
                <br />
                to feel stuck.
              </h2>
            </div>
            <div className="md:col-span-8">
              <ul className="divide-y divide-rule border-y border-rule">
                {personas.map((p) => (
                  <li key={p.name} className="grid grid-cols-12 gap-6 py-8 md:py-10">
                    <p className="font-display col-span-12 text-xl leading-snug md:col-span-5 md:text-2xl">
                      {p.name}
                    </p>
                    <p className="col-span-12 text-[15px] leading-[1.7] text-ink-soft md:col-span-7">
                      {p.line}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECONDARY CINEMATIC LANDSCAPE — palms against mountain
          ============================================================ */}
      <section className="relative h-[55vh] min-h-[420px] w-full overflow-hidden bg-charcoal">
        <Image
          src={photos.palmsMountain.src}
          alt={photos.palmsMountain.alt}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div aria-hidden className="absolute inset-0 bg-charcoal/30" />
        <div className="absolute inset-x-0 bottom-0 px-6 pb-12 md:px-10 md:pb-16">
          <div className="mx-auto max-w-[1500px]">
            <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-sand/80">
              Plate II / Care, held side by side
            </p>
            <p className="font-display mt-5 max-w-3xl text-sand text-[clamp(28px,3.4vw,48px)] font-light leading-[1.05] tracking-[-0.015em]">
              Clinical and holistic, without a hierarchy.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          FOR PRACTITIONERS — split, photo-left
          ============================================================ */}
      <section id="practitioners" className="border-b border-rule">
        <div className="mx-auto max-w-[1500px] px-6 py-24 md:px-10 md:py-32">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <figure className="md:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  src={photos.acupuncture.src}
                  alt={photos.acupuncture.alt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 40vw, 100vw"
                />
              </div>
              <figcaption className="mt-3 text-[10px] font-medium uppercase tracking-[0.28em] text-ink-muted">
                Plate III / Practitioner at work
              </figcaption>
            </figure>
            <div className="md:col-span-7">
              <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-teal">
                For practitioners
              </p>
              <h2 className="font-display mt-8 text-[clamp(36px,4.5vw,64px)] font-light leading-[0.95] tracking-[-0.02em]">
                Aligned clients,
                <br />
                not lead lists.
              </h2>
              <p className="mt-8 max-w-xl text-[16px] leading-[1.7] text-ink-soft">
                We streamline your referral pipeline. Each introduction arrives with context.
                What the seeker is working on, what they have tried, and why we picked you.
                Your calendar fills with well-matched consultations, never per-lead invoices.
              </p>
              <a
                href="mailto:practitioners@healingtides.co"
                className="mt-10 inline-flex items-center border border-charcoal px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-charcoal transition-colors hover:bg-charcoal hover:text-sand"
              >
                Apply to join the collective
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FAQ — small, restrained
          ============================================================ */}
      <section id="faq" className="border-b border-rule">
        <div className="mx-auto max-w-[1100px] px-6 py-24 md:px-10 md:py-32">
          <div className="mb-12 text-center md:mb-16">
            <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-ink-muted">
              Questions
            </p>
            <h2 className="font-display mt-8 text-[clamp(32px,4vw,52px)] font-light leading-[1] tracking-[-0.02em]">
              Things to ask before you write.
            </h2>
          </div>
          <div className="border-t border-rule">
            {faqs.map((f, i) => (
              <div
                key={f.q}
                className="grid grid-cols-12 gap-6 border-b border-rule py-9 md:py-10"
              >
                <p className="col-span-12 text-[10px] font-medium uppercase tracking-[0.28em] text-ink-muted md:col-span-2">
                  Q / {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="font-display col-span-12 text-xl leading-snug md:col-span-4 md:text-2xl">
                  {f.q}
                </h3>
                <p className="col-span-12 text-[15px] leading-[1.7] text-ink-soft md:col-span-6">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          FINAL INVERTED CTA
          ============================================================ */}
      <section id="begin" className="bg-charcoal text-sand">
        <div className="mx-auto max-w-[1500px] px-6 py-28 text-center md:px-10 md:py-40">
          <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-sand/60">
            Begin here
          </p>
          <h2 className="font-display mx-auto mt-10 max-w-4xl text-[clamp(44px,7vw,110px)] font-light leading-[0.92] tracking-[-0.025em]">
            Tell us where
            <br />
            you are.
          </h2>
          <p className="mx-auto mt-10 max-w-md text-[15px] leading-[1.7] text-sand/75">
            Two paragraphs is plenty. A real reply within five days, by name.
          </p>
          <a
            href="mailto:hello@healingtides.co?subject=Begin"
            className="mt-12 inline-flex items-center border border-sand/55 bg-sand/10 px-10 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-sand backdrop-blur-sm transition-colors hover:bg-sand hover:text-charcoal"
          >
            Get Matched
          </a>
          <p className="mt-8 text-[10px] font-medium uppercase tracking-[0.28em] text-sand/50">
            hello@healingtides.co
          </p>
        </div>
      </section>

      {/* ============================================================
          FOOTER
          ============================================================ */}
      <footer className="bg-charcoal text-sand/70">
        <div className="mx-auto h-px max-w-[1500px] bg-sand/15" />
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-6 py-8 md:px-10">
          <p className="text-[10px] font-medium uppercase tracking-[0.32em]">
            Healing Tides Collective
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.32em]">
            Miami / Est. 2026
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.32em]">
            healingtides.co
          </p>
        </div>
      </footer>
    </main>
  );
}
