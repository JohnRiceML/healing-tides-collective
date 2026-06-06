// The "help me find a fit" nudge — a calm pill that floats above the page content as
// you scroll (sticky), then settles at the end. Click-through sides so it never blocks
// the cards/links behind it. Shared by the directory and the individual profile pages.

const MATCH_MAILTO = "mailto:hello@healingtides.co?subject=Help%20me%20find%20a%20fit";

function Leaf({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M4 20C4 12 9 5 20 4c0 11-7 16-15 16-1 0-1-3-1-3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 16c2-3 5-6 9-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function GetMatchedBar({
  title,
  body,
  cta = "Get matched",
  className = "",
}: {
  title: string;
  body: string;
  cta?: string;
  className?: string;
}) {
  return (
    <div className={`pointer-events-none sticky bottom-6 z-20 mt-10 flex justify-center ${className}`}>
      <div className="pointer-events-auto flex w-full max-w-2xl items-center gap-3.5 rounded-full border border-rule/80 bg-white/95 px-5 py-3 shadow-[0_12px_44px_-14px_rgba(31,58,95,0.32)] backdrop-blur-sm sm:gap-4 sm:px-6">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-seafoam/60 text-teal">
          <Leaf className="h-[18px] w-[18px]" />
        </span>
        <p className="flex-1 text-[13.5px] leading-[1.4] text-ink-soft sm:text-[14px]">
          <span className="text-charcoal">{title}</span> {body}
        </p>
        <a
          href={MATCH_MAILTO}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-charcoal px-4 py-2.5 text-[13px] font-medium text-sand transition-colors hover:bg-charcoal/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-sand sm:px-5"
        >
          {cta}
        </a>
      </div>
    </div>
  );
}
