import Link from "next/link";

const personas = [
  {
    label: "If you have read everything",
    line: "We will help you stop reading and start choosing. The shortlist is short on purpose.",
  },
  {
    label: "If you want a record",
    line: "Every practitioner we suggest comes with their training, their license where applicable, and a sentence on why they are the right person for you.",
  },
  {
    label: "If you are not sure where to begin",
    line: "Begin with the email. We will write back like a person.",
  },
];

const steps = [
  {
    n: "i.",
    title: "Write to us.",
    body: "Two paragraphs is plenty. Tell us what feels close to right and what does not. We will not send you a form.",
  },
  {
    n: "ii.",
    title: "We answer with names.",
    body: "Three to five practitioners, each chosen by a person. With each name, a sentence on why we picked them for you.",
  },
  {
    n: "iii.",
    title: "Begin in your own time.",
    body: "Reply to the practitioner directly when you are ready. We are out of the loop unless you ask us back in.",
  },
];

const faqs = [
  {
    q: "Are you a directory?",
    a: "No. A directory hands you a list. We hand you a shortlist with the reasoning and a real person on the other end of an email.",
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
    q: "Will you sell my information?",
    a: "No. Your idea, your story, and your contact details belong to you until you decide to share them with a practitioner.",
  },
];

function RuleFlourish({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-[42rem] items-center gap-4 px-6">
      <span className="h-px flex-1 bg-rule" />
      <span className="font-display text-sm italic text-ink-muted">{children}</span>
      <span className="h-px flex-1 bg-rule" />
    </div>
  );
}

