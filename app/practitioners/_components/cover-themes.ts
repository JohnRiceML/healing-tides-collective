// Cover themes — the soft gradient background a practitioner can choose for their profile +
// directory card. Stored migration-free as fieldValues.cover_theme. Kept deliberately
// simple: each theme is just a calm 3-stop gradient (light → soft → gentle). "Tide" is the
// default. Rendered by ProfileCover (a clean wash + one soft wave).

export type CoverTheme = {
  id: string;
  label: string;
  grad: [string, string, string]; // light (top) → soft → gentle (bottom)
};

export const COVER_THEMES: CoverTheme[] = [
  { id: "tide", label: "Tide", grad: ["#eaf3f0", "#c4e0d8", "#86b3a8"] },
  { id: "meadow", label: "Meadow", grad: ["#edf2e9", "#cfdec4", "#9cba93"] },
  { id: "blush", label: "Blush", grad: ["#f7ede4", "#eed4c4", "#d8ab94"] },
  { id: "sky", label: "Sky", grad: ["#eaeff4", "#cddbe6", "#9bbdce"] },
  { id: "sand", label: "Sand", grad: ["#f4eee3", "#e7dac4", "#cdba9b"] },
  { id: "fog", label: "Fog", grad: ["#eef1ef", "#d3ddd7", "#abb9b2"] },
];

const BY_ID = new Map(COVER_THEMES.map((t) => [t.id, t]));

/** The default cover (Tide) — "the one we have". */
export const DEFAULT_COVER_THEME = COVER_THEMES[0];

/** Resolve a theme id to a theme, falling back to the default (Tide). */
export function coverTheme(id?: string | null): CoverTheme {
  return (id ? BY_ID.get(id) : undefined) ?? DEFAULT_COVER_THEME;
}
