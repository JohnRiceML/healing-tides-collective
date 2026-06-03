"use client";

import type { ImportExtra, ImportSourceSummary } from "./_extract/types";

export type ImportPhase = "reading" | "done" | "partial" | "nothing" | "failed";

export interface ImportView {
  phase: ImportPhase;
  /** During "reading" these are the sources we're attempting; after, the resolved rollups. */
  sources: ImportSourceSummary[];
  /** Count of form fields this run will fill (only fields that were empty). */
  filledCount: number;
  extras: ImportExtra[];
  unmapped: string[];
  error?: string;
}

const plural = (n: number, s: string) => `${n} ${s}${n === 1 ? "" : "s"}`;

function summaryText(v: ImportView): string {
  const failed = v.sources.filter((s) => !s.ok).length;
  switch (v.phase) {
    case "reading":
      return "Reading what you shared…";
    case "done":
      return `Filled ${plural(v.filledCount, "field")} — review them below, then Save.`;
    case "partial":
      return `Filled ${plural(v.filledCount, "field")} from what we could reach. ${
        failed === 1 ? "A link" : `${failed} links`
      } wouldn't open — paste those below if you'd like.`;
    case "nothing":
      return "We read everything, but didn't find new details to add. Your form's below — it's lighter than it looks.";
    case "failed":
      return v.error ?? "Couldn't read that — try pasting your bio instead.";
  }
}

/** Sticky, calm import readout. Never steals focus; no red, no spinners. */
export function ImportStatusBar({
  view,
  collapsed,
  onToggleCollapse,
  onDismiss,
  onPasteFocus,
}: {
  view: ImportView;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onDismiss: () => void;
  onPasteFocus?: () => void;
}) {
  const running = view.phase === "reading";
  const summary = summaryText(view);

  if (collapsed) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rule/80 bg-sand/95 backdrop-blur-sm pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex w-full max-w-[720px] items-center gap-3 px-6 py-3 md:px-10">
          <span aria-hidden className="text-teal">✓</span>
          <span className="text-[14px] text-charcoal">
            {plural(view.filledCount, "detail")} imported · review &amp; save
          </span>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="ml-auto rounded-full px-2 py-1 text-[13px] text-ink-soft underline-offset-2 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15"
          >
            show
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rule/80 bg-sand/95 backdrop-blur-sm shadow-[0_-1px_0_rgba(31,58,95,0.02),0_-18px_40px_-32px_rgba(31,58,95,0.18)] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-[720px] px-6 py-4 md:px-10">
        {/* Header: summary (announced) + controls */}
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p role="status" aria-live="polite" aria-atomic="true" className="text-[14px] leading-[1.5] text-charcoal">
              {view.phase === "failed" ? null : summary}
              {view.phase === "failed" ? <span role="alert" className="text-ocean">{summary}</span> : null}
            </p>
            {(view.phase === "done" || view.phase === "partial") && view.filledCount > 0 ? (
              <p className="mt-1 text-[13px] leading-[1.5] text-ink-soft">
                No new forms to fill from scratch — we pulled this from what you already have. Just look it over and Save.
              </p>
            ) : null}
          </div>

          {!running ? (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={onToggleCollapse}
                className="rounded-full px-2 py-1 text-[13px] text-ink-soft underline-offset-2 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15"
              >
                hide
              </button>
              <button
                type="button"
                aria-label="Dismiss import summary"
                onClick={onDismiss}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-sand-deep/60 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15"
              >
                ×
              </button>
            </div>
          ) : null}
        </div>

        {/* Reading: a gentle indeterminate track */}
        {running ? (
          <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-rule/60">
            <div className="h-full w-1/3 rounded-full bg-teal/70 motion-safe:animate-pulse" />
          </div>
        ) : null}

        {/* Source rows */}
        {view.sources.length ? (
          <ul className="mt-3 flex flex-col gap-1">
            {view.sources.map((s) => (
              <SourceRow key={s.id} source={s} reading={running} />
            ))}
          </ul>
        ) : null}

        {/* Extras we found but have no field for yet */}
        {!running && view.extras.length ? (
          <p className="mt-3 text-[13px] leading-[1.5] text-ink-muted">
            We also found{" "}
            {view.extras.map((e, i) => (
              <span key={`${e.label}-${i}`}>
                {i > 0 ? ", " : ""}
                <span className="text-ink-soft">{e.label.toLowerCase()}</span>
                {e.value && e.value !== "found" ? ` (${e.value})` : ""}
              </span>
            ))}
            . You can add {view.extras.length > 1 ? "those" : "that"} below.
          </p>
        ) : null}

        {/* Unmapped focus areas → nudge */}
        {!running && view.unmapped.length ? (
          <p className="mt-2 text-[13px] leading-[1.5] text-ink-muted">
            A few focus areas didn&rsquo;t map to a category — {view.unmapped.slice(0, 5).join(", ")}. Pick the closest under “Areas of focus.”
          </p>
        ) : null}

        {/* Paste nudge on partial/failed */}
        {!running && (view.phase === "partial" || view.phase === "failed") && onPasteFocus ? (
          <button
            type="button"
            onClick={onPasteFocus}
            className="mt-3 text-[13px] text-teal underline underline-offset-2 hover:text-ocean focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15 rounded"
          >
            Paste your bio instead →
          </button>
        ) : null}
      </div>
    </div>
  );
}

function SourceRow({ source, reading }: { source: ImportSourceSummary; reading: boolean }) {
  if (reading) {
    return (
      <li className="flex items-center gap-3 py-1 text-[14px] text-ink-soft">
        <span aria-hidden className="inline-block h-2 w-2 shrink-0 rounded-full bg-teal motion-safe:animate-pulse" />
        <span className="text-charcoal">Reading {source.label}</span>
        <span className="text-ink-muted">…</span>
      </li>
    );
  }
  if (!source.ok) {
    return (
      <li className="flex items-start gap-3 py-1 text-[14px] text-ink-soft">
        <span aria-hidden className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-rule-strong/40" />
        <span>
          <span className="text-charcoal">{source.label}</span>
          <span className="text-ink-muted"> — couldn&rsquo;t reach it</span>
        </span>
      </li>
    );
  }
  return (
    <li className="flex items-start gap-3 py-1 text-[14px] text-charcoal">
      <span aria-hidden className="mt-0.5 shrink-0 text-teal">✓</span>
      <span className="min-w-0">
        <span className="font-medium">{source.label}</span>
        {source.contributed.length ? (
          <span className="text-ink-muted">
            {" — "}
            {source.contributed.slice(0, 4).join(", ")}
            {source.contributed.length > 4 ? `, +${source.contributed.length - 4} more` : ""}
          </span>
        ) : (
          <span className="text-ink-muted"> — read</span>
        )}
      </span>
    </li>
  );
}
