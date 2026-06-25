import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { selectReminderRecipients } from "@/lib/completeness-reminders";

import { countNewFeedback, getAdminInvites, getAdminPractitioners, getReminderCandidates } from "./_data";
import { computeAdminOverview } from "./overview";
import { AdminOverview } from "./AdminOverview";
import { AdminShell } from "./_components/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const admin = await requireAdmin();
  if (!admin) notFound();

  const now = new Date();
  const [rows, invites, reminderCandidates, newFeedback] = await Promise.all([
    getAdminPractitioners(),
    getAdminInvites(),
    getReminderCandidates(),
    countNewFeedback(),
  ]);
  const dueReminders = selectReminderRecipients(reminderCandidates, { now }).length;
  const invitesPending = invites.filter((i) => i.status === "pending").length;
  const overview = computeAdminOverview(rows, { now, invitesPending, dueReminders, newFeedback });

  return (
    <AdminShell title="Overview">
      <AdminOverview overview={overview} />
    </AdminShell>
  );
}
