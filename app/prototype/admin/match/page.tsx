"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Button,
  Card,
  Container,
  DLRow,
  TextArea,
} from "@/app/prototype/_components/ui";
import {
  getSeeker,
  inProgressSeekers,
  practitioners,
  seekers,
} from "@/app/prototype/_data/mock";
import type { Practitioner, Seeker } from "@/app/prototype/_lib/types";

type ShortlistItem = {
  practitionerId: string;
  reason: string;
};

const SHORTLIST_TARGET = 3;

function Tag({
  children,
  size = "md",
}: {
  children: React.ReactNode;
  size?: "sm" | "md";
}) {
  const cls =
    size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-[12px]";
  return (
    <span
      className={`inline-flex items-center rounded-full bg-sand-deep ${cls} font-medium tracking-[0.02em] text-ink-soft`}
    >
      {children}
    </span>
  );
}

const pairReasons: Record<string, Record<string, string>> = {
  "sk-001": {
    "pr-001":
      "Elena has spent her career on grief work — and explicitly works with maternal loss. She isn&apos;t trying to fix you; she sits with it.",
    "pr-005":
      "Naomi works slowly and somatically with people who&apos;ve held it together for everyone else. Evenings and virtual fit Maya&apos;s schedule.",
    "pr-004":
      "Ana&apos;s movement work is gentle and trauma-sensitive — a good companion piece if Maya wants her body to be part of the healing, not just her words.",
  },
  "sk-002": {
    "pr-002":
      "Marcus runs a small one-room practice — the opposite of the chain places David has tried. Eleven years of orthopedic-focused acupuncture, careful intake.",
    "pr-004":
      "Ana&apos;s Feldenkrais and somatic work is built for people returning to their bodies after long pain. No adjustments, no athletic conditioning energy.",
  },
  "sk-003": {
    "pr-005":
      "Naomi has spent the last decade exclusively on relational and complex trauma — and explicitly welcomes clients who&apos;ve tried CBT and bounced off. Mornings, virtual.",
    "pr-001":
      "Elena&apos;s IFS and somatic experiencing training fits the &lsquo;slower, sit with it&rsquo; ask. Quiet, depth-oriented.",
  },
  "sk-004": {
    "pr-003":
      "Sara works with clients in exactly this kind of transition — leaving a career, leaving the city. Consent-first, unhurried.",
    "pr-004":
      "Ana&apos;s movement practice is quiet and unfashionable in the best way. Good fit for someone disconnected from their body and not looking for a workout.",
  },
};

function reasonFor(seekerId: string, practitionerId: string): string | null {
  return pairReasons[seekerId]?.[practitionerId] ?? null;
}

function genericReason(p: Practitioner): string {
  return `${p.name.split(",")[0].split(" ")[0]} ${p.worksBestWith.toLowerCase()}`;
}

function defaultReasonForShortlist(p: Practitioner, s: Seeker): string {
  const tailored = reasonFor(s.id, p.id);
  if (tailored) {
    return tailored.replace(/&apos;/g, "'").replace(/&lsquo;/g, "‘").replace(/&rsquo;/g, "’");
  }
  return `${p.name.split(",")[0].split(" ")[0]} feels like a good fit because of their work in ${p.specialties.slice(0, 2).join(" and ")}.`;
}

