import Link from "next/link";

const personas = [
  { tag: "Reader 01", name: "The Overwhelmed Optimizer", line: "Reads the studies. Owns the spreadsheet. Cannot choose." },
  { tag: "Reader 02", name: "The Practical Seeker", line: "Wants a record. Wants a person. Skeptical of vibes." },
  { tag: "Reader 03", name: "The Curious Seeker", line: "Open. Uncertain. Wants a guide, not a gauntlet." },
];

const steps = [
  { n: "01", title: "You write a paragraph.", body: "Two paragraphs is plenty. We do not send you a form." },
  { n: "02", title: "We answer with names.", body: "Three to five practitioners, each chosen by a person, each with a sentence on why." },
  { n: "03", title: "You begin in your time.", body: "Reply to the practitioner directly. We are out of the loop unless you ask us back in." },
];

const faqs = [
  { q: "Is this a directory?", a: "No. A directory hands you a list. We hand you a shortlist with the reasoning, written by a person." },
  { q: "How are practitioners vetted?", a: "License where applicable. Training where it matters. Working relationship where neither is enough." },
  { q: "Clinical or holistic?", a: "Both, side by side, without a hierarchy. A licensed therapist and a craniosacral practitioner can both be the right answer." },
  { q: "Do you charge practitioners?", a: "No. The cost is borne by the seeker, paid only after a first session, refundable if the fit is wrong." },
  { q: "What about my privacy?", a: "Your story belongs to you. We do not share it with anyone you have not chosen." },
];

function Plate({ caption, variant = "a" }: { caption: string; variant?: "a" | "b" }) {
  return (
    <figure>
      <div
        className="relative aspect-[16/10] w-full overflow-hidden bg-charcoal"
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              variant === "a"
                ? "linear-gradient(135deg, #1c1c1c 0%, #0a0a0a 100%)"
                : "linear-gradient(135deg, #1f3a5f 0%, #0a1726 100%)",
          }}
        />
        <div className="absolute left-[8%] top-[18%] h-[55%] w-[36%] bg-sand/80" />
        <div className="absolute right-[10%] top-[28%] h-[44%] w-[28%] border border-sand/70" />
        <div className="absolute bottom-[12%] left-[44%] h-[28%] w-[18%] bg-sage/30" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 30% 40%, rgba(214, 237, 232, 0.18), transparent 55%)",
          }}
        />
      </div>
      <figcaption className="meta mt-4 text-ink-muted">{caption}</figcaption>
    </figure>
  );
}

