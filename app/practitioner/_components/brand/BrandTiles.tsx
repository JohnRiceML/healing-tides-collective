import Link from "next/link";

import type { Dimension, DimensionState } from "@/lib/brand";

import { MoonState } from "./MoonState";

/**
 * The five parts of a practitioner's brand, at a glance — one growing-moon tile per
 * dimension. This is the calm "shape of your brand" overview: the same five tiles read
 * as a full grid at the top of the brand center, and as a compact strip on the dashboard.
 *
 * When `hrefBase` is given, each tile links to that dimension (the brand page uses an
 * in-page anchor `#dim-<id>`; the dashboard links into `/practitioner/brand#dim-<id>`).
 * Never a score or a ranking — just the moon, the name, and the calm state word.
 */

const WORD: Record<DimensionState, string> = {
  not_started: "Not started",
  forming: "Forming",
  on_its_way: "On its way",
  settled: "Settled",
};

export function BrandTiles({
  dimensions,
  hrefBase,
  compact = false,
}: {
  dimensions: Dimension[];
  hrefBase?: string;
  compact?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {dimensions.map((d) => {
        const inner = (
          <>
            <MoonState state={d.state} size={compact ? "sm" : "lg"} />
            <span
              className={`font-display mt-3 block leading-[1.25] tracking-[-0.01em] text-charcoal ${
                compact ? "text-[14px]" : "text-[15.5px]"
              }`}
            >
              {d.name}
            </span>
            <span className="meta mt-1 block text-ink-muted">{WORD[d.state]}</span>
          </>
        );
        const base = `rounded-2xl border border-rule/70 bg-white ${compact ? "p-4" : "p-5"}`;
        return hrefBase !== undefined ? (
          <Link
            key={d.id}
            href={`${hrefBase}#dim-${d.id}`}
            className={`group block transition-colors hover:border-teal/40 hover:bg-seafoam/20 ${base}`}
          >
            {inner}
          </Link>
        ) : (
          <div key={d.id} className={base}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
