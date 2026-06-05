// Wide watercolor cover banner for a practitioner profile — soft receding hills +
// a botanical sprig, in the brand palette. Original SVG (no photos, no licensing),
// renders server-side. A gentle blur gives the watercolor edge. The hue shifts a
// little by seed (the slug) so each profile feels distinct without leaving the palette.

const PALETTES: { mist: string; hills: string[]; sprig: string }[] = [
  // seafoam → teal → ocean (the mockup's blue-green)
  { mist: "#eef3ee", hills: ["#cfe0d8", "#aecabf", "#84a79d", "#5f8f8b", "#3c6a6e"], sprig: "#4d7d79" },
  // sage-forward
  { mist: "#eef2ea", hills: ["#d3e0cf", "#b3c7ab", "#8aa886", "#62876a", "#3f6450"], sprig: "#5a8268" },
  // cooler, ocean-deep
  { mist: "#edf1f1", hills: ["#cfe1de", "#a6c6c4", "#7aa4a6", "#52818c", "#2f5566"], sprig: "#46757e" },
];

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function ProfileCover({ seed, className }: { seed: string; className?: string }) {
  const h = hashSeed(seed || "tide");
  const pal = PALETTES[h % PALETTES.length];
  const gid = `htc-pc-${h.toString(36)}`;

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
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      <rect width="1200" height="340" fill={`url(#${gid}-sky)`} />

      {/* Receding hills — palest + highest at the back, deepest at the foot */}
      <g filter={`url(#${gid}-soft)`}>
        <path
          d="M0,150 C200,120 400,166 600,140 C820,112 1000,150 1200,134 L1200,340 L0,340 Z"
          fill={pal.hills[0]}
          opacity="0.8"
        />
        <path
          d="M0,196 C220,168 430,206 640,182 C860,158 1040,193 1200,180 L1200,340 L0,340 Z"
          fill={pal.hills[1]}
          opacity="0.8"
        />
        <path
          d="M0,236 C250,212 470,246 690,225 C900,205 1060,233 1200,222 L1200,340 L0,340 Z"
          fill={pal.hills[2]}
          opacity="0.82"
        />
        <path
          d="M0,273 C270,252 540,283 770,266 C960,252 1080,273 1200,264 L1200,340 L0,340 Z"
          fill={pal.hills[3]}
          opacity="0.85"
        />
        <path
          d="M0,303 C320,288 620,313 900,301 C1050,295 1130,305 1200,301 L1200,340 L0,340 Z"
          fill={pal.hills[4]}
          opacity="0.85"
        />
      </g>

      {/* Soft mist over the hills */}
      <rect width="1200" height="340" fill={`url(#${gid}-haze)`} />

      {/* Botanical sprig, bottom-right */}
      <g opacity="0.5" stroke={pal.sprig} fill="none">
        <path d="M1062,300 C1052,250 1060,196 1078,150" strokeWidth="2" strokeLinecap="round" />
        <path d="M1060,266 C1034,259 1018,241 1014,219 C1042,221 1058,239 1060,266 Z" fill={pal.sprig} stroke="none" opacity="0.8" />
        <path d="M1062,236 C1090,230 1108,212 1112,190 C1084,190 1066,208 1062,236 Z" fill={pal.sprig} stroke="none" opacity="0.7" />
        <path d="M1066,206 C1042,200 1026,183 1023,162 C1049,164 1064,181 1066,206 Z" fill={pal.sprig} stroke="none" opacity="0.7" />
        <path d="M1072,178 C1098,172 1114,156 1118,136 C1093,136 1076,153 1072,178 Z" fill={pal.sprig} stroke="none" opacity="0.6" />
        <circle cx="1080" cy="150" r="5" fill={pal.sprig} stroke="none" opacity="0.7" />
      </g>
    </svg>
  );
}
