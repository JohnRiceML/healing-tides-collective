import Link from "next/link";
import Image from "next/image";
import { photos } from "@/app/_lib/images";

const directions = [
  {
    slug: "immersive-scroll",
    name: "Immersive · Scroll",
    pitch:
      "Six full-viewport chapters over one continuous photographic canvas. Photos crossfade as you scroll. Modalities pin and slide horizontally. Apple-product-page energy.",
    swatches: ["#f7f5f2", "#1f3a5f", "#2f2f2f", "#d6ede8"],
    anchor: "Scroll-driven",
    photoKey: "studio" as const,
  },
  {
    slug: "immersive-tides",
    name: "Immersive · Tides",
    pitch:
      "The brand name as the mechanic. SVG waves morph between sections, page background shifts from sand to ocean as you scroll, hero photo dissolves into surf.",
    swatches: ["#f7f5f2", "#d6ede8", "#5f8f8b", "#1f3a5f"],
    anchor: "Tide-as-grammar",
    photoKey: "sunsetGather" as const,
  },
  {
    slug: "immersive-cinema",
    name: "Immersive · Cinema",
    pitch:
      "Sticky full-viewport photographs as held film shots. Chapter title cards. Letterbox bars. Lifts framing for one quiet intermission. Slow film, not scroll.",
    swatches: ["#2f2f2f", "#f7f5f2", "#1f3a5f", "#5f8f8b"],
    anchor: "Cinematic chapters",
    photoKey: "practice" as const,
  },
  {
    slug: "lifetime-video",
    name: "Lifetime · Video Split",
    pitch:
      "Vertical 50/50 split with two crossfading photo wells per section, reading as ambient looping video. Lifetime's signature split-screen pattern in the wellness palette.",
    swatches: ["#f7f5f2", "#2f2f2f", "#1f3a5f", "#5f8f8b"],
    anchor: "Lifetime split-screen",
    photoKey: "studio" as const,
  },
  {
    slug: "prana-style",
    name: "prAna Poster",
    pitch:
      "Cinematic practitioner photo, oversized bold serif overlaid like an event poster, carousel chevrons. Each section is its own poster moment.",
    swatches: ["#f7f5f2", "#2f2f2f", "#5f8f8b", "#1f3a5f"],
    anchor: "prAna Wellness Week",
    photoKey: "practice" as const,
  },
  {
    slug: "lifetime-style",
    name: "Lifetime",
    pitch:
      "Cinematic full-bleed hero photo. Wide-tracked sans wordmark, big serif headline overlaid, single muted CTA. Confident resort-brand restraint.",
    swatches: ["#f7f5f2", "#2f2f2f", "#1f3a5f", "#5f8f8b"],
    anchor: "Lifetime Coral Gables",
    photoKey: "palmRow" as const,
  },
  {
    slug: "kairos-style",
    name: "Kairos",
    pitch:
      "Massive serif wordmark on cream. Landscape pool hero with caption overlay. Two-column editorial sections, single pop of color via desert architecture.",
    swatches: ["#f7f5f2", "#efeae1", "#2f2f2f", "#1f3a5f"],
    anchor: "Kairos Collective",
    photoKey: "poolMountain" as const,
  },
  {
    slug: "sacred-woman-style",
    name: "Sacred Woman",
    pitch:
      "Full-bleed atmospheric sunset. Headline overlaid, glassmorphic join card floats in the lower third. Tidal bookend composition.",
    swatches: ["#2f2f2f", "#f7f5f2", "#1f3a5f", "#d6ede8"],
    anchor: "Sacred Woman Collective",
    photoKey: "sunsetGather" as const,
  },
  {
    slug: "modern",
    name: "Modern",
    pitch:
      "Floating pill nav, full-bleed hero photo, bento grid for value props, double-bezel cards. Linear-tier polish in a wellness palette.",
    swatches: ["#f7f5f2", "#1f3a5f", "#a8bfa3", "#d6ede8"],
    anchor: "2026 wellness brand",
    photoKey: "threshold" as const,
  },
  {
    slug: "editorial",
    name: "Editorial",
    pitch:
      "Numbered departments, drop-cap essay, magazine index. The argument is the product.",
    swatches: ["#f7f5f2", "#1f3a5f", "#2f2f2f", "#d6ede8"],
    anchor: "Magazine restraint",
    photoKey: "practice" as const,
  },
  {
    slug: "warm-letter",
    name: "Warm Letter",
    pitch:
      "Reads like the opening of a letter. Single Fraunces, paper grain, signature lines, real photography.",
    swatches: ["#f7f5f2", "#efeae1", "#1f3a5f", "#a8bfa3"],
    anchor: "Attic workspace",
    photoKey: "teaPour" as const,
  },
  {
    slug: "gallery",
    name: "Gallery",
    pitch:
      "Monumental display, exhibition-style sections, real photography as exhibits, asymmetric grids.",
    swatches: ["#f7f5f2", "#2f2f2f", "#5f8f8b", "#d6ede8"],
    anchor: "prAna confidence",
    photoKey: "studio" as const,
  },
  {
    slug: "minimalist",
    name: "Minimalist",
    pitch:
      "Single Fraunces serif everywhere. Hairline rules, text-link CTAs, one restrained photograph. Quiet luxury.",
    swatches: ["#f7f5f2", "#2f2f2f", "#1f3a5f", "#a8bfa3"],
    anchor: "Spa courtyard",
    photoKey: "landing" as const,
  },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-sand text-charcoal">
      <header className="mx-auto max-w-6xl px-6 pt-16 pb-12 md:pt-24 md:pb-20">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">
          Healing Tides Collective / Design directions
        </p>
        <h1 className="font-display mt-6 max-w-3xl text-4xl leading-tight md:text-6xl md:leading-[1.05]">
          Thirteen landing page directions.
          <span className="italic text-ocean"> Pick the one that breathes right.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft md:text-lg">
          A modern care-matching platform that replaces overwhelming directories with a guided, matching-based
          experience across clinical and holistic wellness. Each direction below is a complete landing page
          serving the same dual-sided story for seekers and practitioners. Same brand, five different visual
          systems.
        </p>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-24 md:pb-40">
        {/* Featured: modern */}
        <Link
          href={`/designs/${directions[0].slug}`}
          className="group block overflow-hidden rounded-[2rem] border border-charcoal/[0.08] bg-white shadow-[0_30px_80px_-40px_rgba(47,47,47,0.25)] transition-transform hover:-translate-y-0.5"
        >
          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="relative min-h-[280px] md:col-span-7">
              <Image
                src={photos[directions[0].photoKey].src}
                alt={photos[directions[0].photoKey].alt}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 768px) 60vw, 100vw"
              />
            </div>
            <div className="p-8 md:col-span-5 md:p-10">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-full bg-charcoal/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em]">
                  / {directions[0].anchor}
                </span>
                <span className="text-xs uppercase tracking-[0.18em] text-ocean opacity-0 transition-opacity group-hover:opacity-100">
                  Read →
                </span>
              </div>
              <h2 className="font-display mt-6 text-4xl leading-tight md:text-5xl">{directions[0].name}</h2>
              <p className="mt-4 text-base leading-relaxed text-ink-soft">{directions[0].pitch}</p>
              <div className="mt-8 flex gap-2">
                {directions[0].swatches.map((s) => (
                  <span
                    key={s}
                    className="h-8 w-8 rounded-full border border-charcoal/10"
                    style={{ background: s }}
                    aria-hidden
                  />
                ))}
              </div>
            </div>
          </div>
        </Link>

        {/* Other 4 — 2x2 grid */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {directions.slice(1).map((d) => (
            <Link
              key={d.slug}
              href={`/designs/${d.slug}`}
              className="group block overflow-hidden rounded-[1.5rem] border border-charcoal/[0.08] bg-white transition-transform hover:-translate-y-0.5"
            >
              <div className="relative aspect-[16/10]">
                <Image
                  src={photos[d.photoKey].src}
                  alt={photos[d.photoKey].alt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
              <div className="p-7">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-charcoal/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em]">
                    / {d.anchor}
                  </span>
                  <span className="text-xs uppercase tracking-[0.18em] text-ocean opacity-0 transition-opacity group-hover:opacity-100">
                    Read →
                  </span>
                </div>
                <h2 className="font-display mt-5 text-3xl leading-tight">{d.name}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft md:text-base">{d.pitch}</p>
                <div className="mt-6 flex gap-2">
                  {d.swatches.map((s) => (
                    <span
                      key={s}
                      className="h-7 w-7 rounded-full border border-charcoal/10"
                      style={{ background: s }}
                      aria-hidden
                    />
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-charcoal/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">
            Healing Tides Collective / 2026
          </p>
          <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">v1 / design exploration</p>
        </div>
      </footer>
    </main>
  );
}
