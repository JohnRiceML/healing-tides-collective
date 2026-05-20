"use client";

import { useState } from "react";
import {
  Button,
  Card,
  ChoiceChip,
  Container,
  Field,
  SectionHeader,
  TextArea,
  TextInput,
} from "@/app/prototype/_components/ui";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const TIMES = ["Mornings", "Afternoons", "Evenings"] as const;

type Day = (typeof DAYS)[number];
type Time = (typeof TIMES)[number];

export default function AvailabilityPage() {
  const [days, setDays] = useState<Day[]>(["Tue", "Thu", "Fri"]);
  const [times, setTimes] = useState<Time[]>(["Evenings", "Afternoons"]);
  const [perMonth, setPerMonth] = useState("2");
  const [notes, setNotes] = useState(
    "I prefer to take new clients after an initial fit call. Please mention this in introductions.",
  );
  const [paused, setPaused] = useState(false);
  const [pauseUntil, setPauseUntil] = useState("");
  const [saved, setSaved] = useState(false);

  const toggleDay = (d: Day) =>
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  const toggleTime = (t: Time) =>
    setTimes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  return (
    <main className="py-12 md:py-16">
      <Container size="default">
        <SectionHeader
          eyebrow="Edit availability"
          title={
            <>
              When you can take
              <br />
              <span className="italic text-ocean">new clients.</span>
            </>
          }
          body="A realistic picture helps Nora send referrals that actually fit. Be honest about the current season — you can always change it later."
        />

        <Card className="mt-12">
          <div className="space-y-10">
            <Field
              label="Days of the week"
              hint="Pick the days you're generally available to see new clients."
            >
              <div className="flex flex-wrap gap-3">
                {DAYS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    aria-pressed={days.includes(d)}
                    className={`rounded-full border px-5 py-2 text-[14px] font-medium transition-colors ${
                      days.includes(d)
                        ? "border-charcoal bg-charcoal text-sand"
                        : "border-rule bg-white text-charcoal hover:border-charcoal/40 hover:bg-sand-deep/40"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Time of day" hint="When in the day are you available?">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {TIMES.map((t) => (
                  <ChoiceChip
                    key={t}
                    label={t}
                    selected={times.includes(t)}
                    onClick={() => toggleTime(t)}
                  />
                ))}
              </div>
            </Field>

            <Field
              label="New clients per month"
              hint="A realistic number is more useful than an aspirational one."
            >
              <TextInput
                inputMode="numeric"
                value={perMonth}
                onChange={(e) => setPerMonth(e.target.value)}
                className="max-w-[200px]"
              />
            </Field>

            <Field
              label="Notes about availability"
              hint="Anything Nora should know before sending a referral — preferred intake style, current season, etc."
            >
              <TextArea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Field>

            <div className="border-t border-rule/70 pt-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="meta text-ink-muted">Pause</p>
                  <h3 className="font-display mt-2 text-[22px] leading-tight text-charcoal">
                    Pause referrals temporarily
                  </h3>
                  <p className="mt-2 max-w-xl text-[14px] leading-[1.6] text-ink-soft">
                    You stay in the collective. Nora simply stops sending new
                    introductions until you turn it back on.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  aria-pressed={paused}
                  className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition-colors ${
                    paused
                      ? "border-ocean/30 bg-ocean/15"
                      : "border-rule bg-white"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full transition-transform ${
                      paused ? "translate-x-7 bg-ocean" : "translate-x-1 bg-charcoal/40"
                    }`}
                  />
                </button>
              </div>

              {paused ? (
                <div className="mt-6 max-w-md">
                  <Field label="Pause until">
                    <TextInput
                      type="date"
                      value={pauseUntil}
                      onChange={(e) => setPauseUntil(e.target.value)}
                    />
                  </Field>
                </div>
              ) : null}
            </div>
          </div>
        </Card>

        <div className="mt-10 flex flex-wrap items-center justify-end gap-4">
          {saved ? (
            <span className="meta text-ocean">Changes saved.</span>
          ) : null}
          <Button
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 2500);
            }}
          >
            Save changes
          </Button>
        </div>
      </Container>
    </main>
  );
}
