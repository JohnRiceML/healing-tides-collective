"use client";

import { useState, useTransition } from "react";

import { setProfileHold } from "./actions";

const field =
  "w-full rounded-lg border border-rule bg-white px-2.5 py-1.5 text-[12px] leading-snug text-charcoal placeholder:text-ink-muted/70 focus:border-charcoal focus:outline-none focus:ring-2 focus:ring-charcoal/10";

/**
 * Per-practitioner Hold / Release control. ADMIN-only path. Holding hides the profile
 * (with a practitioner-facing message + a private internal note); Release restores them
 * to their prior visibility. Optimistic; reverts on failure.
 */
export function HoldControl({
  practitionerId,
  held: initialHeld,
}: {
  practitionerId: string;
  held: boolean;
}) {
  const [held, setHeld] = useState(initialHeld);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function hold() {
    setError(null);
    start(async () => {
      const res = await setProfileHold(practitionerId, { held: true, message, internalNote: note });
      if (res.ok) {
        setHeld(true);
        setOpen(false);
        setMessage("");
        setNote("");
      } else setError(res.error);
    });
  }

  function release() {
    setError(null);
    start(async () => {
      const res = await setProfileHold(practitionerId, { held: false });
      if (res.ok) setHeld(false);
      else setError(res.error);
    });
  }

  if (held) {
    return (
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={release}
          disabled={pending}
          className="w-fit rounded-full border border-charcoal/20 bg-white px-3 py-1 text-[11px] font-medium text-charcoal transition-colors hover:border-charcoal/40 hover:bg-sand-deep/40 disabled:opacity-50"
        >
          {pending ? "Releasing…" : "Release hold"}
        </button>
        {error ? <span className="text-[11px] text-ocean">{error}</span> : null}
      </div>
    );
  }

  if (!open) {
    return (
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-fit rounded-full bg-charcoal/[0.06] px-3 py-1 text-[11px] font-medium text-ink-muted transition-colors hover:bg-charcoal/10 hover:text-charcoal"
        >
          Hold…
        </button>
        {error ? <span className="text-[11px] text-ocean">{error}</span> : null}
      </div>
    );
  }

  return (
    <div className="flex w-60 flex-col gap-2">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
        placeholder="Message to the practitioner (they'll see this)"
        className={field}
      />
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Internal note (private — never shown)"
        className={field}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={hold}
          disabled={pending}
          className="rounded-full bg-ocean px-3 py-1 text-[11px] font-medium text-sand transition-colors hover:bg-ocean/90 disabled:opacity-50"
        >
          {pending ? "Hiding…" : "Hide profile"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          disabled={pending}
          className="rounded-full px-2 py-1 text-[11px] font-medium text-ink-muted transition-colors hover:text-charcoal"
        >
          Cancel
        </button>
      </div>
      {error ? <span className="text-[11px] text-ocean">{error}</span> : null}
    </div>
  );
}
