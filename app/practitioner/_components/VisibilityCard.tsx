"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/app/_components/ui";
import type { Coverage, MapPack, TermCoverage } from "@/lib/visibility";
import { describeDelta, type PresenceDelta, type PresenceScan } from "@/lib/presence-scan";
import { getTermMapPack, runVisibilityAudit } from "../visibility-actions";

type AuditResult =
  | { ok: true; coverage: Coverage; scan: PresenceScan; delta: PresenceDelta }
  | { ok: false; reason: "unauthenticated" | "not_practitioner" | "no_region" | "unconfigured" };

type MapPackState =
  | { status: "looking" }
  | { status: "ready"; mapPack: MapPack }
  | { status: "error" };

const REASON_COPY: Record<string, string> = {
  no_region: "Add your location to your profile, then we can check how you show up locally.",
  unconfigured: "Visibility checks aren't switched on yet — check back soon.",
  not_practitioner: "Set up your practitioner profile first.",
  unauthenticated: "Please sign in again.",
};

/** Where the seeker found them, in calm prose. */
function viaLabel(via: TermCoverage["via"]): string {
  if (via === "website") return "your website";
  if (via === "profile") return "your Healing Tides page";
  return "your Healing Tides page";
}

/** A filled teal dot for "you appear", a hollow rule-ring for "not yet". */
function Glyph({ found, className = "" }: { found: boolean; className?: string }) {
  return found ? (
    <span
      aria-hidden
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-teal ${className}`}
    />
  ) : (
    <span
      aria-hidden
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full border-[1.5px] border-rule ${className}`}
    />
  );
}

export function VisibilityCard({ lastCheckedLabel }: { lastCheckedLabel?: string }) {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function run() {
    start(async () => {
      const next = (await runVisibilityAudit()) as AuditResult;
      setResult(next);
      // A scan caches its result server-side; refresh so the brand page's moon states
      // (server-rendered above this card) reflect the new reading right away.
      if (next.ok) router.refresh();
    });
  }

  // What opened up since the last cached scan — gain-framed, only after a fresh run.
  const deltaLine = result?.ok ? describeDelta(result.delta) : null;

  return (
    <section className="rounded-2xl border border-rule/70 bg-white p-6">
      <p className="meta text-ink-muted">How you show up on Google</p>
      <p className="mt-2 max-w-prose text-[14.5px] leading-[1.6] text-ink-soft">
        When someone nearby searches for the kind of care you offer, do you appear? We check
        a few real searches for your specialty in your area.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <Button type="button" onClick={run} disabled={pending}>
          {pending ? "Checking…" : result?.ok || lastCheckedLabel ? "Check again" : "Check my visibility"}
        </Button>
        {!result && lastCheckedLabel ? (
          <span className="text-[12.5px] text-ink-muted">Last checked {lastCheckedLabel}</span>
        ) : null}
      </div>

      {deltaLine ? (
        <p className="mt-3 text-[13.5px] leading-[1.5] text-ocean">{deltaLine}</p>
      ) : null}

      {result && !result.ok ? (
        <p className="mt-4 text-[14px] leading-[1.6] text-ink-soft">
          {REASON_COPY[result.reason] ?? "Couldn't run the check — please try again."}
        </p>
      ) : null}

      {result?.ok ? <CoverageMap coverage={result.coverage} /> : null}
    </section>
  );
}

