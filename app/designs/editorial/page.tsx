import Link from "next/link";

const personas = [
  {
    label: "Reader / 01",
    name: "The Overwhelmed Optimizer",
    line: "You have read the studies. You have the spreadsheet. You still do not know who to call.",
  },
  {
    label: "Reader / 02",
    name: "The Practical Seeker",
    line: "You are not interested in vibes. You want a person whose work checks out.",
  },
  {
    label: "Reader / 03",
    name: "The Curious Seeker",
    line: "You are open. You are uncertain. You want a guide, not a gauntlet.",
  },
];

const steps = [
  {
    no: "01",
    title: "Tell us where you are.",
    detail:
      "A short, plain conversation. Not an intake form. We ask what you are working on, what you have tried, what feels close to right.",
  },
  {
    no: "02",
    title: "Read the shortlist.",
    detail:
      "Three to five practitioners chosen by a person, not a search index. Each pick comes with a sentence on why they fit you, specifically.",
  },
  {
    no: "03",
    title: "Begin with the one that breathes right.",
    detail:
      "You introduce yourself by reply or by booking. We are out of the loop unless you want us back in it. Your relationship is yours.",
  },
];

const yesList = [
  "Therapists who pick up the phone before a sales pitch",
  "Acupuncturists with a real clinical record",
  "Movement teachers working with adult bodies",
  "Trauma-informed practitioners across modalities",
  "Practitioners who say no when the fit is wrong",
];

const noList = [
  "A directory you have to read for an hour",
  "Algorithm-only matches, no human in the loop",
  "Coaches certified by a weekend on Zoom",
  "Practitioners who sell a course on the way in",
  "An AI agent pretending to be a clinician",
];

const faqs = [
  {
    q: "Is this a directory?",
    a: "No. A directory hands you a list and walks away. We hand you a shortlist with the reasoning, and a real person on the other end of an email if you have a follow-up.",
  },
  {
    q: "How are practitioners vetted?",
    a: "License where applicable, training where it matters, references where we can ask, and a working relationship where we cannot. We turn away more than we accept.",
  },
  {
    q: "Do you take a fee from practitioners?",
    a: "No. The cost of a poor referral is borne by the seeker. We take a small platform fee from the seeker, paid only after a first session, refundable if the fit is wrong.",
  },
  {
    q: "Clinical or holistic?",
    a: "Both, side by side, without a hierarchy. A licensed therapist and a craniosacral practitioner can both be the right answer. Sometimes they are both the right answer for the same person.",
  },
];

function SectionNumber({ n, label, dark = false }: { n: string; label: string; dark?: boolean }) {
  return (
    <div className={`flex items-baseline gap-6 ${dark ? "text-sand" : "text-charcoal"}`}>
      <span className="font-display text-[14vw] leading-[0.86] tracking-[-0.04em]">{n}</span>
      <span className="meta">/ {label}</span>
    </div>
  );
}

