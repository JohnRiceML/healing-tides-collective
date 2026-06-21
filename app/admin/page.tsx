import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/app/_components/ui";
import { requireAdmin } from "@/lib/auth";

import { selectReminderRecipients } from "@/lib/completeness-reminders";

import { getAdminInvites, getAdminPractitioners, getAdminStats, getReminderCandidates } from "./_data";
import { CompletenessReminders } from "./CompletenessReminders";
import { InviteCreator } from "./InviteCreator";
import { InvitesList } from "./InvitesList";
import { PractitionersTable } from "./PractitionersTable";

export const metadata: Metadata = {
  title: "Admin — Healing Tides Collective",
  robots: { index: false, follow: false },
};

// Auth-gated + reads the DB per request.
export const dynamic = "force-dynamic";

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

  const [stats, rows, invites, reminderCandidates] = await Promise.all([
    getAdminStats(),
    getAdminPractitioners(),
    getAdminInvites(),
    getReminderCandidates(),
  ]);
  const eligibleReminders = selectReminderRecipients(reminderCandidates, { now: new Date() }).length;

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

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <InviteCreator />
          <CompletenessReminders eligible={eligibleReminders} />
        </div>

        <InvitesList invites={invites} />

        <PractitionersTable rows={rows} />

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
