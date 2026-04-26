import Link from "next/link";
import Image from "next/image";

export default function SpaciousStudio() {
  return (
    <main className="min-h-screen bg-warm-white font-body text-charcoal">
      {/* Quiet nav */}
      <nav className="mx-auto flex max-w-2xl items-center justify-between px-6 py-10">
        <Link href="/" className="font-display text-base italic">
          Healing Tides
        </Link>
        <a
          href="#waitlist"
          className="text-xs uppercase tracking-[0.25em] text-charcoal-soft underline-offset-8 hover:text-charcoal hover:underline"
        >
          Get matched
        </a>
      </nav>

      {/* Single-column reading layout */}
      <article className="mx-auto max-w-2xl px-6 pb-32 pt-16 md:pt-24">
        {/* Hero */}
        <p className="text-xs uppercase tracking-[0.3em] text-teal">
          A new front door to wellness
        </p>
        <h1 className="mt-8 font-display text-5xl font-light leading-[1.05] md:text-6xl">
          Find the care
          <br />
          that <em className="text-ocean">actually</em> fits.
        </h1>
        <p className="mt-10 text-lg leading-[1.7] text-charcoal-soft md:text-xl">
          Most directories give you hundreds of options and almost no help
          choosing. We do the opposite. A few thoughtful questions, and we
          match you with two or three practitioners — clinical or holistic —
          who actually fit what you're looking for.
        </p>
        <div className="mt-12 flex flex-wrap items-center gap-6">
          <a
            href="#waitlist"
            className="rounded-full bg-charcoal px-7 py-3.5 text-sm uppercase tracking-widest text-sand transition-opacity hover:opacity-90"
          >
            Begin here
          </a>
          <a
            href="#practitioners"
            className="border-b border-teal pb-1 text-sm text-teal hover:border-charcoal hover:text-charcoal"
          >
            For practitioners →
          </a>
        </div>

        {/* Reassurance — inline list */}
        <div className="mt-24 space-y-8 border-l-2 border-sage pl-8">
          <Reassurance
            t="No more endless browsing."
            b="Tell us what you're looking for. We'll narrow it down."
          />
          <Reassurance
            t="Practitioners we trust."
            b="Each one is curated for fit, not just listed."
          />
          <Reassurance
            t="No commitment."
            b="Take the next step when you're ready."
          />
        </div>

        {/* How it works */}
        <h2 className="mt-32 font-display text-3xl md:text-4xl">
          How it works
        </h2>
        <p className="mt-3 text-charcoal-soft">
          Three steps. Five minutes. No pressure.
        </p>
        <ol className="mt-10 space-y-12">
          <Step
            n="One"
            h="Tell us a little."
            b="A few questions about what you need — what brought you here, what you've tried, what you're open to."
          />
          <Step
            n="Two"
            h="We match you."
            b="Two or three practitioners, with the reasoning behind each. No long lists."
          />
          <Step
            n="Three"
            h="Reach out."
            b="Connect directly when something feels right. There's no booking pressure."
          />
        </ol>

        {/* Inline image — the studio reference */}
        <figure className="mt-24">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-sand">
            <Image
              src="/inspiration/03-attic-workspace.png"
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <figcaption className="mt-4 font-display text-sm italic text-charcoal-soft">
            A studio, not a showroom. Real practitioners. Real care.
          </figcaption>
        </figure>

        {/* Care types */}
        <h2 className="mt-24 font-display text-3xl md:text-4xl">
          Care we cover
        </h2>
        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              className="flex items-center gap-3 text-charcoal-soft before:h-px before:w-4 before:bg-teal"
            >
              {c}
            </li>
          ))}
        </ul>

        {/* Practitioners */}
        <section id="practitioners" className="mt-32 rounded-2xl bg-sand p-8 md:p-12">
          <p className="text-xs uppercase tracking-[0.3em] text-teal">
            For practitioners
          </p>
          <h2 className="mt-6 font-display text-3xl md:text-4xl">
            Aligned referrals, less friction.
          </h2>
          <p className="mt-6 leading-[1.7] text-charcoal-soft">
            We match you with people who are actually a fit for your work.
            Less cold outreach, more meaningful first consultations. Your
            calendar fills with conversations that go somewhere.
          </p>
          <a
            href="#"
            className="mt-8 inline-block border-b border-charcoal pb-1 hover:text-ocean"
          >
            Join the practitioner network →
          </a>
        </section>

        {/* Waitlist */}
        <section id="waitlist" className="mt-32">
          <h2 className="font-display text-4xl leading-tight md:text-5xl">
            Be the first to begin.
          </h2>
          <p className="mt-4 text-lg text-charcoal-soft">
            Matches open in waves. Email us — we'll reach out when it's your turn.
          </p>
          <form className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="you@email.com"
              className="flex-1 rounded-full border border-charcoal/20 bg-warm-white px-6 py-4 placeholder-charcoal-soft focus:border-ocean focus:outline-none"
            />
            <button
              type="button"
              className="rounded-full bg-charcoal px-8 py-4 text-sm uppercase tracking-widest text-sand transition-opacity hover:opacity-90"
            >
              Notify me
            </button>
          </form>
        </section>
      </article>

      {/* Footer */}
      <footer className="border-t border-charcoal/10">
        <div className="mx-auto flex max-w-2xl flex-col gap-2 px-6 py-10 text-xs uppercase tracking-[0.2em] text-charcoal-soft md:flex-row md:items-center md:justify-between">
          <span className="font-display text-base normal-case italic tracking-normal text-charcoal">
            Healing Tides Collective
          </span>
          <span>© 2026 · The modern front door to wellness.</span>
        </div>
      </footer>
    </main>
  );
}

function Reassurance({ t, b }: { t: string; b: string }) {
  return (
    <div>
      <h3 className="font-display text-xl leading-tight">{t}</h3>
      <p className="mt-2 text-charcoal-soft">{b}</p>
    </div>
  );
}

function Step({ n, h, b }: { n: string; h: string; b: string }) {
  return (
    <li>
      <p className="font-display text-sm uppercase tracking-[0.3em] text-teal">
        {n}
      </p>
      <h3 className="mt-3 font-display text-2xl leading-tight">{h}</h3>
      <p className="mt-3 leading-[1.7] text-charcoal-soft">{b}</p>
    </li>
  );
}
