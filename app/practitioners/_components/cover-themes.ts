// Cover = a DESIGN (the motif/composition) + a COLOR (the palette), chosen independently
// and stored migration-free as fieldValues.cover_design + fieldValues.cover_color. So a
// practitioner can have e.g. peach waves, or a green tree, or blue mountains. Rendered by
// ProfileCover. Defaults: Waves + Tide (≈ the calm cover we already had).

export type CoverColor = {
  id: string;
  label: string;
  grad: [string, string, string]; // background wash: light (top) → soft → gentle (bottom)
  ink: string; // the motif colour (waves / hills / leaf / tree …)
};

export type CoverDesign = { id: string; label: string };

export const COVER_COLORS: CoverColor[] = [
  { id: "tide", label: "Tide", grad: ["#eaf3f0", "#c4e0d8", "#9fcabf"], ink: "#5f8f8b" },
  { id: "meadow", label: "Meadow", grad: ["#edf2e9", "#cfdec4", "#aecba3"], ink: "#6d9462" },
  { id: "blush", label: "Blush", grad: ["#f7ede4", "#eed4c4", "#e2b9a4"], ink: "#bd8b78" },
  { id: "sky", label: "Sky", grad: ["#eaeff4", "#cddbe6", "#aac6d6"], ink: "#5f86a0" },
  { id: "sand", label: "Sand", grad: ["#f4eee3", "#e7dac4", "#d8c4a4"], ink: "#a98f5f" },
  { id: "fog", label: "Fog", grad: ["#eef1ef", "#d3ddd7", "#bcc7c1"], ink: "#6f7d79" },
];

export const COVER_DESIGNS: CoverDesign[] = [
  { id: "waves", label: "Waves" },
  { id: "hills", label: "Hills" },
  { id: "mountains", label: "Mountains" },
  { id: "leaf", label: "Leaf" },
  { id: "tree", label: "Tree" },
  { id: "plain", label: "Plain" },
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
