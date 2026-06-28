"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { useConsidering } from "./ConsideringContext";
import { requestIntro } from "../actions";

// "People you're considering" — a calm holding space, NOT a shopping cart. No urgency, no scarcity.
// A floating pill opens a drawer with the saved practitioners + a staged, low-pressure CTA:
// reach out yourself, or consent to have Nora make a warm introduction (the storage moment).
export function ConsideringPanel() {
  const { items, remove } = useConsidering();
  const [open, setOpen] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (items.length === 0 && !open) return null;

  const submit = () => {
    if (!consent) {
      setError("Please check the box so we know it's okay to reach out.");
      return;
    }
    start(async () => {
      setError(null);
      const res = await requestIntro({ name, email, slugs: items.map((i) => i.slug) });
      if (res.ok) setDone(true);
      else setError(res.error);
    });
  };

  return (
    <>
      {/* Floating pill — calm, no count-badge alarm */}
      {items.length > 0 ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 rounded-full bg-white px-4 py-2.5 text-[13px] text-charcoal shadow-lg ring-1 ring-teal/30 transition hover:ring-teal/50"
        >
          <span className="text-clay">♥</span> {items.length} {items.length === 1 ? "person" : "people"} you&rsquo;re
          considering
        </button>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-charcoal/20" onClick={() => setOpen(false)} aria-hidden />
          <div className="relative flex h-full w-full max-w-[420px] flex-col overflow-y-auto bg-sand shadow-xl">
            <header className="flex items-center justify-between border-b border-rule/60 px-5 py-4">
              <p className="font-display text-[18px] font-light text-charcoal">People you&rsquo;re considering</p>
              <button onClick={() => setOpen(false)} className="text-[13px] text-ink-muted hover:text-charcoal">
                Close
              </button>
            </header>

            <div className="flex-1 px-5 py-4">
              {items.length === 0 ? (
                <p className="text-[14px] text-ink-soft">Your list is empty — save anyone who resonates as you talk.</p>
              ) : (
                <ul className="flex flex-col gap-2.5">
                  {items.map((i) => (
                    <li key={i.slug} className="rounded-2xl border border-rule bg-white p-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link
                            href={`/practitioners/${i.slug}`}
                            target="_blank"
                            className="font-medium text-charcoal underline-offset-2 hover:underline"
                          >
                            {i.displayName}
                          </Link>
                          {i.title ? <p className="text-[12px] text-ink-soft">{i.title}</p> : null}
                          {i.region ? <p className="text-[12px] text-ink-muted">{i.region}</p> : null}
                        </div>
                        <button
                          onClick={() => remove(i.slug)}
                          className="shrink-0 text-[12px] text-ink-muted underline-offset-2 hover:text-clay hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Staged, low-pressure CTA */}
            {items.length > 0 ? (
              <div className="border-t border-rule/60 bg-white px-5 py-4">
                {done ? (
                  <p className="text-[14px] leading-[1.6] text-ocean">
                    <span className="font-medium">We have it from here.</span> Nora will read your list and reach out
                    by email — usually within a few days. You can keep exploring anytime.
                  </p>
                ) : showIntro ? (
                  <div className="flex flex-col gap-2.5">
                    <p className="text-[13px] leading-[1.6] text-ink-soft">
                      Nora will read your list and make a warm introduction. Just your name and email — nothing else.
                    </p>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="First name"
                      aria-label="Your first name"
                      className="rounded-lg border border-rule bg-sand/40 px-3 py-2 text-[14px] text-charcoal placeholder:text-ink-muted focus:border-teal focus:outline-none"
                    />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      aria-label="Your email"
                      className="rounded-lg border border-rule bg-sand/40 px-3 py-2 text-[14px] text-charcoal placeholder:text-ink-muted focus:border-teal focus:outline-none"
                    />
                    <label className="flex items-start gap-2 text-[12px] leading-[1.5] text-ink-soft">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-0.5 accent-teal"
                      />
                      I understand a person at Healing Tides will read my list and email me back.
                    </label>
                    {error ? <p className="text-[12px] text-clay">{error}</p> : null}
                    <button
                      type="button"
                      disabled={pending}
                      onClick={submit}
                      className="rounded-full bg-ocean px-4 py-2 text-[13px] text-white hover:bg-ocean/90 disabled:opacity-50"
                    >
                      {pending ? "Sending…" : "Send my list to Nora"}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setShowIntro(true)}
                      className="rounded-full bg-ocean px-4 py-2 text-[13px] text-white hover:bg-ocean/90"
                    >
                      Have Nora introduce you
                    </button>
                    <p className="text-center text-[12px] text-ink-muted">
                      …or reach out to anyone yourself from their profile. No rush.
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
