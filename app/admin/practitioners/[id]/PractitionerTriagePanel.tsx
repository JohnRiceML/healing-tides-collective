"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button, TextInput, TextArea } from "@/app/_components/ui";
import { categoryMeta, type TriageResult, type TriageTone } from "@/app/_lib/triage";
import type { AdminNote } from "@/app/_lib/admin-notes";
import { runTriage, saveAdminNote, messagePractitioner } from "../../triage-actions";

const when = (iso: string) => (iso ? iso.slice(0, 10) : "");

const toneClass: Record<TriageTone, string> = {
  good: "bg-seafoam/50 text-ocean ring-teal/30",
  warn: "bg-clay/10 text-clay ring-clay/30",
  neutral: "bg-sand-deep/60 text-ink-soft ring-rule",
};

// Triage + notes are rendered straight from the server props (the page is force-dynamic and each
// action calls router.refresh()), so the displayed data is always the source of truth — no local
// copy that could drift from, or mask a lost write on, the server. The useTransition pending state
// covers the gap until the refresh lands.
export function PractitionerTriagePanel({
  practitionerId,
  displayName,
  email,
  initialTriage,
  initialNotes,
}: {
  practitionerId: string;
  displayName: string | null;
  email: string | null;
  initialTriage: TriageResult | null;
  initialNotes: AdminNote[];
}) {
  const router = useRouter();
  const [noteText, setNoteText] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [triaging, startTriage] = useTransition();
  const [savingNote, startNote] = useTransition();
  const [sending, startSend] = useTransition();

  const triage = initialTriage;
  const notes = initialNotes;
  const cat = triage ? categoryMeta(triage.category) : null;

  function triageNow() {
    setErr(null);
    startTriage(async () => {
      const res = await runTriage(practitionerId);
      if (res.ok) router.refresh();
      else setErr(res.error);
    });
  }

  function addNote() {
    setErr(null);
    if (!noteText.trim()) return;
    startNote(async () => {
      const res = await saveAdminNote(practitionerId, noteText);
      if (res.ok) {
        setNoteText("");
        router.refresh();
      } else setErr(res.error ?? "Couldn't save the note.");
    });
  }

  function sendEmail() {
    setErr(null);
    setEmailStatus(null);
    startSend(async () => {
      const res = await messagePractitioner(practitionerId, subject, body);
      if (res.ok) {
        setEmailStatus(`Sent to ${email}.`);
        setSubject("");
        setBody("");
        router.refresh();
      } else setErr(res.error ?? "Couldn't send.");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* AI triage */}
      <section className="rounded-2xl border border-rule/70 bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="meta text-ink-muted">AI triage</p>
          <Button type="button" tone="secondary" onClick={triageNow} disabled={triaging} aria-busy={triaging}>
            {triaging ? "Reading…" : triage ? "Re-run" : "Run AI triage"}
          </Button>
        </div>

        <div role="status" aria-live="polite">
          {triage && cat ? (
            <div className="mt-4">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-[13px] font-medium ring-1 ${toneClass[cat.tone]}`}>
                {cat.label}
              </span>
              {triage.tags.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {triage.tags.map((t) => (
                    <span key={t} className="rounded-full bg-sand-deep/60 px-2.5 py-0.5 text-[12px] text-ink-soft">
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
              {triage.insights.length ? (
                <ul className="mt-3 flex flex-col gap-1.5">
                  {triage.insights.map((i, idx) => (
                    <li key={idx} className="flex gap-2 text-[13.5px] leading-[1.6] text-charcoal">
                      <span aria-hidden className="text-teal">·</span>
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-3 text-[11.5px] text-ink-muted">An AI read to help you sort — not a judgment. Ran {when(triage.at)}.</p>
            </div>
          ) : (
            <p className="mt-3 text-[13.5px] leading-[1.6] text-ink-soft">
              Run a quick AI read to categorize this profile and flag what stands out — a starting point, not a verdict.
            </p>
          )}
        </div>
      </section>

      {/* Notes */}
      <section className="rounded-2xl border border-rule/70 bg-white p-6">
        <p className="meta text-ink-muted">Private notes</p>
        <div className="mt-3 flex flex-col gap-2">
          <TextArea
            rows={2}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            aria-label="Add a private note"
            placeholder="A note only you can see…"
          />
          <div>
            <Button type="button" onClick={addNote} disabled={savingNote || !noteText.trim()}>
              {savingNote ? "Saving…" : "Save note"}
            </Button>
          </div>
        </div>
        {notes.length ? (
          <ul className="mt-4 flex flex-col divide-y divide-rule/50">
            {notes.map((n, i) => (
              <li key={`${n.at}-${i}`} className="py-2.5">
                <p className="whitespace-pre-wrap text-[13.5px] leading-[1.6] text-charcoal">{n.text}</p>
                <p className="mt-1 text-[11.5px] text-ink-muted">
                  {n.by ? `${n.by} · ` : ""}
                  {when(n.at)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-[13px] text-ink-muted">No notes yet.</p>
        )}
      </section>

      {/* Email */}
      <section className="rounded-2xl border border-rule/70 bg-white p-6">
        <p className="meta text-ink-muted">Email {displayName ?? "this practitioner"}</p>
        {email ? (
          <div className="mt-3 flex flex-col gap-2">
            <TextInput value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Subject" placeholder="Subject" />
            <TextArea rows={4} value={body} onChange={(e) => setBody(e.target.value)} aria-label="Message" placeholder={`Hi ${displayName ?? "there"},`} />
            <div className="flex items-center gap-3">
              <Button type="button" onClick={sendEmail} disabled={sending || !subject.trim() || !body.trim()}>
                {sending ? "Sending…" : "Send email"}
              </Button>
              <span className="text-[12px] text-ink-muted">to {email}</span>
            </div>
            <p role="status" aria-live="polite" className="text-[12.5px] text-teal">
              {emailStatus}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-[13px] text-ink-muted">No email on file for this practitioner.</p>
        )}
      </section>

      {err ? <p role="alert" className="text-[13px] text-ocean">{err}</p> : null}
    </div>
  );
}
