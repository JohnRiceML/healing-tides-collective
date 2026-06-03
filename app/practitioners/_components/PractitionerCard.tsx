import Link from "next/link";

import type { PractitionerCard as PractitionerCardData } from "@/lib/practitioners";
import { modalityLabel, specialtyLabel } from "@/app/_lib/taxonomy";
import { VerificationBadges } from "@/app/_components/VerificationBadges";

import { CoverArt } from "./CoverArt";

const MAX_SPECIALTIES = 3;

/** First letter of the name, for the photo-less portrait. */
function initialOf(name: string): string {
  const ch = name.trim().charAt(0);
  return ch ? ch.toUpperCase() : "·";
}

/**
 * One person in the directory — a warm, linked card: a default "wide image" cover
 * (CoverArt, until they upload their own), an overlapping portrait, a line of their
 * bio, and a few focus areas. Photos render as a plain lazy <img> (their host isn't
 * in next/image's allowlist; a plain img is the safe, deploy-proof choice).
 */
export function PractitionerCard({ practitioner }: { practitioner: PractitionerCardData }) {
  const { slug, displayName, bio, region, modality, specialties, photoUrl, featured, createdAt, verificationBadges } =
    practitioner;

  const meta = [region, modalityLabel(modality)].filter(Boolean).join(" · ");
  const shown = specialties.slice(0, MAX_SPECIALTIES);
  const remaining = specialties.length - shown.length;

  return (
    <Link
      href={`/practitioners/${slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-rule/80 bg-white shadow-[0_1px_0_rgba(31,58,95,0.02),0_18px_40px_-32px_rgba(31,58,95,0.18)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-charcoal/20 hover:shadow-[0_1px_0_rgba(31,58,95,0.02),0_30px_55px_-30px_rgba(31,58,95,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/30 focus-visible:ring-offset-2 focus-visible:ring-offset-sand"
    >
      {/* Cover — the default "wide image" (their own once they upload one). */}
      <div className="relative h-32 w-full overflow-hidden">
        <CoverArt seed={slug} className="h-full w-full" />
        {featured ? (
          <span className="absolute right-3 top-3 rounded-full bg-sand/90 px-2.5 py-1 text-[11px] font-medium tracking-[0.04em] text-teal backdrop-blur-sm">
            Featured
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-6 pb-6">
        {/* Portrait, overlapping the cover. `relative z-10` so it paints ABOVE the
            cover (which is `relative` for its badge — positioned beats static). */}
        <div className="relative z-10 -mt-10">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt=""
              loading="lazy"
              className="h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-sm"
            />
          ) : (
            <span
              aria-hidden
              className="font-display flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-sand-deep text-[26px] text-teal shadow-sm"
            >
              {initialOf(displayName)}
            </span>
          )}
        </div>

        <h2 className="font-display mt-4 text-[21px] leading-[1.15] tracking-[-0.01em] text-charcoal">
          {displayName}
        </h2>
        {meta ? <p className="mt-1.5 text-[14px] leading-[1.5] text-ink-muted">{meta}</p> : null}

        <VerificationBadges practitioner={{ createdAt, verificationBadges }} size="sm" className="mt-2.5" />

        {bio ? (
          <p className="mt-3 line-clamp-2 text-[14px] leading-[1.6] text-ink-soft">{bio}</p>
        ) : null}

        {shown.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {shown.map((id) => (
              <li
                key={id}
                className="rounded-full bg-seafoam/40 px-3 py-1.5 text-[12.5px] leading-none text-ocean"
              >
                {specialtyLabel(id)}
              </li>
            ))}
            {remaining > 0 ? (
              <li className="rounded-full px-2 py-1.5 text-[12.5px] leading-none text-ink-muted">
                +{remaining}
              </li>
            ) : null}
          </ul>
        ) : null}

        <span
          aria-hidden
          className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[13px] font-medium text-ink-muted transition-colors group-hover:text-charcoal"
        >
          View profile
          <span className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
