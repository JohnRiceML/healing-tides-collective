import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "../_components/AdminShell";

export const dynamic = "force-dynamic";

const PLANNED = [
  {
    title: "Match requests",
    body: "Guided intake → a curated shortlist. Track each request from new → matched → connected, in one queue.",
  },
  {
    title: "Seeker intake",
    body: "The conversational questions a seeker answers, and their responses — the input the matching engine reads.",
  },
  {
    title: "Referrals",
    body: "Curated lists sent to seekers and de-identified pings to practitioners, with the outcome of each.",
  },
  {
    title: "Seeker insights",
    body: "Anonymized: what people search for, and where coverage is thin (e.g. adolescent therapy) — your gaps view.",
  },
];

export default async function AdminSeekersPage() {
  const admin = await requireAdmin();
  if (!admin) notFound();

  return (
    <AdminShell title="Seekers">
      <p className="mt-4 max-w-prose text-[15px] leading-[1.7] text-ink-soft">
        The seeker side is the next build. Today people browse anonymously and reach you through
        &ldquo;Get matched,&rdquo; which emails <span className="text-charcoal">hello@healingtides.co</span>{" "}
        directly — there are no seeker accounts or match records yet. Here&rsquo;s what will live here once
        matching ships.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {PLANNED.map((c) => (
          <div key={c.title} className="rounded-2xl border border-dashed border-rule bg-white/60 p-5">
            <div className="flex items-center gap-2">
              <span className="font-display text-[17px] leading-tight text-charcoal">{c.title}</span>
              <span className="rounded-full bg-sand px-2.5 py-0.5 text-[11px] uppercase tracking-[0.06em] text-ink-muted">
                Planned
              </span>
            </div>
            <p className="mt-2 text-[14px] leading-[1.6] text-ink-soft">{c.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 max-w-prose text-[13px] leading-[1.6] text-ink-muted">
        Nothing here is live yet — it lights up with the matching build (the next phase). Until then,
        every &ldquo;Get matched&rdquo; note lands in your inbox, and these surfaces are scoped and ready to
        build once Nora&rsquo;s matching input is in.
      </p>
    </AdminShell>
  );
}
