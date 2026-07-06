"use client";

// Runs once when a signed-in seeker lands on their dashboard: pushes the anonymous client-side
// basket(s) up into the account, then fires the welcome email (idempotent server-side).
// Renders nothing. If anything was newly merged, refreshes so the server re-render shows it.
//
// There are TWO client-side save surfaces, each with its own localStorage key:
//   - the /get-matched chat shortlist → `ht_considering_v1` (array of {slug,...} objects)
//   - the directory profile "Save profile" button → `ht_saved_practitioners` (array of slug strings)
// We merge BOTH so saves from either path carry over — anything else silently drops a seeker's picks.
//
// CONTRACT: after a successful sync the account is the source of truth, so BOTH keys are cleared —
// even when nothing new was added. Leaving them behind would re-merge stale slugs on every visit
// and resurrect practitioners the seeker deliberately removed. On a failed sync the keys stay put,
// so nothing is lost and the next visit retries.

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { syncSaved, ensureWelcomed } from "./actions";

const CONSIDERING_KEY = "ht_considering_v1"; // chat shortlist — {slug,...} objects
const SAVED_KEY = "ht_saved_practitioners"; // directory bookmark — slug strings

/** Read one localStorage key and extract slug strings, tolerating either shape. */
function readSlugs(key: string): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => (typeof x === "string" ? x : x?.slug))
      .filter((s): s is string => typeof s === "string");
  } catch {
    return [];
  }
}

export function SaveSync() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // once per mount — never loop
    ran.current = true;

    void (async () => {
      const slugs = Array.from(new Set([...readSlugs(CONSIDERING_KEY), ...readSlugs(SAVED_KEY)]));

      const res = await syncSaved(slugs); // safe with an empty list
      if (res.ok) {
        // Merged (or nothing to merge) — the account now owns the list. Clear both baskets so a
        // slug removed from the account can't be resurrected from stale localStorage next visit.
        try {
          localStorage.removeItem(CONSIDERING_KEY);
          localStorage.removeItem(SAVED_KEY);
        } catch {
          /* storage unavailable — worst case we re-merge next visit */
        }
      }
      await ensureWelcomed();
      if (res.ok && res.added > 0) router.refresh();
    })();
  }, [router]);

  return null;
}
