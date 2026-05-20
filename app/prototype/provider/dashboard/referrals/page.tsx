"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Container,
  SectionHeader,
  StatusPill,
  TextArea,
} from "@/app/prototype/_components/ui";
import { getPractitioner } from "@/app/prototype/_data/mock";

const PAST_REFERRALS = [
  {
    id: "rh-past-1",
    seekerInitials: "R.A.",
    date: "Mar 12",
    status: "Booked first session",
  },
  {
    id: "rh-past-2",
    seekerInitials: "S.N.",
    date: "Feb 19",
    status: "Ongoing care",
  },
  {
    id: "rh-past-3",
    seekerInitials: "T.B.",
    date: "Jan 30",
    status: "Closed — completed work",
  },
];

export default function ReferralsPage() {
  const elena = getPractitioner("pr-001");
  const [accepting, setAccepting] = useState(elena?.acceptingReferrals ?? true);

  const all = [...(elena?.referralHistory ?? []), ...PAST_REFERRALS];

  return (
    <main className="py-12 md:py-16">
      <Container size="wide">
        <SectionHeader
          eyebrow="Referral history"
          title={
            <>
              The people Nora has
              <br />
              <span className="italic text-ocean">sent your way.</span>
            </>
          }
          body="Recent and past introductions. Make a quiet note of how each one landed — it helps Nora refer better next time."
        />

        <div className="mt-12 grid grid-cols-1 gap-4">
          {all.map((r) => (
            <ReferralRow
              key={r.id}
              initials={r.seekerInitials}
              date={r.date}
              status={r.status}
            />
          ))}
        </div>

        <section className="mt-20 border-t border-rule/70 pt-12">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-xl">
              <p className="meta text-ink-muted">Practice status</p>
              <h2 className="font-display mt-2 text-[28px] leading-[1.1] text-charcoal">
                Pause or resume accepting referrals
              </h2>
              <p className="mt-4 text-[15px] leading-[1.65] text-ink-soft">
                A single toggle. When paused, your profile stays visible to
                Nora but no new introductions go out. Turn it back on whenever
                you have room.
              </p>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-rule/70 bg-white px-4 py-2">
                <span
                  aria-hidden
                  className={`inline-block h-2 w-2 rounded-full ${
                    accepting ? "bg-sage" : "bg-ink-muted/50"
                  }`}
                />
                <span className="meta text-ink-soft">
                  {accepting ? "Accepting referrals" : "Paused"}
                </span>
              </div>
              <Button
                tone={accepting ? "secondary" : "primary"}
                onClick={() => setAccepting((a) => !a)}
              >
                {accepting ? "Pause referrals" : "Resume referrals"}
              </Button>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}

function ReferralRow({
  initials,
  date,
  status,
}: {
  initials: string;
  date: string;
  status: string;
}) {
  const [note, setNote] = useState("");

  return (
    <Card className="!p-6 md:!p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-display text-[22px] leading-tight text-charcoal">
            {initials}
          </p>
          <p className="meta mt-2 text-ink-muted">Introduced {date}</p>
        </div>
        <StatusPill status={status} />
      </div>

      <div className="mt-5">
        <label className="block">
          <span className="meta block text-ink-muted">Outcome note</span>
          <div className="mt-3">
            <TextArea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="A short note for yourself — and for Nora — about how this referral landed."
              className="min-h-[88px]"
            />
          </div>
        </label>
      </div>
    </Card>
  );
}
