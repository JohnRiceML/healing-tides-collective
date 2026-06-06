"use client";

import {
  COVER_COLORS,
  COVER_DESIGNS,
  DEFAULT_COLOR,
  DEFAULT_DESIGN,
} from "@/app/practitioners/_components/cover-themes";
import { ProfileCover } from "@/app/practitioners/_components/ProfileCover";

/**
 * Two-axis cover picker: choose a DESIGN, then a COLOR. Design swatches render in each
 * design's representative colour (so the row reads varied + pretty); colour swatches render
 * in the currently-chosen design (so you preview your design in each colour). The big live
 * preview shows the actual chosen combination.
 */
export function CoverThemePicker({
  design,
  color,
  onDesignChange,
  onColorChange,
}: {
  design: string;
  color: string;
  onDesignChange: (id: string) => void;
  onColorChange: (id: string) => void;
}) {
  const activeDesign = design || DEFAULT_DESIGN.id;
  const activeColor = color || DEFAULT_COLOR.id;

  const frame = (on: boolean) =>
    `block w-full overflow-hidden rounded-xl border transition-all ${
      on
        ? "border-charcoal/30 ring-2 ring-charcoal ring-offset-2 ring-offset-white"
        : "border-rule/70 group-hover:border-charcoal/30"
    }`;
  const label = (on: boolean) =>
    `text-[12px] ${on ? "font-medium text-charcoal" : "text-ink-muted"}`;

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2.5 text-[12px] font-medium uppercase tracking-[0.1em] text-ink-muted">Design</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {COVER_DESIGNS.map((d) => {
            const on = activeDesign === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onDesignChange(d.id)}
                aria-pressed={on}
                className="group flex flex-col items-center gap-1.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/20 focus-visible:ring-offset-2 focus-visible:ring-offset-sand"
              >
                <span className={`${frame(on)} h-[68px]`}>
                  <ProfileCover seed={d.id} design={d.id} color={d.rep} className="h-full w-full" />
                </span>
                <span className={label(on)}>{d.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2.5 text-[12px] font-medium uppercase tracking-[0.1em] text-ink-muted">Color</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {COVER_COLORS.map((c) => {
            const on = activeColor === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onColorChange(c.id)}
                aria-pressed={on}
                className="group flex flex-col items-center gap-1.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/20 focus-visible:ring-offset-2 focus-visible:ring-offset-sand"
              >
                <span className={`${frame(on)} h-12`}>
                  <ProfileCover seed={c.id} design={activeDesign} color={c.id} className="h-full w-full" />
                </span>
                <span className={label(on)}>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
