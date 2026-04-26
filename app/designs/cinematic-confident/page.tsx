import Link from "next/link";
import Image from "next/image";

const careTypes = [
  "Therapy",
  "Acupuncture",
  "Reiki",
  "Movement",
  "Trauma-informed",
  "Bodywork",
  "Nutrition",
];

export default function CinematicConfident() {
  return (
    <main className="min-h-screen bg-sand font-body text-charcoal">
      {/* Hero — full bleed photo */}
      <section className="relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-charcoal">
        <Image
          src="/inspiration/02-prana-wellness-week.png"
          alt=""
          fill
          priority
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/50 via-charcoal/30 to-charcoal/80" />

        {/* Top nav over photo */}
        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-8 text-sand md:px-12">
          <Link href="/" className="font-display text-xl italic">
            Healing Tides
          </Link>
          <a
            href="#waitlist"
            className="rounded-full border border-sand/60 px-5 py-2 text-xs uppercase tracking-widest backdrop-blur-sm transition-colors hover:bg-sand hover:text-charcoal"
          >
            Get matched
          </a>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 mx-auto flex h-[calc(100%-120px)] max-w-7xl flex-col justify-end px-6 pb-16 text-sand md:px-12 md:pb-24">
          <p className="mb-6 text-xs uppercase tracking-[0.4em] text-sand/80">
            Healing Tides Collective
          </p>
          <h1 className="font-display text-[clamp(3.5rem,10vw,9rem)] font-medium uppercase leading-[0.9] tracking-tight">
            Find the care
            <br />
            <span className="italic font-light">that fits.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-sand/85 md:text-xl">
            Less searching. More healing. A guided way to find the right
            practitioner across clinical and holistic care.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#waitlist"
              className="rounded-full bg-sand px-8 py-4 text-sm uppercase tracking-widest text-charcoal transition-opacity hover:opacity-90"
            >
              Begin here
            </a>
            <a href="#how" className="text-sm uppercase tracking-widest text-sand/80 hover:text-sand">
              How it works ↓
            </a>
          </div>
        </div>
      </section>

      {/* Reassurance band */}
      <section className="border-y border-charcoal/10 bg-warm-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-charcoal/10 md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            { t: "No more endless browsing", b: "Tell us what you need. We narrow it down." },
            { t: "Curated practitioners", b: "Selected for fit, not just listed." },
            { t: "No commitment", b: "Move forward when you're ready." },
          ].map((r) => (
            <div key={r.t} className="px-8 py-12 md:px-12 md:py-16">
              <h3 className="font-display text-2xl leading-tight">{r.t}</h3>
              <p className="mt-3 text-charcoal-soft">{r.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — three big numbered cards */}
      <section id="how" className="mx-auto max-w-7xl px-6 py-24 md:px-12 md:py-40">
        <div className="mb-16 max-w-3xl md:mb-24">
          <p className="text-xs uppercase tracking-[0.3em] text-charcoal-soft">
            How it works
          </p>
          <h2 className="mt-6 font-display text-5xl uppercase leading-[1] md:text-7xl">
            Three steps.
            <br />
            <span className="italic font-light">No noise.</span>
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { n: "01", h: "Tell us a little", b: "A few questions. Five minutes." },
            { n: "02", h: "We match you", b: "Two or three practitioners with reasoning." },
            { n: "03", h: "Reach out", b: "Connect directly when something feels right." },
          ].map((step) => (
            <div
              key={step.n}
              className="aspect-[4/5] rounded-2xl bg-charcoal p-8 text-sand transition-transform duration-500 hover:-translate-y-1 md:p-10"
            >
              <p className="font-display text-6xl font-light text-seafoam md:text-7xl">
                {step.n}
              </p>
              <h3 className="mt-auto pt-32 font-display text-3xl leading-tight md:pt-40 md:text-4xl">
                {step.h}
              </h3>
              <p className="mt-4 text-sand/70">{step.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Care types */}
      <section className="bg-ocean text-sand">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-28">
          <p className="text-xs uppercase tracking-[0.3em] text-sand/70">
            Care we cover
          </p>
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-display text-3xl md:text-5xl">
            {careTypes.map((c, i) => (
              <li key={c} className={i % 2 === 1 ? "italic text-seafoam" : ""}>
                {c}
                {i < careTypes.length - 1 && <span className="ml-8 text-sand/40">·</span>}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Practitioners — split with image */}
      <section id="practitioners" className="bg-warm-white">
        <div className="mx-auto grid max-w-7xl gap-0 md:grid-cols-2">
          <div className="relative aspect-[4/5] md:aspect-auto">
            <Image
              src="/inspiration/04-spa-courtyard.png"
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center px-6 py-16 md:px-16 md:py-24">
            <p className="text-xs uppercase tracking-[0.3em] text-charcoal-soft">
              For practitioners
            </p>
            <h2 className="mt-6 font-display text-4xl leading-[1.05] md:text-5xl">
              Aligned referrals.
              <br />
              <em className="text-ocean">Less friction.</em>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-charcoal-soft">
              We match you with people who are actually a fit for your work.
              Less cold outreach, more meaningful first consultations.
            </p>
            <a
              href="#"
              className="mt-10 inline-flex w-fit items-center gap-2 rounded-full bg-charcoal px-7 py-3 text-sm uppercase tracking-widest text-sand transition-opacity hover:opacity-90"
            >
              Join the network →
            </a>
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section
        id="waitlist"
        className="bg-sand"
      >
        <div className="mx-auto max-w-3xl px-6 py-24 text-center md:py-36">
          <h2 className="font-display text-5xl uppercase leading-[1] md:text-7xl">
            Be the first
            <br />
            <span className="italic font-light text-ocean">to begin.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-charcoal-soft">
            Matches open in waves. Drop your email — we'll reach out when it's your turn.
          </p>
          <form className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="you@email.com"
              className="flex-1 rounded-full border border-charcoal/20 bg-warm-white px-6 py-4 placeholder-charcoal-soft focus:border-ocean focus:outline-none"
            />
            <button
              type="button"
              className="rounded-full bg-ocean px-8 py-4 text-sm uppercase tracking-widest text-sand transition-opacity hover:opacity-90"
            >
              Notify me
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-charcoal/10 bg-sand">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 text-xs uppercase tracking-[0.2em] text-charcoal-soft md:flex-row md:items-center md:justify-between md:px-12">
          <span className="font-display text-base normal-case italic tracking-normal text-charcoal">
            Healing Tides Collective
          </span>
          <span>© 2026 · Less searching. More healing.</span>
        </div>
      </footer>
    </main>
  );
}
