import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/app/_components/ui";
import { requireAdmin } from "@/lib/auth";

import { getAdminInvites, getAdminPractitioners, getAdminStats } from "./_data";
import { BadgeEditor } from "./BadgeEditor";
import { HoldControl } from "./HoldControl";
import { InviteCreator } from "./InviteCreator";
import { InvitesList } from "./InvitesList";

export const metadata: Metadata = {
  title: "Admin — Healing Tides Collective",
  robots: { index: false, follow: false },
};

// Auth-gated + reads the DB per request.
export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; className: string }> = {
  PUBLISHED: { label: "Published", className: "bg-teal/15 text-teal" },
  DRAFT: { label: "Draft", className: "bg-charcoal/5 text-ink-muted" },
  HIDDEN: { label: "On hold", className: "bg-ocean/10 text-ocean" },
  NEEDS_REVIEW: { label: "Needs review", className: "bg-sage/25 text-ocean" },
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

  const [stats, rows, invites] = await Promise.all([
    getAdminStats(),
    getAdminPractitioners(),
    getAdminInvites(),
  ]);

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

        <div className="mt-8">
          <InviteCreator />
        </div>

        <InvitesList invites={invites} />

        {rows.length === 0 ? (
          <p className="mt-12 text-[15px] text-ink-soft">No practitioners yet.</p>
        ) : (
          <div className="mt-10 overflow-x-auto rounded-2xl border border-rule bg-white">
            <table className="w-full min-w-[1040px] text-left text-[14px]">
              <thead className="border-b border-rule text-ink-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Complete</th>
                  <th className="px-5 py-3 font-medium">Views</th>
                  <th className="px-5 py-3 font-medium">Updated</th>
                  <th className="px-5 py-3 font-medium">Verification</th>
                  <th className="px-5 py-3 font-medium">Visibility</th>
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
                          <a
                            href={`mailto:${r.email}`}
                            className="text-[13px] text-ink-muted underline-offset-2 hover:text-charcoal hover:underline"
                          >
                            {r.email}
                          </a>
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

        <p className="mt-8 max-w-3xl text-[13px] leading-[1.6] text-ink-muted">
          <strong className="font-medium text-ink-soft">Visibility:</strong> &ldquo;Hold&rdquo; hides a
          profile from the public immediately (with a message they&rsquo;ll see in their editor and a
          private note for the record); &ldquo;Release&rdquo; restores it to where it was. Nothing is
          deleted — held profiles keep all their data and the practitioner can still edit, they just
          can&rsquo;t re-publish until you release them. <strong className="font-medium text-ink-soft">Verification
          badges</strong> toggle on/off and show on the public profile right away; Founding Member is
          automatic. Banning an account entirely is done from the Clerk dashboard.
        </p>
      </Container>
    </main>
  );
}
