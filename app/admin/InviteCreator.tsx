"use client";

import { useState, useTransition } from "react";

import { Button, TextInput } from "@/app/_components/ui";
import { createInvite } from "./actions";

/**
 * Admin: mint a "claim your profile" link for a waitlist practitioner. Email wiring is
 * deferred — for now you copy the link and send it however you like. No Practitioner
 * row is created, so an unclaimed invite never appears in the directory.
 */
export function InviteCreator() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [region, setRegion] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  function submit() {
    setError(null);
    setUrl(null);
    setCopied(false);
    start(async () => {
      const res = await createInvite({
        email,
        displayName: displayName || undefined,
        prefill: region ? { region } : undefined,
      });
      if (res.ok) {
        setUrl(res.url);
        setEmail("");
        setDisplayName("");
        setRegion("");
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <section className="rounded-2xl border border-rule/70 bg-white p-6">
      <p className="meta text-ink-muted">Invite a practitioner</p>
      <p className="mt-2 max-w-prose text-[14px] leading-[1.6] text-ink-soft">
        Mint a claim link from a waitlist entry. Send it however you like — when they sign up
        through it, their profile is pre-filled.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <TextInput type="email" placeholder="Email (required)" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Invitee email" />
        <TextInput placeholder="Name (optional)" value={displayName} onChange={(e) => setDisplayName(e.target.value)} aria-label="Invitee name" />
        <TextInput placeholder="Location (optional)" value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Invitee location" />
      </div>

      <div className="mt-4">
        <Button type="button" onClick={submit} disabled={pending || !email.trim()}>
          {pending ? "Creating…" : "Create claim link"}
        </Button>
      </div>

      {error ? <p role="alert" className="mt-3 text-[13.5px] text-ocean">{error}</p> : null}

      {url ? (
        <div className="mt-4 rounded-xl border border-teal/30 bg-seafoam/20 p-4">
          <p className="text-[13px] font-medium text-charcoal">Claim link — copy &amp; send:</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <code className="break-all rounded bg-white px-2 py-1 text-[12.5px] text-ink-soft">{url}</code>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(url);
                setCopied(true);
              }}
              className="rounded-full border border-rule px-3 py-1 text-[13px] text-charcoal hover:bg-sand/60"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
