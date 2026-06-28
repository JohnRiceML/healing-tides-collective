import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { selectReminderRecipients } from "@/lib/completeness-reminders";

import { countNewFeedback, getAdminInvites, getAdminPractitioners, getReminderCandidates, getSeekerIntakes } from "./_data";
import { computeAdminOverview } from "./overview";
import { buildCommandCenter } from "./command-center";
import { AdminOverview } from "./AdminOverview";
import { CommandCenter } from "./CommandCenter";
import { AdminShell } from "./_components/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const admin = await requireAdmin();
  if (!admin) notFound();

  const now = new Date();
  const [rows, invites, reminderCandidates, newFeedback, intakes] = await Promise.all([
    getAdminPractitioners(),
    getAdminInvites(),
    getReminderCandidates(),
    countNewFeedback(),
    getSeekerIntakes(),
  ]);
  const dueReminders = selectReminderRecipients(reminderCandidates, { now }).length;
  const invitesPending = invites.filter((i) => i.status === "pending").length;
  const overview = computeAdminOverview(rows, { now, invitesPending, dueReminders, newFeedback });
  const digest = buildCommandCenter(
    {
      intakes,
      invitesPending,
      dueReminders,
      newFeedback,
      drafts: overview.practitioners.drafts,
      needsReview: overview.practitioners.needsReview,
      onHold: overview.practitioners.onHold,
    },
    now,
  );

  return (
    <AdminShell title="Overview">
      <CommandCenter digest={digest} />
      <AdminOverview overview={overview} />
    </AdminShell>
  );
}
