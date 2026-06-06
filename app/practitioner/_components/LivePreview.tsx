"use client";

import { specialtyLabel } from "@/app/_lib/taxonomy";
import { ProfileCover } from "@/app/practitioners/_components/ProfileCover";

/**
 * The "Live profile preview" mini-card in the wizard sidebar — driven by LIVE form
 * state (not the DB), so it updates as the practitioner types. Mirrors the public card's
 * look without reusing it (that one takes DB-shaped data and links out).
 */
export function LivePreview({
  name,
  region,
  photoUrl,
  specialties,
  seed,
}: {
  name: string;
  region: string;
  photoUrl: string;
  specialties: string[];
  seed: string;
}) {
  const shown = specialties.slice(0, 3);
  const initial = (name.trim()[0] ?? "·").toUpperCase();

  return (
    <div className="overflow-hidden rounded-3xl border border-rule/80 bg-white shadow-[0_1px_0_rgba(31,58,95,0.02),0_18px_40px_-34px_rgba(31,58,95,0.2)]">
      <div className="flex items-center gap-2 px-5 pt-4 text-ink-muted">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4 w-4">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="meta">Live profile preview</span>
      </div>

      <div className="relative mt-3 h-24 w-full overflow-hidden">
        <ProfileCover seed={seed} className="h-full w-full" />
      </div>

      <div className="px-5 pb-5 text-center">
        {/* relative z-10 so the avatar paints ABOVE the cover (a positioned/`relative`
            element otherwise paints over static siblings, hiding the portrait). */}
        <div className="relative z-10 -mt-10 flex justify-center">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="h-[72px] w-[72px] rounded-full border-4 border-white object-cover shadow-sm" />
          ) : (
            <span
              aria-hidden
              className="font-display flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-white bg-sand-deep text-[24px] text-teal shadow-sm"
            >
              {initial}
            </span>
          )}
        </div>

        <h3 className="font-display mt-3 text-[19px] leading-tight tracking-[-0.01em] text-charcoal">
          {name.trim() || "Your name"}
        </h3>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-[13px] text-ink-muted">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-3.5 w-3.5">
            <path d="M12 21c4.5-4.2 7-7.6 7-11a7 7 0 1 0-14 0c0 3.4 2.5 6.8 7 11z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          {region.trim() || "Your location"}
        </p>

        <div className="mt-4 border-t border-rule/70 pt-4 text-left">
          <p className="meta text-ink-muted">Areas of focus</p>
          {shown.length > 0 ? (
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {shown.map((id) => (
                <li key={id} className="rounded-full bg-seafoam/40 px-3 py-1 text-[12px] leading-none text-ocean">
                  {specialtyLabel(id)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[13px] text-ink-muted/80">Choose your focus areas in step 2.</p>
          )}
          <p className="mt-3 text-[12px] text-ink-muted/70">More to come</p>
        </div>
      </div>
    </div>
  );
}
