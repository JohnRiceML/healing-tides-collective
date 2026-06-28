"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";

import { useConsidering } from "../_considering/ConsideringContext";
import { useSurfaced } from "./SurfacedContext";
import { PractitionerChatCard } from "../_chat/PractitionerChatCard";
import { requestIntro } from "../actions";

// The right-hand rail: the practitioners the agent surfaces appear here as cards, and the ones the
// seeker saves collect into a calm "basket of good choices" with a staged, low-pressure CTA. Used
// both as the desktop side column and (via RailDrawer) the mobile bottom sheet.
export function DiscoveryRail() {
  const { items: saved, remove } = useConsidering();
  const { surfaced } = useSurfaced();

  const [showIntro, setShowIntro] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const savedSlugs = new Set(saved.map((s) => s.slug));
  const suggestions = surfaced.filter((s) => !savedSlugs.has(s.slug));

  const submit = () => {
    if (!consent) {
      setError("Please check the box so we know it's okay to reach out.");
      return;
    }
    start(async () => {
      setError(null);
      const res = await requestIntro({ name, email, slugs: saved.map((s) => s.slug), consent });
      if (res.ok) setDone(true);
      else setError(res.error);
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-rule/60 px-4 py-3.5">
        <p className="font-display text-[16px] font-light text-charcoal">People for you</p>
        <p className="text-[11.5px] text-ink-muted">Save a few that feel right — you can reach out to more than one.</p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4">
        {/* The basket of good choices */}
        {saved.length > 0 ? (
          <section>
            <h3 className="text-[12px] font-medium uppercase tracking-wide text-ink-muted">
              Your shortlist ({saved.length})
            </h3>
            <ul className="mt-2 flex flex-col gap-2">
              {saved.map((i) => (
                <li key={i.slug} className="rounded-xl border border-teal/30 bg-seafoam/15 px-3 py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/practitioners/${i.slug}`}
                        target="_blank"
                        className="block truncate text-[13.5px] font-medium text-charcoal underline-offset-2 hover:underline"
                      >
                        {i.displayName}
                      </Link>
                      {i.title ? <p className="truncate text-[11.5px] text-ink-soft">{i.title}</p> : null}
                    </div>
                    <button
                      onClick={() => remove(i.slug)}
                      className="shrink-0 text-[11px] text-ink-muted underline-offset-2 hover:text-clay hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Staged CTA */}
            <div className="mt-3">
              {done ? (
                <div className="rounded-xl border border-teal/30 bg-seafoam/20 px-3 py-2.5 text-[12.5px] leading-[1.6] text-ocean">
                  <span className="font-medium">We have it from here.</span> A real person will read your shortlist and
                  reach out by email — usually within a few days.
                </div>
              ) : showIntro ? (
                <div className="flex flex-col gap-2">
                  <p className="text-[12px] leading-[1.5] text-ink-soft">
                    We&rsquo;ll introduce you to everyone on your shortlist — just your name and email.
                  </p>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="First name"
                    aria-label="Your first name"
                    className="rounded-lg border border-rule bg-white px-3 py-2 text-[13.5px] text-charcoal placeholder:text-ink-muted focus:border-teal focus:outline-none"
                  />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    aria-label="Your email"
                    className="rounded-lg border border-rule bg-white px-3 py-2 text-[13.5px] text-charcoal placeholder:text-ink-muted focus:border-teal focus:outline-none"
                  />
                  <label className="flex items-start gap-2 text-[11.5px] leading-[1.5] text-ink-soft">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-teal" />
                    I understand a person at Healing Tides will read my list and email me back.
                  </label>
                  {error ? <p className="text-[11.5px] text-clay">{error}</p> : null}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={submit}
                    className="rounded-full bg-ocean px-4 py-2 text-[12.5px] text-white hover:bg-ocean/90 disabled:opacity-50"
                  >
                    {pending ? "Sending…" : "Send my shortlist"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowIntro(true)}
                    className="rounded-full bg-ocean px-4 py-2 text-[12.5px] text-white hover:bg-ocean/90"
                  >
                    Introduce me to these {saved.length > 1 ? `${saved.length}` : ""}
                  </button>
                  <p className="text-center text-[11px] text-ink-muted">…or reach out yourself from any profile.</p>
                </div>
              )}
            </div>

            {/* Quiet, optional: keep this list across devices by making a free account. */}
            {!done ? (
              <p className="mt-3 border-t border-rule/50 pt-3 text-center text-[11px] leading-[1.5] text-ink-muted">
                <Link href="/save-account" className="text-teal underline-offset-2 hover:underline">
                  Save this list to an account
                </Link>{" "}
                to keep it for later.
              </p>
            ) : null}
          </section>
        ) : null}

        {/* Live suggestions surfaced by the agent */}
        <section>
          {saved.length > 0 ? (
            <h3 className="text-[12px] font-medium uppercase tracking-wide text-ink-muted">Suggested as you talk</h3>
          ) : null}
          {suggestions.length > 0 ? (
            <div className="mt-2 flex flex-col gap-3">
              {suggestions.map((p) => (
                <PractitionerChatCard key={p.slug} p={p} />
              ))}
            </div>
          ) : saved.length === 0 ? (
            <p className="text-[13px] leading-[1.6] text-ink-soft">
              As you talk, practitioners will appear here. Save the ones that feel right — keeping a few gives you
              options.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}

// Mobile presentation: a floating pill → bottom-anchored drawer hosting the same rail.
export function RailDrawer() {
  const { items: saved } = useConsidering();
  const { surfaced } = useSurfaced();
  const [open, setOpen] = useState(false);
  const count = saved.length || surfaced.length;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (count === 0 && !open) return null;

  return (
    <div className="lg:hidden">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-[120] rounded-full bg-white px-4 py-2.5 text-[13px] text-charcoal shadow-lg ring-1 ring-teal/30"
        >
          <span className="text-clay">♥</span> {saved.length > 0 ? `${saved.length} saved` : `${surfaced.length} for you`}
        </button>
      ) : (
        <div className="fixed inset-0 z-[210] flex flex-col justify-end">
          <div className="absolute inset-0 bg-charcoal/25" onClick={() => setOpen(false)} aria-hidden />
          <div role="dialog" aria-modal="true" aria-label="People for you" className="relative max-h-[85vh] overflow-hidden rounded-t-3xl bg-sand shadow-xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-3 z-10 text-[13px] text-ink-muted hover:text-charcoal"
            >
              Close
            </button>
            <div className="h-[80vh]">
              <DiscoveryRail />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
