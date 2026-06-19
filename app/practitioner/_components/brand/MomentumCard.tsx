import type { Momentum, MomentumState } from "@/lib/presence-history";

/**
 * "How your presence is growing" — movement over time, the thing that makes the brand center a
 * reason to RETURN. A calm sparkline of how many local searches find them across their checks, the
 * new doors that have opened since they started, and a gentle headline per trend. Gain-only: a flat
 * or lower reading reads as "steady / still tending," never a loss or a number going down.
 */

/** A quiet bar sparkline — no axis, no numbers; just the shape of the trend. Rendered only when
 *  the trend is non-decreasing (see MomentumCard): we never draw a falling chart, so the visual
 *  can't contradict the gain-framed copy. */
function Sparkline({ series }: { series: number[] }) {
  if (series.length < 2) return null;
  const max = Math.max(...series, 1);
  // Height: 8px baseline (so a zero check is still a calm dot, never vanishing) → 36px at the peak.
  return (
    <div className="mt-4 flex h-10 items-end gap-1.5" role="img" aria-label="Your presence over recent checks">
      {series.map((v, i) => (
        <span
          key={i}
          className="w-2.5 shrink-0 rounded-full bg-teal/70"
          style={{ height: `${8 + (v / max) * 28}px` }}
        />
      ))}
    </div>
  );
}

const COPY: Record<MomentumState, { head: string; sub: string }> = {
  new: {
    head: "Your first reading is here",
    sub: "Come back after your next check and we'll show you what's opened up since today. Presence grows quietly, over time.",
  },
  growing: {
    head: "Your presence is growing",
    sub: "More of the right searches are finding you than when you started checking.",
  },
  steady: {
    head: "Your presence is holding steady",
    sub: "These things grow in their own time. Keep tending your profile — each small step widens the door a little.",
  },
  quiet: {
    head: "Still early",
    sub: "Nothing has surfaced just yet. The steps in your profile are how the right person first starts to find you — no rush.",
  },
};

export function MomentumCard({ momentum }: { momentum: Momentum }) {
  if (momentum.checks === 0) return null;
  const { state, newlyFound, appearedSeries } = momentum;
  const { head, sub } = COPY[state];

  // Gain-only: never draw a falling chart. Show the sparkline only when the latest reading is at
  // or above the first (growing or flat-steady) — a dip is told gently in words, not pictured.
  const dipped = appearedSeries.length >= 2 && appearedSeries[appearedSeries.length - 1] < appearedSeries[0];
  const showSparkline = state !== "quiet" && !dipped;

  return (
    <div className="rounded-3xl border border-rule/70 bg-white p-6 md:p-7">
      <p className="meta text-ink-muted">Your presence over time</p>
      <p className="font-display mt-2 text-[19px] leading-[1.3] tracking-[-0.01em] text-charcoal">{head}</p>
      <p className="mt-2 max-w-2xl text-[14px] leading-[1.6] text-ink-soft">{sub}</p>

      {showSparkline ? <Sparkline series={appearedSeries} /> : null}

      {newlyFound.length ? (
        <div className="mt-5 rounded-2xl bg-seafoam/30 p-5">
          <p className="meta text-teal">New doors since you started</p>
          <ul className="mt-3 space-y-2">
            {newlyFound.slice(0, 5).map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[14px] leading-[1.5] text-charcoal">
                <span aria-hidden className="mt-[7px] inline-block h-2 w-2 shrink-0 rounded-full bg-teal" />
                <span>The right person now finds you when they search &ldquo;{t}&rdquo;.</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
