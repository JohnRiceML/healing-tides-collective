import Link from "next/link";

const directions = [
  {
    slug: "editorial",
    name: "Editorial",
    pitch: "Numbered departments, magazine restraint. The argument is the product.",
    swatches: ["#f7f5f2", "#1f3a5f", "#2f2f2f", "#d6ede8"],
    anchor: "Magazine restraint",
  },
  {
    slug: "warm-letter",
    name: "Warm Letter",
    pitch: "Reads like the opening of a letter. Single serif, paper grain, signature lines.",
    swatches: ["#f7f5f2", "#efeae1", "#1f3a5f", "#a8bfa3"],
    anchor: "Attic workspace",
  },
  {
    slug: "gallery",
    name: "Gallery",
    pitch: "Monumental display, exhibition-style sections, geometric plates over photography.",
    swatches: ["#f7f5f2", "#2f2f2f", "#5f8f8b", "#d6ede8"],
    anchor: "prAna confidence",
  },
  {
    slug: "minimalist",
    name: "Minimalist",
    pitch: "Single serif everywhere, hairline rules, text-link CTAs. Quiet luxury, one color note.",
    swatches: ["#f7f5f2", "#2f2f2f", "#1f3a5f", "#a8bfa3"],
    anchor: "Spa courtyard",
  },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-sand text-charcoal">
      <header className="mx-auto max-w-6xl px-6 pt-16 pb-12 md:pt-24 md:pb-20">
        <p className="meta text-ink-muted">Healing Tides Collective / Design directions</p>
        <h1 className="font-display mt-6 text-4xl leading-tight md:text-6xl md:leading-[1.05]">
          Four landing page directions.
          <span className="italic text-ocean"> Pick the one that breathes right.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft md:text-lg">
          Each direction is a complete landing page anchored to one of the four mood-board references.
          Same brand palette, same component inventory, four different visual systems. Click any tile to
          read the page in full.
        </p>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-24 md:pb-40">
        <div className="grid gap-6 md:grid-cols-2">
          {directions.map((d) => (
            <Link
              key={d.slug}
              href={`/designs/${d.slug}`}
              className="group block border border-rule bg-white p-8 transition-colors hover:border-charcoal md:p-10"
            >
              <div className="flex items-baseline justify-between">
                <p className="meta text-ink-muted">/ {d.anchor}</p>
                <span className="meta text-ocean opacity-0 transition-opacity group-hover:opacity-100">
                  Read →
                </span>
              </div>
              <h2 className="font-display mt-4 text-3xl leading-none md:text-4xl">{d.name}</h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft md:text-base">{d.pitch}</p>
              <div className="mt-8 flex gap-2">
                {d.swatches.map((s) => (
                  <span
                    key={s}
                    className="h-8 w-8 border border-rule"
                    style={{ background: s }}
                    aria-hidden
                  />
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
          <p className="meta text-ink-muted">Healing Tides Collective / 2026</p>
          <p className="meta text-ink-muted">v0 / design exploration</p>
        </div>
      </footer>
    </main>
  );
}
