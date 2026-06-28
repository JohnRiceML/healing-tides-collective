"use client";

// Practitioners the agent has surfaced THIS session — they flow into the right-hand rail as cards
// (from both the text and voice surfaces). Session-only (not persisted); the saved "basket" is the
// separate ConsideringContext (localStorage). Dedup by slug, newest first.

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

import type { PractitionerHit } from "@/lib/onboarding/types";

type SurfacedValue = {
  surfaced: PractitionerHit[];
  addMany: (hits: PractitionerHit[]) => void;
};

const SurfacedCtx = createContext<SurfacedValue | null>(null);

export function SurfacedProvider({ children }: { children: ReactNode }) {
  const [surfaced, setSurfaced] = useState<PractitionerHit[]>([]);

  const addMany = useCallback((hits: PractitionerHit[]) => {
    if (!hits?.length) return;
    setSurfaced((prev) => {
      const bySlug = new Map(prev.map((p) => [p.slug, p]));
      let changed = false;
      for (const h of hits) {
        if (h?.slug && !bySlug.has(h.slug)) {
          bySlug.set(h.slug, h);
          changed = true;
        }
      }
      // Newest surfaced first, so the most recent suggestions sit at the top of the rail.
      return changed ? [...hits.filter((h) => h?.slug), ...prev.filter((p) => !hits.some((h) => h?.slug === p.slug))] : prev;
    });
  }, []);

  return <SurfacedCtx.Provider value={{ surfaced, addMany }}>{children}</SurfacedCtx.Provider>;
}

export function useSurfaced(): SurfacedValue {
  const ctx = useContext(SurfacedCtx);
  if (!ctx) throw new Error("useSurfaced must be used within <SurfacedProvider>");
  return ctx;
}
