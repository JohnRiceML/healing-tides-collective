"use client";

import { Fragment } from "react";

export const WIZARD_STEPS = ["Basics", "Practice details", "Your voice", "Review & publish"];

/**
 * Labeled wizard stepper. Steps are freely clickable — the wizard is ALSO the ongoing
 * edit surface, so a returning practitioner can jump straight to any section.
 */
export function Stepper({ step, onStep }: { step: number; onStep: (n: number) => void }) {
  return (
    <nav aria-label="Profile steps" className="flex items-center gap-2 overflow-x-auto pb-1">
      {WIZARD_STEPS.map((label, i) => {
        const current = i === step;
        const done = i < step;
        return (
          <Fragment key={label}>
            <button
              type="button"
              onClick={() => onStep(i)}
              aria-current={current ? "step" : undefined}
              className="group flex shrink-0 items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15 focus-visible:ring-offset-2 focus-visible:ring-offset-sand"
            >
              <span
                aria-hidden
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-medium transition-colors ${
                  current
                    ? "bg-charcoal text-sand"
                    : done
                      ? "bg-teal/15 text-teal"
                      : "border border-rule text-ink-muted group-hover:border-charcoal/30 group-hover:text-charcoal"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={`whitespace-nowrap text-[14px] transition-colors ${
                  current ? "font-medium text-charcoal" : "text-ink-muted group-hover:text-charcoal"
                }`}
              >
                {label}
              </span>
            </button>
            {i < WIZARD_STEPS.length - 1 ? (
              <span aria-hidden className="h-px min-w-[16px] flex-1 bg-rule" />
            ) : null}
          </Fragment>
        );
      })}
    </nav>
  );
}
