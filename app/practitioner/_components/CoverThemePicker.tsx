"use client";

import { COVER_THEMES, DEFAULT_COVER_THEME } from "@/app/practitioners/_components/cover-themes";
import { ProfileCover } from "@/app/practitioners/_components/ProfileCover";

/**
 * Pick the watercolor cover design for your profile + card. Each swatch renders the
 * actual artwork (scene + palette) so you can see hills vs waves vs mountains. The
 * active one (defaulting to Tide) gets a ring.
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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
              className={`block h-14 w-full overflow-hidden rounded-xl border transition-all ${
                on
                  ? "border-charcoal/30 ring-2 ring-charcoal ring-offset-2 ring-offset-white"
                  : "border-rule/70 group-hover:border-charcoal/30"
              }`}
            >
              <ProfileCover seed={t.id} theme={t.id} className="h-full w-full" />
            </span>
            <span className={`text-[12px] ${on ? "font-medium text-charcoal" : "text-ink-muted"}`}>
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
