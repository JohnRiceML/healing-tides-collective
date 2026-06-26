"use client";

import { useMemo, useState, useTransition } from "react";

import { FEEDBACK_STATUSES, feedbackStatusLabel, kindLabel, roleLabel } from "@/lib/feedback";
import { setFeedbackStatus } from "./actions";
import type { AdminFeedbackRow } from "./_data";

const STATUS_CHIP: Record<string, string> = {
  NEW: "bg-sage/25 text-ocean",
  TRIAGED: "bg-charcoal/5 text-ink-muted",
  PLANNED: "bg-charcoal/5 text-ink-muted",
  FIXED: "bg-teal/15 text-teal",
  WONT_FIX: "bg-ocean/10 text-ocean",
};

function FeedbackItem({ row }: { row: AdminFeedbackRow }) {
  const [status, setStatus] = useState(row.status);
  const [note, setNote] = useState(row.adminNote ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function save() {
    setError(null);
    setSaved(false);
    start(async () => {
      const res = await setFeedbackStatus(row.id, { status, adminNote: note });
      if (res.ok) setSaved(true);
      else setError(res.error);
    });
  }

  return (
    <li className="rounded-xl border border-rule/70 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2 text-[12px]">
        <span className="rounded-full bg-sand px-2.5 py-0.5 text-ink-soft">{kindLabel(row.kind)}</span>
        <span className="rounded-full bg-charcoal/5 px-2.5 py-0.5 text-ink-muted">{roleLabel(row.role)}</span>
        <span className={`rounded-full px-2.5 py-0.5 ${STATUS_CHIP[status] ?? "bg-charcoal/5 text-ink-muted"}`}>
          {feedbackStatusLabel(status)}
        </span>
        <span className="text-ink-muted">{row.createdAt.toISOString().slice(0, 10)}</span>
        {row.path ? <span className="text-ink-muted">· {row.path}</span> : null}
      </div>

      <p className="mt-2 whitespace-pre-wrap text-[14px] leading-[1.6] text-charcoal">{row.message}</p>
      {row.email ? (
        <a href={`mailto:${row.email}`} className="mt-1 inline-block text-[13px] text-teal underline-offset-2 hover:underline">
          {row.email}
        </a>
      ) : null}
      {row.screenshotUrl ? (
        <a href={row.screenshotUrl} target="_blank" rel="noreferrer" className="mt-2 block w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={row.screenshotUrl} alt="Attached screenshot" className="max-h-36 rounded-lg border border-rule" />
        </a>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Status"
          className="h-9 rounded-full border border-rule bg-white px-3 text-[13px] text-charcoal focus:border-teal focus:outline-none"
        >
          {FEEDBACK_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note — what we did / will do"
          aria-label="Triage note"
          className="h-9 min-w-[180px] flex-1 rounded-full border border-rule bg-white px-3 text-[13px] text-charcoal placeholder:text-ink-muted focus:border-teal focus:outline-none"
        />
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-full bg-charcoal px-3 py-1.5 text-[13px] text-white hover:bg-charcoal/90 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {saved ? <span className="text-[12px] text-teal">Saved ✓</span> : null}
        {error ? <span className="text-[12px] text-ocean">{error}</span> : null}
      </div>
    </li>
  );
}

export function FeedbackList({ rows }: { rows: AdminFeedbackRow[] }) {
  const [filter, setFilter] = useState("all");
  const filtered = useMemo(() => (filter === "all" ? rows : rows.filter((r) => r.status === filter)), [rows, filter]);
  const FILTERS = [{ id: "all", label: "All" }, ...FEEDBACK_STATUSES.map((s) => ({ id: s.value, label: s.label }))];

  if (rows.length === 0) {
    return (
      <p className="mt-8 text-[15px] text-ink-soft">
        No feedback yet — it&rsquo;ll appear here as people use the widget on the site.
      </p>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3 py-1.5 text-[13px] ${
              filter === f.id ? "bg-charcoal text-white" : "border border-rule text-ink-soft hover:bg-sand/60"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-[13px] text-ink-muted">
          {filtered.length} of {rows.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-[15px] text-ink-soft">Nothing with that status.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {filtered.map((r) => (
            <FeedbackItem key={r.id} row={r} />
          ))}
        </ul>
      )}
    </div>
  );
}
