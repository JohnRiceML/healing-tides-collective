import Link from "next/link";

import type { CommandCenter as Digest } from "./command-center";

/** A single action queue — count + label, links to where the work gets done. */
function LaneCard({ label, count, href, act }: { label: string; count: number; href: string; act: boolean }) {
  return (
    <Link
      href={href}
      className={`group flex items-center justify-between gap-3 rounded-2xl border px-5 py-4 transition-colors ${
        act ? "border-teal/40 bg-seafoam/30 hover:border-teal/60" : "border-rule bg-white hover:border-teal/40"
      }`}
    >
      <span>
        <span className={`font-display text-[26px] leading-none ${act ? "text-teal" : "text-charcoal"}`}>{count}</span>
        <span className="meta mt-1.5 block text-ink-muted">{label}</span>
      </span>
      <span aria-hidden className="text-ink-muted transition-colors group-hover:text-teal">→</span>
    </Link>
  );
}

/**
 * The command center's "today" panel: a warm greeting, a one-line read of what's waiting, the
 * highest-priority people-waiting queue (intakes), and a card per non-empty action queue. Everything
 * deep-links into the surface that does the work. When nothing's waiting, it says so plainly.
 */
export function CommandCenter({ digest }: { digest: Digest }) {
  const { greeting, totalActions, lanes, topIntakes } = digest;

  return (
    <section className="mb-10">
      <h2 className="font-display text-[22px] font-light text-charcoal">{greeting}.</h2>
      <p className="mt-1 text-[15px] leading-[1.6] text-ink-soft">
        {totalActions > 0
          ? `${totalActions} thing${totalActions === 1 ? "" : "s"} waiting on you today.`
          : "You're all caught up — nothing waiting right now."}
      </p>

      {/* People waiting to be matched — the highest-priority, surfaced first. */}
      {topIntakes.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-teal/40 bg-seafoam/20 p-5">
          <p className="meta text-ink-muted">People waiting to be matched</p>
          <ul className="mt-3 flex flex-col divide-y divide-rule/50">
            {topIntakes.map((s) => (
              <li key={s.id}>
                <Link
                  href="/admin/seekers"
                  className="group flex items-center gap-3 py-2.5 transition-colors hover:text-teal"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white font-display text-[16px] text-ocean ring-1 ring-teal/30">
                    {s.initial}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] text-charcoal">{s.detail}</span>
                    <span className="text-[12px] text-ink-muted">submitted {s.ago}</span>
                  </span>
                  {s.urgent ? (
                    <span className="shrink-0 rounded-full bg-clay/10 px-2.5 py-0.5 text-[11px] font-medium text-clay">soon</span>
                  ) : null}
                  <span aria-hidden className="shrink-0 text-ink-muted transition-colors group-hover:text-teal">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* One card per non-empty queue. */}
      {lanes.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {lanes.map((l) => (
            <LaneCard key={l.key} label={l.label} count={l.count} href={l.href} act={l.tone === "act"} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
