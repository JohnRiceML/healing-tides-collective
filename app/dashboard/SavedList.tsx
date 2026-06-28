"use client";

// The seeker's saved practitioners, rendered as the warm directory card (which links through
// to the full profile, where they reach out). Each card carries a small "Remove" control —
// optimistic-hide on click, then the server action + refresh reconcile.
//
// A11y: removal announces via a polite live region and moves focus to a stable target (the next
// Remove button, else the list container) so a keyboard/screen-reader user isn't dropped to <body>.

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { PractitionerCard as PractitionerCardData } from "@/lib/practitioners";
import { PractitionerCard } from "@/app/practitioners/_components/PractitionerCard";

import { unsaveBySlug } from "./actions";

export function SavedList({ initial }: { initial: PractitionerCardData[] }) {
  const router = useRouter();
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [liveMsg, setLiveMsg] = useState("");
  const [, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const justRemoved = useRef(false);

  const remove = (slug: string, name: string) => {
    setRemoved((prev) => new Set(prev).add(slug)); // optimistic
    setLiveMsg(`Removed ${name} from your saved list.`);
    justRemoved.current = true;
    startTransition(async () => {
      await unsaveBySlug(slug);
      router.refresh();
    });
  };

  // After a removal re-render, move focus to a stable target so it isn't lost to <body>.
  useEffect(() => {
    if (!justRemoved.current) return;
    justRemoved.current = false;
    const next = containerRef.current?.querySelector<HTMLElement>("button[data-remove]");
    (next ?? containerRef.current)?.focus();
  }, [removed]);

  const visible = initial.filter((p) => !removed.has(p.slug));

  return (
    <div ref={containerRef} tabIndex={-1} className="grid gap-6 outline-none sm:grid-cols-2">
      <p aria-live="polite" className="sr-only">
        {liveMsg}
      </p>
      {visible.map((p) => (
        <div key={p.slug} className="relative">
          <PractitionerCard practitioner={p} />
          <button
            type="button"
            data-remove
            onClick={() => remove(p.slug, p.displayName)}
            aria-label={`Remove ${p.displayName} from your saved list`}
            className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-[12px] font-medium text-ink-soft shadow-sm ring-1 ring-rule/70 backdrop-blur-sm transition hover:text-clay hover:ring-clay/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/50"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
