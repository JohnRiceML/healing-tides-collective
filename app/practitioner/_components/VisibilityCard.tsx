"use client";

import { useState, useTransition } from "react";

import { Button } from "@/app/_components/ui";
import type { Coverage, TermCoverage } from "@/lib/visibility";
import { runVisibilityAudit } from "../visibility-actions";

type AuditResult =
  | { ok: true; coverage: Coverage }
  | { ok: false; reason: "unauthenticated" | "not_practitioner" | "no_region" | "unconfigured" };

const REASON_COPY: Record<string, string> = {
  no_region: "Add your location to your profile, then we can check how you show up locally.",
  unconfigured: "Visibility checks aren't switched on yet — check back soon.",
  not_practitioner: "Set up your practitioner profile first.",
  unauthenticated: "Please sign in again.",
};

/** Where the seeker found them, in calm prose. */
function viaLabel(via: TermCoverage["via"]): string {
  if (via === "website") return "your website";
  if (via === "profile") return "your Healing Tides page";
  return "your Healing Tides page";
}

/** A filled teal dot for "you appear", a hollow rule-ring for "not yet". */
function Glyph({ found, className = "" }: { found: boolean; className?: string }) {
  return found ? (
    <span
      aria-hidden
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-teal ${className}`}
    />
  ) : (
    <span
      aria-hidden
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full border-[1.5px] border-rule ${className}`}
    />
  );
}

export function VisibilityCard() {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [pending, start] = useTransition();

  function run() {
    start(async () => setResult((await runVisibilityAudit()) as AuditResult));
  }

  return (
    <section className="rounded-2xl border border-rule/70 bg-white p-6">
      <p className="meta text-ink-muted">How you show up on Google</p>
      <p className="mt-2 max-w-prose text-[14.5px] leading-[1.6] text-ink-soft">
        When someone nearby searches for the kind of care you offer, do you appear? We check
        a few real searches for your specialty in your area.
      </p>

      <div className="mt-4">
        <Button type="button" onClick={run} disabled={pending}>
          {pending ? "Checking…" : result?.ok ? "Check again" : "Check my visibility"}
        </Button>
      </div>

      {result && !result.ok ? (
        <p className="mt-4 text-[14px] leading-[1.6] text-ink-soft">
          {REASON_COPY[result.reason] ?? "Couldn't run the check — please try again."}
        </p>
      ) : null}

      {result?.ok ? <CoverageMap coverage={result.coverage} /> : null}
    </section>
  );
}

function CoverageMap({ coverage }: { coverage: Coverage }) {
  const { terms, appeared, total, questions, relatedSearches } = coverage;

  return (
    <div className="mt-6">
      {/* 1) Overview ----------------------------------------------------- */}
      <div className="rounded-xl border border-rule/70 bg-seafoam/30 p-5">
        <p className="text-[15px] leading-[1.55] text-charcoal">
          You&rsquo;re showing up for{" "}
          <span className="font-medium text-ocean">
            {appeared} of {total}
          </span>{" "}
          searches we checked — and there&rsquo;s room for more.
        </p>
        <div
          className="mt-4 flex flex-wrap items-center gap-2"
          role="img"
          aria-label={`Appearing in ${appeared} of ${total} searches`}
        >
          {terms.map((t) => (
            <Glyph key={`dot-${t.query}`} found={t.found} className="h-3 w-3" />
          ))}
        </div>
      </div>

      {/* 2) Coverage rows (appear-first; order comes from the action) ---- */}
      <ul className="mt-5 space-y-px overflow-hidden rounded-xl border border-rule/70">
        {terms.map((t) => (
          <li
            key={t.query}
            className="flex items-start gap-3.5 bg-white px-4 py-3.5 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-rule/60"
          >
            <Glyph found={t.found} className="mt-[7px]" />
            <div className="min-w-0">
              <p className="font-display text-[16px] leading-[1.3] tracking-[-0.01em] text-charcoal">
                {t.label}
              </p>
              {t.found ? (
                <p className="mt-1 text-[13.5px] leading-[1.5] text-teal">
                  You&rsquo;re here{t.position ? ` — result #${t.position}` : ""}, via {viaLabel(t.via)}.
                </p>
              ) : (
                <>
                  <p className="mt-1 text-[13.5px] leading-[1.5] text-ocean">
                    Not on the first page yet — an open door.
                  </p>
                  {t.competitors.length ? (
                    <p className="mt-1 text-[12.5px] leading-[1.5] text-ink-muted">
                      A seeker also sees {t.competitors.join(" · ")}.
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* 3) Demand panels (hidden when empty) --------------------------- */}
      {questions.length ? (
        <div className="mt-5 rounded-xl border border-rule/70 bg-sand/40 p-5">
          <p className="meta text-ink-muted">Questions your people are asking</p>
          <ul className="mt-3 space-y-2">
            {questions.map((q) => (
              <li
                key={q}
                className="flex items-start gap-2.5 text-[13.5px] leading-[1.5] text-ink-soft"
              >
                <span
                  aria-hidden
                  className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-sage"
                />
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {relatedSearches.length ? (
        <div className="mt-4 rounded-xl border border-rule/70 bg-sand/40 p-5">
          <p className="meta text-ink-muted">Words seekers use for care like yours</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {relatedSearches.map((w) => (
              <span
                key={w}
                className="inline-flex items-center rounded-full border border-rule/80 bg-white px-3 py-1.5 text-[12.5px] leading-none text-ink-soft"
              >
                {w}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
