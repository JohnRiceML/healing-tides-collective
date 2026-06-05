// Default "wide image" for a practitioner — a calm, on-brand SVG cover evoking
// tides. Deterministic from a seed (the slug), so each person gets a consistent,
// distinct band of colour even before they upload their own. Original artwork
// (no photos, no licensing), tiny, and renders server-side.

const PALETTES: [string, string, string][] = [
  ["#d6ede8", "#5f8f8b", "#1f3a5f"], // seafoam → teal → ocean
  ["#a8bfa3", "#5f8f8b", "#1f3a5f"], // sage → teal → ocean
  ["#d6ede8", "#a8bfa3", "#5f8f8b"], // seafoam → sage → teal
  ["#efeae1", "#d6ede8", "#5f8f8b"], // sand-deep → seafoam → teal
  ["#5f8f8b", "#27506e", "#1f3a5f"], // teal → deep ocean
  ["#d6ede8", "#5f8f8b", "#a8bfa3"], // seafoam → teal → sage
];

// Three wave rhythms (light layers + one deeper band for depth at the foot).
const WAVES: { light: string[]; deep: string }[] = [
  {
    light: [
      "M0,206 C160,176 320,238 480,208 C640,178 720,228 800,202 L800,300 L0,300 Z",
      "M0,242 C200,216 360,260 520,236 C680,214 760,256 800,240 L800,300 L0,300 Z",
    ],
    deep: "M0,266 C220,246 420,282 800,258 L800,300 L0,300 Z",
  },
  {
    light: [
      "M0,172 C180,212 340,140 520,182 C660,212 740,160 800,186 L800,300 L0,300 Z",
      "M0,216 C160,250 380,190 560,226 C700,250 760,216 800,230 L800,300 L0,300 Z",
    ],
    deep: "M0,256 C240,236 480,276 800,250 L800,300 L0,300 Z",
  },
  {
    light: [
      "M0,190 C200,160 400,212 600,180 C700,164 760,196 800,180 L800,300 L0,300 Z",
      "M0,236 C220,210 420,252 620,226 C720,210 780,242 800,228 L800,300 L0,300 Z",
    ],
    deep: "M0,270 C260,250 520,286 800,262 L800,300 L0,300 Z",
  },
];

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Deterministic palette + wave + gradient-id for a seed. Pure, so it's unit-tested.
 *  Unsigned shifts/mods only — a signed `>>` here can go negative and index past the
 *  arrays (undefined → crash) for ~half of all seeds. */
export function pickCover(seed: string) {
  const h = hashSeed(seed || "tide");
  return {
    palette: PALETTES[h % PALETTES.length],
    wave: WAVES[(h >>> 5) % WAVES.length],
    gid: `htc-${h.toString(36)}`,
  };
}

export function CoverArt({ seed, className }: { seed: string; className?: string }) {
  const { palette: pal, wave, gid } = pickCover(seed);

  return (
    <svg
      className={className}
      viewBox="0 0 800 300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${gid}-g`} x1="0" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor={pal[0]} />
          <stop offset="55%" stopColor={pal[1]} />
          <stop offset="100%" stopColor={pal[2]} />
        </linearGradient>
        <radialGradient id={`${gid}-glow`} cx="0.7" cy="0.2" r="0.9">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="300" fill={`url(#${gid}-g)`} />
      {/* Sand wash — softens the band toward a pale, watercolor feel (matches the
          directory mockup; keeps the brand calm rather than saturated). */}
      <rect width="800" height="300" fill="#f7f5f2" opacity="0.2" />
      <rect width="800" height="300" fill={`url(#${gid}-glow)`} />
      {wave.light.map((d, i) => (
        <path key={i} d={d} fill="#ffffff" opacity={0.08 + i * 0.06} />
      ))}
      <path d={wave.deep} fill={pal[2]} opacity="0.18" />
    </svg>
  );
}
