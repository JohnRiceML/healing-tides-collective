import Image from "next/image";
import { photos } from "@/app/_lib/images";

const navItems = ["About", "Practice", "Begin"];

const personas = [
  {
    label: "The Overwhelmed Optimizer",
    line: "You have read the studies. You own the spreadsheet. You still do not know who to call.",
  },
  {
    label: "The Practical Seeker",
    line: "You are not interested in vibes. You want a person whose work checks out.",
  },
  {
    label: "The Curious Seeker",
    line: "You are open. You are uncertain. You want a guide, not a gauntlet.",
  },
];

const steps = [
  {
    n: "01",
    title: "Tell us where you are.",
    body: "A short, plain conversation. Not an intake form. We ask what you are working on, what you have tried, what feels close to right.",
  },
  {
    n: "02",
    title: "Read the shortlist.",
    body: "Three to five practitioners chosen by a person, not a search index. Each pick comes with a sentence on why they fit you, specifically.",
  },
  {
    n: "03",
    title: "Begin.",
    body: "You introduce yourself by reply or by booking. The relationship is yours from the first message onward.",
  },
];

const modalities = [
  "Therapy",
  "Acupuncture",
  "Reiki",
  "Movement-based care",
  "Trauma-informed support",
];

const faqs = [
  {
    q: "Is this a directory?",
    a: "No. A directory hands you a list and walks away. We hand you a shortlist, with reasoning, and a person on the other end of the email.",
  },
  {
    q: "How are practitioners vetted?",
    a: "By license where applicable, by training where it matters, by working relationship where neither is enough.",
  },
  {
    q: "Clinical or holistic?",
    a: "Both, side by side. A licensed therapist and a craniosacral practitioner can both be the right answer.",
  },
  {
    q: "What about privacy?",
    a: "Your story belongs to you until you decide to share it with a practitioner. We do not sell information, ever.",
  },
];

