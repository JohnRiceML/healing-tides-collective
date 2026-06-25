import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/app/_components/ui";
import { requireAdmin } from "@/lib/auth";

import { selectReminderRecipients } from "@/lib/completeness-reminders";

import { getAdminInvites, getAdminPractitioners, getReminderCandidates } from "./_data";
import { computeAdminOverview } from "./overview";
import { AdminOverview } from "./AdminOverview";
import { CompletenessReminders } from "./CompletenessReminders";
import { CredentialVerification } from "./CredentialVerification";
import { InviteCreator } from "./InviteCreator";
import { InvitesList } from "./InvitesList";
import { PractitionersTable } from "./PractitionersTable";

export const metadata: Metadata = {
  title: "Admin — Healing Tides Collective",
  robots: { index: false, follow: false },
};

// Auth-gated + reads the DB per request.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Gate: only ADMIN users. Everyone else (signed-out or not admin) gets a 404,
  // which also keeps the route's existence hidden.
  const admin = await requireAdmin();
  if (!admin) notFound();

  const now = new Date();
  const [rows, invites, reminderCandidates] = await Promise.all([
    getAdminPractitioners(),
    getAdminInvites(),
    getReminderCandidates(),
  ]);
  const eligibleReminders = selectReminderRecipients(reminderCandidates, { now }).length;
  const invitesPending = invites.filter((i) => i.status === "pending").length;
  const overview = computeAdminOverview(rows, { now, invitesPending, dueReminders: eligibleReminders });

  return (
    <main id="main-content" className="min-h-screen bg-sand text-charcoal">
      <Container size="wide" className="py-14 md:py-20">
        <p className="meta text-ink-muted">Admin</p>
        <h1 className="font-display mt-3 text-[clamp(28px,5vw,44px)] font-light tracking-[-0.02em]">
          Overview
        </h1>

        <AdminOverview overview={overview} />

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <InviteCreator />
          <CompletenessReminders eligible={eligibleReminders} />
        </div>

        <InvitesList invites={invites} />

        <CredentialVerification rows={rows} />

        <PractitionersTable rows={rows} now={now} />

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
