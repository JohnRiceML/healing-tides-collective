// Watercolor cover — a soft sky WASH (chosen colour) + a layered MOTIF (chosen design):
// Waves, Hills, Mountains, Botanical, Horizon, Dunes, or Minimal. Layers step through the
// colour's light→deep ramp for real depth; a gentle blur gives the painterly edge. Original
// SVG, renders server-side; the seed only keeps gradient-ids unique.

import { coverColor, coverDesign, type CoverColor } from "./cover-themes";

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// Layered fill paths per design (back → front), drawn with ramp[0..4].
const LAYERS: Record<string, string[]> = {
  waves: [
    "M0,150 C300,128 600,168 900,148 C1050,138 1150,156 1200,150 L1200,340 L0,340 Z",
    "M0,196 C280,176 560,212 860,192 C1040,180 1140,198 1200,192 L1200,340 L0,340 Z",
    "M0,236 C320,218 620,250 920,232 C1060,224 1150,238 1200,234 L1200,340 L0,340 Z",
    "M0,274 C300,258 640,288 960,270 C1080,263 1160,276 1200,272 L1200,340 L0,340 Z",
    "M0,306 C360,292 760,316 1200,302 L1200,340 L0,340 Z",
  ],
  hills: [
    "M0,170 C200,140 420,180 640,158 C860,136 1040,172 1200,158 L1200,340 L0,340 Z",
    "M0,210 C240,184 500,222 760,202 C980,186 1110,214 1200,206 L1200,340 L0,340 Z",
    "M0,248 C280,226 560,260 840,242 C1020,230 1130,250 1200,244 L1200,340 L0,340 Z",
    "M0,284 C320,266 660,298 1000,280 C1100,274 1160,286 1200,282 L1200,340 L0,340 Z",
    "M0,312 C400,300 800,322 1200,308 L1200,340 L0,340 Z",
  ],
  mountains: [
    "M0,180 L240,118 L430,196 L650,104 L880,190 L1080,130 L1200,194 L1200,340 L0,340 Z",
    "M0,224 L300,162 L540,238 L780,160 L1030,232 L1200,196 L1200,340 L0,340 Z",
    "M0,262 L340,206 L600,276 L860,200 L1100,266 L1200,236 L1200,340 L0,340 Z",
    "M0,296 L400,256 L780,302 L1120,258 L1200,284 L1200,340 L0,340 Z",
    "M0,318 L520,298 L920,322 L1200,304 L1200,340 L0,340 Z",
  ],
  dunes: [
    "M0,196 C420,150 720,244 1200,184 L1200,340 L0,340 Z",
    "M0,238 C360,202 820,282 1200,222 L1200,340 L0,340 Z",
    "M0,272 C460,240 840,300 1200,258 L1200,340 L0,340 Z",
    "M0,300 C420,280 880,318 1200,288 L1200,340 L0,340 Z",
    "M0,320 C520,310 940,330 1200,312 L1200,340 L0,340 Z",
  ],
};

// Soft white accent lines that weave through the Waves design.
const WAVE_ACCENTS = [
  "M0,166 C300,144 600,184 900,164 C1050,154 1150,172 1200,166",
  "M0,250 C320,232 620,264 920,246 C1060,238 1150,252 1200,248",
  "M0,290 C300,274 640,304 960,286 C1080,279 1160,292 1200,288",
];

function Scene({ design, c, gid }: { design: string; c: CoverColor; gid: string }) {
  const r = c.ramp;

  if (design === "minimal") {
    return (
      <path d="M0,256 C400,236 800,268 1200,250 L1200,340 L0,340 Z" fill={r[1]} opacity="0.5" />
    );
  }

  if (design === "botanical") {
    // A faint ground + an elegant line-art leaf sprig, centered.
    return (
      <>
        <path d="M0,300 C400,286 800,310 1200,296 L1200,340 L0,340 Z" fill={r[1]} opacity="0.45" />
        <g stroke={r[4]} fill="none" strokeWidth="2.2" opacity="0.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M600,302 C594,250 598,198 606,148" />
          <path d="M599,256 C566,250 542,232 532,206 C566,206 590,224 599,256 Z" />
          <path d="M601,244 C634,238 658,220 668,194 C634,194 610,212 601,244 Z" />
          <path d="M601,212 C572,206 552,188 544,164 C572,166 593,184 601,212 Z" />
          <path d="M603,200 C632,194 652,176 660,152 C632,154 611,172 603,200 Z" />
          <path d="M604,172 C580,166 564,150 558,130 C580,132 597,148 604,172 Z" />
          <path d="M606,162 C630,156 646,140 652,120 C630,122 613,138 606,162 Z" />
          <path d="M606,148 C600,132 600,118 606,106 C612,118 612,132 606,148 Z" />
        </g>
      </>
    );
  }

  if (design === "horizon") {
    return (
      <>
        {/* sun + glow, just above the waterline */}
        <circle cx="600" cy="158" r="80" fill="#ffffff" opacity="0.28" />
        <circle cx="600" cy="156" r="46" fill="#fdf6ec" opacity="0.9" />
        {/* water */}
        <rect x="0" y="196" width="1200" height="144" fill={r[2]} opacity="0.9" />
        <rect x="0" y="196" width="1200" height="144" fill={r[3]} opacity="0.22" />
        {/* sun reflection on the water */}
        <path d="M576,200 L624,200 L640,340 L560,340 Z" fill="#fdf6ec" opacity="0.22" />
        {/* ripple lines */}
        <g stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.22" strokeLinecap="round">
          <path d="M120,236 H1080" />
          <path d="M220,272 H980" />
          <path d="M320,304 H880" />
        </g>
      </>
    );
  }

  // Layered designs: waves / hills / mountains / dunes
  const layers = LAYERS[design] ?? LAYERS.waves;
  return (
    <>
      {layers.map((d, i) => (
        <path key={i} d={d} fill={r[i]} opacity={0.92} />
      ))}
      {design === "waves" ? (
        <g stroke="#ffffff" fill="none" strokeWidth="2.2" opacity="0.38" strokeLinecap="round">
          {WAVE_ACCENTS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      ) : null}
    </>
  );
}

export function ProfileCover({
  seed,
  className,
  design,
  color,
}: {
  seed: string;
  className?: string;
  design?: string | null;
  color?: string | null;
}) {
  const c = coverColor(color);
  const d = coverDesign(design);
  const gid = `htc-pc-${hashSeed(seed || "tide").toString(36)}`;
  const sharp = d === "mountains" || d === "botanical";

  return (
    <svg
      className={className}
      viewBox="0 0 1200 340"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${gid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.sky[0]} />
          <stop offset="100%" stopColor={c.sky[1]} />
        </linearGradient>
        <radialGradient id={`${gid}-haze`} cx="0.42" cy="0.18" r="0.7">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="72%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id={`${gid}-soft`} x="-4%" y="-4%" width="108%" height="112%">
          <feGaussianBlur stdDeviation={sharp ? "1.3" : "2.4"} />
        </filter>
      </defs>

      <rect width="1200" height="340" fill={`url(#${gid}-sky)`} />
      <g filter={`url(#${gid}-soft)`}>
        <Scene design={d} c={c} gid={gid} />
      </g>
      <rect width="1200" height="340" fill={`url(#${gid}-haze)`} />
    </svg>
  );
}
