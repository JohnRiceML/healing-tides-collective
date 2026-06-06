// Cover themes — the watercolor background a practitioner can choose for their profile +
// directory card. Stored migration-free as fieldValues.cover_theme. A theme is a PALETTE
// + a SCENE (the composition): rolling hills, soft waves, or mountains-with-a-tree. "Tide"
// is the default (the cool hills cover we shipped first).
//
// `wave` is the 3-stop palette the legacy CoverArt band used; kept for compatibility.
// The live surfaces (card, profile hero, live preview) render ProfileCover, which uses
// `scene` + `mist`/`hills`/`sprig`.

export type CoverScene = "hills" | "waves" | "mountains";

export type CoverTheme = {
  id: string;
  label: string;
  scene: CoverScene;
  wave: [string, string, string];
  mist: string;
  hills: [string, string, string, string, string];
  sprig: string;
};

export const COVER_THEMES: CoverTheme[] = [
  {
    id: "tide",
    label: "Tide",
    scene: "hills",
    wave: ["#d6ede8", "#5f8f8b", "#1f3a5f"],
    mist: "#eef3ee",
    hills: ["#cfe0d8", "#aecabf", "#84a79d", "#5f8f8b", "#3c6a6e"],
    sprig: "#4d7d79",
  },
  {
    id: "meadow",
    label: "Meadow",
    scene: "hills",
    wave: ["#d3e0cf", "#8aa886", "#3f6450"],
    mist: "#eef2ea",
    hills: ["#d3e0cf", "#b3c7ab", "#8aa886", "#62876a", "#3f6450"],
    sprig: "#5a8268",
  },
  {
    id: "dawn",
    label: "Dawn",
    scene: "hills",
    wave: ["#efe4cf", "#c8a878", "#876844"],
    mist: "#f6f1e7",
    hills: ["#efe4cf", "#ddc59c", "#c8a878", "#ad8a5e", "#876844"],
    sprig: "#9c7f57",
  },
  {
    id: "blush",
    label: "Blush",
    scene: "waves",
    wave: ["#f0e1d6", "#d9ad97", "#9c7060"],
    mist: "#f6efe8",
    hills: ["#f0e1d6", "#e6c9b8", "#d4a892", "#bd8b78", "#9c7060"],
    sprig: "#b3897a",
  },
  {
    id: "cove",
    label: "Cove",
    scene: "waves",
    wave: ["#caeae1", "#67b6a8", "#28635a"],
    mist: "#e9f4f0",
    hills: ["#caeae1", "#98d2c6", "#67b6a8", "#3f8d80", "#28635a"],
    sprig: "#3a8175",
  },
  {
    id: "fog",
    label: "Fog",
    scene: "waves",
    wave: ["#dfe4e2", "#aab5b2", "#6e7c79"],
    mist: "#f0f2f0",
    hills: ["#dfe4e2", "#c4cdc9", "#a3afab", "#7f8d89", "#5a6663"],
    sprig: "#6f7d79",
  },
  {
    id: "dusk",
    label: "Dusk",
    scene: "mountains",
    wave: ["#cdd9e3", "#7a99ad", "#2f4f66"],
    mist: "#edf1f4",
    hills: ["#cdd9e3", "#a7bccb", "#7a99ad", "#51748c", "#2f4f66"],
    sprig: "#46708a",
  },
  {
    id: "ridge",
    label: "Ridge",
    scene: "mountains",
    wave: ["#ccd8c0", "#7a9462", "#324827"],
    mist: "#eaf0e6",
    hills: ["#ccd8c0", "#a3b78f", "#7a9462", "#536e3f", "#324827"],
    sprig: "#4d6a38",
  },
];

const BY_ID = new Map(COVER_THEMES.map((t) => [t.id, t]));

/** The default cover (Tide) — "the one we have". */
export const DEFAULT_COVER_THEME = COVER_THEMES[0];

/** Resolve a theme id to a theme, falling back to the default (Tide). */
export function coverTheme(id?: string | null): CoverTheme {
  return (id ? BY_ID.get(id) : undefined) ?? DEFAULT_COVER_THEME;
}
