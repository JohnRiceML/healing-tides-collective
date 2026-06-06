// Watercolor cover for a practitioner — a soft gradient WASH (chosen colour) + a clean
// MOTIF (chosen design): waves, hills, mountains, a leaf sprig, a tree, or plain. The two
// are picked independently. Calm + simple by design so the portrait stays the focus.
// Original SVG, renders server-side; the seed only keeps gradient-ids unique.

import { coverColor, coverDesign } from "./cover-themes";

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** The motif paths for a design, drawn in the colour's `ink`. */
function Motif({ design, ink }: { design: string; ink: string }) {
  switch (design) {
    case "plain":
      return null;
    case "hills":
      return (
        <>
          <path d="M0,206 C220,176 440,220 660,196 C880,172 1050,206 1200,194 L1200,340 L0,340 Z" fill={ink} opacity="0.16" />
          <path d="M0,252 C260,226 520,266 780,246 C980,230 1110,256 1200,248 L1200,340 L0,340 Z" fill={ink} opacity="0.26" />
          <path d="M0,296 C320,282 660,312 1000,296 C1110,291 1160,300 1200,298 L1200,340 L0,340 Z" fill={ink} opacity="0.38" />
        </>
      );
    case "mountains":
      return (
        <>
          <path d="M0,214 L230,150 L410,222 L610,130 L830,216 L1030,160 L1200,222 L1200,340 L0,340 Z" fill={ink} opacity="0.2" />
          <path d="M0,262 L290,200 L540,272 L780,200 L1020,266 L1200,228 L1200,340 L0,340 Z" fill={ink} opacity="0.32" />
          <path d="M0,302 L380,266 L760,308 L1120,266 L1200,288 L1200,340 L0,340 Z" fill={ink} opacity="0.42" />
        </>
      );
    case "leaf":
      return (
        <>
          <path d="M0,300 C400,284 800,308 1200,294 L1200,340 L0,340 Z" fill={ink} opacity="0.2" />
          <g fill={ink}>
            <path d="M1076,300 C1058,244 1066,184 1098,134" stroke={ink} strokeWidth="2.5" fill="none" opacity="0.34" strokeLinecap="round" />
            <path d="M1072,262 C1038,254 1016,232 1012,206 C1046,210 1068,232 1072,262 Z" opacity="0.22" />
            <path d="M1080,228 C1116,222 1140,200 1146,172 C1112,174 1086,196 1080,228 Z" opacity="0.2" />
            <path d="M1086,196 C1054,188 1034,168 1031,144 C1062,148 1082,168 1086,196 Z" opacity="0.2" />
            <path d="M1094,166 C1128,160 1150,140 1156,114 C1124,116 1100,138 1094,166 Z" opacity="0.18" />
            <circle cx="1100" cy="132" r="6" opacity="0.26" />
          </g>
        </>
      );
    case "tree":
      return (
        <>
          <path d="M0,302 C400,288 800,310 1200,296 L1200,340 L0,340 Z" fill={ink} opacity="0.2" />
          <g stroke={ink} fill="none" strokeWidth="2" opacity="0.32" strokeLinecap="round">
            <path d="M900,302 L900,168" strokeWidth="3.5" />
            <path d="M900,210 C872,200 850,196 828,198 M900,196 C928,184 952,178 976,180 M900,182 C880,168 866,152 858,134 M900,168 C922,152 938,136 948,116 M900,156 C890,140 884,126 882,110" />
            <g fill={ink} stroke="none" opacity="0.5">
              <circle cx="828" cy="198" r="4.5" />
              <circle cx="976" cy="180" r="4.5" />
              <circle cx="858" cy="134" r="4.5" />
              <circle cx="948" cy="116" r="4.5" />
              <circle cx="882" cy="110" r="4.5" />
            </g>
          </g>
        </>
      );
    case "waves":
    default:
      return (
        <>
          <path d="M0,236 C300,210 600,258 900,234 C1050,222 1150,240 1200,232 L1200,340 L0,340 Z" fill={ink} opacity="0.22" />
          <path d="M0,288 C360,268 760,298 1200,282 L1200,340 L0,340 Z" fill={ink} opacity="0.34" />
        </>
      );
  }
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
  const [c0, c1, c2] = c.grad;
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
          <feGaussianBlur stdDeviation={d === "mountains" || d === "tree" ? "1.4" : "2.4"} />
        </filter>
      </defs>

      <rect width="1200" height="340" fill={`url(#${gid}-g)`} />
      <g filter={`url(#${gid}-s)`}>
        <Motif design={d} ink={c.ink} />
      </g>
    </svg>
  );
}
