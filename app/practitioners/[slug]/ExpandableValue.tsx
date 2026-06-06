"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A Quick-details value that collapses to a couple of lines when it's long (e.g. a
 * free-text "Focus") with a Show more / Show less toggle. Self-gating: it only shows
 * the toggle when the text actually overflows the clamp, so short values (Specialty,
 * Availability, …) render as plain text with no control.
 */
export function ExpandableValue({ text, lines = 2 }: { text: string; lines?: number }) {
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) setOverflows(el.scrollHeight - el.clientHeight > 2);
  }, [text]);

  const clamp = lines === 1 ? "line-clamp-1" : lines === 3 ? "line-clamp-3" : "line-clamp-2";

  return (
    <>
      {/* NB: don't add `block` alongside the clamp — `line-clamp-*` sets
          display:-webkit-box, and a `block` utility overrides it and kills the clamp.
          So: clamp class when collapsed, plain `block` only when expanded. */}
      <span ref={ref} className={open ? "block" : clamp}>
        {text}
      </span>
      {overflows || open ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mt-1 inline-flex items-center gap-1 rounded text-[12.5px] font-medium text-teal transition-colors hover:text-ocean focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15"
        >
          {open ? "Show less" : "Show more"}
          <svg
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
            className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : null}
    </>
  );
}
