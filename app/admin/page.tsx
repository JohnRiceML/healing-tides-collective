import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/app/_components/ui";
import { requireAdmin } from "@/lib/auth";

import { getAdminPractitioners, getAdminStats } from "./_data";
import { BadgeEditor } from "./BadgeEditor";

export const metadata: Metadata = {
  title: "Admin — Healing Tides Collective",
  robots: { index: false, follow: false },
};

// Auth-gated + reads the DB per request.
export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; className: string }> = {
  PUBLISHED: { label: "Published", className: "bg-teal/15 text-teal" },
  DRAFT: { label: "Draft", className: "bg-charcoal/5 text-ink-muted" },
  HIDDEN: { label: "Hidden", className: "bg-charcoal/5 text-ink-muted" },
  NEEDS_REVIEW: { label: "Needs review", className: "bg-ocean/10 text-ocean" },
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-rule bg-white px-5 py-4">
      <div className="font-display text-[28px] leading-none text-charcoal">{value}</div>
      <div className="meta mt-2 text-ink-muted">{label}</div>
    </div>
  );
}

export default async function AdminPage() {
  // Gate: only ADMIN users. Everyone else (signed-out or not admin) gets a 404,
  // which also keeps the route's existence hidden.
  const admin = await requireAdmin();
  if (!admin) notFound();

  const [stats, rows] = await Promise.all([getAdminStats(), getAdminPractitioners()]);

  return (
    <main id="main-content" className="min-h-screen bg-sand text-charcoal">
      <Container size="wide" className="py-14 md:py-20">
        <p className="meta text-ink-muted">Admin</p>
        <h1 className="font-display mt-3 text-[clamp(28px,5vw,44px)] font-light tracking-[-0.02em]">
          Practitioners
        </h1>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Total" value={stats.total} />
          <Stat label="Published" value={stats.published} />
          <Stat label="Drafts" value={stats.draft} />
          <Stat label="Total views" value={stats.totalViews} />
        </div>

        {rows.length === 0 ? (
          <p className="mt-12 text-[15px] text-ink-soft">No practitioners yet.</p>
        ) : (
          <div className="mt-10 overflow-x-auto rounded-2xl border border-rule bg-white">
            <table className="w-full min-w-[920px] text-left text-[14px]">
              <thead className="border-b border-rule text-ink-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Complete</th>
                  <th className="px-5 py-3 font-medium">Views</th>
                  <th className="px-5 py-3 font-medium">Updated</th>
                  <th className="px-5 py-3 font-medium">Verification</th>
                  <th className="px-5 py-3 font-medium" aria-label="actions" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
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
                          <div className="text-[13px] text-ink-muted">{r.email}</div>
                        ) : null}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-[12px] ${s.className}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-ink-soft">{r.completeness}%</td>
                      <td className="px-5 py-3 text-ink-soft">{r.viewCount}</td>
                      <td className="px-5 py-3 text-ink-muted">
                        {r.updatedAt.toISOString().slice(0, 10)}
                      </td>
                      <td className="px-5 py-3">
                        <BadgeEditor practitionerId={r.id} current={r.verificationBadges} />
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

        <p className="mt-8 text-[13px] text-ink-muted">
          Verification badges are editable here — toggle to grant or remove; changes show on the
          public profile right away. Founding Member is automatic. Managing status, featuring, and
          invites comes next.
        </p>
      </Container>
    </main>
  );
}
