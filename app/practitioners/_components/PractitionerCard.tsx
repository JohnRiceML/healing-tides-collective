import Link from "next/link";

import type { PractitionerCard as PractitionerCardData } from "@/lib/practitioners";
import { specialtyLabel } from "@/app/_lib/taxonomy";
import { derivedBadges } from "@/app/_lib/verification";

import { ProfileCover } from "./ProfileCover";

const MAX_SPECIALTIES = 4;

/** First letter of the name, for the photo-less portrait. */
function initialOf(name: string): string {
  const ch = name.trim().charAt(0);
  return ch ? ch.toUpperCase() : "·";
}

function MapPin({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M12 21c4.5-4.2 7-7.6 7-11a7 7 0 1 0-14 0c0 3.4 2.5 6.8 7 11z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/**
 * One person in the directory — a warm, linked card: a default "wide image" cover
 * (ProfileCover, until they upload their own) with a single status badge, an overlapping
 * circular portrait, their name + location + role, a line of bio, and a few focus
 * areas. Photos render as a plain lazy <img> (their host isn't in next/image's
 * allowlist; a plain img is the safe, deploy-proof choice).
 */
export function PractitionerCard({ practitioner }: { practitioner: PractitionerCardData }) {
  const { slug, displayName, bio, region, title, specialties, photoUrl, coverTheme, acceptingNew, createdAt, verificationBadges } =
    practitioner;

  const isFounding =
    verificationBadges.includes("founding_member") ||
    derivedBadges(createdAt).includes("founding_member");
  const shown = specialties.slice(0, MAX_SPECIALTIES);
  const remaining = specialties.length - shown.length;

  return (
    <Link
      href={`/practitioners/${slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-rule/80 bg-white shadow-[0_1px_0_rgba(31,58,95,0.02),0_18px_40px_-32px_rgba(31,58,95,0.18)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-charcoal/20 hover:shadow-[0_1px_0_rgba(31,58,95,0.02),0_30px_55px_-30px_rgba(31,58,95,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/30 focus-visible:ring-offset-2 focus-visible:ring-offset-sand"
    >
      {/* Cover — the default "wide image" (their own once they upload one), with one
          status badge: accepting-new-clients takes priority; else a founding pill. */}
      <div className="relative h-28 w-full overflow-hidden">
        <ProfileCover seed={slug} theme={coverTheme} className="h-full w-full" />
        {acceptingNew ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11.5px] font-medium text-charcoal shadow-sm backdrop-blur-sm">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#6f9b6a]" />
            Accepting new clients
          </span>
        ) : isFounding ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-seafoam/90 px-2.5 py-1 text-[11.5px] font-medium text-ocean shadow-sm backdrop-blur-sm">
            <span aria-hidden>🌊</span> Founding member
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-6 pb-6">
        {/* Circular portrait, overlapping the cover. `relative z-10` so it paints ABOVE
            the cover (which is `relative` for its badge — positioned beats static). */}
        <div className="relative z-10 -mt-11">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt=""
              loading="lazy"
              className="h-[88px] w-[88px] rounded-full border-4 border-white object-cover shadow-sm"
            />
          ) : (
            <span
              aria-hidden
              className="font-display flex h-[88px] w-[88px] items-center justify-center rounded-full border-4 border-white bg-sand-deep text-[28px] text-teal shadow-sm"
            >
              {initialOf(displayName)}
            </span>
          )}
        </div>

        <h2 className="font-display mt-3.5 text-[21px] leading-[1.15] tracking-[-0.01em] text-charcoal">
          {displayName}
        </h2>

        {region ? (
          <p className="mt-1.5 flex items-center gap-1.5 text-[13.5px] leading-[1.4] text-ink-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {region}
          </p>
        ) : null}

        {title ? <p className="meta mt-2.5 line-clamp-1 text-teal">{title}</p> : null}

        {bio ? (
          <p className="mt-2.5 line-clamp-2 text-[14px] leading-[1.6] text-ink-soft">{bio}</p>
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
              <li className="self-center px-1 text-[12.5px] leading-none text-ink-muted">
                +{remaining}
              </li>
            ) : null}
          </ul>
        ) : null}

        <span
          aria-hidden
          className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[13px] font-medium text-teal transition-colors group-hover:text-ocean"
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
