// A small SQUARE watercolor wave glyph for tight spots (e.g. the dashboard's Profile
// Strength card) where the full landscape ProfileCover would crop to a flat band. Uses
// the practitioner's chosen cover COLOUR palette so it stays on-theme.

import { coverColor } from "./cover-themes";

export function CoverThumb({ color, className }: { color?: string | null; className?: string }) {
  const c = coverColor(color);
  const r = c.ramp;
  const id = `htc-ct-${(color || "tide").replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.sky[0]} />
          <stop offset="100%" stopColor={c.sky[1]} />
        </linearGradient>
      </defs>
      <rect width="64" height="64" fill={`url(#${id}-sky)`} />
      <path d="M0,34 C16,28 32,40 48,33 C56,30 60,35 64,32 L64,64 L0,64 Z" fill={r[2]} opacity="0.7" />
      <path d="M0,44 C18,38 40,49 64,42 L64,64 L0,64 Z" fill={r[3]} opacity="0.85" />
      <path d="M0,54 C22,49 46,58 64,52 L64,64 L0,64 Z" fill={r[4]} />
      <path
        d="M0,40 C16,34 32,46 48,39 C56,36 60,41 64,38"
        stroke="#ffffff"
        strokeWidth="1.4"
        fill="none"
        opacity="0.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
