// Atmospheric header art for the directory — soft, layered watercolor waves with a
// pale sun and a botanical sprig, all on-brand (seafoam / sage / teal). Original SVG
// (no photos, no licensing), tiny, renders server-side. A gentle blur gives the
// watercolor edge; the page masks the LEFT edge so it dissolves behind the headline.
//
// Decorative only — the parent marks it aria-hidden + pointer-events-none.

export function DirectoryHeaderArt({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 640 360"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id="htc-hero-soft" x="-8%" y="-8%" width="116%" height="116%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        <radialGradient id="htc-hero-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#f1e7d3" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#f1e7d3" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#f1e7d3" stopOpacity="0" />
        </radialGradient>
        {/* Fade the very bottom of the art so the filled waves dissolve into the sand
            instead of ending on a hard horizontal seam. */}
        <linearGradient id="htc-hero-bf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="84%" stopColor="#fff" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
        <mask id="htc-hero-bottomfade">
          <rect width="640" height="360" fill="url(#htc-hero-bf)" />
        </mask>
      </defs>

      <g mask="url(#htc-hero-bottomfade)">
      {/* Soft sun, high on the right */}
      <circle cx="500" cy="98" r="118" fill="url(#htc-hero-sun)" />

      {/* Watercolor wave bands — palest + highest at the back, deeper toward the front */}
      <g filter="url(#htc-hero-soft)">
        <path
          d="M0,206 C120,182 260,236 400,206 C520,180 588,214 640,200 L640,360 L0,360 Z"
          fill="#d6ede8"
          opacity="0.5"
        />
        <path
          d="M0,250 C140,228 280,270 444,242 C560,222 610,250 640,238 L640,360 L0,360 Z"
          fill="#a8bfa3"
          opacity="0.3"
        />
        <path
          d="M0,280 C160,258 320,296 484,272 C580,257 620,280 640,270 L640,360 L0,360 Z"
          fill="#cfe6dd"
          opacity="0.62"
        />
        <path
          d="M0,308 C180,290 360,322 540,302 C600,295 624,308 640,302 L640,360 L0,360 Z"
          fill="#bcd9cf"
          opacity="0.7"
        />
      </g>

      {/* Botanical sprig, top-right — a thin stem with a few soft leaves */}
      <g opacity="0.6">
        <path
          d="M601,236 C593,190 600,140 614,92"
          stroke="#5f8f8b"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M600,206 C580,201 568,187 565,170 C585,171 597,186 600,206 Z"
          fill="#a8bfa3"
          opacity="0.6"
        />
        <path
          d="M602,184 C621,179 635,165 639,148 C619,148 605,162 602,184 Z"
          fill="#a8bfa3"
          opacity="0.55"
        />
        <path
          d="M603,158 C586,153 575,140 573,124 C591,126 601,139 603,158 Z"
          fill="#9bb89a"
          opacity="0.55"
        />
        <path
          d="M607,134 C624,128 636,115 639,100 C622,100 610,113 607,134 Z"
          fill="#9bb89a"
          opacity="0.5"
        />
        <circle cx="615" cy="90" r="4" fill="#a8bfa3" opacity="0.6" />
      </g>
      </g>
    </svg>
  );
}
