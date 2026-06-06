// Cover themes — the watercolor background palette a practitioner can choose for their
// profile + directory card. Stored migration-free as fieldValues.cover_theme (a normal,
// practitioner-editable key). "Tide" is the default (the cool brand cover we shipped first);
// the others are drawn from the directory mockup's card backgrounds.
//
// Each theme carries TWO palettes so it reads consistently across surfaces:
//  - `wave`  → CoverArt (the directory card band: light → mid → deep)
//  - `mist` + `hills` + `sprig` → ProfileCover (the profile-hero / live-preview hills)

export type CoverTheme = {
  id: string;
  label: string;
  wave: [string, string, string];
  mist: string;
  hills: [string, string, string, string, string];
  sprig: string;
};

export const COVER_THEMES: CoverTheme[] = [
  {
    id: "tide",
    label: "Tide",
    wave: ["#d6ede8", "#5f8f8b", "#1f3a5f"],
    mist: "#eef3ee",
    hills: ["#cfe0d8", "#aecabf", "#84a79d", "#5f8f8b", "#3c6a6e"],
    sprig: "#4d7d79",
  },
  {
    id: "meadow",
    label: "Meadow",
    wave: ["#d3e0cf", "#8aa886", "#3f6450"],
    mist: "#eef2ea",
    hills: ["#d3e0cf", "#b3c7ab", "#8aa886", "#62876a", "#3f6450"],
    sprig: "#5a8268",
  },
  {
    id: "blush",
    label: "Blush",
    wave: ["#f0e1d6", "#d9ad97", "#9c7060"],
    mist: "#f6efe8",
    hills: ["#f0e1d6", "#e6c9b8", "#d4a892", "#bd8b78", "#9c7060"],
    sprig: "#b3897a",
  },
  {
    id: "dusk",
    label: "Dusk",
    wave: ["#cdd9e3", "#7a99ad", "#2f4f66"],
    mist: "#edf1f4",
    hills: ["#cdd9e3", "#a7bccb", "#7a99ad", "#51748c", "#2f4f66"],
    sprig: "#46708a",
  },
  {
    id: "fog",
    label: "Fog",
    wave: ["#dfe4e2", "#aab5b2", "#6e7c79"],
    mist: "#f0f2f0",
    hills: ["#dfe4e2", "#c4cdc9", "#a3afab", "#7f8d89", "#5a6663"],
    sprig: "#6f7d79",
  },
];

const BY_ID = new Map(COVER_THEMES.map((t) => [t.id, t]));

/** The default cover (Tide) — "the one we have". */
export const DEFAULT_COVER_THEME = COVER_THEMES[0];

/** Resolve a theme id to a theme, falling back to the default (Tide). */
export function coverTheme(id?: string | null): CoverTheme {
  return (id ? BY_ID.get(id) : undefined) ?? DEFAULT_COVER_THEME;
}

/** A CSS gradient string previewing a theme (for swatches). */
export function coverSwatch(t: CoverTheme): string {
  return `linear-gradient(155deg, ${t.mist} 0%, ${t.hills[2]} 55%, ${t.hills[4]} 100%)`;
}