function PractitionerCard({
  practitioner,
  seeker,
  selected,
  onToggle,
}: {
  practitioner: Practitioner;
  seeker: Seeker;
  selected: boolean;
  onToggle: () => void;
}) {
  const tailored = reasonFor(seeker.id, practitioner.id);
  const reason = tailored ?? genericReason(practitioner);

  return (
    <article className="rounded-3xl border border-rule/80 bg-white p-7 md:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-[26px] leading-[1.15] text-charcoal">
            {practitioner.name}
          </h3>
          <p className="meta mt-2 text-ink-muted">{practitioner.location}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {practitioner.modalities.map((m) => (
            <Tag key={m}>{m}</Tag>
          ))}
        </div>
      </header>

      <div className="mt-6 rounded-2xl bg-sand-deep/70 px-6 py-5">
        <p className="meta text-ocean">Why this may be a fit</p>
        <p
          className="font-display mt-3 text-[19px] leading-[1.5] italic text-charcoal"
          dangerouslySetInnerHTML={{ __html: reason }}
        />
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
        <div className="border-t border-rule/60 py-3">
          <dt className="meta text-ink-muted">Specialties</dt>
          <dd className="mt-2 flex flex-wrap gap-1.5">
            {practitioner.specialties.map((s) => (
              <Tag key={s} size="sm">
                {s}
              </Tag>
            ))}
          </dd>
        </div>
        <div className="border-t border-rule/60 py-3">
          <dt className="meta text-ink-muted">Availability</dt>
          <dd className="mt-2 text-[14px] leading-[1.55] text-ink-soft">
            {practitioner.availability}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-[13px] italic leading-[1.55] text-ink-muted">
        Notes: {practitioner.traumaInformed}
      </p>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-[13px] text-ink-muted">
          {practitioner.yearsExperience} years in practice
        </span>
        <button
          type="button"
          onClick={onToggle}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium tracking-[0.01em] transition-colors ${
            selected
              ? "border border-ocean/30 bg-seafoam/50 text-ocean hover:bg-seafoam/70"
              : "border border-charcoal/20 bg-white text-charcoal hover:border-charcoal/40 hover:bg-sand-deep/60"
          }`}
        >
          {selected ? "Added ✓ — Remove" : "Add to shortlist"}
        </button>
      </div>
    </article>
  );
}

function MatchWorkspace() {
  const params = useSearchParams();
  const seekerIdFromParam = params.get("seekerId");
  const defaultSeeker =
    (seekerIdFromParam && getSeeker(seekerIdFromParam)) ||
    inProgressSeekers[0] ||
    seekers[0];

  const [seekerId, setSeekerId] = useState<string>(defaultSeeker.id);
  const seeker = getSeeker(seekerId) ?? defaultSeeker;

  const referable = useMemo(
    () =>
      practitioners.filter(
        (p) => p.status === "Approved" && p.acceptingReferrals,
      ),
    [],
  );

  const [shortlist, setShortlist] = useState<ShortlistItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [note, setNote] = useState(
    "I held this list for a few days before sending. Take your time — you don't have to reply to anyone today.",
  );
  const [sent, setSent] = useState(false);

  function toggle(p: Practitioner) {
    setShortlist((curr) => {
      const exists = curr.find((c) => c.practitionerId === p.id);
      if (exists) return curr.filter((c) => c.practitionerId !== p.id);
      return [
        ...curr,
        {
          practitionerId: p.id,
          reason: defaultReasonForShortlist(p, seeker),
        },
      ];
    });
  }

  function updateReason(practitionerId: string, reason: string) {
    setShortlist((curr) =>
      curr.map((c) =>
        c.practitionerId === practitionerId ? { ...c, reason } : c,
      ),
    );
  }

  function handleSwitchSeeker(id: string) {
    setSeekerId(id);
    setShortlist([]);
    setShowPreview(false);
    setSent(false);
  }

  function handleSend() {
    setSent(true);
    setShowPreview(false);
  }

  const canPreview = shortlist.length >= 3;
  const switchableSeekers = inProgressSeekers.length
    ? inProgressSeekers
    : seekers;

  return (
    <main className="py-12 md:py-16">
      <Container size="wide">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Link
              href="/prototype/admin"
              className="meta inline-flex items-center gap-2 text-ink-muted hover:text-charcoal"
            >
              <span aria-hidden>←</span> Back to dashboard
            </Link>
            <h1 className="font-display mt-4 text-[clamp(30px,4vw,42px)] leading-[1.05] tracking-[-0.01em] text-charcoal">
              Matching workspace
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-[1.6] text-ink-soft">
              You&apos;re building a shortlist for{" "}
              <span className="text-charcoal">{seeker.firstName}</span>. Aim for{" "}
              {SHORTLIST_TARGET} practitioners. There&apos;s no rush.
            </p>
          </div>
          <div>
            <p className="meta text-ink-muted">Working on</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {switchableSeekers.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSwitchSeeker(s.id)}
                  className={`inline-flex items-center rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
                    s.id === seekerId
                      ? "border-charcoal bg-charcoal text-sand"
                      : "border-rule bg-white text-ink-soft hover:border-charcoal/40 hover:text-charcoal"
                  }`}
                >
                  {s.firstName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {sent ? (
          <div className="mt-10 rounded-3xl bg-seafoam/60 px-7 py-6">
            <p className="meta text-ocean">Introduction sent</p>
            <p className="font-display mt-3 text-[22px] leading-[1.4] text-ocean">
              {seeker.firstName} will receive your note within the hour.
            </p>
            <p className="mt-3 text-[14px] leading-[1.6] text-ink-soft">
              Each practitioner you selected has been emailed a brief introduction
              with {seeker.firstName}&apos;s context, your note, and reply
              instructions.
            </p>
          </div>
        ) : null}

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[360px_1fr]">
          {/* Left column: seeker details */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <Card className="!p-7">
              <p className="meta text-ink-muted">The seeker</p>
              <h2 className="font-display mt-3 text-[28px] leading-[1.1] text-charcoal">
                {seeker.firstName}
                {seeker.pronouns ? (
                  <span className="ml-3 align-middle text-[14px] font-normal text-ink-muted">
                    {seeker.pronouns}
                  </span>
                ) : null}
              </h2>
              <p className="meta mt-2 text-ink-muted">
                Submitted {seeker.submittedAt}
              </p>

              <blockquote className="font-display mt-6 border-l-2 border-ocean/40 pl-5 text-[17px] leading-[1.55] italic text-ocean">
                {seeker.story}
              </blockquote>

              <dl className="mt-8">
                <DLRow label="Looking for">
                  {seeker.modalities.join(", ")}
                </DLRow>
                <DLRow label="Location">{seeker.location}</DLRow>
                <DLRow label="Format">{seeker.format}</DLRow>
                <DLRow label="Budget">{seeker.budget}</DLRow>
                {seeker.genderPreference ? (
                  <DLRow label="Preference">{seeker.genderPreference}</DLRow>
                ) : null}
                <DLRow label="Availability">{seeker.availability}</DLRow>
                <DLRow label="Urgency">{seeker.urgency}</DLRow>
              </dl>

              {seeker.noraNotes ? (
                <div className="mt-6 rounded-2xl bg-seafoam/40 px-5 py-4">
                  <p className="meta text-ocean">Your note</p>
                  <p className="font-display mt-2 text-[15px] leading-[1.55] italic text-charcoal">
                    {seeker.noraNotes}
                  </p>
                </div>
              ) : null}
            </Card>
          </aside>

          {/* Right column: practitioners */}
          <div className="flex flex-col gap-6">
            <div className="flex items-end justify-between gap-3 border-b border-rule/60 pb-4">
              <div>
                <p className="meta text-ink-muted">Suggested practitioners</p>
                <h2 className="font-display mt-2 text-[24px] leading-tight text-charcoal">
                  {referable.length} possible fits
                </h2>
              </div>
              <p className="text-[13px] text-ink-muted">
                Filtered to practitioners accepting referrals
              </p>
            </div>

            <ul className="grid grid-cols-1 gap-6">
              {referable.map((p) => (
                <li key={p.id}>
                  <PractitionerCard
                    practitioner={p}
                    seeker={seeker}
                    selected={Boolean(
                      shortlist.find((s) => s.practitionerId === p.id),
                    )}
                    onToggle={() => toggle(p)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sticky shortlist tray */}
        {shortlist.length > 0 && !sent ? (
          <div className="sticky bottom-6 z-30 mt-16">
            <div className="rounded-3xl border border-rule/80 bg-white p-6 shadow-[0_18px_44px_-22px_rgba(31,58,95,0.25)] md:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="meta text-ink-muted">
                    Shortlist for {seeker.firstName}
                  </p>
                  <p className="font-display mt-2 text-[22px] leading-tight text-charcoal">
                    {shortlist.length} of {SHORTLIST_TARGET} added
                  </p>
                </div>
                <Button
                  tone={canPreview ? "primary" : "secondary"}
                  disabled={!canPreview}
                  onClick={() => setShowPreview(true)}
                >
                  Preview shortlist
                </Button>
              </div>

              <ul className="mt-6 grid grid-cols-1 gap-4">
                {shortlist.map((item) => {
                  const p = practitioners.find(
                    (pr) => pr.id === item.practitionerId,
                  );
                  if (!p) return null;
                  return (
                    <li
                      key={item.practitionerId}
                      className="rounded-2xl bg-sand-deep/50 px-5 py-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-[18px] text-charcoal">
                            {p.name}
                          </p>
                          <p className="meta mt-1 text-ink-muted">
                            {p.modalities.join(", ")} · {p.location}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggle(p)}
                          className="meta text-ink-muted hover:text-charcoal"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-3">
                        <label className="meta text-ink-muted">
                          Reason for {seeker.firstName}
                        </label>
                        <TextArea
                          value={item.reason}
                          onChange={(e) =>
                            updateReason(item.practitionerId, e.target.value)
                          }
                          className="mt-2 min-h-[80px]"
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : null}

        {/* Shortlist preview */}
        {showPreview && !sent ? (
          <div className="mt-16 rounded-3xl border border-rule/80 bg-white p-8 md:p-12">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-rule/60 pb-6">
              <div>
                <p className="meta text-ink-muted">Preview — what {seeker.firstName} will receive</p>
                <h2 className="font-display mt-3 text-[clamp(26px,3vw,34px)] leading-[1.1] text-charcoal">
                  Three practitioners we&apos;d like you to meet.
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="meta text-ink-muted hover:text-charcoal"
              >
                Close preview
              </button>
            </div>

            <p className="mt-8 text-[16px] leading-[1.7] text-ink-soft">
              Hi {seeker.firstName}, — thanks for trusting us with your intake.
              Here&apos;s a small handful of people who feel like they could fit
              what you described. There&apos;s no obligation to reach out to all
              of them. Take your time.
            </p>

            <ul className="mt-10 grid grid-cols-1 gap-10">
              {shortlist.map((item) => {
                const p = practitioners.find(
                  (pr) => pr.id === item.practitionerId,
                );
                if (!p) return null;
                return (
                  <li key={p.id} className="border-t border-rule/60 pt-8">
                    <p className="font-display text-[26px] leading-tight text-charcoal">
                      {p.name}
                    </p>
                    <p className="meta mt-2 text-ink-muted">
                      {p.modalities.join(", ")} · {p.location}
                    </p>
                    <p className="font-display mt-5 text-[18px] leading-[1.55] italic text-ocean">
                      {item.reason}
                    </p>
                    <p className="mt-5 text-[14px] leading-[1.6] text-ink-soft">
                      Reply directly to{" "}
                      <span className="text-charcoal">{p.email}</span> within 7
                      days. {p.availability}
                    </p>
                  </li>
                );
              })}
            </ul>

            <div className="mt-12 border-t border-rule/60 pt-8">
              <label className="meta text-ink-muted">
                Optional note from Healing Tides
              </label>
              <TextArea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-3"
              />
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <p className="text-[13px] text-ink-muted">
                This will email {seeker.firstName} and each practitioner above.
              </p>
              <Button tone="primary" onClick={handleSend}>
                Send introduction by email
              </Button>
            </div>
          </div>
        ) : null}
      </Container>
    </main>
  );
}

export default function MatchPage() {
  return (
    <Suspense
      fallback={
        <main className="py-12 md:py-16">
          <Container size="wide">
            <p className="meta text-ink-muted">Loading workspace…</p>
          </Container>
        </main>
      }
    >
      <MatchWorkspace />
    </Suspense>
  );
}