export default function EditorialDesign() {
  return (
    <main className="min-h-screen bg-sand text-charcoal">
      {/* Masthead */}
      <header className="border-b border-charcoal">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5">
          <p className="meta">Est. 2026 / Healing Tides Collective</p>
          <p className="meta hidden md:block">Issue No. 01 / Spring 2026</p>
          <nav className="flex gap-5">
            {["Mission", "How", "Practitioners", "FAQ", "Begin"].map((l) => (
              <a key={l} className="meta link-underline" href={`#${l.toLowerCase()}`}>
                {l}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Cover hero */}
      <section className="border-b border-charcoal">
        <div className="mx-auto grid max-w-[1500px] grid-cols-12 gap-6 px-6 py-16 md:py-28">
          <div className="col-span-12 md:col-span-8">
            <p className="meta text-ink-muted">Plate I / The front door to wellness</p>
            <h1 className="font-display mt-8 text-[14vw] leading-[0.86] tracking-[-0.04em]">
              Less searching.
              <br />
              More
              <span className="text-ocean"> healing.</span>
            </h1>
          </div>
          <div className="col-span-12 flex flex-col justify-end md:col-span-4">
            <svg viewBox="0 0 200 240" className="mb-8 w-full max-w-[260px]" aria-hidden>
              <rect x="0" y="0" width="200" height="240" fill="#f7f5f2" stroke="#2f2f2f" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="#1f3a5f" strokeWidth="1" />
              <path d="M40 160 Q100 120 160 160 T280 160" stroke="#1f3a5f" strokeWidth="1" fill="none" />
              <path d="M40 180 Q100 140 160 180 T280 180" stroke="#1f3a5f" strokeWidth="1" fill="none" />
              <path d="M40 200 Q100 160 160 200 T280 200" stroke="#1f3a5f" strokeWidth="1" fill="none" />
            </svg>
            <p className="text-base leading-relaxed text-ink-soft">
              A guided care-matching service for therapy, acupuncture, reiki, movement, and trauma-informed care.
              Replaces the directory wall with a shortlist written by a person.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="#begin"
                className="meta inline-flex items-center gap-2 bg-ocean px-6 py-4 text-sand transition-colors hover:bg-charcoal"
              >
                Begin Here
              </Link>
              <Link
                href="#how"
                className="meta inline-flex items-center gap-2 border border-charcoal px-6 py-4 transition-colors hover:bg-charcoal hover:text-sand"
              >
                How It Works
              </Link>
            </div>
          </div>
        </div>
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-8 gap-y-2 border-t border-rule px-6 py-4">
          <p className="meta text-ink-muted">Volume I / Care, matched</p>
          <p className="meta text-ink-muted">Clinical / Holistic / Side by side</p>
          <p className="meta text-ink-muted">Reviewed by a person</p>
          <p className="meta text-ink-muted">healingtides.co</p>
        </div>
      </section>

      {/* 01 Mission — drop cap essay */}
      <section id="mission" className="border-b border-charcoal">
        <div className="mx-auto max-w-[1500px] px-6 py-20 md:py-32">
          <SectionNumber n="01" label="The mission" />
          <h2 className="font-display mt-10 max-w-3xl text-4xl leading-[0.92] tracking-[-0.035em] md:text-6xl">
            We do not believe wellness is a maze.
            <span className="text-ocean"> We believe it has been built like one.</span>
          </h2>
          <div className="mt-12 max-w-5xl columns-1 gap-12 text-[17px] leading-[1.7] text-ink-soft md:columns-2">
            <p className="first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-[72px] first-letter:font-semibold first-letter:leading-[0.78] first-letter:text-ocean">
              Three personas walk into the same problem. The optimizer who has read the studies and still cannot
              choose. The practical seeker who wants a record, not an aesthetic. The curious seeker who wants a
              guide, not a gauntlet. Every directory in the category serves none of them well.
            </p>
            <p>
              The promise of digital care has been a wall of practitioners listed alphabetically with star
              ratings and no theory of fit. The cost of that wall is a quiet one. People do not give up on
              wellness. They give up on choosing.
            </p>
            <p>
              Healing Tides Collective is a different gesture. We replace the wall with a shortlist. We replace
              the rating with a paragraph. We replace the algorithm with a person who reads what you wrote and
              picks three to five practitioners by name. The relationship that follows is yours. We are out of
              the loop the moment you reply.
            </p>
          </div>
        </div>
      </section>

      {/* 02 Personas */}
      <section className="border-b border-charcoal">
        <div className="mx-auto max-w-[1500px] px-6 py-20 md:py-32">
          <SectionNumber n="02" label="Who this is for" />
          <div className="mt-16 grid grid-cols-1 gap-0 md:grid-cols-3">
            {personas.map((p, i) => (
              <div
                key={p.name}
                className={`p-8 ${i !== 0 ? "border-t border-rule md:border-l md:border-t-0" : ""}`}
              >
                <p className="meta text-ocean">{p.label}</p>
                <h3 className="font-display mt-6 text-2xl leading-[1.1] md:text-3xl">{p.name}</h3>
                <p className="mt-4 text-[15px] leading-[1.7] text-ink-soft">{p.line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pull quote */}
      <section className="border-b border-charcoal bg-sand-deep">
        <div className="mx-auto max-w-4xl px-6 py-24 md:py-32">
          <blockquote className="font-display text-center text-[40px] leading-[0.95] tracking-[-0.035em] md:text-[68px]">
            <span className="text-ocean">&ldquo;</span>The right practitioner is not the most decorated one.
            It is the one who feels right after the first reply.<span className="text-ocean">&rdquo;</span>
          </blockquote>
          <p className="meta mt-8 text-center text-ink-muted">From the founding letter</p>
        </div>
      </section>

      {/* 03 How — magazine index of steps */}
      <section id="how" className="border-b border-charcoal">
        <div className="mx-auto max-w-[1500px] px-6 py-20 md:py-32">
          <SectionNumber n="03" label="How it works" />
          <ol className="mt-16 border-t border-charcoal">
            {steps.map((s) => (
              <li
                key={s.no}
                className="grid grid-cols-12 items-baseline gap-6 border-b border-rule px-2 py-10 md:py-14"
              >
                <span className="font-display col-span-12 text-[64px] leading-none text-ocean md:col-span-2 md:text-[96px]">
                  {s.no}
                </span>
                <div className="col-span-12 md:col-span-8">
                  <h3 className="font-display text-2xl leading-[1.1] md:text-4xl">{s.title}</h3>
                  <p className="mt-4 max-w-2xl text-[15px] leading-[1.7] text-ink-soft md:text-base">
                    {s.detail}
                  </p>
                </div>
                <p className="meta col-span-12 text-ink-muted md:col-span-2 md:text-right">Step {s.no}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 04 Yes/no two-up */}
      <section id="practitioners" className="border-b border-charcoal">
        <div className="mx-auto max-w-[1500px] px-6 py-20 md:py-32">
          <SectionNumber n="04" label="The shortlist, briefly" />
          <div className="mt-16 grid grid-cols-1 gap-[1px] bg-charcoal md:grid-cols-2">
            <div className="bg-sand p-10">
              <p className="meta text-ocean">Yes / This Collective</p>
              <ul className="mt-8 space-y-5 text-[16px] leading-[1.6] text-charcoal">
                {yesList.map((y) => (
                  <li key={y}>{y}</li>
                ))}
              </ul>
            </div>
            <div className="bg-sand p-10">
              <p className="meta text-ink-muted">No / Another Directory</p>
              <ul className="mt-8 space-y-5 text-[16px] leading-[1.6] text-ink-muted">
                {noList.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 05 FAQ */}
      <section id="faq" className="border-b border-charcoal">
        <div className="mx-auto max-w-[1500px] px-6 py-20 md:py-32">
          <SectionNumber n="05" label="Questions, answered" />
          <div className="mt-16 border-t border-charcoal">
            {faqs.map((f, i) => (
              <div key={f.q} className="grid grid-cols-12 gap-6 border-b border-rule px-2 py-10">
                <p className="meta col-span-12 text-ink-muted md:col-span-2">
                  Q / {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="font-display col-span-12 text-xl leading-[1.2] md:col-span-4 md:text-2xl">
                  {f.q}
                </h3>
                <p className="col-span-12 text-[15px] leading-[1.7] text-ink-soft md:col-span-6">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 06 Inverted CTA */}
      <section id="begin" className="bg-charcoal text-sand">
        <div className="mx-auto max-w-[1500px] px-6 py-20 md:py-32">
          <SectionNumber n="06" label="Begin here" dark />
          <h2 className="font-display mt-12 max-w-4xl text-[44px] leading-[0.92] tracking-[-0.035em] md:text-[88px]">
            Tell us where you are.
            <span className="text-seafoam"> We will read it.</span>
          </h2>
          <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-2">
            <div>
              <a
                href="mailto:hello@healingtides.co?subject=Begin"
                className="meta inline-flex items-center gap-2 bg-seafoam px-6 py-4 text-charcoal transition-colors hover:bg-sand"
              >
                hello@healingtides.co
              </a>
              <p className="mt-6 max-w-md text-[15px] leading-[1.7] text-sand/80">
                Or fill the short form on first reply. Two paragraphs is plenty. We answer within five business
                days, by name.
              </p>
            </div>
            <div>
              <p className="meta text-sand/60">Correspondence / Hours</p>
              <p className="mt-6 text-[15px] leading-[1.7] text-sand/80">
                Monday through Thursday, 9am to 4pm Central. Friday for rest. Saturday and Sunday for clients
                already in the room.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Colophon */}
      <footer className="border-t border-charcoal bg-sand">
        <div className="mx-auto grid max-w-[1500px] grid-cols-1 items-baseline gap-6 px-6 py-10 md:grid-cols-3">
          <p className="font-display text-2xl leading-none">Healing Tides Collective / 2026</p>
          <p className="meta text-center text-ink-muted">Colophon / Set in Fraunces and Inter</p>
          <p className="meta text-ink-muted md:text-right">All rights, quietly reserved</p>
        </div>
      </footer>
    </main>
  );
}
