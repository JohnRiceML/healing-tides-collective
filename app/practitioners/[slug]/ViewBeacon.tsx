"use client";

import { useEffect, useRef } from "react";

import { recordProfileView } from "./view-actions";

/**
 * Invisible beacon: records one profile view on mount. The ref guard makes it fire
 * a single time per page load (React 18 StrictMode double-invokes effects in dev).
 * Fire-and-forget — the action swallows its own errors, so nothing reaches the user.
 */
export function ViewBeacon({ slug }: { slug: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void recordProfileView(slug);
  }, [slug]);

  return null;
}
