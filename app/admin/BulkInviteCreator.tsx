"use client";

import { useState, useTransition } from "react";

import { Button, TextInput, TextArea } from "@/app/_components/ui";
import { parseBulkInvites, MAX_BULK_INVITES } from "@/lib/bulk-invites";
import { createInvitesFromRows, type BulkInviteResult } from "./actions";

type EditableRow = { id: string; email: string; displayName: string; importUrl: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.round(performance.now())}`;

/**
 * Admin: invite many practitioners. PASTE a list (from a spreadsheet, an email, anywhere) → it auto-
 * splits into editable rows (email / name / Psychology Today link) you can hand-correct → SEND. Each
 * becomes a claim link, emailed when the email layer is on. No Practitioner rows are created, so an
 * unclaimed invite never hits the directory. Anyone with a pending invite is skipped on send.
 */
export function BulkInviteCreator() {
  const [pasteText, setPasteText] = useState("");
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [result, setResult] = useState<BulkInviteResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const readyCount = rows.filter((r) => EMAIL_RE.test(r.email.trim())).length;

  function ingestPaste() {
    const parsed = parseBulkInvites(pasteText);
    const existing = new Set(rows.map((r) => r.email.trim().toLowerCase()));
    const additions: EditableRow[] = [];
    let dupAgainstList = 0;
    for (const v of parsed.valid) {
      if (existing.has(v.email)) {
        dupAgainstList++;
        continue;
      }
      existing.add(v.email);
      additions.push({ id: newId(), email: v.email, displayName: v.displayName ?? "", importUrl: v.importUrl ?? "" });
    }
    setRows((prev) => [...prev, ...additions].slice(0, MAX_BULK_INVITES));
    setPasteText("");
    setResult(null);

    const bits: string[] = [`Added ${additions.length}`];
    const skipped = parsed.duplicates + dupAgainstList;
    if (skipped) bits.push(`${skipped} duplicate${skipped === 1 ? "" : "s"} skipped`);
    if (parsed.invalid.length) bits.push(`${parsed.invalid.length} line${parsed.invalid.length === 1 ? "" : "s"} had no email`);
    setNote(additions.length || skipped || parsed.invalid.length ? bits.join(" · ") : "Nothing to add — paste a list above first.");
  }

  function update(id: string, field: keyof Omit<EditableRow, "id">, value: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }
  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }
  function addBlank() {
    setRows((prev) => (prev.length >= MAX_BULK_INVITES ? prev : [...prev, { id: newId(), email: "", displayName: "", importUrl: "" }]));
  }

  function send() {
    setResult(null);
    setCopied(null);
    const payload = rows
      .filter((r) => r.email.trim())
      .map((r) => ({ email: r.email.trim(), displayName: r.displayName.trim() || undefined, importUrl: r.importUrl.trim() || undefined }));
    start(async () => {
      const res = await createInvitesFromRows(payload);
      setResult(res);
      if (res.ok) {
        // Drop successfully-created rows; keep skipped/failed so they can be fixed + retried.
        const created = new Set(res.rows.filter((r) => r.ok).map((r) => r.email.toLowerCase()));
        setRows((prev) => prev.filter((r) => !created.has(r.email.trim().toLowerCase())));
      }
    });
  }

  return (
    <section className="rounded-2xl border border-rule/70 bg-white p-6">
      <p className="meta text-ink-muted">Invite many at once</p>
      <p className="mt-2 max-w-prose text-[14px] leading-[1.6] text-ink-soft">
        Paste a list — from a spreadsheet, an email, anywhere. We&apos;ll split it into rows you can
        fix by hand before sending. Each line just needs an <strong>email</strong>; a name and
        Psychology Today link are optional (any order, comma- or tab-separated). Up to {MAX_BULK_INVITES}.
      </p>

      {/* Step 1 — paste */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <TextArea
          rows={3}
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          aria-label="Paste practitioners to invite"
          placeholder={"jordan@example.com, Jordan Lee, https://www.psychologytoday.com/us/therapists/jordan-lee\nsam@example.com, Sam Rivera"}
          className="flex-1 font-mono text-[13px]"
        />
        <div className="sm:self-end">
          <Button type="button" tone="secondary" onClick={ingestPaste} disabled={!pasteText.trim()}>
            Add to list ↓
          </Button>
        </div>
      </div>
      {note ? <p className="mt-2 text-[12.5px] text-ink-muted">{note}</p> : null}

      {/* Step 2 — editable rows */}
      {rows.length > 0 ? (
        <div className="mt-5">
          <div className="hidden gap-2 px-1 pb-1 text-[11px] uppercase tracking-wide text-ink-muted sm:grid sm:grid-cols-[1.4fr_1fr_1.6fr_auto]">
            <span>Email</span>
            <span>Name</span>
            <span>Psychology Today link</span>
            <span className="sr-only">Remove</span>
          </div>
          <ul className="flex flex-col gap-2">
            {rows.map((r) => {
              const invalid = r.email.trim() !== "" && !EMAIL_RE.test(r.email.trim());
              return (
                <li key={r.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1.4fr_1fr_1.6fr_auto] sm:items-center">
                  <TextInput
                    type="email"
                    value={r.email}
                    onChange={(e) => update(r.id, "email", e.target.value)}
                    aria-label="Email"
                    placeholder="email (required)"
                    className={invalid ? "border-clay/60 focus:border-clay" : ""}
                  />
                  <TextInput value={r.displayName} onChange={(e) => update(r.id, "displayName", e.target.value)} aria-label="Name" placeholder="name" />
                  <TextInput value={r.importUrl} onChange={(e) => update(r.id, "importUrl", e.target.value)} aria-label="Psychology Today link" placeholder="psychologytoday.com/… (optional)" />
                  <button
                    type="button"
                    onClick={() => removeRow(r.id)}
                    aria-label={`Remove ${r.email || "row"}`}
                    className="justify-self-start rounded-full px-3 py-1 text-[12px] text-ink-muted hover:text-clay sm:justify-self-center"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button type="button" onClick={send} disabled={pending || readyCount === 0}>
              {pending ? "Sending…" : `Send ${readyCount} invite${readyCount === 1 ? "" : "s"}`}
            </Button>
            <button type="button" onClick={addBlank} className="text-[13px] text-teal underline-offset-2 hover:underline">
              + Add a row
            </button>
            {rows.length - readyCount > 0 ? (
              <span className="text-[12.5px] text-clay">{rows.length - readyCount} row(s) need a valid email</span>
            ) : null}
          </div>
        </div>
      ) : null}

      {result && !result.ok ? (
        <p role="alert" className="mt-3 text-[13.5px] text-ocean">
          {result.error}
        </p>
      ) : null}

      {/* Step 3 — results */}
      {result && result.ok ? (
        <div className="mt-5 space-y-3">
          <div className="rounded-xl border border-teal/30 bg-seafoam/20 p-4 text-[13px] leading-[1.7] text-charcoal">
            <p className="font-medium text-teal">
              {result.summary.created} invite{result.summary.created === 1 ? "" : "s"} created
              {result.summary.emailed > 0 ? ` · ${result.summary.emailed} emailed` : ""}
            </p>
            <p className="text-ink-soft">
              {result.summary.emailed === 0 && result.summary.created > 0 ? "Auto-email isn't switched on — copy each link below and send it however you like. " : ""}
              {result.summary.skippedExisting > 0 ? `${result.summary.skippedExisting} already had a pending invite (skipped). ` : ""}
              {result.summary.duplicates > 0 ? `${result.summary.duplicates} duplicate${result.summary.duplicates === 1 ? "" : "s"} ignored. ` : ""}
              {result.summary.failed > 0 ? `${result.summary.failed} failed.` : ""}
            </p>
          </div>

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
        </div>
      ) : null}
    </section>
  );
}
