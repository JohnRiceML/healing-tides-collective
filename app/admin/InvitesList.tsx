"use client";

import { useState, useTransition } from "react";

import { SITE_URL } from "@/lib/site";
import { resendInvite, revokeInvite } from "./actions";
import type { AdminInviteRow } from "./_data";

/**
 * Admin: the sent-invites worklist — who's been invited, who's claimed, who to follow up with.
 * Resend the claim email or revoke an unclaimed invite. Claimed invites are read-only (a real record).
 */
export function InvitesList({ invites }: { invites: AdminInviteRow[] }) {
  if (invites.length === 0) return null;
  const pending = invites.filter((i) => i.status === "pending").length;
  return (
    <section className="mt-8">
      <p className="meta text-ink-muted">
        Sent invites <span className="text-ink-soft">— {invites.length} total, {pending} unclaimed</span>
      </p>
      <div className="mt-3 overflow-x-auto rounded-2xl border border-rule bg-white">
        <table className="w-full min-w-[820px] text-left text-[14px]">
          <thead className="border-b border-rule text-ink-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Invitee</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Sent</th>
              <th className="px-5 py-3 font-medium">Claim link</th>
              <th className="px-5 py-3 font-medium" aria-label="actions" />
            </tr>
          </thead>
          <tbody>
            {invites.map((inv) => (
              <InviteRow key={inv.id} inv={inv} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function InviteRow({ inv }: { inv: AdminInviteRow }) {
  const [pending, start] = useTransition();
  const [note, setNote] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revoked, setRevoked] = useState(false);
  const url = `${SITE_URL}/claim/${inv.token}`;
  const claimed = inv.status === "claimed";

  if (revoked) return null;

  function resend() {
    setNote(null);
    start(async () => {
      const res = await resendInvite(inv.token);
      if (!res.ok) setNote(res.error);
      else setNote(res.emailed ? "Email re-sent ✓" : "Email is off — copy the link instead");
    });
  }
  function revoke() {
    setNote(null);
    start(async () => {
      const res = await revokeInvite(inv.token);
      if (res.ok) setRevoked(true);
      else setNote(res.error ?? "Couldn't revoke.");
    });
  }

  return (
    <tr className="border-b border-rule/60 align-top last:border-0">
      <td className="px-5 py-3">
        <div className="font-medium text-charcoal">{inv.displayName ?? <span className="text-ink-muted">— no name —</span>}</div>
        <div className="text-[13px] text-ink-muted">
          {inv.email}
          {inv.region ? ` · ${inv.region}` : ""}
        </div>
      </td>
      <td className="px-5 py-3">
        <span className={`rounded-full px-2.5 py-1 text-[12px] ${claimed ? "bg-teal/15 text-teal" : "bg-charcoal/5 text-ink-muted"}`}>
          {claimed ? "Claimed" : "Pending"}
        </span>
      </td>
      <td className="px-5 py-3 text-ink-muted">{inv.createdAt.toISOString().slice(0, 10)}</td>
      <td className="px-5 py-3">
        {claimed ? (
          <span className="text-ink-muted">—</span>
        ) : (
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(url);
              setCopied(true);
            }}
            className="rounded-full border border-rule px-3 py-1 text-[13px] text-charcoal hover:bg-sand/60"
          >
            {copied ? "Copied ✓" : "Copy link"}
          </button>
        )}
      </td>
      <td className="px-5 py-3">
        {claimed ? (
          <span className="text-[13px] text-ink-muted">—</span>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={resend}
              disabled={pending}
              className="rounded-full border border-rule px-3 py-1 text-[13px] text-charcoal hover:bg-sand/60 disabled:opacity-50"
            >
              {pending ? "…" : "Resend email"}
            </button>
            <button
              type="button"
              onClick={revoke}
              disabled={pending}
              className="rounded-full border border-rule px-3 py-1 text-[13px] text-ocean hover:bg-ocean/5 disabled:opacity-50"
            >
              Revoke
            </button>
            {note ? <span className="text-[12.5px] text-ink-muted">{note}</span> : null}
          </div>
        )}
      </td>
    </tr>
  );
}
