import Link from "next/link";

import type { AdminOverview as Overview, Insight } from "./overview";

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
      <div className={`font-display text-[30px] leading-none ${attention ? "text-teal" : "text-charcoal"}`}>{value}</div>
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

type Seg = { label: string; value: number; color: string };

function Bar({ segments }: { segments: Seg[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-rule/50">
        {total > 0
          ? segments.map((s) =>
              s.value > 0 ? <div key={s.label} className={s.color} style={{ width: `${(s.value / total) * 100}%` }} /> : null,
            )
          : null}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
        {segments.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-soft">
            <span className={`h-2 w-2 rounded-full ${s.color}`} />
            {s.label} <span className="font-medium text-charcoal">{s.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const TONE_DOT: Record<Insight["tone"], string> = { good: "bg-teal", neutral: "bg-sage", attention: "bg-ocean" };

function Insights({ items }: { items: Insight[] }) {
  return (
    <div className="rounded-2xl border border-rule bg-white p-5">
      <p className="meta text-ink-muted">Top-level insights</p>
      <ul className="mt-3 flex flex-col gap-2.5">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[14px] leading-[1.5] text-charcoal">
            <span className={`mt-[7px] h-2 w-2 shrink-0 rounded-full ${TONE_DOT[it.tone]}`} aria-hidden />
            <span>{it.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** At-a-glance "health of the app" dashboard — practitioner side only (the Seeker half has no
 *  data until matching ships). Pure display; all numbers + insights come from computeAdminOverview. */
export function AdminOverview({ overview }: { overview: Overview }) {
  const { practitioners: p, activity: a, traction: t, queue: q, insights } = overview;

  return (
    <div className="mt-8 space-y-8">
      {/* Headline */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Practitioners" value={p.total} sub={`${overview.publishedRate}% live`} />
        <Metric label="Published" value={p.published} />
        <Metric label="Active" value={a.active + a.new} sub="this month" />
        <Metric label="Profile views (30d)" value={t.views30} sub={`${t.totalViews} all-time`} />
      </div>

      {/* Insights + composition */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Insights items={insights} />
        <div className="rounded-2xl border border-rule bg-white p-5">
          <p className="meta text-ink-muted">Composition</p>
          <div className="mt-4">
            <p className="mb-2 text-[13px] text-ink-soft">Profile status</p>
            <Bar
              segments={[
                { label: "Published", value: p.published, color: "bg-teal" },
                { label: "Drafts", value: p.drafts, color: "bg-sage" },
                { label: "On hold", value: p.onHold, color: "bg-ocean" },
              ]}
            />
          </div>
          <div className="mt-5">
            <p className="mb-2 text-[13px] text-ink-soft">Engagement</p>
            <Bar
              segments={[
                { label: "Active", value: a.active, color: "bg-teal" },
                { label: "New", value: a.new, color: "bg-sage" },
                { label: "Quiet", value: a.quiet, color: "bg-charcoal/25" },
                { label: "Dormant", value: a.dormant, color: "bg-ocean" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Needs attention */}
      <div>
        <p className="meta text-ink-muted">Needs your attention</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Invites pending" value={q.invitesPending} tone="attention" href="/admin/practitioners" />
          <Metric label="Credentials to verify" value={q.credentialsToVerify} tone="attention" href="/admin/practitioners" />
          <Metric label="Due a nudge" value={q.dueReminders} tone="attention" href="/admin/practitioners" />
          <Metric label="On hold" value={q.onHold} tone="attention" href="/admin/practitioners" />
        </div>
      </div>

      {/* Seekers */}
      <Link
        href="/admin/seekers"
        className="block rounded-2xl border border-dashed border-rule bg-sand/30 px-5 py-4 transition-colors hover:border-ink-muted/50"
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
    </div>
  );
}
