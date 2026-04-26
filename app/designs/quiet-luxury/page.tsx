import Link from "next/link";
import Image from "next/image";

export default function QuietLuxury() {
  return (
    <main className="min-h-screen bg-sand font-body text-charcoal">
      {/* Symmetric centered nav */}
      <nav className="mx-auto flex max-w-6xl items-center justify-center gap-12 px-6 py-10 text-xs uppercase tracking-[0.3em] text-charcoal-soft md:px-10">
        <a href="#how" className="hidden hover:text-charcoal md:inline">
          How it works
        </a>
        <Link
          href="/"
          className="font-display text-lg italic normal-case tracking-normal text-charcoal"
        >
          Healing Tides
        </Link>
        <a href="#practitioners" className="hidden hover:text-charcoal md:inline">
          Practitioners
        </a>
      </nav>

      {/* Hero — centered, restrained */}
      <section className="mx-auto max-w-4xl px-6 pb-24 pt-24 text-center md:pb-40 md:pt-32">
        <p className="font-display text-sm italic text-teal">
          Healing Tides Collective
        </p>
        <h1 className="mt-12 font-display text-5xl font-light leading-[1.05] tracking-tight md:text-7xl lg:text-8xl">
          Find the care
          <br />
          that <em className="text-teal">fits.</em>
        </h1>
        <p className="mx-auto mt-10 max-w-xl text-base leading-relaxed text-charcoal-soft md:text-lg">
          A guided way to find the right practitioner — clinical or holistic —
          across therapy, acupuncture, reiki, movement, and trauma-informed support.
        </p>
        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
          <a
            href="#waitlist"
            className="rounded-full bg-charcoal px-9 py-4 text-xs uppercase tracking-[0.25em] text-sand transition-opacity hover:opacity-90"
          >
            Begin here
          </a>
          <a
            href="#how"
            className="text-xs uppercase tracking-[0.25em] text-charcoal-soft underline-offset-8 hover:text-charcoal hover:underline"
          >
            How it works
          </a>
        </div>

        {/* Hairline divider */}
        <div className="mx-auto mt-24 h-px w-24 bg-teal" />
      </section>

      {/* Single hero photo — narrow, with margins */}
      <section className="mx-auto max-w-5xl px-6 pb-24 md:px-10 md:pb-32">
        <div className="relative aspect-[16/9] overflow-hidden rounded-sm">
          <Image
            src="/inspiration/04-spa-courtyard.png"
            alt=""
            fill
            priority
            className="object-cover"
          />
        </div>
        <p className="mt-6 text-center font-display text-sm italic text-charcoal-soft">
          Considered. Curated. Calm.
        </p>
      </section>

      {/* Reassurance — centered, three rows */}
      <section className="border-y border-charcoal/10 bg-warm-white">
        <div className="mx-auto max-w-4xl divide-y divide-charcoal/10 px-6 md:px-10">
          {[
            { num: "I", t: "No more endless browsing.", b: "Tell us what you're looking for. We'll narrow it down." },
            { num: "II", t: "Practitioners we trust.", b: "Each one is curated for fit, not just listed." },
            { num: "III", t: "No commitment.", b: "Take the next step when you're ready." },
          ].map((r) => (
            <div
              key={r.num}
              className="grid grid-cols-[auto_1fr] gap-8 py-12 md:grid-cols-[120px_1fr] md:gap-16 md:py-16"
            >
              <span className="font-display text-3xl font-light text-teal md:text-4xl">
                {r.num}
              </span>
              <div>
                <h3 className="font-display text-2xl leading-tight md:text-3xl">{r.t}</h3>
                <p className="mt-3 text-charcoal-soft">{r.b}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — centered */}
      <section id="how" className="mx-auto max-w-4xl px-6 py-24 text-center md:px-10 md:py-32">
        <p className="text-xs uppercase tracking-[0.3em] text-teal">How it works</p>
        <h2 className="mt-6 font-display text-4xl font-light leading-[1.1] md:text-6xl">
          Three steps. <em className="text-teal">No noise.</em>
        </h2>
        <div className="mt-16 grid gap-12 md:mt-20 md:grid-cols-3 md:gap-8">
          {[
            { n: "1", h: "Tell us a little", b: "A few thoughtful questions." },
            { n: "2", h: "We match you", b: "Two or three practitioners, with reasoning." },
            { n: "3", h: "Reach out", b: "Connect directly when it feels right." },
          ].map((step) => (
            <div key={step.n}>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-teal font-display text-xl text-teal">
                {step.n}
              </div>
              <h3 className="mt-6 font-display text-2xl leading-tight">{step.h}</h3>
              <p className="mt-3 text-charcoal-soft">{step.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Care types — centered, sparse */}
      <section className="bg-warm-white">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center md:px-10 md:py-32">
          <p className="text-xs uppercase tracking-[0.3em] text-teal">Care we cover</p>
          <ul className="mx-auto mt-12 flex max-w-3xl flex-wrap justify-center gap-x-10 gap-y-4 font-display text-xl md:text-2xl">
            {[
              "Therapy",
              "Acupuncture",
              "Reiki",
              "Movement",
              "Trauma-informed",
              "Bodywork",
              "Nutrition",
            ].map((c, i, arr) => (
              <li key={c} className="text-charcoal">
                {c}
                {i < arr.length - 1 && (
                  <span className="ml-10 text-teal/50">·</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Practitioners — centered */}
      <section id="practitioners" className="border-y border-charcoal/10">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
          <p className="text-xs uppercase tracking-[0.3em] text-teal">For practitioners</p>
          <h2 className="mt-6 font-display text-4xl font-light leading-[1.05] md:text-5xl">
            Aligned referrals.
            <br />
            <em className="text-teal">Less friction.</em>
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-charcoal-soft">
            We match you with people who are actually a fit for your work.
            Less cold outreach, more meaningful first consultations.
          </p>
          <a
            href="#"
            className="mt-10 inline-block border-b border-charcoal pb-1 text-sm uppercase tracking-[0.25em] hover:text-teal hover:border-teal"
          >
            Join the network
          </a>
        </div>
      </section>

      {/* Waitlist — centered, calm */}
      <section
        id="waitlist"
        className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32"
      >
        <h2 className="font-display text-4xl font-light leading-tight md:text-6xl">
          Be the first
          <br />
          <em className="text-teal">to begin.</em>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-charcoal-soft">
          Matches open in waves. Drop your email — we'll let you know when it's your turn.
        </p>
        <form className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="you@email.com"
            className="flex-1 rounded-full border border-charcoal/20 bg-warm-white px-6 py-4 placeholder-charcoal-soft focus:border-teal focus:outline-none"
          />
          <button
            type="button"
            className="rounded-full bg-charcoal px-8 py-4 text-xs uppercase tracking-[0.25em] text-sand transition-opacity hover:opacity-90"
          >
            Notify me
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="border-t border-charcoal/10 bg-warm-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-center text-xs uppercase tracking-[0.25em] text-charcoal-soft md:flex-row md:items-center md:justify-between md:px-10">
          <span className="font-display text-base normal-case italic tracking-normal text-charcoal">
            Healing Tides Collective
          </span>
          <span>© 2026 · The modern front door to wellness.</span>
        </div>
      </footer>
    </main>
  );
}
