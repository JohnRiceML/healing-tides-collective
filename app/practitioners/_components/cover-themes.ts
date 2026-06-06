// Cover = a DESIGN (motif/composition) + a COLOR (palette), chosen independently and stored
// migration-free as fieldValues.cover_design + fieldValues.cover_color. Each colour carries a
// `sky` (background gradient) + a 5-stop `ramp` (light mist → deep) so designs can layer for
// real watercolor depth. Rendered by ProfileCover. Defaults: Waves + Tide.

export type CoverColor = {
  id: string;
  label: string;
  sky: [string, string]; // background wash, top → bottom
  ramp: [string, string, string, string, string]; // light (back/mist) → deep (front)
  /** Warm luminous accent — the sun/glow on Horizon, and a faint warmth elsewhere.
      Optional so older data keeps working; ProfileCover falls back to a soft cream. */
  sun?: string;
};

export type CoverDesign = {
  id: string;
  label: string;
  rep: string; // colour id used for this design's picker swatch
};

export const COVER_COLORS: CoverColor[] = [
  { id: "tide", label: "Tide", sky: ["#eef5f3", "#d8ece6"], ramp: ["#cfe3dc", "#a9cdc4", "#7fb0a6", "#578f86", "#356b64"], sun: "#fbf0dd" },
  { id: "meadow", label: "Meadow", sky: ["#f0f4ec", "#dfecd6"], ramp: ["#d2e0c8", "#b3cba6", "#8fb07f", "#6a8f5c", "#48683c"], sun: "#f7f0d6" },
  { id: "blush", label: "Blush", sky: ["#fbf2ec", "#f6e1d3"], ramp: ["#f0d8c6", "#e6bca5", "#d79e84", "#c08066", "#9d6149"], sun: "#fde7cf" },
  { id: "sky", label: "Sky", sky: ["#eef3f7", "#dbe8f0"], ramp: ["#cfe0ea", "#aec9da", "#86adc6", "#5d8bab", "#3c6586"], sun: "#fbeede" },
  { id: "sand", label: "Sand", sky: ["#f8f3e9", "#eee2cd"], ramp: ["#e8d8bc", "#d9c19b", "#c5a679", "#a9875b", "#856640"], sun: "#fdeccb" },
  { id: "fog", label: "Fog", sky: ["#f1f3f1", "#e2e8e3"], ramp: ["#d7ddd7", "#bfc8c1", "#a1ada6", "#7f8d86", "#5c6863"], sun: "#f6f1e4" },
];

export const COVER_DESIGNS: CoverDesign[] = [
  { id: "classic", label: "Classic", rep: "tide" },
  { id: "waves", label: "Waves", rep: "sky" },
  { id: "hills", label: "Hills", rep: "meadow" },
  { id: "mountains", label: "Mountains", rep: "sky" },
  { id: "botanical", label: "Botanical", rep: "meadow" },
  { id: "horizon", label: "Horizon", rep: "blush" },
  { id: "dunes", label: "Dunes", rep: "sand" },
  { id: "minimal", label: "Minimal", rep: "fog" },
];

const COLOR_BY_ID = new Map(COVER_COLORS.map((c) => [c.id, c]));
const DESIGN_IDS = new Set(COVER_DESIGNS.map((d) => d.id));

export const DEFAULT_COLOR = COVER_COLORS[0]; // Tide
export const DEFAULT_DESIGN = COVER_DESIGNS[0]; // Waves

/** Resolve a colour id to a palette, falling back to the default (Tide). */
export function coverColor(id?: string | null): CoverColor {
  return (id ? COLOR_BY_ID.get(id) : undefined) ?? DEFAULT_COLOR;
}

/** Resolve a design id to a valid one, falling back to the default (Waves). */
export function coverDesign(id?: string | null): string {
  return id && DESIGN_IDS.has(id) ? id : DEFAULT_DESIGN.id;
}