export default function GalleryDesign() {
  return (
    <main className="min-h-screen bg-sand text-charcoal" style={{ letterSpacing: "-0.01em" }}>
      {/* Sticky nav */}
      <header className="sticky top-0 z-40 bg-sand/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5 md:px-10">
          <Link href="#" className="meta link-underline">
            Healing Tides Collective
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {[
              ["01", "Problem"],
              ["02", "How"],
              ["03", "Practitioners"],
              ["04", "FAQ"],
            ].map(([n, l]) => (
              <a key={n} className="meta link-underline" href={`#${l.toLowerCase()}`}>
                {n} / {l}
              </a>
            ))}
          </nav>
          <a href="#begin" className="meta link-underline">
            05 / Begin
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pb-20 pt-16 md:px-10 md:pb-24 md:pt-28">
        <div className="mx-auto max-w-[1500px]">
          <p className="meta text-ink-muted">
            Care&nbsp;&nbsp;/&nbsp;&nbsp;Matched&nbsp;&nbsp;/&nbsp;&nbsp;By a person
          </p>
          <h1
            className="font-display mt-12 leading-[0.86] tracking-[-0.045em]"
            style={{ fontSize: "clamp(64px, 14vw, 220px)" }}
          >
            Less searching.
            <br />
            More
            <br />
            healing.
          </h1>
          <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-12">
            <p className="col-span-12 max-w-2xl text-[16px] leading-[1.7] text-ink-soft md:col-span-7">
              A guided care-matching service for therapy, acupuncture, reiki, movement, and trauma-informed
              care. We replace the directory wall with a shortlist written by a person.
            </p>
            <p className="meta col-span-12 self-end text-ink-muted md:col-span-5 md:text-right">
              Currently Viewing / Index 00 of 05
            </p>
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-10">
            <a href="#begin" className="meta link-underline">
              Begin Here
            </a>
            <a href="#how" className="meta link-underline">
              See How It Works
            </a>
            <a href="#practitioners" className="meta link-underline">
              For Practitioners
            </a>
          </div>
        </div>
      </section>

      {/* 01 Problem with asymmetric grid */}
      <section id="problem" className="px-6 py-24 md:px-10 md:py-40">
        <div className="mx-auto max-w-[1500px]">
          <p className="meta">01&nbsp;&nbsp;/&nbsp;&nbsp;The problem</p>
          <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <Plate caption="Plate 01 / Wellness as a maze" />
            </div>
            <div className="md:col-span-5 md:pl-6">
              <h2
                className="font-display leading-[0.86] tracking-[-0.045em]"
                style={{ fontSize: "clamp(36px, 6vw, 96px)" }}
              >
                The wall is the problem.
              </h2>
              <p className="mt-8 text-[15px] leading-[1.7] text-ink-soft">
                Directories list practitioners alphabetically with star ratings and no theory of fit. The cost
                of that wall is quiet. People do not give up on wellness. They give up on choosing.
              </p>
              <p
                className="font-display mt-10 leading-tight"
                style={{ fontSize: "clamp(28px, 3.2vw, 52px)" }}
              >
                We replace the wall with a shortlist.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Personas as numbered list */}
      <section className="px-6 py-24 md:px-10 md:py-40">
        <div className="mx-auto max-w-[1500px]">
          <p className="meta">02&nbsp;&nbsp;/&nbsp;&nbsp;Who reads this</p>
          <ol className="mt-12 border-t border-rule">
            {personas.map((p, i) => (
              <li
                key={p.name}
                className="grid grid-cols-12 items-baseline gap-6 border-b border-rule py-8 md:py-10"
              >
                <span className="meta col-span-2 text-ink-muted md:col-span-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3
                  className="font-display col-span-10 leading-tight md:col-span-7"
                  style={{ fontSize: "clamp(22px, 3.5vw, 34px)" }}
                >
                  {p.name}
                </h3>
                <p className="col-span-12 text-[15px] leading-[1.7] text-ink-soft md:col-span-3">{p.line}</p>
                <p className="meta col-span-12 text-ink-muted md:col-span-1 md:text-right">{p.tag}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 03 How — inverted grid */}
      <section id="how" className="px-6 py-24 md:px-10 md:py-40">
        <div className="mx-auto max-w-[1500px]">
          <p className="meta">03&nbsp;&nbsp;/&nbsp;&nbsp;How it works</p>
          <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <h2
                className="font-display leading-[0.86] tracking-[-0.045em]"
                style={{ fontSize: "clamp(36px, 6vw, 96px)" }}
              >
                Three steps.
                <br />
                No theatre.
              </h2>
              <p className="mt-8 text-[15px] leading-[1.7] text-ink-soft">
                We do not send forms. We do not ping you with notifications. We do not insert ourselves between
                you and the practitioner once we have made the introduction.
              </p>
            </div>
            <div className="md:col-span-7 md:pl-6">
              <ol className="border-t border-rule">
                {steps.map((s) => (
                  <li
                    key={s.n}
                    className="grid grid-cols-12 items-baseline gap-6 border-b border-rule py-10"
                  >
                    <span className="meta col-span-12 text-ink-muted md:col-span-2">{s.n}</span>
                    <div className="col-span-12 md:col-span-10">
                      <h3
                        className="font-display leading-tight"
                        style={{ fontSize: "clamp(22px, 3vw, 34px)" }}
                      >
                        {s.title}
                      </h3>
                      <p className="mt-3 text-[15px] leading-[1.7] text-ink-soft">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Pull quote on dark plate */}
      <section className="px-6 py-24 md:px-10 md:py-40">
        <div className="mx-auto max-w-[1500px]">
          <Plate caption="Exhibit A / The thesis, written plain" variant="b" />
          <p
            className="font-display mx-auto mt-16 max-w-4xl text-center leading-tight tracking-[-0.035em]"
            style={{ fontSize: "clamp(28px, 3.2vw, 52px)" }}
          >
            The right practitioner is not the most decorated one. It is the one who feels right after the first
            reply.
          </p>
        </div>
      </section>

      {/* 04 Practitioners */}
      <section id="practitioners" className="px-6 py-24 md:px-10 md:py-40">
        <div className="mx-auto max-w-[1500px]">
          <p className="meta">04&nbsp;&nbsp;/&nbsp;&nbsp;For practitioners</p>
          <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <h2
                className="font-display leading-[0.86] tracking-[-0.045em]"
                style={{ fontSize: "clamp(36px, 6vw, 96px)" }}
              >
                Fewer leads.
                <br />
                Better fits.
              </h2>
              <p className="mt-8 text-[15px] leading-[1.7] text-ink-soft">
                The seeker has already told us what they need. You decide whether to take the introduction. We
                never charge per lead. We never sell your information.
              </p>
              <a href="mailto:practitioners@healingtides.co" className="meta link-underline mt-10 inline-block">
                Apply to join the collective
              </a>
            </div>
            <div className="md:col-span-7">
              <Plate caption="Plate 02 / The studio, after the introduction" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-24 md:px-10 md:py-40">
        <div className="mx-auto max-w-[1500px]">
          <p className="meta">05&nbsp;&nbsp;/&nbsp;&nbsp;Questions</p>
          <div className="mt-12 border-t border-rule">
            {faqs.map((f, i) => (
              <div
                key={f.q}
                className="grid grid-cols-12 items-baseline gap-6 border-b border-rule py-8 md:py-10"
              >
                <span className="meta col-span-2 text-ink-muted md:col-span-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3
                  className="font-display col-span-10 leading-tight md:col-span-5"
                  style={{ fontSize: "clamp(20px, 2.5vw, 28px)" }}
                >
                  {f.q}
                </h3>
                <p className="col-span-12 text-[15px] leading-[1.7] text-ink-soft md:col-span-6">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Begin */}
      <section id="begin" className="px-6 py-24 md:px-10 md:py-40">
        <div className="mx-auto max-w-[1500px]">
          <p className="meta">06&nbsp;&nbsp;/&nbsp;&nbsp;Begin here</p>
          <h2
            className="font-display mt-12 leading-[0.86] tracking-[-0.045em]"
            style={{ fontSize: "clamp(44px, 9vw, 160px)" }}
          >
            Send a paragraph.
            <br />
            We answer
            <br />
            with names.
          </h2>
          <form className="mt-16 grid max-w-3xl grid-cols-1 gap-10">
            <label className="block">
              <span className="meta text-ink-muted">Name</span>
              <input
                type="text"
                className="mt-2 block w-full border-b border-rule bg-transparent py-3 text-lg outline-none transition focus:border-charcoal"
                placeholder="Your name"
              />
            </label>
            <label className="block">
              <span className="meta text-ink-muted">Email</span>
              <input
                type="email"
                className="mt-2 block w-full border-b border-rule bg-transparent py-3 text-lg outline-none transition focus:border-charcoal"
                placeholder="you@example.com"
              />
            </label>
            <label className="block">
              <span className="meta text-ink-muted">Tell us where you are</span>
              <textarea
                rows={5}
                className="mt-2 block w-full border-b border-rule bg-transparent py-3 text-lg outline-none transition focus:border-charcoal"
                placeholder="Two paragraphs is plenty"
              />
            </label>
            <div>
              <button type="submit" className="meta link-underline">
                Send →
              </button>
            </div>
          </form>
        </div>
      </section>

      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-8 md:px-10">
          <p className="meta text-ink-muted">© Healing Tides Collective / 2026</p>
          <p className="meta text-ink-muted">Care, matched. By a person.</p>
        </div>
      </footer>
    </main>
  );
}