export default function WarmLetterDesign() {
  return (
    <main className="relative min-h-screen bg-sand text-charcoal">
      <div className="paper-grain absolute inset-0" aria-hidden />

      {/* Nav */}
      <header className="relative border-b border-rule">
        <div className="mx-auto flex max-w-[68rem] items-center justify-between px-6 py-6">
          <p className="font-display text-base italic">Healing Tides Collective</p>
          <nav className="flex gap-6">
            {["Mission", "How", "FAQ", "Begin"].map((l) => (
              <a key={l} className="font-display text-sm italic text-ink-soft hover:text-ocean" href={`#${l.toLowerCase()}`}>
                {l}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero — letter opening */}
      <section className="relative">
        <div className="mx-auto max-w-[68rem] px-6 py-24 md:py-32">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="meta text-ink-muted">A letter to the seeker</p>
              <h1 className="font-display mt-8 text-[clamp(2.4rem,5vw,4.4rem)] leading-[1.05]">
                Less searching.
                <br />
                <span className="italic text-ocean">More healing.</span>
              </h1>
              <p className="mt-8 max-w-[42ch] text-[1.075rem] leading-[1.65] text-ink-soft">
                We started Healing Tides Collective because choosing a practitioner had become its own
                full-time job. We thought it should be easier, gentler, and more honest. So we built a small
                service that does it for you, one careful match at a time.
              </p>
              <p className="font-display mt-10 text-base italic text-ink-muted">Write when you are ready.</p>
            </div>
            <div className="flex items-end md:col-span-5">
              <figure className="w-full">
                <div
                  className="warm-tile aspect-[5/6] w-full shadow-[0_30px_60px_-25px_rgba(47,47,47,0.35)]"
                  aria-hidden
                />
                <figcaption className="font-display mt-4 text-sm italic text-ink-muted">
                  Plate I / The studio, before the day begins.
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="relative bg-sand-deep/60 py-28">
        <RuleFlourish>The mission</RuleFlourish>
        <div className="mx-auto mt-16 max-w-[44rem] px-6">
          <h2 className="font-display text-[clamp(2rem,3.6vw,3rem)] leading-tight">
            We do not believe wellness is a maze.
            <br />
            <span className="italic text-ocean">We believe it has been built like one.</span>
          </h2>
          <div className="mt-10 space-y-6 text-[1.075rem] leading-[1.65] text-ink-soft">
            <p>
              The promise of digital care has been a wall of practitioners listed alphabetically with star
              ratings and no theory of fit. The cost of that wall is a quiet one. People do not give up on
              wellness. They give up on choosing.
            </p>
            <p>
              We replace the wall with a shortlist. We replace the rating with a paragraph. We replace the
              algorithm with a person who reads what you wrote and picks three to five practitioners by name.
            </p>
            <blockquote className="border-l-2 border-ocean pl-6 text-[1.2rem] italic leading-snug text-charcoal">
              The right practitioner is not the most decorated one. It is the one who feels right after the
              first reply.
            </blockquote>
          </div>
        </div>
      </section>

      {/* Personas */}
      <section className="relative py-28">
        <RuleFlourish>Who this is for</RuleFlourish>
        <div className="mx-auto mt-16 max-w-[52rem] px-6">
          <ul className="divide-y divide-rule">
            {personas.map((p) => (
              <li key={p.label} className="grid grid-cols-12 gap-6 py-8">
                <p className="meta col-span-12 text-ocean md:col-span-4">{p.label}</p>
                <p className="col-span-12 text-[1.05rem] italic leading-[1.65] text-ink-soft md:col-span-8">
                  {p.line}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative bg-sand-deep/60 py-28">
        <RuleFlourish>How it works</RuleFlourish>
        <div className="mx-auto mt-16 max-w-[52rem] px-6">
          <ol className="space-y-12">
            {steps.map((s) => (
              <li key={s.n} className="grid grid-cols-12 gap-6">
                <p className="font-display col-span-2 text-3xl italic text-ocean md:text-4xl">{s.n}</p>
                <div className="col-span-10">
                  <h3 className="font-display text-2xl leading-tight">{s.title}</h3>
                  <p className="mt-3 text-[1.05rem] italic leading-[1.65] text-ink-soft">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Practitioners */}
      <section className="relative py-28">
        <RuleFlourish>For practitioners</RuleFlourish>
        <div className="mx-auto mt-16 max-w-[68rem] px-6">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
            <div className="md:col-span-7">
              <h2 className="font-display text-[clamp(2rem,3.6vw,2.8rem)] leading-tight">
                We send you fewer leads.
                <br />
                <span className="italic text-ocean">They tend to be better fits.</span>
              </h2>
              <p className="mt-6 text-[1.075rem] leading-[1.65] text-ink-soft">
                Our matches arrive with context. The seeker has already told us what they need, what they have
                tried, and where you came in. You decide whether to take the introduction. We never charge per
                lead, and we never sell your information.
              </p>
              <a
                href="mailto:practitioners@healingtides.co?subject=Practitioner%20introduction"
                className="font-display mt-10 inline-block border border-charcoal px-8 py-3 text-lg italic transition hover:bg-charcoal hover:text-sand"
              >
                Write to us as a practitioner →
              </a>
            </div>
            <div className="flex items-center md:col-span-5">
              <figure className="w-full">
                <div className="warm-tile aspect-[4/5] w-full shadow-[0_30px_60px_-25px_rgba(47,47,47,0.35)]" aria-hidden />
                <figcaption className="font-display mt-4 text-sm italic text-ink-muted">
                  Plate II / A treatment room, mid afternoon.
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative bg-sand-deep/60 py-28">
        <RuleFlourish>Things you might be wondering</RuleFlourish>
        <div className="mx-auto mt-16 max-w-[52rem] px-6">
          <ul className="divide-y divide-rule">
            {faqs.map((f) => (
              <li key={f.q} className="grid grid-cols-12 gap-6 py-8">
                <p className="font-display col-span-12 text-lg italic md:col-span-5">{f.q}</p>
                <p className="col-span-12 text-[1rem] leading-[1.65] text-ink-soft md:col-span-7">{f.a}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Begin */}
      <section id="begin" className="relative py-32">
        <RuleFlourish>To begin</RuleFlourish>
        <div className="mx-auto mt-16 max-w-[44rem] px-6 text-center">
          <h2 className="font-display text-[clamp(2.2rem,4vw,3.4rem)] leading-tight">
            Write to us.
            <br />
            <span className="italic text-ocean">We read every letter.</span>
          </h2>
          <p className="mt-6 text-[1.075rem] leading-[1.65] text-ink-soft">
            Two paragraphs is plenty. Tell us what feels close to right and what does not. A person will write
            back, by name, within five business days.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:hello@healingtides.co?subject=Begin"
              className="font-display bg-ocean px-8 py-3 text-lg italic text-sand transition hover:bg-charcoal"
            >
              Send us a letter
            </a>
            <a href="#how" className="font-display text-base italic text-ink-soft hover:text-ocean">
              or read how it works again
            </a>
          </div>
          <p className="font-display mt-10 text-sm italic text-ink-muted">
            Your story belongs to you until you decide otherwise.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-rule">
        <RuleFlourish>P.S.</RuleFlourish>
        <div className="mx-auto mt-12 flex max-w-[68rem] items-center justify-between px-6 pb-10">
          <p className="font-display text-sm italic text-ink-muted">
            We&rsquo;ll see you in the inbox.
          </p>
          <p className="meta text-ink-muted">© Healing Tides Collective / 2026</p>
        </div>
      </footer>
    </main>
  );
}
