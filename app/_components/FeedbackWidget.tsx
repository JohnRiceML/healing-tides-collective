"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";

import { FEEDBACK_KINDS, MAX_FEEDBACK_MESSAGE } from "@/lib/feedback";
import { submitFeedback } from "@/app/feedback/actions";

type Phase = "idle" | "done" | "error";

export function FeedbackWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<string>("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  // The admin has its own Feedback queue; the Sanity studio is a separate surface.
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/studio")) return null;

  function reset() {
    setKind("");
    setMessage("");
    setEmail("");
    setPhase("idle");
    setError(null);
  }

  function send() {
    setError(null);
    start(async () => {
      const res = await submitFeedback({ message, kind: kind || undefined, email: email || undefined, path: pathname ?? undefined });
      if (res.ok) setPhase("done");
      else {
        setError(res.error);
        setPhase("error");
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        className="fixed left-0 top-1/2 z-[190] -translate-y-1/2 rounded-r-xl bg-charcoal/90 px-2 py-3 text-[13px] tracking-wide text-sand shadow-md transition-colors hover:bg-charcoal [writing-mode:vertical-rl] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
      >
        Feedback
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Send feedback"
      className="fixed bottom-4 left-4 z-[200] w-[min(92vw,340px)] rounded-2xl border border-rule bg-white p-5 shadow-[0_18px_50px_-24px_rgba(31,58,95,0.35)] sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-[17px] leading-tight text-charcoal">
          {phase === "done" ? "Thank you" : "Share feedback"}
        </p>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            if (phase === "done") reset();
          }}
          aria-label="Close feedback"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-muted hover:bg-sand/70 hover:text-charcoal"
        >
          ×
        </button>
      </div>

      {phase === "done" ? (
        <div className="mt-3">
          <p className="text-[14px] leading-[1.6] text-ink-soft">
            We read every note — thank you for helping us make Healing Tides better.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 rounded-full border border-rule px-3 py-1.5 text-[13px] text-ink-soft hover:bg-sand/60"
          >
            Send another
          </button>
        </div>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {FEEDBACK_KINDS.map((k) => (
              <button
                key={k.value}
                type="button"
                onClick={() => setKind((cur) => (cur === k.value ? "" : k.value))}
                className={`rounded-full px-3 py-1 text-[12.5px] ${
                  kind === k.value ? "bg-charcoal text-white" : "border border-rule text-ink-soft hover:bg-sand/60"
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={MAX_FEEDBACK_MESSAGE}
            placeholder="What's on your mind?"
            aria-label="Your feedback"
            className="mt-3 min-h-[96px] w-full rounded-xl border border-rule bg-white px-3 py-2 text-[14px] text-charcoal placeholder:text-ink-muted focus:border-teal focus:outline-none"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional, for a reply)"
            aria-label="Your email (optional)"
            className="mt-2 h-10 w-full rounded-xl border border-rule bg-white px-3 text-[14px] text-charcoal placeholder:text-ink-muted focus:border-teal focus:outline-none"
          />

          {error ? <p role="alert" className="mt-2 text-[13px] text-ocean">{error}</p> : null}

          <button
            type="button"
            onClick={send}
            disabled={pending || message.trim().length < 3}
            className="mt-3 w-full rounded-full bg-teal px-4 py-2 text-[14px] text-white transition-colors hover:bg-teal/90 disabled:opacity-50"
          >
            {pending ? "Sending…" : "Send"}
          </button>
          <p className="mt-2 text-[11.5px] leading-[1.5] text-ink-muted">
            Goes straight to the team. No account needed.
          </p>
        </>
      )}
    </div>
  );
}
