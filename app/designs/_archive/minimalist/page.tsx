import Link from "next/link";
import Image from "next/image";
import { photos } from "@/app/_lib/images";

const personas = [
  { who: "If you have read everything", line: "We will help you stop reading and start choosing." },
  { who: "If you want a record", line: "Every name comes with the training, the license, the reasoning." },
  { who: "If you are not sure where to begin", line: "Begin with the email. We will write back like a person." },
];

const steps = [
  { n: "i", title: "Write", body: "Two paragraphs about where you are. We do not send a form." },
  { n: "ii", title: "Read the shortlist", body: "Three to five practitioners, each chosen by a person, each with a sentence on why." },
  { n: "iii", title: "Begin", body: "Reply directly. We are out of the loop unless you ask us back in." },
];

const faqs = [
  { q: "Are you a directory?", a: "No. A directory hands you a list. We hand you a shortlist with reasoning." },
  { q: "How are practitioners vetted?", a: "License where applicable, training where it matters, working relationship where neither is enough." },
  { q: "Clinical or holistic?", a: "Both, side by side, without a hierarchy." },
  { q: "Do you charge practitioners?", a: "No." },
  { q: "What about my privacy?", a: "Your story belongs to you until you decide to share it." },
];

function Hairline() {
  return (
    <div className="mx-auto max-w-6xl px-6 md:px-12">
      <div className="rule" />
    </div>
  );
}

