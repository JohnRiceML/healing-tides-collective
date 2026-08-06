"use client";

import { useState, useTransition } from "react";

import { setDirectoryApproval } from "./actions";

/**
 * Per-practitioner directory approval. ADMIN-only path. Publishing is gated — only an
 * invited or admin-approved practitioner can go live — so this is the "yes, they belong
 * here" switch. Approving someone waiting in NEEDS_REVIEW publishes them at the same time.
 * Optimistic; reverts on failure.
 */
export function ApprovalControl({
  practitionerId,
  approved: initialApproved,
  needsReview,
}: {
  practitionerId: string;
  approved: boolean;
  needsReview: boolean;
}) {
  const [approved, setApproved] = useState(initialApproved);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function set(next: boolean) {
    setError(null);
    start(async () => {
      const res = await setDirectoryApproval(practitionerId, next);
      if (res.ok) setApproved(next);
      else setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-1">
      {approved ? (
        <button
          type="button"
          onClick={() => set(false)}
          disabled={pending}
          title="Clear the approval (this doesn't hide a live profile — use Hold for that)"
          className="w-fit rounded-full bg-teal/15 px-3 py-1 text-[11px] font-medium text-teal transition-colors hover:bg-teal/25 disabled:opacity-50"
        >
          {pending ? "Working…" : "Approved ✓"}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => set(true)}
          disabled={pending}
          className="w-fit rounded-full border border-teal/40 bg-white px-3 py-1 text-[11px] font-medium text-teal transition-colors hover:bg-seafoam/40 disabled:opacity-50"
        >
          {pending ? "Approving…" : needsReview ? "Approve & publish" : "Approve"}
        </button>
      )}
      {error ? <span className="text-[11px] text-ocean">{error}</span> : null}
    </div>
  );
}
