// Watercolor cover — a soft sky WASH (chosen colour) + a layered, painterly MOTIF
// (chosen design): Waves, Hills, Mountains, Botanical, Horizon, Dunes, or Minimal.
//
// What makes it read as watercolour rather than construction paper:
//   • every motif layer gets its OWN vertical gradient — a light, hazy tint at its top
//     edge melting down into its base colour (computed in code via `mix`, so all six
//     palettes work with all seven designs);
//   • atmospheric perspective — distant/back layers are lighter, lower-contrast (pulled
//     toward the sky) and softer-blurred; near/front layers are deeper and crisper;
//   • delicate light accents — mist between ridges, white foam on waves, a glowing sun
//     + water reflection on the horizon, snow-light on peak tops, a line-art leaf.
//
// Original SVG (viewBox 1200×340), rendered server-side. It's shown cropped at many
// aspect ratios — tall hero, short directory band, near-square swatches/thumbnail — so
// the key motif sits in the lower-middle and the sky stays calm up top. `seed` only
// keeps the <defs> ids unique when several covers share a page.

import { coverColor, coverDesign, type CoverColor } from "./cover-themes";

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// ── colour helpers ──────────────────────────────────────────────────────────
// Parse "#rgb" / "#rrggbb" → [r,g,b]. Tolerant of a missing leading '#'.
function toRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h || "000000", 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function toHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
/** Mix two hex colours, t=0 → a, t=1 → b. The workhorse for tints & haze. */
function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = toRgb(a);
  const [br, bg, bb] = toRgb(b);
  return toHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}
/** Lighten toward white — the watercolour "wash" of a colour. */
const lighten = (hex: string, t: number) => mix(hex, "#ffffff", t);

// ── geometry for the layered designs ─────────────────────────────────────────
// Back → front. Amplitude & rhythm are varied per layer so ridges feel organic
// rather than a stack of identical sine waves. Each path closes to the bottom so
// it paints as a filled, gradient-washed band.
const LAYERS: Record<string, string[]> = {
  waves: [
    "M0,150 C220,126 430,158 640,150 C840,142 1010,166 1200,148 L1200,340 L0,340 Z",
    "M0,190 C260,210 470,170 700,188 C900,204 1060,176 1200,192 L1200,340 L0,340 Z",
    "M0,230 C200,212 420,246 660,232 C880,220 1050,250 1200,230 L1200,340 L0,340 Z",
    "M0,268 C300,288 560,254 820,272 C1000,284 1120,262 1200,274 L1200,340 L0,340 Z",
    "M0,302 C360,288 720,316 1040,300 C1110,296 1170,304 1200,302 L1200,340 L0,340 Z",
  ],
  hills: [
    "M0,168 C220,134 430,178 660,160 C880,142 1050,176 1200,156 L1200,340 L0,340 Z",
    "M0,208 C260,182 520,222 780,200 C990,182 1110,214 1200,204 L1200,340 L0,340 Z",
    "M0,246 C300,266 560,228 840,244 C1030,254 1130,232 1200,246 L1200,340 L0,340 Z",
    "M0,284 C320,262 660,300 1000,280 C1100,274 1160,288 1200,282 L1200,340 L0,340 Z",
    "M0,312 C400,300 800,322 1200,306 L1200,340 L0,340 Z",
  ],
  mountains: [
    "M0,176 L210,108 L360,166 L560,92 L760,176 L960,118 L1110,178 L1200,138 L1200,340 L0,340 Z",
    "M0,222 L260,150 L470,236 L700,148 L940,232 L1130,182 L1200,212 L1200,340 L0,340 Z",
    "M0,260 L320,196 L580,278 L840,190 L1080,262 L1200,224 L1200,340 L0,340 Z",
    "M0,296 L380,250 L720,300 L1080,250 L1200,282 L1200,340 L0,340 Z",
    "M0,318 L520,300 L920,324 L1200,304 L1200,340 L0,340 Z",
  ],
  dunes: [
    "M0,186 C380,140 720,236 1200,176 L1200,340 L0,340 Z",
    "M0,232 C420,272 760,198 1200,238 L1200,340 L0,340 Z",
    "M0,270 C360,238 820,300 1200,256 L1200,340 L0,340 Z",
    "M0,300 C460,322 880,280 1200,302 L1200,340 L0,340 Z",
    "M0,320 C520,310 940,330 1200,312 L1200,340 L0,340 Z",
  ],
};