export default function MinimalistDesign() {
  return (
    <main
      className="min-h-screen bg-sand text-charcoal"
      style={{ fontFamily: "var(--font-display)" }}
    >
      {/* Nav */}
      <header>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 md:px-12">
          <Link href="#" className="text-sm uppercase tracking-[0.22em] text-ink-soft hover:opacity-60">
            Healing Tides Collective
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {["Mission", "How", "FAQ", "Begin"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="text-sm uppercase tracking-[0.22em] text-ink-soft transition-opacity hover:opacity-60"
              >
                {l}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <Hairline />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-24 pb-32 md:px-12">
        <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">I. The premise</p>
        <h1
          className="mt-10 font-light leading-[1.05]"
          style={{ fontSize: "clamp(42px, 6vw, 76px)" }}
        >
          A quiet front door
          <br />
          to <em className="text-ocean">wellness.</em>
        </h1>
        <p className="mt-14 max-w-xl text-[22px] leading-[1.55] text-ink-soft md:text-[24px]">
          We replace the directory wall with a shortlist, written by a person.
        </p>
        <p className="mt-10 max-w-xl text-[16px] leading-[1.85] text-ink-soft">
          Three to five practitioners. Each chosen by a person, not by a search index. Each named with a
          sentence on why they fit you, specifically. Therapy, acupuncture, reiki, movement-based care,
          trauma-informed support. Clinical and holistic, side by side, without a hierarchy.
        </p>
        <p className="mt-20">
          <a
            href="#begin"
            className="inline-block border-b border-charcoal pb-1 text-sm uppercase tracking-[0.22em] transition-opacity hover:opacity-60"
          >
            Begin here
          </a>
        </p>
      </section>

      {/* One restrained photograph */}
      <section className="mx-auto max-w-5xl px-6 pb-32 md:px-12">
        <figure>
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <Image
              src={photos.threshold.src}
              alt={photos.threshold.alt}
              fill
              className="object-cover"
              style={{ filter: "grayscale(20%)" }}
              sizes="(min-width: 768px) 80vw, 100vw"
            />
          </div>
          <figcaption className="mt-4 text-xs uppercase tracking-[0.22em] text-ink-muted">
            Plate I. The threshold.
          </figcaption>
        </figure>
      </section>

      <Hairline />

      {/* Mission */}
      <section id="mission" className="mx-auto max-w-4xl px-6 py-32 md:px-12">
        <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">II. The mission</p>
        <h2
          className="mt-10 font-light leading-[1.1]"
          style={{ fontSize: "clamp(32px, 4vw, 44px)" }}
        >
          We do not believe wellness is a maze.
          <em className="text-ocean"> We believe it has been built like one.</em>
        </h2>
        <div className="mt-14 max-w-2xl space-y-6 text-[17px] leading-[1.85] text-ink-soft">
          <p>
            The promise of digital care has been a wall of practitioners listed alphabetically with star
            ratings and no theory of fit. The cost of that wall is quiet. People do not give up on wellness.
            They give up on choosing.
          </p>
          <p>
            We replace the wall with a shortlist. We replace the rating with a paragraph. We replace the
            algorithm with a person.
          </p>
          <p className="italic">The relationship that follows is yours.</p>
        </div>
      </section>

      <Hairline />

      {/* Personas */}
      <section className="mx-auto max-w-5xl px-6 py-32 md:px-12">
        <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">III. Who this is for</p>
        <ul className="mt-14 divide-y divide-rule border-y border-rule">
          {personas.map((p) => (
            <li key={p.who} className="grid grid-cols-12 gap-6 py-8 md:py-10">
              <p className="col-span-12 text-[20px] italic leading-snug md:col-span-5">{p.who}</p>
              <p className="col-span-12 text-[16px] leading-[1.85] text-ink-soft md:col-span-7">{p.line}</p>
            </li>
          ))}
        </ul>
      </section>

      <Hairline />

      {/* How */}
      <section id="how" className="mx-auto max-w-4xl px-6 py-32 md:px-12">
        <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">IV. How it works</p>
        <h2
          className="mt-10 font-light leading-[1.1]"
          style={{ fontSize: "clamp(32px, 4vw, 44px)" }}
        >
          Three steps. <em className="text-ocean">No theatre.</em>
        </h2>
        <ol className="mt-14 divide-y divide-rule border-y border-rule">
          {steps.map((s) => (
            <li key={s.n} className="grid grid-cols-12 gap-6 py-10">
              <p className="col-span-2 text-2xl italic text-ocean md:col-span-1">{s.n}</p>
              <div className="col-span-10 md:col-span-11">
                <h3 className="text-[24px] font-light leading-tight">{s.title}</h3>
                <p className="mt-4 max-w-2xl text-[16px] leading-[1.85] text-ink-soft">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <Hairline />

      {/* Practitioners */}
      <section className="mx-auto max-w-4xl px-6 py-32 md:px-12">
        <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">V. For practitioners</p>
        <h2
          className="mt-10 font-light leading-[1.1]"
          style={{ fontSize: "clamp(32px, 4vw, 44px)" }}
        >
          Fewer leads. <em className="text-ocean">Better fits.</em>
        </h2>
        <p className="mt-12 max-w-2xl text-[17px] leading-[1.85] text-ink-soft">
          We streamline the referral pipeline. The seeker has already told us what they need, what they have
          tried, where you came in. You decide whether to take the introduction. We never charge per lead. We
          never sell your information.
        </p>
        <p className="mt-14">
          <a
            href="mailto:practitioners@healingtides.co"
            className="inline-block border-b border-charcoal pb-1 text-sm uppercase tracking-[0.22em] transition-opacity hover:opacity-60"
          >
            Apply to join the collective
          </a>
        </p>
      </section>

      <Hairline />

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-5xl px-6 py-32 md:px-12">
        <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">VI. Things you might be wondering</p>
        <ul className="mt-14 divide-y divide-rule border-y border-rule">
          {faqs.map((f) => (
            <li key={f.q} className="grid grid-cols-12 gap-6 py-8">
              <p className="col-span-12 text-[20px] italic leading-snug md:col-span-5">{f.q}</p>
              <p className="col-span-12 text-[16px] leading-[1.85] text-ink-soft md:col-span-7">{f.a}</p>
            </li>
          ))}
        </ul>
      </section>

      <Hairline />

      {/* Begin */}
      <section id="begin" className="mx-auto max-w-4xl px-6 py-32 md:px-12">
        <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">VII. To begin</p>
        <h2
          className="mt-10 font-light leading-[1.1]"
          style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
        >
          Write to us. <em className="text-ocean">We read every letter.</em>
        </h2>
        <p className="mt-10 max-w-2xl text-[17px] leading-[1.85] text-ink-soft">
          Two paragraphs is plenty. Tell us what feels close to right and what does not. A person answers, by
          name, within five business days.
        </p>
        <p className="mt-20">
          <a
            href="mailto:hello@healingtides.co?subject=Begin"
            className="inline-block border-b border-charcoal pb-1 text-sm uppercase tracking-[0.22em] transition-opacity hover:opacity-60"
          >
            hello@healingtides.co
          </a>
        </p>
        <p className="mt-16 text-[16px] italic text-ink-muted">
          Your story belongs to you until you decide otherwise.
        </p>
      </section>

      <Hairline />

      <footer className="mx-auto flex max-w-6xl items-center justify-between px-6 py-12 md:px-12">
        <p className="text-xs uppercase tracking-[0.22em] text-ink-muted">Healing Tides Collective</p>
        <p className="text-xs uppercase tracking-[0.22em] text-ink-muted">2026</p>
      </footer>
    </main>
  );
}
