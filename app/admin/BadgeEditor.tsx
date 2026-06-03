"use client";

import { useState, useTransition } from "react";

import { BADGES, GRANTABLE_BADGES } from "@/app/_lib/verification";
import { setVerificationBadges } from "./actions";

/** Compact labels so six toggles fit a table cell. */
const SHORT: Record<string, string> = {
  licensed_professional: "Licensed",
  verified_credentials: "Credentials",
  advanced_certification: "Advanced",
  verified_identity: "ID",
  insured: "Insured",
  community_partner: "Partner",
};

/** Per-practitioner verification toggles. Optimistic; reverts on failure. ADMIN-only path. */
export function BadgeEditor({
  practitionerId,
  current,
}: {
  practitionerId: string;
  current: string[];
}) {
  const [granted, setGranted] = useState<string[]>(current);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    const prev = granted;
    const next = granted.includes(id) ? granted.filter((x) => x !== id) : [...granted, id];
    setGranted(next);
    setError(null);
    start(async () => {
      const res = await setVerificationBadges(practitionerId, next);
      if (res.ok) setGranted(res.badges);
      else {
        setGranted(prev);
        setError(res.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-1.5">
        {GRANTABLE_BADGES.map((id) => {
          const on = granted.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              disabled={pending}
              aria-pressed={on}
              title={BADGES[id].description}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors disabled:opacity-50 ${
                on
                  ? "bg-ocean text-sand"
                  : "bg-charcoal/[0.06] text-ink-muted hover:bg-charcoal/10 hover:text-charcoal"
              }`}
            >
              {on ? "✓ " : ""}
              {SHORT[id] ?? id}
            </button>
          );
        })}
      </div>
      {error ? <span className="text-[11px] text-ocean">{error}</span> : null}
    </div>
  );
}