function CoverageMap({ coverage }: { coverage: Coverage }) {
  const { terms, appeared, total, questions, relatedSearches } = coverage;

  return (
    <div className="mt-6">
      {/* 1) Overview ----------------------------------------------------- */}
      <div className="rounded-xl border border-rule/70 bg-seafoam/30 p-5">
        <p className="text-[15px] leading-[1.55] text-charcoal">
          You&rsquo;re showing up for{" "}
          <span className="font-medium text-ocean">
            {appeared} of {total}
          </span>{" "}
          searches we checked — and there&rsquo;s room for more.
        </p>
        <div
          className="mt-4 flex flex-wrap items-center gap-2"
          role="img"
          aria-label={`Appearing in ${appeared} of ${total} searches`}
        >
          {terms.map((t) => (
            <Glyph key={`dot-${t.query}`} found={t.found} className="h-3 w-3" />
          ))}
        </div>
      </div>

      {/* 2) Coverage rows (appear-first; order comes from the action) ---- */}
      <ul className="mt-5 space-y-px overflow-hidden rounded-xl border border-rule/70">
        {terms.map((t) => (
          <CoverageRow key={t.query} term={t} />
        ))}
      </ul>

      {/* 3) Demand panels (hidden when empty) --------------------------- */}
      {questions.length ? (
        <div className="mt-5 rounded-xl border border-rule/70 bg-sand/40 p-5">
          <p className="meta text-ink-muted">Questions your people are asking</p>
          <ul className="mt-3 space-y-2">
            {questions.map((q) => (
              <li
                key={q}
                className="flex items-start gap-2.5 text-[13.5px] leading-[1.5] text-ink-soft"
              >
                <span
                  aria-hidden
                  className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-sage"
                />
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {relatedSearches.length ? (
        <div className="mt-4 rounded-xl border border-rule/70 bg-sand/40 p-5">
          <p className="meta text-ink-muted">Words seekers use for care like yours</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {relatedSearches.map((w) => (
              <span
                key={w}
                className="inline-flex items-center rounded-full border border-rule/80 bg-white px-3 py-1.5 text-[12.5px] leading-none text-ink-soft"
              >
                {w}
              </span>
            ))}
          </div>
          <p className="mt-3 max-w-prose text-[12.5px] leading-[1.55] text-ink-muted">
            Search engines quietly match what a seeker types with the words on your page — so when your
            bio naturally uses the same language, the right people are more likely to find you.
          </p>
        </div>
      ) : null}
    </div>
  );
}

/**
 * One coverage term row, with calm per-row disclosure of the local Google map.
 * The map pack is fetched lazily — only when this row is first expanded — via a
 * per-row transition. State is held in a Record keyed by the term's query so a
 * fetched pack persists if the row is collapsed and reopened.
 */
function CoverageRow({ term: t }: { term: TermCoverage }) {
  const [open, setOpen] = useState(false);
  const [packs, setPacks] = useState<Record<string, MapPackState>>({});
  const [pending, start] = useTransition();

  const pack = packs[t.query];

  function toggle() {
    const next = !open;
    setOpen(next);
    // Fetch once, the first time this row opens. Re-opens reuse the cached pack.
    if (next && !pack) {
      setPacks((prev) => ({ ...prev, [t.query]: { status: "looking" } }));
      start(async () => {
        const res = await getTermMapPack(t.query);
        setPacks((prev) => ({
          ...prev,
          [t.query]: res.ok
            ? { status: "ready", mapPack: res.mapPack }
            : { status: "error" },
        }));
      });
    }
  }

  const panelId = `mappack-${t.query.replace(/\W+/g, "-")}`;

  return (
    <li className="bg-white px-4 py-3.5 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-rule/60">
      <div className="flex items-start gap-3.5">
        <Glyph found={t.found} className="mt-[7px]" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-[16px] leading-[1.3] tracking-[-0.01em] text-charcoal">
            {t.label}
          </p>
          {t.found ? (
            <p className="mt-1 text-[13.5px] leading-[1.5] text-teal">
              You&rsquo;re here{t.position ? ` — result #${t.position}` : ""}, via {viaLabel(t.via)}.
            </p>
          ) : (
            <>
              <p className="mt-1 text-[13.5px] leading-[1.5] text-ocean">
                Not on the first page yet — an open door.
              </p>
              {t.competitors.length ? (
                <p className="mt-1 text-[12.5px] leading-[1.5] text-ink-muted">
                  A seeker also sees {t.competitors.join(" · ")}.
                </p>
              ) : null}
            </>
          )}

          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls={panelId}
            className="mt-2 inline-flex items-center gap-1 text-[12.5px] leading-none text-ink-muted underline-offset-2 transition-colors hover:text-ocean hover:underline"
          >
            {open ? "hide the local map" : "view the local map"}
            <span aria-hidden>{open ? "↑" : "→"}</span>
          </button>
        </div>
      </div>

      {open ? (
        <div id={panelId} className="mt-3 pl-[26px]">
          {!pack || pack.status === "looking" || pending ? (
            <p className="text-[12.5px] leading-[1.5] text-ink-muted">looking…</p>
          ) : pack.status === "error" ? (
            <p className="text-[12.5px] leading-[1.5] text-ink-muted">
              Couldn&rsquo;t load the local map just now — try again in a moment.
            </p>
          ) : (
            <TermMapPack mapPack={pack.mapPack} />
          )}
        </div>
      ) : null}
    </li>
  );
}

/**
 * The local Google map pack as calm terrain — never a podium. Plain rows: each
 * practice's name (font-display) over a quiet category + reviews fact. The
 * practitioner's own row gets a soft seafoam wash and a "You" pill. When they're
 * not on the map, a calm GBP footer. Reviews are framed once, at section level.
 */
function TermMapPack({ mapPack }: { mapPack: MapPack }) {
  const { entries, youInPack } = mapPack;

  if (!entries.length) {
    return (
      <p className="text-[12.5px] leading-[1.5] text-ink-muted">
        No local map showed up for this search yet.
      </p>
    );
  }

  return (
    <div>
      <p className="text-[12px] leading-[1.5] text-ink-muted">
        Reviews are simply how Google learns a practitioner is trusted nearby — not a scoreboard.
      </p>

      <ul className="mt-3 space-y-px overflow-hidden rounded-lg border border-rule/60">
        {entries.map((e, i) => {
          const reviews =
            e.ratingCount != null && e.rating != null
              ? `${e.ratingCount} review${e.ratingCount === 1 ? "" : "s"} · ${e.rating}`
              : e.rating != null
                ? `${e.rating}`
                : null;
          const fact = [e.category, reviews].filter(Boolean).join(" · ");
          return (
            <li
              key={`${e.title}-${i}`}
              className={`flex items-start justify-between gap-3 px-3.5 py-2.5 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-rule/50 ${
                e.isYou ? "bg-seafoam/30" : "bg-white"
              }`}
            >
              <div className="min-w-0">
                <p className="font-display text-[15px] leading-[1.3] tracking-[-0.01em] text-charcoal">
                  {e.title}
                </p>
                {fact ? (
                  <p className="mt-0.5 text-[12px] leading-[1.5] text-ink-muted">{fact}</p>
                ) : null}
              </div>
              {e.isYou ? (
                <span className="mt-0.5 inline-flex shrink-0 items-center rounded-full bg-teal px-2 py-0.5 text-[11px] font-medium leading-none text-white">
                  You
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>

      {!youInPack ? (
        <p className="mt-3 text-[12.5px] leading-[1.55] text-ink-soft">
          You&rsquo;re not on the local map for this one yet. A free Google Business Profile is
          what puts practitioners here — it&rsquo;s the single most useful step, and we can point
          you to it.
        </p>
      ) : null}
    </div>
  );
}
