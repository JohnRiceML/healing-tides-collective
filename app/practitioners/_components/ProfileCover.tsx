// Watercolor cover for a practitioner — a clean, calm gradient wash with two soft waves,
// in the chosen theme's palette (defaults to Tide). Deliberately simple so the portrait
// stays the focus. Original SVG, renders server-side; the seed only keeps gradient-ids
// unique. Used by the directory card, profile hero, live preview, and the theme picker.

import { coverTheme } from "./cover-themes";

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
  const [c0, c1, c2] = coverTheme(theme).grad;
  const gid = `htc-pc-${hashSeed(seed || "tide").toString(36)}`;

  return (
    <svg
      className={className}
      viewBox="0 0 1200 340"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${gid}-g`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor={c0} />
          <stop offset="58%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        <filter id={`${gid}-s`} x="-5%" y="-5%" width="110%" height="115%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
      </defs>

      <rect width="1200" height="340" fill={`url(#${gid}-g)`} />

      {/* Two soft waves for a gentle watercolor hint — nothing busy. */}
      <g filter={`url(#${gid}-s)`}>
        <path
          d="M0,236 C300,210 600,258 900,234 C1050,222 1150,240 1200,232 L1200,340 L0,340 Z"
          fill={c2}
          opacity="0.28"
        />
        <path
          d="M0,288 C360,268 760,298 1200,282 L1200,340 L0,340 Z"
          fill={c2}
          opacity="0.42"
        />
      </g>
    </svg>
  );
}
