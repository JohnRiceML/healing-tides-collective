"use client";

// "People you're considering" — the seeker's own shortlist, built as they explore with the agent.
//
// Deliberately CLIENT-SIDE ONLY (localStorage), anonymous: while someone browses + collects
// practitioners, NOTHING is stored on our server. That's both the calmest psychology (zero
// pressure, it's theirs) and the lightest compliance footprint (no sensitive "this person is
// interested in these mental-health practitioners" record exists server-side until they
// explicitly consent — see requestIntro / the account CTA).

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type ConsideredItem = {
  slug: string;
  displayName: string;
  title?: string | null;
  region?: string | null;
};

type ConsideringValue = {
  items: ConsideredItem[];
  has: (slug: string) => boolean;
  toggle: (item: ConsideredItem) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const ConsideringCtx = createContext<ConsideringValue | null>(null);
const STORAGE_KEY = "ht_considering_v1";

export function ConsideringProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ConsideredItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed.filter((x) => x && typeof x.slug === "string"));
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full / disabled — the in-memory list still works for the session */
    }
  }, [items, hydrated]);

  const has = useCallback((slug: string) => items.some((i) => i.slug === slug), [items]);
  const toggle = useCallback(
    (item: ConsideredItem) =>
      setItems((prev) => (prev.some((i) => i.slug === item.slug) ? prev.filter((i) => i.slug !== item.slug) : [...prev, item])),
    [],
  );
  const remove = useCallback((slug: string) => setItems((prev) => prev.filter((i) => i.slug !== slug)), []);
  const clear = useCallback(() => setItems([]), []);

  return <ConsideringCtx.Provider value={{ items, has, toggle, remove, clear }}>{children}</ConsideringCtx.Provider>;
}

export function useConsidering(): ConsideringValue {
  const ctx = useContext(ConsideringCtx);
  if (!ctx) throw new Error("useConsidering must be used within <ConsideringProvider>");
  return ctx;
}