export default function KairosStyleDesign() {
  return (
    <main className="min-h-screen bg-sand text-charcoal">
      {/* Nav */}
      <header className="relative">
        <div className="mx-auto flex max-w-[92rem] items-center justify-between px-6 py-6 md:px-10">
          <p className="font-display text-[0.78rem] italic uppercase tracking-[0.18em] text-charcoal">
            Healing Tides Collective
          </p>
          <nav className="flex gap-7">
            {navItems.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="font-display text-[0.78rem] italic uppercase tracking-[0.18em] text-charcoal/80 transition hover:text-ocean"
              >
                {l}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Wordmark hero */}
      <section className="relative">
        <div className="mx-auto max-w-[92rem] px-6 pt-6 pb-10 md:px-10 md:pt-10 md:pb-14">
          <h1 className="font-display text-charcoal/95 text-[clamp(3.6rem,11vw,12rem)] leading-[0.92] tracking-[-0.02em]">
            Healing Tides Collective
          </h1>
        </div>
      </section>

      {/* Full-width hero photo with caption overlay */}
      <section className="relative">
        <div className="mx-auto max-w-[92rem] px-6 md:px-10">
          <figure className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src={photos.poolMountain.src}
              alt={photos.poolMountain.alt}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <figcaption className="absolute bottom-6 left-6 max-w-[22rem] md:bottom-10 md:left-10">
              <p className="font-display text-[0.95rem] italic leading-snug text-sand drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] md:text-[1.05rem]">
                At Healing Tides, discover the intersection of guided wellness and timeless transformation.
              </p>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Practice — 2-column with pop-of-color photo */}
      <section id="practice" className="relative py-28 md:py-36">
        <div className="mx-auto grid max-w-[92rem] grid-cols-1 gap-16 px-6 md:grid-cols-12 md:gap-12 md:px-10">
          <div className="md:col-span-6 md:pr-10">
            <h2 className="font-display text-charcoal text-[clamp(2.4rem,4.4vw,3.8rem)] leading-[1.05]">
              Our Practice
            </h2>
            <p className="mt-8 max-w-[34rem] text-[1rem] leading-[1.7] text-ink-soft">
              A guided alternative to the wellness directory. We listen, we read, and we hand back a
              shortlist of practitioners chosen by a person. Therapy and acupuncture beside reiki and
              movement, held without hierarchy.
            </p>
            <p className="font-display mt-10 text-sm italic text-ink-muted">
              Now matching: Minneapolis / St Paul, Spring 2026.
            </p>
            <div className="mt-10 h-px w-full bg-rule" />
            <a
              href="mailto:hello@healingtides.co?subject=Begin"
              className="font-display mt-12 inline-flex items-center gap-3 rounded-full bg-charcoal px-8 py-3.5 text-[0.95rem] italic text-sand transition hover:bg-ocean"
            >
              Get matched
              <span aria-hidden className="text-base">→</span>
            </a>
          </div>

          <figure className="md:col-span-6">
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <Image
                src={photos.desertArch.src}
                alt={photos.desertArch.alt}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 45vw, 100vw"
              />
            </div>
            <figcaption className="font-display mt-4 text-[0.78rem] italic uppercase tracking-[0.18em] text-ink-muted">
              I. The threshold.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* The Heart — split heading + 2-column body */}
      <section id="about" className="relative bg-sand-deep/50 py-28 md:py-36">
        <div className="mx-auto grid max-w-[92rem] grid-cols-1 gap-12 px-6 md:grid-cols-12 md:gap-16 md:px-10">
          <div className="md:col-span-5">
            <h2 className="font-display text-charcoal text-[clamp(2.4rem,4.6vw,4rem)] leading-[1.02]">
              The Heart of
              <br />
              Healing Tides
              <br />
              <span className="italic text-ocean">Collective.</span>
            </h2>
          </div>
          <div className="md:col-span-7">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
              <p className="text-[1rem] leading-[1.75] text-ink-soft">
                Our why. To redraw how a person finds care. The wall of practitioners listed
                alphabetically, sorted by star rating, has cost the seeker something quiet but real.
                People do not give up on wellness. They give up on choosing.
              </p>
              <p className="text-[1rem] leading-[1.75] text-ink-soft">
                We replace the wall with a shortlist. We replace the rating with a paragraph. We
                replace the algorithm with a person who reads what you wrote and picks three to five
                practitioners by name, with the reasoning attached.
              </p>
            </div>
            <div className="mt-12 h-px w-full bg-rule" />
            <p className="font-display mt-10 max-w-[36rem] text-[1.25rem] italic leading-snug text-charcoal">
              The right practitioner is not the most decorated one. It is the one who feels right
              after the first reply.
            </p>
          </div>
        </div>
      </section>

      {/* Modalities — quiet typographic band */}
      <section className="relative py-28 md:py-36">
        <div className="mx-auto max-w-[92rem] px-6 md:px-10">
          <p className="font-display text-[0.78rem] italic uppercase tracking-[0.18em] text-ink-muted">
            II. Care, side by side.
          </p>
          <ul className="mt-12 grid grid-cols-1 gap-y-6 sm:grid-cols-2 md:grid-cols-3 md:gap-y-10">
            {modalities.map((m, i) => (
              <li key={m} className="flex items-baseline gap-5">
                <span className="font-display text-sm italic text-ink-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-charcoal text-[clamp(1.6rem,2.4vw,2.1rem)] leading-tight">
                  {m}.
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Personas */}
      <section className="relative bg-sand-deep/50 py-28 md:py-36">
        <div className="mx-auto max-w-[92rem] px-6 md:px-10">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <h2 className="font-display text-charcoal text-[clamp(2rem,3.6vw,3rem)] leading-[1.05]">
                Who arrives
                <br />
                <span className="italic">at the door.</span>
              </h2>
            </div>
            <ul className="md:col-span-8">
              {personas.map((p, i) => (
                <li
                  key={p.label}
                  className={`grid grid-cols-12 gap-6 py-8 ${
                    i !== 0 ? "border-t border-rule" : ""
                  }`}
                >
                  <p className="font-display col-span-12 text-[0.78rem] italic uppercase tracking-[0.18em] text-ocean md:col-span-5">
                    {p.label}
                  </p>
                  <p className="col-span-12 text-[1rem] leading-[1.7] text-ink-soft md:col-span-7">
                    {p.line}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How it works — image left, steps right */}
      <section className="relative py-28 md:py-36">
        <div className="mx-auto grid max-w-[92rem] grid-cols-1 gap-16 px-6 md:grid-cols-12 md:gap-12 md:px-10">
          <figure className="md:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <Image
                src={photos.teaPour.src}
                alt={photos.teaPour.alt}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 40vw, 100vw"
              />
            </div>
            <figcaption className="font-display mt-4 text-[0.78rem] italic uppercase tracking-[0.18em] text-ink-muted">
              III. A small ceremony.
            </figcaption>
          </figure>
          <div className="md:col-span-7 md:pl-6">
            <h2 className="font-display text-charcoal text-[clamp(2.2rem,4vw,3.4rem)] leading-[1.05]">
              How a match begins.
            </h2>
            <ol className="mt-12 space-y-10">
              {steps.map((s) => (
                <li key={s.n} className="grid grid-cols-12 gap-6 border-t border-rule pt-8">
                  <p className="font-display col-span-2 text-2xl italic text-ocean">{s.n}</p>
                  <div className="col-span-10">
                    <h3 className="font-display text-[1.5rem] leading-tight">{s.title}</h3>
                    <p className="mt-3 text-[1rem] leading-[1.7] text-ink-soft">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Wide landscape break */}
      <section className="relative">
        <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
          <Image
            src={photos.palmsMountain.src}
            alt={photos.palmsMountain.alt}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-charcoal/25" />
          <div className="absolute inset-0 flex items-end px-6 py-12 md:px-10 md:py-16">
            <div className="mx-auto w-full max-w-[92rem]">
              <p className="font-display max-w-2xl text-[clamp(1.6rem,3vw,2.4rem)] italic leading-tight text-sand">
                A quieter way to find care. One careful introduction at a time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For practitioners */}
      <section className="relative py-28 md:py-36">
        <div className="mx-auto grid max-w-[92rem] grid-cols-1 gap-16 px-6 md:grid-cols-12 md:gap-12 md:px-10">
          <figure className="md:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <Image
                src={photos.attic.src}
                alt={photos.attic.alt}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 40vw, 100vw"
              />
            </div>
            <figcaption className="font-display mt-4 text-[0.78rem] italic uppercase tracking-[0.18em] text-ink-muted">
              IV. The treatment room, mid afternoon.
            </figcaption>
          </figure>
          <div className="md:col-span-7 md:pl-6">
            <p className="font-display text-[0.78rem] italic uppercase tracking-[0.18em] text-ink-muted">
              For practitioners
            </p>
            <h2 className="font-display mt-6 text-charcoal text-[clamp(2.2rem,4vw,3.4rem)] leading-[1.05]">
              Aligned clients,
              <br />
              <span className="italic text-ocean">not lead lists.</span>
            </h2>
            <p className="mt-8 max-w-[40rem] text-[1rem] leading-[1.7] text-ink-soft">
              We streamline your referral pipeline. Every introduction arrives with context: what
              the seeker has tried, what feels close to right, why we picked you. You decide whether
              to take the consultation. We never charge per lead.
            </p>
            <a
              href="mailto:practitioners@healingtides.co"
              className="font-display mt-10 inline-flex items-center gap-3 rounded-full border border-charcoal px-8 py-3.5 text-[0.95rem] italic text-charcoal transition hover:bg-charcoal hover:text-sand"
            >
              Write to us as a practitioner
              <span aria-hidden className="text-base">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative bg-sand-deep/50 py-28 md:py-36">
        <div className="mx-auto grid max-w-[92rem] grid-cols-1 gap-12 px-6 md:grid-cols-12 md:px-10">
          <div className="md:col-span-4">
            <h2 className="font-display text-charcoal text-[clamp(2rem,3.6vw,3rem)] leading-[1.05]">
              Things you
              <br />
              <span className="italic">might be wondering.</span>
            </h2>
          </div>
          <ul className="md:col-span-8">
            {faqs.map((f, i) => (
              <li
                key={f.q}
                className={`grid grid-cols-12 gap-6 py-8 ${
                  i !== 0 ? "border-t border-rule" : ""
                }`}
              >
                <p className="font-display col-span-12 text-[1.1rem] italic md:col-span-5">{f.q}</p>
                <p className="col-span-12 text-[0.98rem] leading-[1.7] text-ink-soft md:col-span-7">
                  {f.a}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Begin */}
      <section id="begin" className="relative py-32 md:py-40">
        <div className="mx-auto max-w-[60rem] px-6 text-center md:px-10">
          <p className="font-display text-[0.78rem] italic uppercase tracking-[0.18em] text-ink-muted">
            The Invitation
          </p>
          <h2 className="font-display mt-8 text-charcoal text-[clamp(2.6rem,5vw,4.4rem)] leading-[1.02]">
            Begin here.
          </h2>
          <p className="mx-auto mt-8 max-w-[36rem] text-[1.05rem] leading-[1.7] text-ink-soft">
            Two paragraphs is plenty. Tell us what feels close to right and what does not. A person
            will write back, by name, within five business days.
          </p>
          <a
            href="mailto:hello@healingtides.co?subject=Begin"
            className="font-display mt-12 inline-flex items-center gap-3 rounded-full bg-charcoal px-10 py-4 text-[1rem] italic text-sand transition hover:bg-ocean"
          >
            Get matched
            <span aria-hidden className="text-base">→</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-rule">
        <div className="mx-auto flex max-w-[92rem] flex-wrap items-center justify-between gap-4 px-6 py-10 md:px-10">
          <p className="font-display text-[0.78rem] italic uppercase tracking-[0.18em] text-ink-muted">
            Healing Tides Collective
          </p>
          <p className="font-display text-[0.78rem] italic uppercase tracking-[0.18em] text-ink-muted">
            © 2026 / Made with care
          </p>
        </div>
      </footer>
    </main>
  );
}
