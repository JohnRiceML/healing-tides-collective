import type { DimensionState } from "@/lib/brand";

/**
 * A growing-moon glyph — the calm, never-punitive read of a dimension's state.
 *
 * It fills like a waxing moon, not a progress bar: a teal arc grows over a quiet
 * neutral track. There is no empty/red/✗ state — "not started" is simply a hollow
 * ring (a door, not a deficiency). No number, no percentage, no comparison.
 *
 *   not_started  ○  hollow ring (no fill)
 *   forming      ◔  ~30% teal
 *   on_its_way   ◑  ~60% teal
 *   settled      ◕  ~92% teal
 *
 * Implemented with a conic-gradient fill so the arc is a true sweep, masked into a
 * ring so the center stays light (a glyph, not a solid coin). Pure server component.
 */

const FILL: Record<DimensionState, number> = {
  not_started: 0,
  forming: 30,
  on_its_way: 60,
  settled: 92,
};

const WORD: Record<DimensionState, string> = {
  not_started: "not started",
  forming: "forming",
  on_its_way: "on its way",
  settled: "settled",
};

const SIZE: Record<"sm" | "lg", string> = {
  sm: "h-3.5 w-3.5 border-[1.5px]",
  lg: "h-6 w-6 border-2",
};

export function MoonState({
  state,
  label = false,
  size = "sm",
  fillPct,
}: {
  state: DimensionState;
  label?: boolean;
  size?: "sm" | "lg";
  /** When given (a dimension's 0–100 score), the moon fills to it exactly — a true progress dial
   *  (values outside 0–100 are clamped). Omitted for per-insight moons, which fall back to the
   *  state's coarse fill. */
  fillPct?: number;
}) {
  const pct = fillPct != null ? Math.max(0, Math.min(100, fillPct)) : FILL[state];
  const word = WORD[state];

  return (
    <span className="inline-flex items-center gap-2 leading-none">
      <span
        aria-hidden
        className={`relative inline-block shrink-0 rounded-full border-rule ${SIZE[size]}`}
        style={
          pct > 0
            ? {
                // teal arc grows from the top, clockwise; the rest stays on the
                // neutral sand-deep track. A radial mask keeps the centre clear so
                // it reads as a waxing moon, not a filled dot.
                background: `conic-gradient(var(--color-teal) ${pct}%, var(--color-sand-deep) 0)`,
                WebkitMask: "radial-gradient(circle, transparent 38%, #000 39%)",
                mask: "radial-gradient(circle, transparent 38%, #000 39%)",
                borderColor: "var(--color-teal)",
              }
            : undefined
        }
      />
      {label ? <span className="meta text-ink-muted">{word}</span> : null}
      <span className="sr-only">{word}</span>
    </span>
  );
}
