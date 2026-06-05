"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "ht_saved_practitioners";

function readSaved(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function Bookmark({ filled, className = "" }: { filled: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} aria-hidden className={className}>
      <path
        d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * "Save profile" — a lightweight client-side bookmark kept in localStorage (no account
 * needed). Honest + self-contained: it actually remembers, and renders a stable label
 * on the server (unsaved) until it hydrates to avoid a flash.
 */
export function SaveProfileButton({ slug }: { slug: string }) {
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSaved(readSaved().includes(slug));
    setHydrated(true);
  }, [slug]);

  function toggle() {
    const set = new Set(readSaved());
    if (set.has(slug)) set.delete(slug);
    else set.add(slug);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
    } catch {
      /* storage unavailable (private mode) — keep the in-memory state */
    }
    setSaved(set.has(slug));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-[14px] font-medium tracking-[0.01em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/20 focus-visible:ring-offset-2 focus-visible:ring-offset-sand ${
        saved
          ? "border-charcoal/25 bg-sand-deep/50 text-charcoal"
          : "border-charcoal/20 bg-white text-charcoal hover:border-charcoal/40 hover:bg-sand-deep/40"
      }`}
    >
      <Bookmark filled={saved} className="h-4 w-4 shrink-0 text-teal" />
      {hydrated && saved ? "Saved" : "Save profile"}
    </button>
  );
}
