"use client";

import { useState, useTransition } from "react";

import { Button, TextArea } from "@/app/_components/ui";
import { MAX_BULK_INVITES } from "@/lib/bulk-invites";
import { bulkCreateInvites, type BulkInviteResult } from "./actions";

/**
 * Admin: invite many practitioners at once. Paste one per line — email, optional name, optional
 * Psychology Today link, in any order, comma- or tab-separated (so a spreadsheet column pastes
 * cleanly). Each becomes a claim link, emailed when the email layer is on; the result table shows
 * exactly what sent, what's a copyable link, and what was skipped/failed. No Practitioner rows are
 * created, so unclaimed invites never hit the directory.
 */
export function BulkInviteCreator() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<BulkInviteResult | null>(null);
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);

  function submit() {
    setResult(null);
    setCopied(null);
    start(async () => setResult(await bulkCreateInvites(text)));
  }

  return (
    <section className="rounded-2xl border border-rule/70 bg-white p-6">
      <p className="meta text-ink-muted">Invite many at once</p>
      <p className="mt-2 max-w-prose text-[14px] leading-[1.6] text-ink-soft">
        Paste one practitioner per line — <strong>email</strong>, plus an optional name and Psychology
        Today link (any order, comma- or tab-separated, so a spreadsheet column works). Up to{" "}
        {MAX_BULK_INVITES} at a time. Anyone who already has a pending invite is skipped automatically.
      </p>

      <div className="mt-4">
        <TextArea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Practitioners to invite, one per line"
          placeholder={"jordan@example.com, Jordan Lee, https://www.psychologytoday.com/us/therapists/jordan-lee\nsam@example.com, Sam Rivera\nalex@example.com"}
          className="font-mono text-[13px]"
        />
      </div>

      <div className="mt-4">
        <Button type="button" onClick={submit} disabled={pending || !text.trim()}>
          {pending ? "Sending invites…" : "Create invites"}
        </Button>
      </div>

      {result && !result.ok ? (
        <p role="alert" className="mt-3 text-[13.5px] text-ocean">
          {result.error}
        </p>
      ) : null}

      {result && result.ok ? (
        <div className="mt-4 space-y-3">
          {/* Summary */}
          <div className="rounded-xl border border-teal/30 bg-seafoam/20 p-4 text-[13px] leading-[1.7] text-charcoal">
            <p className="font-medium text-teal">
              {result.summary.created} invite{result.summary.created === 1 ? "" : "s"} created
              {result.summary.emailed > 0 ? ` · ${result.summary.emailed} emailed` : ""}
            </p>
            <p className="text-ink-soft">
              {result.summary.emailed === 0 && result.summary.created > 0
                ? "Auto-email isn't switched on — copy each link below and send it however you like. "
                : ""}
              {result.summary.skippedExisting > 0 ? `${result.summary.skippedExisting} already had a pending invite (skipped). ` : ""}
              {result.summary.duplicates > 0 ? `${result.summary.duplicates} duplicate line${result.summary.duplicates === 1 ? "" : "s"} ignored. ` : ""}
              {result.summary.failed > 0 ? `${result.summary.failed} failed. ` : ""}
              {result.summary.invalid > 0 ? `${result.summary.invalid} line${result.summary.invalid === 1 ? "" : "s"} couldn't be read.` : ""}
            </p>
          </div>

          {/* Per-row results */}
          {result.rows.length > 0 ? (
            <ul className="divide-y divide-rule/60 rounded-xl border border-rule/70">
              {result.rows.map((r, i) => (
                <li key={`${r.email}-${i}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 text-[13px]">
                  <span className="shrink-0">{r.ok ? (r.emailed ? "✓" : "📋") : "—"}</span>
                  <span className="min-w-0 flex-1 truncate text-charcoal">{r.email}</span>
                  {r.ok ? (
                    r.emailed ? (
                      <span className="text-[12px] text-teal">emailed</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (r.url) {
                            void navigator.clipboard?.writeText(r.url);
                            setCopied(r.email);
                          }
                        }}
                        className="rounded-full border border-rule px-3 py-0.5 text-[12px] text-charcoal hover:bg-sand/60"
                      >
                        {copied === r.email ? "Copied ✓" : "Copy link"}
                      </button>
                    )
                  ) : (
                    <span className="text-[12px] text-ink-muted">{r.error}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : null}

          {/* Lines we couldn't parse */}
          {result.invalid.length > 0 ? (
            <details className="text-[12.5px] text-ink-soft">
              <summary className="cursor-pointer text-ink-muted">{result.invalid.length} line(s) couldn&apos;t be read</summary>
              <ul className="mt-2 space-y-1">
                {result.invalid.map((iv) => (
                  <li key={iv.line}>
                    <span className="text-ink-muted">line {iv.line}:</span> {iv.reason} <code className="text-ink-muted">{iv.raw}</code>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
