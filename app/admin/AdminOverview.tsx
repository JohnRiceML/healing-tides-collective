import Link from "next/link";

import type { AdminOverview as Overview } from "./overview";

function Metric({
  label,
  value,
  tone = "default",
  sub,
  href,
}: {
  label: string;
  value: number;
  tone?: "default" | "attention";
  sub?: string;
  href?: string;
}) {
  const attention = tone === "attention" && value > 0;
  const inner = (
    <>
      <div className={`font-display text-[28px] leading-none ${attention ? "text-teal" : "text-charcoal"}`}>{value}</div>
      <div className="meta mt-2 text-ink-muted">{label}</div>
      {sub ? <div className="mt-1 text-[12px] leading-[1.4] text-ink-muted">{sub}</div> : null}
    </>
  );
  const cls = `block rounded-2xl border px-5 py-4 ${
    attention ? "border-teal/40 bg-seafoam/30" : "border-rule bg-white"
  } ${href ? "transition-colors hover:border-teal/50" : ""}`;
  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

/** At-a-glance "health of the app" — practitioner side only (the Seeker half has no data
 *  until matching ships). Pure display; numbers are computed server-side in computeAdminOverview. */
export function AdminOverview({ overview }: { overview: Overview }) {
  const { practitioners: p, activity: a, traction: t, queue: q } = overview;
  return (
    <section className="mt-8">
      <p className="meta text-ink-muted">Practitioners</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Total" value={p.total} />
        <Metric label="Published" value={p.published} />
        <Metric label="Drafts" value={p.drafts} />
        <Metric label="On hold" value={p.onHold} />
      </div>

      <p className="meta mt-6 text-ink-muted">Activity &amp; reach</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Active" value={a.active} sub="edited / signed in ≤14d" />
        <Metric label="New" value={a.new} sub="joined ≤7d" />
        <Metric label="Dormant" value={a.dormant} sub="quiet 30d+" />
        <Metric label="Profile views (30d)" value={t.views30} sub={`${t.totalViews} all-time`} />
      </div>

      <p className="meta mt-6 text-ink-muted">Needs your attention</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Invites pending" value={q.invitesPending} tone="attention" href="/admin/practitioners" />
        <Metric label="Credentials to verify" value={q.credentialsToVerify} tone="attention" href="/admin/practitioners" />
        <Metric label="Due a nudge" value={q.dueReminders} tone="attention" href="/admin/practitioners" />
        <Metric label="On hold" value={q.onHold} tone="attention" href="/admin/practitioners" />
      </div>

      <Link
        href="/admin/seekers"
        className="mt-6 block rounded-2xl border border-dashed border-rule bg-sand/30 px-5 py-4 transition-colors hover:border-ink-muted/50"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="meta text-ink-muted">Seekers &amp; matching</p>
          <span className="text-[13px] text-ink-soft">View →</span>
        </div>
        <p className="mt-1 max-w-prose text-[14px] leading-[1.6] text-ink-soft">
          No data yet — seekers browse anonymously and &ldquo;Get matched&rdquo; emails you. Lights up with
          the matching build.
        </p>
      </Link>
    </section>
  );
}
