// Watercolor cover for a practitioner — renders one of three SCENES (rolling hills,
// soft waves, or mountains with a tree) in the chosen theme's palette. Original SVG (no
// photos, no licensing), renders server-side. A gentle blur gives the watercolor edge;
// the seed only keeps gradient-ids unique. Used by the directory card, the profile hero,
// the live preview, and the theme picker.

import { coverTheme, type CoverScene } from "./cover-themes";

// Each scene = five layered shapes (back → front), filled with hills[0..4].
const SCENES: Record<CoverScene, string[]> = {
  hills: [
    "M0,150 C200,120 400,166 600,140 C820,112 1000,150 1200,134 L1200,340 L0,340 Z",
    "M0,196 C220,168 430,206 640,182 C860,158 1040,193 1200,180 L1200,340 L0,340 Z",
    "M0,236 C250,212 470,246 690,225 C900,205 1060,233 1200,222 L1200,340 L0,340 Z",
    "M0,273 C270,252 540,283 770,266 C960,252 1080,273 1200,264 L1200,340 L0,340 Z",
    "M0,303 C320,288 620,313 900,301 C1050,295 1130,305 1200,301 L1200,340 L0,340 Z",
  ],
  waves: [
    "M0,168 C300,148 600,188 900,168 C1050,158 1150,176 1200,170 L1200,340 L0,340 Z",
    "M0,208 C300,192 600,226 900,208 C1050,199 1150,214 1200,210 L1200,340 L0,340 Z",
    "M0,246 C300,232 600,262 900,246 C1050,238 1150,251 1200,248 L1200,340 L0,340 Z",
    "M0,282 C300,270 600,296 900,282 C1050,275 1150,286 1200,284 L1200,340 L0,340 Z",
    "M0,313 C300,305 600,323 900,313 C1050,308 1150,316 1200,314 L1200,340 L0,340 Z",
  ],
  mountains: [
    "M0,196 L210,132 L380,206 L560,116 L770,200 L980,148 L1200,206 L1200,340 L0,340 Z",
    "M0,238 L250,176 L470,250 L690,168 L910,244 L1130,192 L1200,222 L1200,340 L0,340 Z",
    "M0,274 L290,222 L530,286 L770,216 L1010,280 L1200,242 L1200,340 L0,340 Z",
    "M0,300 L330,262 L660,306 L980,258 L1200,294 L1200,340 L0,340 Z",
    "M0,320 L420,300 L820,323 L1200,302 L1200,340 L0,340 Z",
  ],
};

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function ProfileCover({
  seed,
  className,
  theme,
}: {
  seed: string;
  className?: string;
  theme?: string | null;
}) {
  const pal = coverTheme(theme);
  const gid = `htc-pc-${hashSeed(seed || "tide").toString(36)}`;
  const layers = SCENES[pal.scene];

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
          <stop offset="0%" stopColor={pal.mist} />
          <stop offset="100%" stopColor={pal.hills[0]} stopOpacity="0.7" />
        </linearGradient>
        <radialGradient id={`${gid}-haze`} cx="0.38" cy="0.2" r="0.6">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter id={`${gid}-soft`} x="-5%" y="-5%" width="110%" height="115%">
          <feGaussianBlur stdDeviation={pal.scene === "mountains" ? "1.6" : "3"} />
        </filter>
      </defs>

      <rect width="1200" height="340" fill={`url(#${gid}-sky)`} />

      <g filter={`url(#${gid}-soft)`}>
        {layers.map((d, i) => (
          <path key={i} d={d} fill={pal.hills[i]} opacity={0.8 + i * 0.012} />
        ))}
      </g>

      {/* Soft mist over the scene */}
      <rect width="1200" height="340" fill={`url(#${gid}-haze)`} />

      {pal.scene === "mountains" ? (
        // A delicate tree silhouette on the right (à la the "Ridge"/"Dusk" cards).
        <g opacity="0.5" stroke={pal.hills[4]} fill="none" strokeWidth="1.5" strokeLinecap="round">
          <path d="M1090,262 L1090,150" strokeWidth="2.6" />
          <path d="M1090,182 C1075,174 1060,170 1045,172" />
          <path d="M1090,170 C1106,162 1122,158 1138,160" />
          <path d="M1090,160 C1078,150 1068,142 1060,130" />
          <path d="M1090,152 C1102,142 1112,134 1120,122" />
          <path d="M1090,142 C1083,132 1078,122 1076,110" />
          <g fill={pal.hills[4]} stroke="none" opacity="0.75">
            <circle cx="1045" cy="172" r="3.2" />
            <circle cx="1138" cy="160" r="3.2" />
            <circle cx="1060" cy="130" r="3.2" />
            <circle cx="1120" cy="122" r="3.2" />
            <circle cx="1076" cy="110" r="3.2" />
          </g>
        </g>
      ) : (
        // A botanical sprig, bottom-right.
        <g opacity="0.5" stroke={pal.sprig} fill="none">
          <path d="M1062,300 C1052,250 1060,196 1078,150" strokeWidth="2" strokeLinecap="round" />
          <path d="M1060,266 C1034,259 1018,241 1014,219 C1042,221 1058,239 1060,266 Z" fill={pal.sprig} stroke="none" opacity="0.8" />
          <path d="M1062,236 C1090,230 1108,212 1112,190 C1084,190 1066,208 1062,236 Z" fill={pal.sprig} stroke="none" opacity="0.7" />
          <path d="M1066,206 C1042,200 1026,183 1023,162 C1049,164 1064,181 1066,206 Z" fill={pal.sprig} stroke="none" opacity="0.7" />
          <path d="M1072,178 C1098,172 1114,156 1118,136 C1093,136 1076,153 1072,178 Z" fill={pal.sprig} stroke="none" opacity="0.6" />
          <circle cx="1080" cy="150" r="5" fill={pal.sprig} stroke="none" opacity="0.7" />
        </g>
      )}
    </svg>
  );
}
