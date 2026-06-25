"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { classifyActivity, relativeShort, type ActivityState } from "@/app/_lib/activity";
import { BadgeEditor } from "./BadgeEditor";
import { HoldControl } from "./HoldControl";
import type { AdminPractitionerRow } from "./_data";

const STATUS: Record<string, { label: string; className: string }> = {
  PUBLISHED: { label: "Published", className: "bg-teal/15 text-teal" },
  DRAFT: { label: "Draft", className: "bg-charcoal/5 text-ink-muted" },
  HIDDEN: { label: "On hold", className: "bg-ocean/10 text-ocean" },
  NEEDS_REVIEW: { label: "Needs review", className: "bg-sage/25 text-ocean" },
};

const FILTERS: { id: string; label: string }[] = [
  { id: "all", label: "All" },
  { id: "PUBLISHED", label: "Published" },
  { id: "DRAFT", label: "Drafts" },
  { id: "HIDDEN", label: "On hold" },
  { id: "NEEDS_REVIEW", label: "Needs review" },
];

// Calm chips for the engagement read — no red anywhere (brand line). "Dormant" uses a
// soft ocean to invite a gentle nudge, never to alarm.
const ACTIVITY_CHIP: Record<ActivityState, string> = {
  new: "bg-sage/30 text-ocean",
  active: "bg-teal/15 text-teal",
  quiet: "bg-charcoal/5 text-ink-muted",
  dormant: "bg-ocean/10 text-ocean",
};

type SortKey = "name" | "activity" | "complete" | "views";
type SortDir = "asc" | "desc";

/** Row + its derived activity, so we can sort/render without recomputing. */
type DerivedRow = AdminPractitionerRow & { activityLabel: string; activityState: ActivityState; lastSignalAt: Date };

function SortHeader({
  label,
  col,
  sort,
  onSort,
  className = "",
}: {
  label: string;
  col: SortKey;
  sort: { key: SortKey; dir: SortDir };
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const active = sort.key === col;
  return (
    <th className={`px-5 py-3 font-medium ${className}`}>
      <button
        type="button"
        onClick={() => onSort(col)}
        className={`inline-flex items-center gap-1 ${active ? "text-charcoal" : "hover:text-charcoal"}`}
        aria-label={`Sort by ${label}`}
      >
        {label}
        <span className="text-[10px] leading-none">{active ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}</span>
      </button>
    </th>
  );
}

export function PractitionersTable({ rows, now }: { rows: AdminPractitionerRow[]; now: Date }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "activity", dir: "desc" });

  const onSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "name" ? "asc" : "desc" }));

  const derived: DerivedRow[] = useMemo(
    () =>
      rows.map((r) => {
        const a = classifyActivity({ createdAt: r.createdAt, updatedAt: r.updatedAt, lastSeenAt: r.lastSeenAt, now });
        return { ...r, activityLabel: a.label, activityState: a.state, lastSignalAt: a.lastSignalAt };
      }),
    [rows, now],
  );

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = derived.filter((r) => {
      if (status !== "all" && r.visibility !== status) return false;
      if (!needle) return true;
      return (r.displayName ?? "").toLowerCase().includes(needle) || (r.email ?? "").toLowerCase().includes(needle);
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sort.key) {
        case "name":
          cmp = (a.displayName ?? "").localeCompare(b.displayName ?? "");
          break;
        case "complete":
          cmp = a.completeness - b.completeness;
          break;
        case "views":
          cmp = a.views30 - b.views30;
          break;
        case "activity":
          cmp = a.lastSignalAt.getTime() - b.lastSignalAt.getTime();
          break;
      }
      return cmp * dir;
    });
  }, [derived, q, status, sort]);

  if (rows.length === 0) {
    return <p className="mt-12 text-[15px] text-ink-soft">No practitioners yet.</p>;
  }

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or email…"
          aria-label="Search practitioners"
          className="h-10 w-full max-w-xs rounded-full border border-rule bg-white px-4 text-[14px] text-charcoal placeholder:text-ink-muted focus:border-teal focus:outline-none sm:w-72"
        />
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatus(f.id)}
              className={`rounded-full px-3 py-1.5 text-[13px] ${
                status === f.id ? "bg-charcoal text-white" : "border border-rule text-ink-soft hover:bg-sand/60"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[13px] text-ink-muted">
          {visible.length} of {rows.length}
        </span>
      </div>

      {visible.length === 0 ? (
        <p className="mt-8 text-[15px] text-ink-soft">No practitioners match that.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-rule bg-white">
          <table className="w-full min-w-[1080px] text-left text-[14px]">
            <thead className="border-b border-rule text-ink-muted">
              <tr>
                <SortHeader label="Name" col="name" sort={sort} onSort={onSort} />
                <th className="px-5 py-3 font-medium">Status</th>
                <SortHeader label="Activity" col="activity" sort={sort} onSort={onSort} />
                <SortHeader label="Complete" col="complete" sort={sort} onSort={onSort} />
                <SortHeader label="Views" col="views" sort={sort} onSort={onSort} />
                <th className="px-5 py-3 font-medium">Verification</th>
                <th className="px-5 py-3 font-medium">Visibility</th>
                <th className="px-5 py-3 font-medium" aria-label="actions" />
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => {
                const s = STATUS[r.visibility] ?? STATUS.DRAFT;
                return (
                  <tr key={r.id} className="border-b border-rule/60 last:border-0">
                    <td className="px-5 py-3">
                      <div className="font-medium text-charcoal">
                        {r.displayName ?? <span className="text-ink-muted">— no name —</span>}
                        {r.featured ? (
                          <span className="ml-2 text-teal" title="Featured" aria-label="featured">
                            ★
                          </span>
                        ) : null}
                      </div>
                      {r.email ? (
                        <a
                          href={`mailto:${r.email}`}
                          className="text-[13px] text-ink-muted underline-offset-2 hover:text-charcoal hover:underline"
                        >
                          {r.email}
                        </a>
                      ) : null}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[12px] ${s.className}`}>{s.label}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[12px] ${ACTIVITY_CHIP[r.activityState]}`}>
                        {r.activityLabel}
                      </span>
                      <div className="mt-1 text-[12px] text-ink-muted">{relativeShort(r.lastSignalAt, now)}</div>
                    </td>
                    <td className="px-5 py-3 text-ink-soft">{r.completeness}%</td>
                    <td className="px-5 py-3">
                      <div className="text-charcoal">
                        {r.views30}
                        <span className="text-ink-muted"> · 30d</span>
                      </div>
                      <div className="text-[12px] text-ink-muted">
                        {r.viewCount} total · seen {relativeShort(r.lastViewedAt, now)}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <BadgeEditor practitionerId={r.id} current={r.verificationBadges} />
                    </td>
                    <td className="px-5 py-3">
                      <HoldControl practitionerId={r.id} held={r.held} />
                    </td>
                    <td className="px-5 py-3">
                      {r.visibility === "PUBLISHED" && r.slug ? (
                        <Link
                          href={`/practitioners/${r.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="link-underline text-charcoal"
                        >
                          View →
                        </Link>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