// Soft white foam lines that weave through the Waves design (front-most reads brightest).
const WAVE_ACCENTS = [
  "M0,150 C220,126 430,158 640,150 C840,142 1010,166 1200,148",
  "M0,230 C200,212 420,246 660,232 C880,220 1050,250 1200,230",
  "M0,268 C300,288 560,254 820,272 C1000,284 1120,262 1200,274",
];

// ── per-layer paint ──────────────────────────────────────────────────────────
// Build the gradient stops for one motif layer. `depth` 0=back(distant) … 1=front.
// Distant layers: base pulled toward the sky (atmospheric haze) + very light top.
// Near layers: base stays saturated/deep, top still gets a soft watercolour wash.
function layerStops(base: string, skyLow: string, depth: number) {
  // Gentle atmospheric haze — JUST enough to recede the back layers, never so much
  // they wash out into the sky (that left waves/hills/dunes looking empty). Every ridge
  // must stay clearly visible + distinct, like the reference.
  const hazed = mix(base, skyLow, (1 - depth) * 0.22);
  // The top edge gets a soft watercolour wash; kept restrained so bands keep their colour.
  const top = lighten(hazed, 0.12 + (1 - depth) * 0.14);
  return { top, bottom: hazed };
}

function Layers({
  paths,
  c,
  gid,
  bigDepth,
}: {
  paths: string[];
  c: CoverColor;
  gid: string;
  bigDepth?: boolean; // true for mountains — slightly more aerial separation
}) {
  const r = c.ramp;
  const skyLow = c.sky[1];
  const n = paths.length;
  return (
    <>
      {paths.map((d, i) => {
        // Back layers use the lighter ramp stops, front layers the deeper ones.
        const base = r[i];
        const depth = n > 1 ? i / (n - 1) : 1; // 0 back → 1 front
        const { top, bottom } = layerStops(base, skyLow, depth);
        // Back-most layers blur the most → recede into haze; front stays crisp.
        const blurId = depth > 0.66 ? `${gid}-b0` : depth > 0.33 ? `${gid}-b1` : `${gid}-b2`;
        const extra = bigDepth ? 1 - depth : 0; // mountains: lift back layers toward mist
        // A bright, narrow "lit crest" at the very top edge of each band makes the
        // ridge catch light and separate from whatever sits behind it — this is what
        // keeps overlapping layers readable instead of melting into one wash. Front
        // crests read brightest; back crests stay subtle (aerial perspective).
        const crest = lighten(top, 0.22 + depth * 0.2 + extra * 0.14);
        return (
          <g key={i} filter={`url(#${blurId})`}>
            <linearGradient id={`${gid}-l${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={crest} />
              <stop offset="9%" stopColor={top} />
              <stop offset="46%" stopColor={mix(top, bottom, 0.62)} />
              <stop offset="100%" stopColor={bottom} />
            </linearGradient>
            <path d={d} fill={`url(#${gid}-l${i})`} />
          </g>
        );
      })}
    </>
  );
}

function Scene({ design, c, gid }: { design: string; c: CoverColor; gid: string }) {
  const r = c.ramp;
  const skyLow = c.sky[1];
  const sun = c.sun ?? "#fbf0dd";

  // ── Classic — the original cover: a clean sky wash + a few calm, smooth wave bands ──
  if (design === "classic") {
    return (
      <g filter={`url(#${gid}-b1)`}>
        <path d="M0,228 C300,204 600,250 900,228 C1050,217 1150,234 1200,226 L1200,340 L0,340 Z" fill={r[2]} opacity="0.55" />
        <path d="M0,272 C360,252 760,294 1200,276 L1200,340 L0,340 Z" fill={r[3]} opacity="0.72" />
        <path d="M0,308 C400,296 800,322 1200,304 L1200,340 L0,340 Z" fill={r[4]} opacity="0.85" />
      </g>
    );
  }

  // ── Minimal — barely there: one whisper-soft, gradient-washed band ──
  if (design === "minimal") {
    const { top, bottom } = layerStops(r[2], skyLow, 0.4);
    return (
      <g filter={`url(#${gid}-b0)`}>
        <linearGradient id={`${gid}-min`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lighten(top, 0.25)} stopOpacity="0.85" />
          <stop offset="100%" stopColor={bottom} stopOpacity="0.85" />
        </linearGradient>
        <path d="M0,250 C360,228 760,266 1200,244 L1200,340 L0,340 Z" fill={`url(#${gid}-min)`} />
      </g>
    );
  }

  // ── Botanical — a calm gradient field + one refined line-art leaf sprig ──
  if (design === "botanical") {
    const { top, bottom } = layerStops(r[1], skyLow, 0.3);
    const stroke = mix(r[4], skyLow, 0.12); // graceful, slightly muted ink
    return (
      <>
        <g filter={`url(#${gid}-b1)`}>
          <linearGradient id={`${gid}-bot`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lighten(top, 0.2)} stopOpacity="0.7" />
            <stop offset="100%" stopColor={bottom} stopOpacity="0.7" />
          </linearGradient>
          <path d="M0,286 C360,266 760,306 1200,284 L1200,340 L0,340 Z" fill={`url(#${gid}-bot)`} />
        </g>
        {/* A single elegant sprig: one graceful stem with paired tapering leaves,
            consistent thin stroke. Sits just right of centre, rising from the field. */}
        <g
          transform="translate(208,-6)"
          stroke={stroke}
          fill="none"
          strokeWidth="2"
          opacity="0.62"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* stem */}
          <path d="M624,300 C612,250 612,196 628,140 C636,114 650,96 668,84" />
          {/* leaves, alternating down the stem (tip → base), each a soft pointed oval */}
          <path d="M626,256 C588,250 560,228 548,196 C588,196 616,220 626,256 Z" />
          <path d="M624,242 C660,232 686,210 696,178 C660,182 634,206 624,242 Z" />
          <path d="M619,210 C584,202 560,180 552,150 C586,154 610,178 619,210 Z" />
          <path d="M624,196 C658,184 680,162 688,132 C656,138 632,162 624,196 Z" />
          <path d="M634,160 C604,150 584,128 580,100 C610,106 628,130 634,160 Z" />
          <path d="M640,146 C668,132 686,110 692,82 C664,90 644,114 640,146 Z" />
          {/* a small bud at the tip */}
          <path d="M668,84 C660,70 660,56 668,44 C676,56 676,70 668,84 Z" />
        </g>
      </>
    );
  }

  // ── Horizon — a luminous sun low over water, with reflection + shimmer ──
  if (design === "horizon") {
    const waterTop = mix(r[2], skyLow, 0.35); // hazy where the water meets the sky
    const waterBot = r[4];
    const cx = 432; // sun sits off-centre (left of middle) — more natural than dead-centre
    const horizon = 196;
    const sunR = 44;
    const sunCy = horizon - 24;
    return (
      <>
        {/* broad soft glow behind the sun */}
        <circle cx={cx} cy={sunCy} r={150} fill={`url(#${gid}-sunglow)`} />
        {/* the sun disc — a soft radial so the rim melts into the glow */}
        <circle cx={cx} cy={sunCy} r={sunR} fill={`url(#${gid}-sundisc)`} />
        {/* water — its own vertical gradient, hazy at the waterline → deep below */}
        <g filter={`url(#${gid}-b1)`}>
          <linearGradient id={`${gid}-water`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={waterTop} />
            <stop offset="100%" stopColor={waterBot} />
          </linearGradient>
          <rect x="0" y={horizon} width="1200" height={340 - horizon} fill={`url(#${gid}-water)`} />
        </g>
        {/* sun reflection — a soft column of light fanning down the water */}
        <path
          d={`M${cx - 26},${horizon} L${cx + 26},${horizon} L${cx + 70},340 L${cx - 70},340 Z`}
          fill={`url(#${gid}-reflect)`}
        />
        {/* soft sun-shimmer — concentrated under the sun + blurred, so it reads as light
            on water rather than ruled lines */}
        <g stroke={lighten(sun, 0.32)} fill="none" strokeLinecap="round" filter={`url(#${gid}-b2)`}>
          <path d={`M${cx - 186},230 H${cx + 186}`} strokeWidth="2.6" opacity="0.5" />
          <path d={`M${cx - 148},262 H${cx + 148}`} strokeWidth="2.2" opacity="0.36" />
          <path d={`M${cx - 108},296 H${cx + 108}`} strokeWidth="1.8" opacity="0.24" />
        </g>
      </>
    );
  }

  // ── Layered designs: waves / hills / mountains / dunes ──
  const paths = LAYERS[design] ?? LAYERS.waves;
  const isMountains = design === "mountains";
  return (
    <>
      {/* faint mist sitting just behind the first ridge — adds aerial depth */}
      <rect x="0" y="120" width="1200" height="130" fill={`url(#${gid}-mist)`} />
      <Layers paths={paths} c={c} gid={gid} bigDepth={isMountains} />

      {/* Waves: translucent white foam weaving through the ridges */}
      {design === "waves" ? (
        <g fill="none" strokeLinecap="round" filter={`url(#${gid}-b2)`}>
          {WAVE_ACCENTS.map((d, i) => (
            <path key={i} d={d} stroke="#ffffff" strokeWidth={2.6 - i * 0.3} opacity={0.3 + i * 0.14} />
          ))}
        </g>
      ) : null}

      {/* Mountains: a soft snow-light catch along the front peak ridges */}
      {isMountains ? (
        <g
          fill="none"
          stroke={lighten(sun, 0.35)}
          strokeWidth="2.4"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0.34"
          filter={`url(#${gid}-b2)`}
        >
          <path d="M260,196 L320,160 L380,196" />
          <path d="M820,200 L840,190 L900,240" />
          <path d="M560,278 L640,228 L700,270" />
        </g>
      ) : null}

      {/* Dunes: a faint warm sheen down the crest of the nearest dune */}
      {design === "dunes" ? (
        <path
          d="M0,300 C460,322 880,280 1200,302"
          fill="none"
          stroke={lighten(sun, 0.3)}
          strokeWidth="3"
          opacity="0.22"
          filter={`url(#${gid}-b2)`}
        />
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
  const sun = c.sun ?? "#fbf0dd";
  const skyLow = c.sky[1];

  return (
    <svg
      className={className}
      viewBox="0 0 1200 340"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* sky wash */}
        <linearGradient id={`${gid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.sky[0]} />
          <stop offset="100%" stopColor={c.sky[1]} />
        </linearGradient>

        {/* aerial haze band that sits behind the first ridge */}
        <linearGradient id={`${gid}-mist`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="60%" stopColor={lighten(skyLow, 0.55)} stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* a soft top-left light bloom over the whole scene */}
        <radialGradient id={`${gid}-haze`} cx="0.4" cy="0.16" r="0.72">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="72%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>

        {/* Horizon sun pieces — glow, disc, and the water reflection */}
        <radialGradient id={`${gid}-sunglow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={lighten(sun, 0.3)} stopOpacity="0.85" />
          <stop offset="38%" stopColor={sun} stopOpacity="0.4" />
          <stop offset="100%" stopColor={sun} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${gid}-sundisc`} cx="0.5" cy="0.45" r="0.5">
          <stop offset="0%" stopColor={lighten(sun, 0.55)} />
          <stop offset="62%" stopColor={sun} />
          <stop offset="100%" stopColor={sun} stopOpacity="0.5" />
        </radialGradient>
        <linearGradient id={`${gid}-reflect`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lighten(sun, 0.3)} stopOpacity="0.5" />
          <stop offset="100%" stopColor={sun} stopOpacity="0" />
        </linearGradient>

        {/* depth-keyed soft blurs: b0 most (distant) → b2 least (near/crisp) */}
        <filter id={`${gid}-b0`} x="-6%" y="-6%" width="112%" height="118%">
          <feGaussianBlur stdDeviation="2.8" />
        </filter>
        <filter id={`${gid}-b1`} x="-6%" y="-6%" width="112%" height="118%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <filter id={`${gid}-b2`} x="-6%" y="-6%" width="112%" height="118%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
      </defs>

      <rect width="1200" height="340" fill={`url(#${gid}-sky)`} />
      <Scene design={d} c={c} gid={gid} />
      <rect width="1200" height="340" fill={`url(#${gid}-haze)`} />
    </svg>
  );
}
