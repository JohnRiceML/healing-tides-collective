"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname } from "next/navigation";

import { FEEDBACK_KINDS, MAX_FEEDBACK_MESSAGE } from "@/lib/feedback";
import { submitFeedback, uploadFeedbackScreenshot } from "@/app/feedback/actions";

type Phase = "idle" | "done" | "error";

export function FeedbackWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<string>("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [shotUrl, setShotUrl] = useState<string | null>(null);
  const [shotUploading, setShotUploading] = useState(false);
  const [shotError, setShotError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || !dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      requestAnimationFrame(() => triggerRef.current?.focus());
    };
  }, [open]);

  // The admin has its own Feedback queue; the Sanity studio is a separate surface.
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/studio")) return null;

  function reset() {
    setKind("");
    setMessage("");
    setEmail("");
    setShotUrl(null);
    setShotError(null);
    setPhase("idle");
    setError(null);
  }

  async function onShotChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setShotError(null);
    setShotUploading(true);
    const fd = new FormData();
    fd.append("screenshot", file);
    const res = await uploadFeedbackScreenshot(fd);
    setShotUploading(false);
    if (res.ok) setShotUrl(res.url);
    else setShotError(res.error);
  }

  function send() {
    setError(null);
    start(async () => {
      const res = await submitFeedback({
        message,
        kind: kind || undefined,
        email: email || undefined,
        path: pathname ?? undefined,
        screenshotUrl: shotUrl || undefined,
      });
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
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Share feedback"
        className="group fixed bottom-4 left-4 z-[190] flex flex-row items-center gap-2 rounded-full bg-ocean px-4 py-2.5 text-sand shadow-[0_12px_30px_-12px_rgba(31,58,95,0.5)] transition-colors duration-200 hover:bg-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean/50 sm:bottom-auto sm:left-0 sm:top-1/2 sm:-translate-y-1/2 sm:flex-col sm:rounded-l-none sm:rounded-r-2xl sm:px-2.5 sm:py-4 sm:hover:px-3"
      >
        <span aria-hidden className="text-[14px] leading-none">♥</span>
        <span className="text-[13px] font-medium tracking-[0.04em] [writing-mode:horizontal-tb] sm:[writing-mode:vertical-rl]">Feedback</span>
      </button>
    );
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Share feedback"
      className="fixed bottom-4 left-4 z-[200] max-h-[85vh] w-[min(92vw,340px)] overflow-y-auto rounded-2xl border border-rule bg-white p-5 shadow-[0_20px_55px_-22px_rgba(31,58,95,0.4)] sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-[18px] leading-tight text-charcoal">
          {phase === "done" ? "Thank you ♥" : "We'd love your thoughts"}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={() => {
            setOpen(false);
            if (phase === "done") reset();
          }}
          aria-label="Close feedback"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-ink hover:bg-sand/70 hover:text-charcoal"
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
          <p className="mt-1 text-[13px] leading-[1.55] text-ink-soft">
            Found something off, or have an idea? We&rsquo;re listening.
          </p>

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
            className="mt-3 min-h-[92px] w-full rounded-xl border border-rule bg-white px-3 py-2 text-[14px] text-charcoal placeholder:text-muted-ink focus:border-teal focus:outline-none"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional, for a reply)"
            aria-label="Your email (optional)"
            className="mt-2 h-10 w-full rounded-xl border border-rule bg-white px-3 text-[14px] text-charcoal placeholder:text-muted-ink focus:border-teal focus:outline-none"
          />

          {/* Screenshot attach */}
          <input ref={fileRef} type="file" accept="image/*" onChange={onShotChange} className="hidden" />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {shotUrl ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-seafoam/30 px-2.5 py-1 text-[12.5px] text-teal">
                <img src={shotUrl} alt="" className="h-5 w-5 rounded object-cover" />
                Screenshot attached
                <button type="button" aria-label="Remove screenshot" onClick={() => setShotUrl(null)} className="text-muted-ink hover:text-charcoal">
                  ×
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={shotUploading}
                className="rounded-full border border-rule px-3 py-1.5 text-[12.5px] text-ink-soft hover:bg-sand/60 disabled:opacity-50"
              >
                {shotUploading ? "Uploading…" : "Attach a screenshot"}
              </button>
            )}
          </div>
          {shotError ? <p className="mt-1 text-[12px] text-ocean">{shotError}</p> : null}

          {error ? <p role="alert" className="mt-2 text-[13px] text-ocean">{error}</p> : null}

          <button
            type="button"
            onClick={send}
            disabled={pending || message.trim().length < 3}
            className="mt-3 w-full rounded-full bg-teal px-4 py-2 text-[14px] text-white transition-colors hover:bg-teal/90 disabled:opacity-50"
          >
            {pending ? "Sending…" : "Send"}
          </button>
          <p className="mt-2 text-[11.5px] leading-[1.5] text-muted-ink">
            Goes straight to the team. No account needed — we&rsquo;ll note your page automatically.
          </p>
        </>
      )}
    </div>
  );
}
