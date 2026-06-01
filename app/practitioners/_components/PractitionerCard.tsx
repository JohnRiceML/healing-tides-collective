import Link from "next/link";

import type { PractitionerCard as PractitionerCardData } from "@/lib/practitioners";
import { modalityLabel, specialtyLabel } from "@/app/_lib/taxonomy";

const MAX_SPECIALTIES = 3;

/** First letter of the name, for the photo-less placeholder circle. */
function initialOf(name: string): string {
  const ch = name.trim().charAt(0);
  return ch ? ch.toUpperCase() : "·";
}

/**
 * One practitioner in the directory grid — a calm, linked card.
 * Presentational only; data + filtering come from the page.
 *
 * Photo note: `photoUrl` lives in Vercel Blob, a host that isn't in
 * next.config's image `remotePatterns`, and upload isn't wired yet. A plain
 * lazy <img> renders any host safely (next/image would throw on an
 * un-allowlisted host). Swap to next/image once the host is allowlisted.
 */
export function PractitionerCard({ practitioner }: { practitioner: PractitionerCardData }) {
  const { slug, displayName, region, modality, specialties, photoUrl, featured } = practitioner;

  const meta = [region, modalityLabel(modality)].filter(Boolean).join(" · ");
  const shownSpecialties = specialties.slice(0, MAX_SPECIALTIES);
  const remaining = specialties.length - shownSpecialties.length;

  return (
    <Link
      href={`/practitioners/${slug}`}
      className="group flex flex-col rounded-3xl border border-rule/80 bg-white p-6 shadow-[0_1px_0_rgba(31,58,95,0.02),0_18px_40px_-32px_rgba(31,58,95,0.18)] transition-colors hover:border-charcoal/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/30 focus-visible:ring-offset-2 focus-visible:ring-offset-sand md:p-7"
    >
      <div className="flex items-start gap-4">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt=""
            loading="lazy"
            className="h-16 w-16 shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="font-display flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sand-deep text-[22px] text-teal"
          >
            {initialOf(displayName)}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-[20px] leading-[1.2] tracking-[-0.01em] text-charcoal">
              {displayName}
            </h2>
            {featured ? (
              <span className="meta mt-1 shrink-0 text-teal">Featured</span>
            ) : null}
          </div>
          {meta ? <p className="mt-1.5 text-[14px] leading-[1.5] text-ink-muted">{meta}</p> : null}
        </div>
      </div>

      {shownSpecialties.length > 0 ? (
        <ul className="mt-5 flex flex-wrap gap-2">
          {shownSpecialties.map((id) => (
            <li
              key={id}
              className="rounded-full bg-charcoal/[0.05] px-3 py-1.5 text-[13px] text-ink-soft"
            >
              {specialtyLabel(id)}
            </li>
          ))}
          {remaining > 0 ? (
            <li className="rounded-full px-3 py-1.5 text-[13px] text-ink-muted">
              +{remaining} more
            </li>
          ) : null}
        </ul>
      ) : null}

      <span
        aria-hidden
        className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted transition-colors group-hover:text-charcoal"
      >
        View profile
        <span className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </Link>
  );
}
