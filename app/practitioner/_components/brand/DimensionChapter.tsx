import type { ReactNode } from "react";

import type { Dimension, DimensionState } from "@/lib/brand";

import { InsightCard } from "./InsightCard";
import { MoonState } from "./MoonState";

/**
 * One dimension of a practitioner's presence, rendered as a calm, COLLAPSED chapter so
 * the page opens grounded and quiet rather than as a wall of five sections. The summary
 * (moon + name + state word + the part's 0–100 progress score) is always visible; the intro,
 * the "why it matters", insights, and any embed unfold on a gentle tap. The page opens the one
 * chapter that matters most by default.
 *
 * Native <details> — no JS, accessible, server-rendered. The score is personal progress,
 * never a grade or a comparison to other practitioners.
 */

const WORD: Record<DimensionState, string> = {
  not_started: "not started",
  forming: "forming",
  on_its_way: "on its way",
  settled: "settled",
};

export function DimensionChapter({
  dimension,
  children,
  defaultOpen = false,
}: {
  dimension: Dimension;
  children?: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-3xl border border-rule/70 bg-white p-6 transition-colors hover:border-rule-strong/30 md:p-7 [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3">
        <MoonState state={dimension.state} fillPct={dimension.score} />
        <div className="min-w-0 flex-1">
          <span className="font-display block text-[17px] leading-[1.3] tracking-[-0.01em] text-charcoal">
            {dimension.name}
          </span>
          <span className="meta mt-1 block text-ink-muted">{WORD[dimension.state]}</span>
        </div>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
          className="h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200 group-open:rotate-180"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>

      <div className="mt-4 border-t border-rule/60 pt-5">
        {/* The number lives HERE, on tap — calm progress, never a grade on the always-visible face. */}
        <p className="text-[13px] leading-[1.5] text-ink-muted">
          This part is at{" "}
          <span className="font-display text-[15px] text-charcoal">{dimension.score}</span> of 100 —{" "}
          {WORD[dimension.state]}. Your own progress, never a grade.
        </p>
        {/* The guided layer: what this part is, and why it matters for being found. */}
        <p className="mt-3 text-[14px] leading-[1.6] text-ink-soft">{dimension.intro}</p>
        <p className="mt-3 flex flex-wrap items-baseline gap-x-2 text-[13.5px] leading-[1.55] text-charcoal">
          <span className="meta shrink-0 text-teal">Why it matters</span>
          <span className="text-ink-soft">{dimension.why}</span>
        </p>

        {dimension.insights.length ? (
          <div className="mt-5 space-y-3">
            {dimension.insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        ) : null}

        {children ? <div className="mt-5">{children}</div> : null}
      </div>
    </details>
  );
}
