import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth";

import { getFeedback } from "../_data";
import { FeedbackList } from "../FeedbackList";
import { AdminShell } from "../_components/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  const admin = await requireAdmin();
  if (!admin) notFound();

  const rows = await getFeedback();

  return (
    <AdminShell title="Feedback">
      <p className="mt-4 max-w-prose text-[14px] leading-[1.6] text-ink-soft">
        Everything from the site-wide feedback widget — from anyone, signed in or not. Triage each
        note through to <span className="text-charcoal">Fixed</span> or{" "}
        <span className="text-charcoal">Planned</span>; the status and your note become the record of
        what we shipped in response.
      </p>
      <FeedbackList rows={rows} />
    </AdminShell>
  );
}
