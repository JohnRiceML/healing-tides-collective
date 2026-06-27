"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { INTAKE_STATUSES } from "@/lib/seeker-intake";
import { composeShortlistEmail } from "@/lib/shortlist-email";
import type { CandidateRelevance } from "@/lib/match-candidates";
import type { WorkspaceMatch } from "../_data";
import {
  addToShortlist,
  removeFromShortlist,
  setMatchReason,
  setIntakeStatus,
  sendShortlist,
  markShortlistSent,
} from "../actions";

export type CandidateVM = {
  id: string;
  displayName: string;
  slug: string;
  title: string | null;
  bio: string | null;
  values: string | null;
  credentials: string[];
  relevance: CandidateRelevance;
};

function Chip({ fact }: { fact: { label: string; hit: boolean; soft?: boolean } }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] ${
        fact.hit ? "bg-seafoam/60 text-ocean" : "bg-charcoal/[0.04] text-ink-muted line-through decoration-rule"
      }`}
      title={fact.soft ? "Approximate match (free-text field)" : undefined}
    >
      {fact.hit ? "✓" : "·"} {fact.label}
      {fact.soft ? <span className="opacity-60">~</span> : null}
    </span>
  );
}

export function MatchingPanel({
  intakeId,
  status,
  matches,
  candidates,
  seekerName,
  seekerEmail,
}: {
  intakeId: string;
  status: string;
  matches: WorkspaceMatch[];
  candidates: CandidateVM[];
  seekerName: string;
  seekerEmail: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState<Record<string, string>>({}); // per-match reason overrides
  const [error, setError] = useState<string | null>(null);
  const [sendFallback, setSendFallback] = useState(false); // email not configured → show mailto + "mark sent"

  // The shortlist email (used for the mailto fallback Nora sends from her own inbox).
  const composed = useMemo(
    () =>
      composeShortlistEmail({
        seekerName,
        seekerEmail,
        picks: matches.map((m) => ({ displayName: m.displayName, slug: m.slug, reason: m.reason })),
      }),
    [seekerName, seekerEmail, matches],
  );

  // "Send shortlist": try Resend; on success the status flips to Matched. If email isn't
  // configured, reveal the prefilled mailto + a "Mark as sent" confirmation.
  const handleSend = () =>
    start(async () => {
      setError(null);
      let res: Awaited<ReturnType<typeof sendShortlist>>;
      try {
        res = await sendShortlist(intakeId);
      } catch {
        setError("Couldn't send just now — try again, or email it yourself below.");
        return;
      }
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (res.delivered) {
        setSendFallback(false);
        router.refresh();
      } else {
        // Email isn't wired — open Nora's mail client with everything prefilled.
        setSendFallback(true);
        if (typeof window !== "undefined") window.location.href = composed.mailto;
      }
    });

  const shortlisted = useMemo(() => new Set(matches.map((m) => m.practitionerId)), [matches]);

  // Forget a per-match draft so the textarea falls back to the authoritative (server-cleaned)
  // m.reason after refresh — keeps "Save note" from lingering and stops stale text from
  // resurfacing on a remove → re-add.
  const clearDraft = (id: string) => setDraft(({ [id]: _omit, ...rest }) => rest);

  // Run a server action, surface its {ok:false} error (and transport errors), and only
  // refresh + run post-success cleanup when it actually succeeded.
  const run = (fn: () => Promise<unknown>, onSuccess?: () => void) =>
    start(async () => {
      setError(null);
      let res: unknown;
      try {
        res = await fn();
      } catch {
        setError("Something went wrong — please try again.");
        return;
      }
      if (res && typeof res === "object" && "ok" in res && (res as { ok: boolean }).ok === false) {
        setError((res as { error?: string }).error ?? "Something went wrong.");
        return; // keep the admin's input; don't refresh away a failed edit
      }
      onSuccess?.();
      router.refresh();
    });

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return candidates;
    return candidates.filter((c) => {
      const hay = [
        c.displayName,
        c.title ?? "",
        c.bio ?? "",
        c.values ?? "",
        c.credentials.join(" "),
        c.relevance.facts.map((f) => f.label).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [candidates, q]);

  return (
    <div>
      {/* Status lifecycle */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[13px] text-ink-muted">Status:</span>
        {INTAKE_STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            disabled={pending}
            aria-pressed={s.value === status}
            onClick={() => s.value !== status && run(() => setIntakeStatus(intakeId, s.value))}
            className={`rounded-full px-3 py-1 text-[13px] transition ${
              s.value === status
                ? "bg-teal text-white"
                : "bg-white text-ink-soft ring-1 ring-rule hover:ring-teal/40 disabled:opacity-50"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {error ? (
        <p role="alert" className="mt-3 rounded-lg border border-clay/40 bg-clay/[0.08] px-3 py-2 text-[13px] text-clay">
          {error}
        </p>
      ) : null}

      {/* Shortlist */}
      <section className="mt-8">
        <h2 className="font-display text-[20px] font-light text-charcoal">
          Shortlist {matches.length > 0 ? <span className="text-ink-muted">({matches.length})</span> : null}
        </h2>
        {matches.length === 0 ? (
          <p className="mt-2 text-[14px] text-ink-soft">
            Nothing here yet — add practitioners from the candidates below, each with a note on why you thought of them.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {matches.map((m) => {
              const reason = draft[m.practitionerId] ?? m.reason ?? "";
              const dirty = draft[m.practitionerId] !== undefined && (draft[m.practitionerId] ?? "") !== (m.reason ?? "");
              return (
                <li key={m.practitionerId} className="rounded-2xl border border-teal/30 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      href={`/practitioners/${m.slug}`}
                      target="_blank"
                      className="font-medium text-charcoal underline-offset-2 hover:underline"
                    >
                      {m.displayName ?? "—"}
                    </Link>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => run(() => removeFromShortlist(intakeId, m.practitionerId), () => clearDraft(m.practitionerId))}
                      className="text-[12px] text-ink-muted underline-offset-2 hover:text-clay hover:underline disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    value={reason}
                    onChange={(e) => setDraft((d) => ({ ...d, [m.practitionerId]: e.target.value }))}
                    placeholder="Why I thought of them for this person…"
                    aria-label={`Why ${m.displayName ?? "this practitioner"} for this seeker`}
                    rows={2}
                    className="mt-2 w-full resize-y rounded-lg border border-rule bg-sand/40 p-2.5 text-[14px] text-charcoal placeholder:text-ink-muted focus:border-teal focus:outline-none"
                  />
                  {dirty ? (
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => run(() => setMatchReason(intakeId, m.practitionerId, reason), () => clearDraft(m.practitionerId))}
                        className="rounded-full bg-teal px-3 py-1 text-[13px] text-white hover:bg-teal/90 disabled:opacity-50"
                      >
                        Save note
                      </button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
        {matches.length > 0 ? (
          status === "MATCHED" ? (
            <div className="mt-4 rounded-xl border border-teal/30 bg-seafoam/20 px-3.5 py-2.5 text-[13px] text-ocean">
              Sent to {seekerName}. You can re-send if you revise the shortlist.
              <a href={composed.mailto} className="ml-2 text-teal underline-offset-2 hover:underline">
                Re-open email
              </a>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={pending}
                  onClick={handleSend}
                  className="rounded-full bg-ocean px-4 py-1.5 text-[13px] text-white hover:bg-ocean/90 disabled:opacity-50"
                >
                  ✉️ Send shortlist to {seekerName}
                </button>
                <a href={composed.mailto} className="text-[12px] text-ink-muted underline-offset-2 hover:text-teal hover:underline">
                  Preview / compose it yourself
                </a>
              </div>
              {sendFallback ? (
                <p className="text-[12px] text-ink-soft">
                  Email isn&rsquo;t auto-sending yet, so I opened it in your mail app. Once you&rsquo;ve sent it,{" "}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => markShortlistSent(intakeId))}
                    className="text-teal underline-offset-2 hover:underline disabled:opacity-50"
                  >
                    mark it as sent
                  </button>
                  .
                </p>
              ) : null}
            </div>
          )
        ) : null}
      </section>

      {/* Candidates */}
      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-[20px] font-light text-charcoal">Candidates</h2>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by name, focus, words…"
            aria-label="Filter candidates by name, focus, or words"
            className="w-56 rounded-full border border-rule bg-white px-3.5 py-1.5 text-[13px] text-charcoal placeholder:text-ink-muted focus:border-teal focus:outline-none"
          />
        </div>

        {candidates.length === 0 ? (
          <p className="mt-3 text-[14px] text-ink-soft">
            No published practitioners yet — they&rsquo;ll appear here as profiles go live.
          </p>
        ) : (
          <p className="mt-1 text-[12px] text-ink-muted">
            Ordered by how many of the seeker&rsquo;s stated needs each one meets — a reading aid, not a score. The
            profile below each name carries the rest (approach, experience, style) for you to weigh.
          </p>
        )}

        <ul className="mt-4 flex flex-col gap-3">
          {filtered.map((c) => {
            const on = shortlisted.has(c.id);
            return (
              <li key={c.id} className={`rounded-2xl border p-4 ${on ? "border-teal/30 bg-seafoam/10" : "border-rule bg-white"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/practitioners/${c.slug}`}
                      target="_blank"
                      className="font-medium text-charcoal underline-offset-2 hover:underline"
                    >
                      {c.displayName}
                    </Link>
                    {c.title ? <p className="text-[13px] text-ink-soft">{c.title}</p> : null}
                  </div>
                  <button
                    type="button"
                    disabled={pending || on}
                    aria-pressed={on}
                    onClick={() => run(() => addToShortlist(intakeId, c.id))}
                    className={`shrink-0 rounded-full px-3 py-1 text-[13px] transition ${
                      on
                        ? "bg-seafoam/60 text-ocean"
                        : "bg-teal text-white hover:bg-teal/90 disabled:opacity-50"
                    }`}
                  >
                    {on ? "On shortlist ✓" : "Add to shortlist"}
                  </button>
                </div>

                {c.relevance.facts.length > 0 ? (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {c.relevance.facts.map((f, i) => (
                      <Chip key={i} fact={f} />
                    ))}
                  </div>
                ) : null}

                {c.relevance.notAcceptingNew ? (
                  <p className="mt-2 text-[12px] text-clay">Not currently accepting new clients — confirm before sending.</p>
                ) : null}

                {c.bio ? <p className="mt-3 line-clamp-3 text-[13px] leading-[1.6] text-ink-soft">{c.bio}</p> : null}

                {c.credentials.length > 0 ? (
                  <p className="mt-2 flex flex-wrap gap-1.5 text-[12px] text-ink-muted">
                    {c.credentials.slice(0, 8).map((cr, i) => (
                      <span key={i} className="rounded-full bg-sand px-2 py-0.5">
                        {cr}
                      </span>
                    ))}
                  </p>
                ) : null}

                {c.values ? (
                  <p className="mt-2 line-clamp-2 text-[12px] italic leading-[1.6] text-ink-muted">{c.values}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
