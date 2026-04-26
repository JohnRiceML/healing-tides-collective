import Link from "next/link";

const careTypes = [
  "Therapy & counseling",
  "Acupuncture",
  "Reiki & energy work",
  "Movement-based care",
  "Trauma-informed support",
  "Bodywork",
  "Nutrition & functional medicine",
];

export default function EditorialQuiet() {
  return (
    <main className="min-h-screen bg-sand font-body text-charcoal">
      {/* Nav */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 md:px-12">
        <Link href="/" className="font-display text-lg italic">
          Healing Tides
        </Link>
        <div className="flex items-center gap-8 text-xs uppercase tracking-[0.2em] text-charcoal-soft">
          <a href="#how" className="hidden hover:text-ocean md:inline">
            How it works
          </a>
          <a href="#practitioners" className="hidden hover:text-ocean md:inline">
            For practitioners
          </a>
          <a
            href="#waitlist"
            className="rounded-full border border-charcoal px-5 py-2 text-charcoal transition-colors hover:bg-charcoal hover:text-sand"
          >
            Get matched
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-16 md:px-12 md:pb-40 md:pt-28">
        <p className="mb-10 font-display italic text-charcoal-soft">
          A new way to find care.
        </p>
        <h1 className="font-display text-[clamp(3rem,9vw,8rem)] font-light leading-[0.95] tracking-tight">
          Find the care
          <br />
          <em className="text-ocean">that fits.</em>
        </h1>
        <div className="mt-16 grid gap-8 md:grid-cols-2 md:gap-16">
          <p className="text-lg leading-relaxed text-charcoal-soft md:text-xl">
            A guided way to find the right practitioner — therapy,
            acupuncture, reiki, movement, trauma-informed support, and more.
          </p>
          <div className="flex flex-col items-start gap-3 md:items-end md:justify-end">
            <a
              href="#waitlist"
              className="rounded-full bg-ocean px-8 py-4 text-sm uppercase tracking-widest text-sand transition-opacity hover:opacity-90"
            >
              Begin here
            </a>
            <a href="#practitioners" className="text-sm text-charcoal-soft underline-offset-4 hover:underline">
              For practitioners →
            </a>
          </div>
        </div>
      </section>

      {/* Reassurance */}
      <section className="border-t border-charcoal/10 bg-warm-white">
        <div className="mx-auto grid max-w-6xl gap-px bg-charcoal/10 md:grid-cols-3">
          {[
            {
              num: "01",
              title: "No more endless browsing.",
              body: "Tell us what you're looking for. We'll narrow it down.",
            },
            {
              num: "02",
              title: "Practitioners we trust.",
              body: "Each one is curated for fit, not just listed.",
            },
            {
              num: "03",
              title: "No commitment.",
              body: "Take the next step when you're ready.",
            },
          ].map((item) => (
            <div key={item.num} className="bg-warm-white p-10 md:p-14">
              <p className="font-display text-sm italic text-ocean">{item.num}</p>
              <h3 className="mt-6 font-display text-2xl leading-tight md:text-3xl">
                {item.title}
              </h3>
              <p className="mt-4 leading-relaxed text-charcoal-soft">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-24 md:px-12 md:py-40">
        <p className="mb-6 text-xs uppercase tracking-[0.3em] text-charcoal-soft">
          How it works
        </p>
        <h2 className="max-w-3xl font-display text-4xl leading-[1.05] md:text-6xl">
          A short, considered flow.
        </h2>
        <ol className="mt-16 space-y-10 md:space-y-16">
          {[
            {
              n: "1",
              h: "Tell us a little.",
              b: "A few questions about what you need — what brought you here, what you've tried, what you're open to.",
            },
            {
              n: "2",
              h: "We match you.",
              b: "Two or three practitioners, with the reasoning behind each. No long lists. No filtering for hours.",
            },
            {
              n: "3",
              h: "Reach out.",
              b: "Connect directly when something feels right. There's no booking pressure.",
            },
          ].map((step) => (
            <li
              key={step.n}
              className="grid grid-cols-[auto_1fr] gap-8 border-t border-charcoal/15 pt-10 md:grid-cols-[120px_1fr] md:gap-16"
            >
              <span className="font-display text-5xl font-light italic text-ocean md:text-7xl">
                {step.n}
              </span>
              <div>
                <h3 className="font-display text-2xl md:text-3xl">{step.h}</h3>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-charcoal-soft">
                  {step.b}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Care types */}
      <section className="border-y border-charcoal/10 bg-seafoam/30">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-12 md:py-28">
          <p className="text-xs uppercase tracking-[0.3em] text-charcoal-soft">
            Care we cover
          </p>
          <ul className="mt-10 flex flex-wrap gap-3">
            {careTypes.map((c) => (
              <li
                key={c}
                className="rounded-full border border-charcoal/20 bg-warm-white px-5 py-2.5 text-sm"
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* For practitioners */}
      <section id="practitioners" className="mx-auto max-w-6xl px-6 py-24 md:px-12 md:py-40">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em] text-charcoal-soft">
              For practitioners
            </p>
            <h2 className="mt-6 font-display text-4xl leading-[1.05] md:text-5xl">
              Aligned referrals,
              <br />
              <em className="text-ocean">less friction.</em>
            </h2>
          </div>
          <div className="md:col-span-7 md:pt-4">
            <p className="text-lg leading-relaxed text-charcoal-soft">
              We match you with people who are actually a fit for your work.
              Less cold outreach, more meaningful first consultations. Your
              calendar fills with well-matched conversations, not maybes.
            </p>
            <a
              href="#"
              className="mt-8 inline-block border-b border-ocean pb-1 text-ocean transition-colors hover:border-charcoal hover:text-charcoal"
            >
              Join the practitioner network →
            </a>
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section
        id="waitlist"
        className="border-t border-charcoal/10 bg-charcoal text-sand"
      >
        <div className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
          <p className="text-xs uppercase tracking-[0.3em] text-sand/60">
            Waitlist
          </p>
          <h2 className="mt-8 font-display text-5xl font-light leading-tight md:text-7xl">
            Be the first <em className="text-seafoam">to begin.</em>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-sand/70 md:text-lg">
            We're opening matches in waves. Drop your email and we'll let you
            know when it's your turn.
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
      <footer className="bg-charcoal text-sand/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-xs uppercase tracking-[0.2em] md:flex-row md:items-center md:justify-between md:px-12">
          <span className="font-display text-base normal-case italic tracking-normal">
            Healing Tides Collective
          </span>
          <span>© 2026 · The modern front door to wellness.</span>
        </div>
      </footer>
    </main>
  );
}
