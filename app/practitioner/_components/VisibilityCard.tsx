"use client";

import { useState, useTransition } from "react";

import { Button } from "@/app/_components/ui";
import { runVisibilityAudit, type VisibilityReport } from "../visibility-actions";

const REASON_COPY: Record<string, string> = {
  no_region: "Add your location to your profile, then we can check how you show up locally.",
  unconfigured: "Visibility checks aren't switched on yet — check back soon.",
  not_practitioner: "Set up your practitioner profile first.",
  unauthenticated: "Please sign in again.",
};

export function VisibilityCard() {
  const [report, setReport] = useState<VisibilityReport | null>(null);
  const [pending, start] = useTransition();

  function run() {
    start(async () => setReport(await runVisibilityAudit()));
  }

  return (
    <section className="rounded-2xl border border-rule/70 bg-white p-6">
      <p className="meta text-ink-muted">How you show up on Google</p>
      <p className="mt-2 max-w-prose text-[14.5px] leading-[1.6] text-ink-soft">
        When someone nearby searches for the kind of care you offer, do you appear? We check
        a few real searches for your specialty in your area.
      </p>

      <div className="mt-4">
        <Button type="button" onClick={run} disabled={pending}>
          {pending ? "Checking…" : report?.ok ? "Check again" : "Check my visibility"}
        </Button>
      </div>

      {report && !report.ok ? (
        <p className="mt-4 text-[14px] leading-[1.6] text-ink-soft">
          {REASON_COPY[report.reason] ?? "Couldn't run the check — please try again."}
        </p>
      ) : null}

      {report?.ok ? (
        <ul className="mt-5 space-y-3">
          {report.queries.map((q) => (
            <li key={q.query} className="rounded-xl border border-rule/70 bg-sand/40 p-4">
              <p className="text-[13px] font-medium text-charcoal">
                &ldquo;{q.query}&rdquo;
              </p>
              {q.found ? (
                <p className="mt-1.5 text-[13.5px] leading-[1.5] text-teal">
                  You appear{q.position ? ` — result #${q.position}` : ""}
                  {q.via === "website" ? " (your website)" : q.via === "profile" ? " (your Healing Tides page)" : ""}.
                </p>
              ) : (
                <>
                  <p className="mt-1.5 text-[13.5px] leading-[1.5] text-ocean">
                    Not on the first page yet.
                  </p>
                  {q.competitors.length ? (
                    <p className="mt-1 text-[12.5px] leading-[1.5] text-ink-muted">
                      Ranking instead: {q.competitors.join(" · ")}
                    </p>
                  ) : null}
                </>
              )}
            </li>
          ))}
          <li className="pt-1 text-[12.5px] leading-[1.5] text-ink-muted">
            A complete, published Healing Tides profile is one of the fastest ways to start
            showing up for these searches.
          </li>
        </ul>
      ) : null}
    </section>
  );
}
