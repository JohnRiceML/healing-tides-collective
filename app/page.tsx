import Link from "next/link";

const designs = [
  {
    slug: "editorial-quiet",
    name: "01 — Editorial Quiet",
    tagline: "Magazine restraint. Type does the heavy lifting.",
    note: "Closest to Kairos Collective. Calm, considered, almost no imagery.",
    swatch: "var(--color-sand)",
  },
  {
    slug: "cinematic-confident",
    name: "02 — Cinematic Confident",
    tagline: "Bold display type over photography.",
    note: "Inspired by the prAna reference. Big, certain, warm.",
    swatch: "var(--color-charcoal)",
  },
  {
    slug: "spacious-studio",
    name: "03 — Spacious Studio",
    tagline: "A single column with room to breathe.",
    note: "Studio energy from the attic-workspace reference. Personal, lived-in.",
    swatch: "var(--color-warm-white)",
  },
  {
    slug: "indoor-garden",
    name: "04 — Indoor Garden",
    tagline: "Plant-forward, organic, soft.",
    note: "Sage and seafoam lead. Curved shapes. Indoor-outdoor feel.",
    swatch: "var(--color-sage)",
  },
  {
    slug: "quiet-luxury",
    name: "05 — Quiet Luxury",
    tagline: "Symmetric. Refined. One color note.",
    note: "Spa-courtyard restraint. 90% neutral, one muted-teal accent.",
    swatch: "var(--color-teal)",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-sand text-charcoal">
      <div className="mx-auto max-w-5xl px-6 py-20 md:px-10 md:py-28">
        <header className="mb-20">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-charcoal-soft">
            Healing Tides Collective
          </p>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
            Five directions <em className="font-light italic text-ocean">to choose from.</em>
          </h1>
          <p className="mt-8 max-w-2xl font-body text-base leading-relaxed text-charcoal-soft md:text-lg">
            Five distinct landing-page directions — same brand foundation, same
            content, different temperatures. Pick a favorite and we'll refine it.
            Each is on the same palette and uses the founder-supplied references
            from <code className="rounded bg-seafoam/40 px-1.5 py-0.5 text-sm">assets/inspiration/</code>.
          </p>
        </header>

        <ul className="grid gap-4 md:grid-cols-2">
          {designs.map((d) => (
            <li key={d.slug}>
              <Link
                href={`/designs/${d.slug}`}
                className="group block h-full rounded-2xl border border-charcoal/10 bg-warm-white p-7 transition-all duration-300 hover:border-ocean/40 hover:shadow-lg md:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="h-14 w-14 shrink-0 rounded-full ring-1 ring-charcoal/10"
                    style={{ background: d.swatch }}
                  />
                  <span className="font-body text-xs uppercase tracking-widest text-charcoal-soft transition-colors group-hover:text-ocean">
                    View →
                  </span>
                </div>
                <h2 className="mt-6 font-display text-2xl leading-tight md:text-3xl">
                  {d.name}
                </h2>
                <p className="mt-3 font-display text-lg italic leading-snug text-ocean md:text-xl">
                  {d.tagline}
                </p>
                <p className="mt-4 font-body text-sm leading-relaxed text-charcoal-soft">
                  {d.note}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <footer className="mt-24 border-t border-charcoal/10 pt-8 font-body text-xs uppercase tracking-widest text-charcoal-soft">
          Phase 0 — design exploration · 2026-04-26
        </footer>
      </div>
    </main>
  );
}
