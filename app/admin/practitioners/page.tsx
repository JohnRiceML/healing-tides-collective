import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { selectReminderRecipients } from "@/lib/completeness-reminders";

import { getAdminInvites, getAdminPractitioners, getReminderCandidates } from "../_data";
import { CompletenessReminders } from "../CompletenessReminders";
import { CredentialVerification } from "../CredentialVerification";
import { InviteCreator } from "../InviteCreator";
import { BulkInviteCreator } from "../BulkInviteCreator";
import { InvitesList } from "../InvitesList";
import { PractitionersTable } from "../PractitionersTable";
import { AdminShell } from "../_components/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminPractitionersPage() {
  const admin = await requireAdmin();
  if (!admin) notFound();

  const now = new Date();
  const [rows, invites, reminderCandidates] = await Promise.all([
    getAdminPractitioners(),
    getAdminInvites(),
    getReminderCandidates(),
  ]);
  const eligibleReminders = selectReminderRecipients(reminderCandidates, { now }).length;

  return (
    <AdminShell title="Practitioners">
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <InviteCreator />
        <CompletenessReminders eligible={eligibleReminders} />
      </div>

      <div className="mt-4">
        <BulkInviteCreator />
      </div>

      <InvitesList invites={invites} />

      <CredentialVerification rows={rows} />

      <PractitionersTable rows={rows} now={now} />

      <p className="mt-8 max-w-3xl text-[13px] leading-[1.6] text-ink-muted">
        <strong className="font-medium text-ink-soft">Visibility:</strong> &ldquo;Hold&rdquo; hides a
        profile from the public immediately (with a message they&rsquo;ll see in their editor and a
        private note for the record); &ldquo;Release&rdquo; restores it to where it was. Nothing is
        deleted — held profiles keep all their data and the practitioner can still edit, they just
        can&rsquo;t re-publish until you release them.{" "}
        <strong className="font-medium text-ink-soft">Verification badges</strong> toggle on/off and show
        on the public profile right away; Founding Member is automatic. Banning an account entirely is
        done from the Clerk dashboard.
      </p>
    </AdminShell>
  );
}
