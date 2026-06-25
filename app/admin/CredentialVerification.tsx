"use client";

import { useMemo, useState, useTransition } from "react";

import { boardsForCredentials, type VerificationAttempt } from "@/app/_lib/credentials";
import { recordCredentialVerification } from "./actions";
import type { AdminPractitionerRow } from "./_data";

function statusChip(v: VerificationAttempt | null): { text: string; cls: string } {
  if (!v) return { text: "Not checked yet", cls: "bg-charcoal/5 text-ink-muted" };
  const when = v.at ? ` · ${v.at.slice(0, 10)}` : "";
  if (v.status === "verified") return { text: `Verified${when}`, cls: "bg-teal/15 text-teal" };
  if (v.status === "not_found") return { text: `Not found${when}`, cls: "bg-ocean/10 text-ocean" };
  return { text: `Pending${when}`, cls: "bg-sage/25 text-ocean" };
}

function CredentialRow({ row }: { row: AdminPractitionerRow }) {
  const boards = useMemo(() => boardsForCredentials(row.credentials), [row.credentials]);
  const [notes, setNotes] = useState(row.credentialVerification?.notes ?? "");
  const [status, setStatus] = useState<VerificationAttempt | null>(row.credentialVerification);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(s: "verified" | "not_found") {
    setError(null);
    start(async () => {
      const res = await recordCredentialVerification(row.id, { status: s, notes });
      if (res.ok) {
        setStatus({ status: s, by: "you", at: new Date().toISOString(), notes, credentials: row.credentials });
      } else {
        setError(res.error);
      }
    });
  }

  const sc = statusChip(status);

  return (
    <li className="rounded-xl border border-rule/70 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-charcoal">{row.displayName ?? "— no name —"}</span>
        <span className={`rounded-full px-2.5 py-0.5 text-[12px] ${sc.cls}`}>{sc.text}</span>
        {row.region ? <span className="text-[12px] text-ink-muted">{row.region}</span> : null}
      </div>
      <p className="mt-1 text-[13px] text-ink-soft">Stated: {row.credentials.join(", ")}</p>

      {boards.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {boards.map((b) => (
            <a
              key={b.board}
              href={b.lookupUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-teal/40 px-3 py-1 text-[12.5px] text-teal hover:bg-seafoam/30"
            >
              Open {b.board} ({b.codes.join(", ")}) →
            </a>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-[12.5px] text-ink-muted">
          No state licensing board for these — review the doc or accept as self-reported.
        </p>
      )}

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="What you saw on the board (license #, active & in good standing on this date) — required"
        aria-label={`Verification notes for ${row.displayName ?? "practitioner"}`}
        className="mt-3 min-h-[56px] w-full rounded-xl border border-rule bg-white px-3 py-2 text-[13px] text-charcoal placeholder:text-ink-muted focus:border-teal focus:outline-none"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={pending || !notes.trim()}
          onClick={() => submit("verified")}
          className="rounded-full bg-teal px-3 py-1.5 text-[13px] text-white hover:bg-teal/90 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Mark verified"}
        </button>
        <button
          type="button"
          disabled={pending || !notes.trim()}
          onClick={() => submit("not_found")}
          className="rounded-full border border-rule px-3 py-1.5 text-[13px] text-ink-soft hover:bg-sand/60 disabled:opacity-50"
        >
          Not found
        </button>
        {error ? <span role="alert" className="text-[12.5px] text-ocean">{error}</span> : null}
      </div>
    </li>
  );
}

/** Admin-assisted credential verification queue. Rows are the full practitioner list; we
 *  surface only those who've stated a credential, un-verified first. */
export function CredentialVerification({ rows }: { rows: AdminPractitionerRow[] }) {
  const queue = useMemo(() => {
    const withCreds = rows.filter((r) => r.credentials.length > 0);
    const done = (r: AdminPractitionerRow) => (r.credentialVerification?.status === "verified" ? 1 : 0);
    return [...withCreds].sort(
      (a, b) => done(a) - done(b) || (a.displayName ?? "").localeCompare(b.displayName ?? ""),
    );
  }, [rows]);

  return (
    <section className="mt-8 rounded-2xl border border-rule/70 bg-sand/40 p-6">
      <p className="meta text-ink-muted">Credential verification</p>
      <p className="mt-2 max-w-prose text-[14px] leading-[1.6] text-ink-soft">
        When a practitioner states a license, open the matching Minnesota board below, confirm it&rsquo;s active,
        and record what you saw. &ldquo;Verified&rdquo; grants the Licensed Professional badge; your note is the
        record. (No board has an API, so this is a quick human check — not automated.)
      </p>
      {queue.length === 0 ? (
        <p className="mt-4 text-[14px] text-ink-soft">No stated credentials to verify yet.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {queue.map((r) => (
            <CredentialRow key={r.id} row={r} />
          ))}
        </ul>
      )}
    </section>
  );
}
