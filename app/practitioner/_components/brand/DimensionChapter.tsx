import type { ReactNode } from "react";

import type { Dimension, DimensionState } from "@/lib/brand";

import { InsightCard } from "./InsightCard";
import { MoonState } from "./MoonState";

/**
 * One dimension of a practitioner's presence, rendered as a calm chapter rather
 * than a graded section. A heading (font-display) with a quiet state word, a plain
 * intro, then the dimension's insights as collapsed InsightCards. The optional
 * children slot is for embeds a page wants to drop inside a chapter (e.g. the live
 * Google-coverage map under "where you're found").
 *
 * No score, no percentage, no comparison — the moon and the state word carry the
 * read, gently.
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
}: {
  dimension: Dimension;
  children?: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-rule/70 bg-white p-6 md:p-7">
      <header className="flex items-start gap-3">
        <MoonState state={dimension.state} />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[17px] leading-[1.3] tracking-[-0.01em] text-charcoal">
            {dimension.name}
          </h2>
          <p className="meta mt-1 text-ink-muted">{WORD[dimension.state]}</p>
        </div>
      </header>

      <p className="mt-3 text-[14px] leading-[1.6] text-ink-soft">{dimension.intro}</p>

      {dimension.insights.length ? (
        <div className="mt-5 space-y-3">
          {dimension.insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      ) : null}

      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}
