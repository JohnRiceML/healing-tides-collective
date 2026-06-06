"use client";

import { COVER_THEMES, coverSwatch, DEFAULT_COVER_THEME } from "@/app/practitioners/_components/cover-themes";

/**
 * Pick the watercolor cover palette for your profile + card. Swatches preview each
 * theme's colours; the active one (defaulting to Tide) gets a ring.
 */
export function CoverThemePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const active = value || DEFAULT_COVER_THEME.id;
  return (
    <div className="flex flex-wrap gap-3">
      {COVER_THEMES.map((t) => {
        const on = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            aria-pressed={on}
            className="group flex flex-col items-center gap-1.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/20 focus-visible:ring-offset-2 focus-visible:ring-offset-sand"
          >
            <span
              aria-hidden
              className={`block h-12 w-[76px] rounded-xl border transition-all ${
                on
                  ? "border-charcoal/30 ring-2 ring-charcoal ring-offset-2 ring-offset-white"
                  : "border-rule/70 group-hover:border-charcoal/30"
              }`}
              style={{ background: coverSwatch(t) }}
            />
            <span className={`text-[12px] ${on ? "font-medium text-charcoal" : "text-ink-muted"}`}>
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
