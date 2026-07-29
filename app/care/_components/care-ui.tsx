// Presentation pieces for the programmatic care pages (/care/[specialty]/[city]).
// Server components, no client JS — the page is a static SEO landing surface and
// should stay one HTML document. Everything here is tokens + the shared art system.

import Link from "next/link";

import { ProfileCover } from "@/app/practitioners/_components/ProfileCover";

/** Stable small hash so a given specialty/city always draws the same art. */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// A curated slice of the cover system — the calmest palettes and motifs. The specialty
// picks the COLOUR (so all "Mind-Body Healing" pages share a family) and the city picks
// the MOTIF (so each place has its own horizon). Deterministic, never random.
// "fog" is left out — a grey wash reads cold, and this page meets people at a hard moment.
const HERO_COLORS = ["tide", "sky", "meadow", "sand", "blush"] as const;
// Only the layered/atmospheric motifs: "minimal" reads as an empty gradient at hero scale,
// and "botanical" blows its line-art sprig up into a wall-sized outline.
const HERO_DESIGNS = ["waves", "hills", "dunes", "horizon"] as const;

// The band is tall enough that its pale sky sits behind the copy and its deeper ridges
// land well below it, then dissolves into the sand canvas instead of ending on a seam
// (STYLE-GUIDE §7, "atmospheric imagery"). Contrast is never at risk: the copy only ever
// sits over the sky wash + mist, which stay far lighter than charcoal.
// The stops ease out rather than ramp linearly: a straight alpha ramp still terminates on a
// faint but visible horizontal seam where the deeper ridges cut off. This tails to nothing.
const WASH_MASK =
  "linear-gradient(to bottom, #000 0%, #000 28%, rgba(0,0,0,0.72) 52%, rgba(0,0,0,0.36) 70%, rgba(0,0,0,0.12) 86%, transparent 100%)";

/**
 * The hero wash — a full-bleed watercolour band bleeding off the top of the page and
 * dissolving downward. Decorative only: aria-hidden, pointer-events-none, behind the copy.
 */
export function CareHeroWash({
  specialtyId,
  citySlug,
}: {
  specialtyId: string;
  citySlug: string;
}) {
  const color = HERO_COLORS[hash(specialtyId) % HERO_COLORS.length];
  const design = HERO_DESIGNS[hash(citySlug) % HERO_DESIGNS.length];
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[400px] select-none opacity-80 sm:h-[520px] md:h-[620px]"
      style={{ maskImage: WASH_MASK, WebkitMaskImage: WASH_MASK }}
    >
      <ProfileCover seed={`${specialtyId}-${citySlug}`} design={design} color={color} className="h-full w-full" />
    </div>
  );
}

/** The house leaf — used on the invitation band and the still-growing note. */
export function Leaf({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M4 20C4 12 9 5 20 4c0 11-7 16-15 16-1 0-1-3-1-3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 16c2-3 5-6 9-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * One column of the internal mesh — a calm directory list, not a link farm. The place
 * name carries the emphasis; the repeated specialty phrase stays quiet, so the eye scans
 * cities instead of re-reading the same six words. Full anchor text is preserved.
 */
export function MeshColumn({
  heading,
  items,
}: {
  heading: string;
  /** `before`/`after` are the quiet, repeated halves; `emphasis` is what changes. The
   *  three concatenate into the natural anchor text ("Mind-Body Healing in Duluth"). */
  items: Array<{ href: string; before?: string; emphasis: string; after?: string }>;
}) {
  return (
    <nav aria-label={heading}>
      <p className="meta text-ink-muted">{heading}</p>
      <ul className="mt-4">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group flex items-baseline justify-between gap-4 border-t border-rule/50 py-3 transition-colors hover:border-rule focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15 focus-visible:ring-offset-4 focus-visible:ring-offset-sand"
            >
              <span className="text-[14px] leading-[1.5] text-ink-muted transition-colors group-hover:text-ink-soft">
                {item.before ? `${item.before} ` : null}
                <span className="font-medium text-charcoal">{item.emphasis}</span>
                {item.after ? ` ${item.after}` : null}
              </span>
              <span
                aria-hidden
                className="shrink-0 text-[13px] text-teal opacity-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:opacity-100"
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
