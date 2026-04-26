import Link from "next/link";
import Image from "next/image";

export default function IndoorGarden() {
  return (
    <main className="min-h-screen overflow-x-hidden font-body text-charcoal">
      {/* Background gradient — sand → seafoam */}
      <div className="relative bg-gradient-to-b from-sand via-seafoam/30 to-sand">
        {/* Soft organic blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-32 h-96 w-96 rounded-full bg-sage/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-[40rem] h-[28rem] w-[28rem] rounded-full bg-seafoam/60 blur-3xl"
        />

        {/* Nav */}
        <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-8 md:px-10">
          <Link href="/" className="font-display text-lg italic">
            Healing Tides
          </Link>
          <a
            href="#waitlist"
            className="rounded-full bg-sage/30 px-5 py-2 text-xs uppercase tracking-widest text-charcoal backdrop-blur transition-colors hover:bg-sage/60"
          >
            Get matched
          </a>
        </nav>

        {/* Hero — asymmetric with photo card */}
        <section className="relative z-10 mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-28">
          <div className="grid gap-12 md:grid-cols-12 md:items-center md:gap-16">
            <div className="md:col-span-7">
              <p className="font-display text-sm italic text-teal">
                A modern way to find care.
              </p>
              <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
                Care that
                <br />
                grows <em className="text-teal">with you.</em>
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-charcoal-soft md:text-xl">
                A guided way to find the right practitioner — therapy,
                acupuncture, reiki, movement, trauma-informed support, and more.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href="#waitlist"
                  className="rounded-full bg-charcoal px-8 py-4 text-sm uppercase tracking-widest text-sand transition-opacity hover:opacity-90"
                >
                  Begin here
                </a>
                <a
                  href="#practitioners"
                  className="text-sm text-teal underline-offset-4 hover:underline"
                >
                  For practitioners →
                </a>
              </div>
            </div>
            <div className="md:col-span-5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-xl ring-1 ring-charcoal/5 md:rotate-2">
                <Image
                  src="/inspiration/01-poolside-lounge.png"
                  alt=""
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Reassurance — pill cards on sand */}
      <section className="bg-sand">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-24">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { t: "No more endless browsing.", b: "Tell us what you need. We narrow it down." },
              { t: "Practitioners we trust.", b: "Curated for fit, not just listed." },
              { t: "No commitment.", b: "Take the next step when you're ready." },
            ].map((r) => (
              <div
                key={r.t}
                className="rounded-3xl bg-warm-white p-8 shadow-sm ring-1 ring-charcoal/5 md:p-10"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-seafoam">
                  <span className="h-2 w-2 rounded-full bg-teal" />
                </span>
                <h3 className="mt-6 font-display text-2xl leading-tight">{r.t}</h3>
                <p className="mt-3 text-charcoal-soft">{r.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — curved bg */}
      <section
        id="how"
        className="relative bg-sage/30 py-20 md:py-32"
        style={{
          borderTopLeftRadius: "4rem",
          borderTopRightRadius: "4rem",
          borderBottomLeftRadius: "4rem",
          borderBottomRightRadius: "4rem",
        }}
      >
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <p className="text-xs uppercase tracking-[0.3em] text-charcoal-soft">
            How it works
          </p>
          <h2 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] md:text-6xl">
            A short, considered flow.
          </h2>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { n: "01", h: "Tell us a little", b: "A few questions about what you need." },
              { n: "02", h: "We match you", b: "Two or three practitioners, with reasoning." },
              { n: "03", h: "Reach out", b: "Connect directly when it feels right." },
            ].map((step, i) => (
              <div
                key={step.n}
                className="rounded-3xl bg-warm-white p-8 transition-transform hover:-translate-y-1 md:p-10"
                style={{ transform: i % 2 === 1 ? "translateY(2rem)" : undefined }}
              >
                <p className="font-display text-5xl font-light italic text-teal">
                  {step.n}
                </p>
                <h3 className="mt-6 font-display text-2xl leading-tight">{step.h}</h3>
                <p className="mt-3 text-charcoal-soft">{step.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Care types */}
      <section className="bg-sand">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-24">
          <p className="text-xs uppercase tracking-[0.3em] text-charcoal-soft">
            Care we cover
          </p>
          <ul className="mt-10 flex flex-wrap gap-3">
            {[
              "Therapy & counseling",
              "Acupuncture",
              "Reiki & energy work",
              "Movement-based care",
              "Trauma-informed support",
              "Bodywork",
              "Nutrition & functional medicine",
            ].map((c) => (
              <li
                key={c}
                className="rounded-full bg-warm-white px-6 py-3 text-sm shadow-sm ring-1 ring-charcoal/5 transition-colors hover:bg-seafoam"
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Practitioners */}
      <section
        id="practitioners"
        className="bg-gradient-to-br from-seafoam/40 via-sand to-sage/30"
      >
        <div className="mx-auto max-w-6xl px-6 py-24 md:px-10 md:py-32">
          <div className="grid gap-12 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7">
              <p className="text-xs uppercase tracking-[0.3em] text-teal">
                For practitioners
              </p>
              <h2 className="mt-6 font-display text-4xl leading-[1.05] md:text-5xl">
                Aligned referrals,
                <br />
                <em className="text-teal">less friction.</em>
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-charcoal-soft">
                We match you with people who are actually a fit for your work.
                Your calendar fills with well-matched conversations.
              </p>
              <a
                href="#"
                className="mt-8 inline-block rounded-full bg-charcoal px-7 py-3.5 text-sm uppercase tracking-widest text-sand transition-opacity hover:opacity-90"
              >
                Join the network →
              </a>
            </div>
            <div className="md:col-span-5">
              <div className="rounded-[2rem] bg-warm-white p-8 shadow-md ring-1 ring-charcoal/5 md:-rotate-1">
                <p className="font-display text-2xl italic leading-snug text-charcoal">
                  "My calendar fills with conversations that actually go
                  somewhere — not maybes."
                </p>
                <p className="mt-6 text-xs uppercase tracking-widest text-charcoal-soft">
                  — practitioner, beta cohort
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section id="waitlist" className="bg-charcoal text-sand">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
          <h2 className="font-display text-5xl font-light leading-tight md:text-6xl">
            Be the first <em className="text-seafoam">to begin.</em>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-sand/70">
            Matches open in waves. Drop your email — we'll reach out when it's your turn.
          </p>
          <form className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="you@email.com"
              className="flex-1 rounded-full border border-sand/30 bg-transparent px-6 py-4 text-sand placeholder-sand/50 focus:border-seafoam focus:outline-none"
            />
            <button
              type="button"
              className="rounded-full bg-seafoam px-8 py-4 text-sm uppercase tracking-widest text-charcoal transition-opacity hover:opacity-90"
            >
              Notify me
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal pt-2 text-sand/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-xs uppercase tracking-[0.2em] md:flex-row md:items-center md:justify-between md:px-10">
          <span className="font-display text-base normal-case italic tracking-normal text-sand">
            Healing Tides Collective
          </span>
          <span>© 2026 · Care that grows with you.</span>
        </div>
      </footer>
    </main>
  );
}
