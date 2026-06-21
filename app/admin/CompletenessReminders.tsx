"use client";

import { useState, useTransition } from "react";

import { sendCompletenessReminders } from "./actions";

/**
 * Admin: send a gentle "finish your profile" nudge to under-complete practitioners. Admin-triggered
 * (you choose when); the action skips anyone reminded in the last 7 days, anyone on hold, and
 * anyone already ≥80% complete, so it can't spam. `eligible` is the live count.
 */
export function CompletenessReminders({ eligible }: { eligible: number }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function send() {
    setResult(null);
    start(async () => {
      const res = await sendCompletenessReminders();
      if (!res.ok) setResult(res.error);
      else setResult(`Sent ${res.sent} reminder${res.sent === 1 ? "" : "s"}.`);
    });
  }

  return (
    <section className="rounded-2xl border border-rule/70 bg-white p-6">
      <p className="meta text-ink-muted">Profile reminders</p>
      <p className="mt-2 max-w-prose text-[14px] leading-[1.6] text-ink-soft">
        A gentle nudge to practitioners whose profile is under 80% complete. Skips anyone reminded
        in the last 7 days, anyone on hold, and anyone already complete — so it&rsquo;s safe to click.
        <span className="text-ink-muted"> {eligible} eligible right now.</span>
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={send}
          disabled={pending || eligible === 0}
          className="rounded-full border border-rule px-4 py-2 text-[14px] text-charcoal hover:bg-sand/60 disabled:opacity-50"
        >
          {pending ? "Sending…" : eligible === 0 ? "No one to remind" : `Send ${eligible} reminder${eligible === 1 ? "" : "s"}`}
        </button>
        {result ? <span className="text-[13.5px] text-ink-muted">{result}</span> : null}
      </div>
    </section>
  );
}
