"use client";

import Link from "next/link";

import type { PractitionerHit, PractitionerDetail } from "@/lib/onboarding/types";
import { ProfileCover } from "@/app/practitioners/_components/ProfileCover";
import { useConsidering } from "../_considering/ConsideringContext";

const initialOf = (name: string) => name.trim().charAt(0).toUpperCase() || "·";

/** A practitioner the agent surfaced, rendered inline in the conversation — a small, branded card:
 *  a watercolor cover, an overlapping portrait, and the calm details. Not a hard sell. */
export function PractitionerChatCard({ p }: { p: PractitionerHit | PractitionerDetail }) {
  const detail = "bio" in p ? (p as PractitionerDetail) : null;
  const { has, toggle } = useConsidering();
  const saved = has(p.slug);

  return (
    <div className="overflow-hidden rounded-2xl border border-rule bg-white shadow-[0_1px_0_rgba(31,58,95,0.02),0_14px_30px_-26px_rgba(31,58,95,0.22)]">
      {/* Watercolor cover (their own once uploaded) + the accepting-new badge */}
      <div className="relative h-16 w-full overflow-hidden">
        <ProfileCover seed={p.slug} design={p.coverDesign} color={p.coverColor} className="h-full w-full" />
        {p.acceptingNew ? (
          <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10.5px] font-medium text-charcoal shadow-sm backdrop-blur-sm">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#6f9b6a]" /> Accepting new
          </span>
        ) : null}
      </div>

      <div className="px-4 pb-4">
        {/* Overlapping circular portrait */}
        <div className="relative z-10 -mt-7">
          {p.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.photoUrl}
              alt=""
              loading="lazy"
              className="h-14 w-14 rounded-full border-4 border-white object-cover shadow-sm"
            />
          ) : (
            <span
              aria-hidden
              className="font-display flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-sand-deep text-[20px] text-teal shadow-sm"
            >
              {initialOf(p.displayName)}
            </span>
          )}
        </div>

        <Link
          href={`/practitioners/${p.slug}`}
          target="_blank"
          className="font-display mt-2 block text-[17px] leading-tight text-charcoal underline-offset-2 hover:underline"
        >
          {p.displayName}
        </Link>
        {p.title ? <p className="text-[13px] text-ink-soft">{p.title}</p> : null}

        <p className="mt-2 flex flex-wrap gap-1.5 text-[12px] text-ink-muted">
          {p.region ? <span className="rounded-full bg-sand px-2 py-0.5">{p.region}</span> : null}
          {p.modality ? <span className="rounded-full bg-sand px-2 py-0.5">{p.modality}</span> : null}
          {p.specialties.slice(0, 3).map((s) => (
            <span key={s} className="rounded-full bg-seafoam/40 px-2 py-0.5 text-ocean">
              {s}
            </span>
          ))}
        </p>

        {(detail?.bio ?? p.blurb) ? (
          <p className="mt-2.5 text-[13px] leading-[1.6] text-ink-soft">
            {detail?.bio ? (detail.bio.length > 320 ? detail.bio.slice(0, 320) + "…" : detail.bio) : p.blurb}
          </p>
        ) : null}

        {detail?.credentials?.length ? (
          <p className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-ink-muted">
            {detail.credentials.slice(0, 6).map((c) => (
              <span key={c} className="rounded-full border border-rule px-2 py-0.5">
                {c}
              </span>
            ))}
          </p>
        ) : null}

        <div className="mt-3 flex items-center justify-between gap-3">
          <Link
            href={`/practitioners/${p.slug}`}
            target="_blank"
            className="text-[12px] text-teal underline-offset-2 hover:underline"
          >
            See full profile →
          </Link>
          <button
            type="button"
            onClick={() => toggle({ slug: p.slug, displayName: p.displayName, title: p.title, region: p.region })}
            aria-pressed={saved}
            className={`rounded-full px-3 py-1 text-[12px] transition ${
              saved ? "bg-seafoam/60 text-ocean" : "bg-white text-ink-soft ring-1 ring-rule hover:ring-teal/40"
            }`}
          >
            {saved ? "♥ Saved" : "♡ Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
