"use client";

import Link from "next/link";
import { useState } from "react";

import type { Insight, Lift } from "@/lib/brand";

import { MoonState } from "./MoonState";

/**
 * One calm insight — a kind observation of the practitioner's own data, never a
 * verdict, never a comparison. Collapsed by default so the page reads as a quiet
 * chapter, not a checklist:
 *
 *   collapsed:  ◔  what (the plain observation)
 *                  whyCare (one sentence, always about who-it-helps)
 *                  ⌄ a small step · {Gentle|Moderate|Deeper}
 *
 * Expanding reveals one soft next action and, optionally, a single gentle CTA.
 * The "lift" is framed as kindness about energy (Gentle / Moderate / Deeper),
 * never difficulty or priority.
 */

const LIFT_WORD: Record<Lift, string> = {
  gentle: "Gentle",
  moderate: "Moderate",
  deeper: "Deeper",
};

export function InsightCard({ insight }: { insight: Insight }) {
  const [open, setOpen] = useState(false);
  const panelId = `insight-${insight.id}`;

  return (
    <div className="rounded-2xl border border-rule/70 bg-white p-5">
      <div className="flex items-start gap-3.5">
        <MoonState state={insight.state} />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] leading-[1.5] text-charcoal">{insight.what}</p>
          <p className="mt-1.5 text-[13.5px] leading-[1.55] text-ink-soft">{insight.whyCare}</p>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={panelId}
            className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] leading-none text-ink-muted underline-offset-2 transition-colors hover:text-teal hover:underline"
          >
            <span aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`}>
              ⌄
            </span>
            a small step
            <span aria-hidden className="text-ink-muted/60">
              ·
            </span>
            <span className="text-ink-soft">{LIFT_WORD[insight.lift]}</span>
          </button>

          {open ? (
            <div id={panelId} className="mt-3.5 border-t border-rule/60 pt-3.5">
              <p className="text-[13.5px] leading-[1.6] text-ink-soft">{insight.whatNext}</p>
              {insight.ctaHref ? (
                <Link
                  href={insight.ctaHref}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-charcoal px-4 py-2 text-[13px] font-medium text-sand transition-opacity hover:opacity-90"
                >
                  {insight.ctaLabel ?? "Open my profile"}
                  <span aria-hidden>→</span>
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
