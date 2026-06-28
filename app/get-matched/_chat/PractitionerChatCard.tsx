"use client";

import Link from "next/link";

import type { PractitionerHit, PractitionerDetail } from "@/lib/onboarding/types";
import { useConsidering } from "../_considering/ConsideringContext";

/** A practitioner the agent surfaced, rendered inline in the conversation. Calm, not a hard sell. */
export function PractitionerChatCard({ p }: { p: PractitionerHit | PractitionerDetail }) {
  const detail = "bio" in p ? (p as PractitionerDetail) : null;
  const { has, toggle } = useConsidering();
  const saved = has(p.slug);
  return (
    <div className="rounded-2xl border border-rule bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href={`/practitioners/${p.slug}`}
            target="_blank"
            className="font-medium text-charcoal underline-offset-2 hover:underline"
          >
            {p.displayName}
          </Link>
          {p.title ? <p className="text-[13px] text-ink-soft">{p.title}</p> : null}
        </div>
        {p.acceptingNew ? (
          <span className="shrink-0 rounded-full bg-seafoam/60 px-2.5 py-0.5 text-[11px] text-ocean">Accepting new</span>
        ) : null}
      </div>

      <p className="mt-2 flex flex-wrap gap-1.5 text-[12px] text-ink-muted">
        {p.region ? <span className="rounded-full bg-sand px-2 py-0.5">{p.region}</span> : null}
        {p.modality ? <span className="rounded-full bg-sand px-2 py-0.5">{p.modality}</span> : null}
        {p.specialties.slice(0, 3).map((s) => (
          <span key={s} className="rounded-full bg-sand px-2 py-0.5">
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
  );
}
