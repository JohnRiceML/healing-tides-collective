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
    body: "A short, plain conversation. Two paragraphs is plenty. Not a form, not an intake.",
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

export default function PranaStyleDesign() {
  return (
    <main className="min-h-screen bg-sand text-charcoal">
      {/* ============================================================
          HERO POSTER — full-bleed cinematic, eyebrow + massive serif
          headline confidently stamped over the photo. The prAna moment.
          ============================================================ */}
      <section className="relative h-[92vh] min-h-[680px] w-full overflow-hidden bg-charcoal">
        <Image
          src={photos.practice.src}
          alt={photos.practice.alt}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />

        {/* Cool muted scrim — pulls the photo toward greenish-grey */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(47,47,47,0.30) 0%, rgba(47,47,47,0.10) 30%, rgba(47,47,47,0.10) 65%, rgba(47,47,47,0.45) 100%)",
          }}
        />
        <div aria-hidden className="absolute inset-0 bg-teal/10 mix-blend-multiply" />

        {/* Side carousel chevrons — visual flourish only */}
        <div
          aria-hidden
          className="absolute left-6 top-1/2 z-10 -translate-y-1/2 select-none font-display text-[44px] font-light leading-none text-sand/65 md:text-[56px]"
        >
          &lt;
        </div>
        <div
          aria-hidden
          className="absolute right-6 top-1/2 z-10 -translate-y-1/2 select-none font-display text-[44px] font-light leading-none text-sand/65 md:text-[56px]"
        >
          &gt;
        </div>

        {/* Top wordmark — small, centered, tracked */}
        <header className="absolute inset-x-0 top-0 z-10">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-6 text-sand md:px-10 md:py-7">
            <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-sand/75">
              Spring 2026
            </p>
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.55em] text-sand md:text-[12px] md:tracking-[0.7em]">
              Healing Tides Presents
            </p>
            <a
              href="#begin"
              className="text-[10px] font-medium uppercase tracking-[0.32em] text-sand/75 transition-colors hover:text-sand"
            >
              Get Matched
            </a>
          </div>
          <div className="mx-auto h-px max-w-[1500px] bg-sand/20" />
        </header>

        {/* Centered massive headline */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
          <h1
            className="font-display font-bold text-sand"
            style={{
              fontSize: "clamp(48px, 9vw, 144px)",
              lineHeight: 0.92,
              letterSpacing: "-0.025em",
            }}
          >
            FIND YOUR FIT
            <br />
            MATCHED BY A PERSON
          </h1>
          <p className="font-display mt-7 max-w-2xl text-[clamp(15px,1.4vw,20px)] italic leading-[1.45] text-sand/90">
            Now matching: Therapy, Acupuncture, Reiki, Movement, Trauma-informed support.
          </p>
          <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.42em] text-sand/80">
            Spring 2026
          </p>
        </div>
      </section>

      {/* ============================================================
          MISSION POSTER — single huge declarative line
          ============================================================ */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-[1500px] px-6 py-32 text-center md:px-10 md:py-40">
          <p className="text-[11px] font-medium uppercase tracking-[0.42em] text-ink-muted">
            The mission
          </p>
          <h2
            className="font-display mt-12 font-bold text-charcoal"
            style={{
              fontSize: "clamp(48px, 8vw, 132px)",
              lineHeight: 0.92,
              letterSpacing: "-0.025em",
            }}
          >
            LESS SEARCHING.
            <br />
            MORE HEALING.
          </h2>
          <p className="mx-auto mt-12 max-w-2xl text-[17px] leading-[1.7] text-ink-soft">
            We replace the wall of practitioners with a shortlist of three to five, chosen by a person,
            with the reasoning written down. One front door. Clinical and holistic, held side by side.
          </p>
        </div>
      </section>

      {/* ============================================================
          MODALITIES POSTER — each care type as its own large-type line
          ============================================================ */}
      <section className="border-b border-rule bg-sand-deep">
        <div className="mx-auto max-w-[1500px] px-6 py-32 md:px-10 md:py-40">
          <div className="mb-16 flex items-baseline justify-between border-b border-charcoal/20 pb-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.42em] text-ink-muted">
              Now matching
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.42em] text-ink-muted">
              Five modalities
            </p>
          </div>
          <ul className="divide-y divide-charcoal/15">
            {modalities.map((m, i) => (
              <li
                key={m}
                className="grid grid-cols-12 items-baseline gap-6 py-8 md:py-10"
              >
                <span className="text-[11px] col-span-2 font-medium uppercase tracking-[0.32em] text-teal md:col-span-1">
                  / {String(i + 1).padStart(2, "0")}
                </span>
                <h3
                  className="font-display col-span-10 font-bold uppercase text-charcoal md:col-span-11"
                  style={{
                    fontSize: "clamp(36px, 6vw, 96px)",
                    lineHeight: 0.95,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {m}
                </h3>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS POSTER — three numerals, oversized
          ============================================================ */}
      <section id="how" className="border-b border-rule">
        <div className="mx-auto max-w-[1500px] px-6 py-32 md:px-10 md:py-40">
          <div className="mb-20 text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.42em] text-ink-muted">
              How it works
            </p>
            <h2
              className="font-display mt-10 font-bold text-charcoal"
              style={{
                fontSize: "clamp(44px, 7vw, 112px)",
                lineHeight: 0.92,
                letterSpacing: "-0.025em",
              }}
            >
              THREE STEPS.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-x-12 gap-y-20 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <p
                  className="font-display font-bold text-teal"
                  style={{
                    fontSize: "clamp(96px, 14vw, 220px)",
                    lineHeight: 0.86,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {s.n}
                </p>
                <h3 className="font-display mt-8 text-[clamp(22px,2vw,30px)] font-bold uppercase leading-[1.05] tracking-[-0.015em]">
                  {s.title}
                </h3>
                <p className="mx-auto mt-6 max-w-xs text-[15px] leading-[1.7] text-ink-soft">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          PERSONAS POSTER — three-line declarative
          ============================================================ */}
      <section className="border-b border-rule bg-sand-deep">
        <div className="mx-auto max-w-[1500px] px-6 py-32 md:px-10 md:py-40">
          <div className="mb-16 text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.42em] text-ink-muted">
              Who it is for
            </p>
            <h2
              className="font-display mt-10 font-bold text-charcoal"
              style={{
                fontSize: "clamp(44px, 7vw, 112px)",
                lineHeight: 0.92,
                letterSpacing: "-0.025em",
              }}
            >
              THREE WAYS TO FEEL STUCK.
            </h2>
          </div>
          <ul className="divide-y divide-charcoal/15 border-y border-charcoal/15">
            {personas.map((p) => (
              <li key={p.name} className="grid grid-cols-12 gap-6 py-10 md:py-12">
                <h3 className="font-display col-span-12 text-[clamp(24px,2.6vw,40px)] font-bold uppercase leading-[1] tracking-[-0.015em] md:col-span-6">
                  {p.name}
                </h3>
                <p className="font-display col-span-12 text-[clamp(18px,1.5vw,22px)] italic leading-[1.45] text-ink-soft md:col-span-6">
                  {p.line}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============================================================
          PRACTITIONERS POSTER — split with real photo
          ============================================================ */}
      <section id="practitioners" className="border-b border-rule">
        <div className="mx-auto max-w-[1500px] px-6 py-32 md:px-10 md:py-40">
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
              <figcaption className="mt-3 text-[10px] font-medium uppercase tracking-[0.32em] text-ink-muted">
                Plate / Practitioner at work
              </figcaption>
            </figure>
            <div className="md:col-span-7">
              <p className="text-[11px] font-medium uppercase tracking-[0.42em] text-teal">
                For practitioners
              </p>
              <h2
                className="font-display mt-8 font-bold text-charcoal"
                style={{
                  fontSize: "clamp(44px, 6.5vw, 104px)",
                  lineHeight: 0.92,
                  letterSpacing: "-0.025em",
                }}
              >
                ALIGNED CLIENTS.
                <br />
                NOT LEAD LISTS.
              </h2>
              <p className="mt-10 max-w-xl text-[16px] leading-[1.7] text-ink-soft">
                We streamline your referral pipeline. Each introduction arrives with context. What the
                seeker is working on, what they have tried, and why we picked you. Your calendar fills
                with well-matched consultations, never per-lead invoices.
              </p>
              <a
                href="mailto:practitioners@healingtides.co"
                className="mt-12 inline-flex items-center border border-charcoal px-9 py-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-charcoal transition-colors hover:bg-charcoal hover:text-sand"
              >
                Apply to join the collective
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FAQ POSTER — clean, simple, restrained
          ============================================================ */}
      <section id="faq" className="border-b border-rule">
        <div className="mx-auto max-w-[1500px] px-6 py-32 md:px-10 md:py-40">
          <div className="mb-16 text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.42em] text-ink-muted">
              Questions
            </p>
            <h2
              className="font-display mt-10 font-bold text-charcoal"
              style={{
                fontSize: "clamp(44px, 7vw, 112px)",
                lineHeight: 0.92,
                letterSpacing: "-0.025em",
              }}
            >
              ASK BEFORE YOU WRITE.
            </h2>
          </div>
          <div className="mx-auto max-w-4xl border-t border-charcoal/20">
            {faqs.map((f, i) => (
              <div
                key={f.q}
                className="grid grid-cols-12 gap-6 border-b border-charcoal/15 py-10 md:py-12"
              >
                <p className="col-span-12 text-[10px] font-medium uppercase tracking-[0.32em] text-ink-muted md:col-span-2">
                  Q / {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="font-display col-span-12 text-xl font-bold leading-snug md:col-span-4 md:text-2xl">
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
          FINAL CTA POSTER — second cinematic moment, "BEGIN HERE"
          ============================================================ */}
      <section
        id="begin"
        className="relative h-[92vh] min-h-[680px] w-full overflow-hidden bg-charcoal"
      >
        <Image
          src={photos.studio.src}
          alt={photos.studio.alt}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(47,47,47,0.35) 0%, rgba(47,47,47,0.15) 30%, rgba(47,47,47,0.15) 65%, rgba(47,47,47,0.55) 100%)",
          }}
        />
        <div aria-hidden className="absolute inset-0 bg-teal/10 mix-blend-multiply" />

        <div
          aria-hidden
          className="absolute left-6 top-1/2 z-10 -translate-y-1/2 select-none font-display text-[44px] font-light leading-none text-sand/65 md:text-[56px]"
        >
          &lt;
        </div>
        <div
          aria-hidden
          className="absolute right-6 top-1/2 z-10 -translate-y-1/2 select-none font-display text-[44px] font-light leading-none text-sand/65 md:text-[56px]"
        >
          &gt;
        </div>

        <div className="absolute inset-x-0 top-0 z-10">
          <div className="mx-auto flex max-w-[1500px] items-center justify-center px-6 py-7 md:px-10">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.55em] text-sand md:text-[12px] md:tracking-[0.7em]">
              Healing Tides Presents
            </p>
          </div>
          <div className="mx-auto h-px max-w-[1500px] bg-sand/20" />
        </div>

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.42em] text-sand/80">
            Spring matching, now open
          </p>
          <h2
            className="font-display mt-8 font-bold text-sand"
            style={{
              fontSize: "clamp(64px, 12vw, 200px)",
              lineHeight: 0.9,
              letterSpacing: "-0.03em",
            }}
          >
            BEGIN HERE.
          </h2>
          <p className="font-display mt-8 max-w-xl text-[clamp(15px,1.4vw,20px)] italic leading-[1.45] text-sand/90">
            Two paragraphs is plenty. A real reply within five days, by name.
          </p>
          <a
            href="mailto:hello@healingtides.co?subject=Begin"
            className="mt-12 inline-flex items-center justify-center border border-sand/55 bg-sand/10 px-12 py-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-sand backdrop-blur-sm transition-colors hover:bg-sand hover:text-charcoal"
          >
            Get Matched
          </a>
          <p className="mt-7 text-[10px] font-medium uppercase tracking-[0.32em] text-sand/60">
            hello@healingtides.co
          </p>
        </div>
      </section>

      {/* ============================================================
          FOOTER
          ============================================================ */}
      <footer className="bg-charcoal text-sand/70">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-6 py-8 md:px-10">
          <p className="text-[10px] font-medium uppercase tracking-[0.32em]">
            Healing Tides Collective
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.32em]">
            Spring 2026 / Issue No. 01
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.32em]">
            healingtides.co
          </p>
        </div>
      </footer>
    </main>
  );
}
