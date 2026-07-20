import Link from "next/link";

import { FINDABILITY_CRITERIA } from "@/lib/presence";
import type { Findability, WeeklyViews, PresenceStep } from "@/lib/presence";

/**
 * The calm "Your presence" panel — findable, not promotional. Reflects only the
 * practitioner's own presence (no comparison), frames everything as gain/possibility,
 * and offers at most one gentle next step. Server-rendered from data we already hold.
 */
export function PresencePanel({
  findability,
  views,
  nextStep,
  region,
}: {
  findability: Findability;
  views: WeeklyViews;
  nextStep: PresenceStep | null;
  region: string | null;
}) {
  const max = Math.max(1, ...views.buckets);
  const place = region?.trim() ? ` in ${region.trim()}` : "";

  return (
    <div className="space-y-5">
      {/* Findability — a private, self-referential stage, never a rank */}
      <div className="rounded-2xl border border-rule/70 bg-white p-6">
        <p className="meta text-ink-muted">Your presence</p>
        <p className="mt-1.5 font-display text-[22px] leading-tight text-charcoal">
          {findability.stage === "established"
            ? "You're well-established."
            : findability.stage === "findable"
              ? "You're findable."
              : "You're getting set up."}
        </p>
        <p className="mt-1 text-[14px] leading-[1.55] text-ink-soft">{findability.line}</p>

        <div className="mt-5">
          <div className="relative h-2 rounded-full bg-sand">
            <div className="absolute left-0 top-0 h-2 rounded-full bg-teal" style={{ width: `${findability.pct}%` }} />
            <div
              className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-teal bg-white"
              style={{ left: `${findability.pct}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[12px]">
            {(["setup", "findable", "established"] as const).map((s) => (
              <span key={s} className={findability.stage === s ? "font-medium text-teal" : "text-ink-muted"}>
                {s === "setup" ? "Getting set up" : s === "findable" ? "Findable" : "Well-established"}
              </span>
            ))}
          </div>
        </div>

        {/* What earns each stage — a quiet, on-demand reference. Copy comes from lib/presence.ts
            so the UI can't drift from the logic that sets the stage. */}
        <details className="group mt-4">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-[12.5px] text-ink-muted underline-offset-2 transition-colors hover:text-teal">
            <span className="group-open:hidden">What earns each stage</span>
            <span className="hidden group-open:inline">Hide</span>
            <span aria-hidden className="transition-transform group-open:rotate-180">↓</span>
          </summary>
          <ul className="mt-3 space-y-3.5">
            {FINDABILITY_CRITERIA.map((c) => (
              <li key={c.stage}>
                <p
                  className={`text-[13px] font-medium ${
                    findability.stage === c.stage ? "text-teal" : "text-charcoal"
                  }`}
                >
                  {c.label}
                </p>
                <ul className="mt-1 space-y-1">
                  {c.criteria.map((line) => (
                    <li
                      key={line}
                      className="flex items-start gap-2 text-[12.5px] leading-[1.5] text-ink-soft"
                    >
                      <span aria-hidden className="mt-[6px] inline-block h-1 w-1 shrink-0 rounded-full bg-sage" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </details>
      </div>

      {/* This week — gains and neutral facts only, tied to meaning */}
      <div className="rounded-2xl border border-rule/70 bg-white p-6">
        <p className="text-[15px] font-medium text-charcoal">This week</p>
        <p className="mt-2.5 text-[14px] leading-[1.55] text-ink-soft">
          {views.thisWeek > 0 ? (
            <>
              <span className="font-medium text-charcoal">
                {views.thisWeek} {views.thisWeek === 1 ? "person" : "people"}
              </span>{" "}
              looking for care{place} saw your profile.
            </>
          ) : (
            <>A quiet week — normal in a slow medium. {views.total} found you over the last six weeks.</>
          )}
        </p>

        <div className="mt-4 flex h-9 items-end gap-1" aria-hidden>
          {views.buckets.map((n, i) => (
            <div
              key={i}
              className={`flex-1 rounded-[3px] ${i === views.buckets.length - 1 ? "bg-teal" : "bg-sand-deep/70"}`}
              style={{ height: `${Math.max(12, Math.round((n / max) * 100))}%` }}
            />
          ))}
        </div>
        <p className="mt-1.5 text-[12px] text-ink-muted">Profile views, last six weeks.</p>
      </div>

      {/* One gentle next step — an invitation, dismissible, never a backlog */}
      {nextStep ? (
        <div className="rounded-2xl bg-sand-deep/40 p-6">
          <p className="text-[14px] font-medium text-charcoal">One small thing, whenever you&rsquo;re ready</p>
          <p className="mt-1.5 text-[14px] leading-[1.55] text-ink-soft">{nextStep.hint}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href={nextStep.href}
              className="rounded-full bg-charcoal px-4 py-2 text-[13.5px] font-medium text-sand transition-opacity hover:opacity-90"
            >
              {nextStep.label}
            </Link>
            <span className="text-[13px] text-ink-muted">Maybe later — nothing&rsquo;s lost.</span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-seafoam/25 p-6">
          <p className="text-[14px] leading-[1.55] text-charcoal">
            Your profile is in good shape. We&rsquo;ll keep a quiet eye on how people are finding you.
          </p>
        </div>
      )}
    </div>
  );
}
