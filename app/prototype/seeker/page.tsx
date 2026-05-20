"use client";

import { useState } from "react";
import {
  Button,
  Card,
  ChoiceChip,
  Container,
  DLRow,
  Field,
  LinkButton,
  SectionHeader,
  StepDots,
  TextArea,
  TextInput,
} from "../_components/ui";
import type { Modality, SessionFormat, Urgency } from "../_lib/types";

type LookingFor = Modality | "Not sure yet";

const lookingForOptions: LookingFor[] = [
  "Therapy",
  "Acupuncture",
  "Reiki",
  "Movement",
  "Trauma-informed support",
  "Not sure yet",
];

const formatOptions: SessionFormat[] = ["In person", "Virtual", "Either"];
const urgencyOptions: Urgency[] = ["Within a week", "This month", "Open-ended"];

const TOTAL_FORM_STEPS = 6;

export default function SeekerFlow() {
  const [step, setStep] = useState(0);

  const [lookingFor, setLookingFor] = useState<LookingFor[]>([]);
  const [story, setStory] = useState("");
  const [location, setLocation] = useState("");
  const [format, setFormat] = useState<SessionFormat | "">("");
  const [budget, setBudget] = useState("");
  const [genderPreference, setGenderPreference] = useState("");
  const [availability, setAvailability] = useState("");
  const [urgency, setUrgency] = useState<Urgency | "">("");
  const [consent, setConsent] = useState(false);

  function toggleLookingFor(option: LookingFor) {
    setLookingFor((prev) =>
      prev.includes(option) ? prev.filter((x) => x !== option) : [...prev, option],
    );
  }

  function next() {
    setStep((s) => Math.min(s + 1, 6));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  return (
    <main className="py-16 md:py-24">
      <Container size="narrow">
        {step === 0 ? (
          <Welcome onBegin={next} />
        ) : step === 6 ? (
          <Confirmation />
        ) : (
          <div>
            <div className="mb-10 flex items-center justify-between">
              <p className="meta text-ink-muted">
                Step {step} of {TOTAL_FORM_STEPS - 1}
              </p>
              <StepDots total={TOTAL_FORM_STEPS - 1} current={step - 1} />
            </div>

            {step === 1 ? (
              <StepLookingFor
                value={lookingFor}
                onToggle={toggleLookingFor}
              />
            ) : null}

            {step === 2 ? <StepStory value={story} onChange={setStory} /> : null}

            {step === 3 ? (
              <StepPreferences
                location={location}
                setLocation={setLocation}
                format={format}
                setFormat={setFormat}
                budget={budget}
                setBudget={setBudget}
                genderPreference={genderPreference}
                setGenderPreference={setGenderPreference}
                availability={availability}
                setAvailability={setAvailability}
                urgency={urgency}
                setUrgency={setUrgency}
              />
            ) : null}

            {step === 4 ? (
              <StepConsent consent={consent} setConsent={setConsent} />
            ) : null}

            {step === 5 ? (
              <StepReview
                lookingFor={lookingFor}
                story={story}
                location={location}
                format={format}
                budget={budget}
                genderPreference={genderPreference}
                availability={availability}
                urgency={urgency}
              />
            ) : null}

            <div className="mt-12 flex items-center justify-between">
              <Button tone="ghost" onClick={back}>
                ← Back
              </Button>
              {step === 5 ? (
                <Button onClick={next}>Submit</Button>
              ) : (
                <Button onClick={next}>Continue →</Button>
              )}
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}

function Welcome({ onBegin }: { onBegin: () => void }) {
  return (
    <div>
      <SectionHeader
        eyebrow="Seeker intake"
        title={
          <>
            Tell us where you are.
            <br />
            <span className="italic text-ocean">Plain language is enough.</span>
          </>
        }
        body={
          <>
            A few short steps. Write the way you'd write to a friend who happens to know
            the right people. No clinical jargon, no forms to perform on. Two paragraphs
            is plenty.
          </>
        }
      />

      <Card className="mt-12">
        <p className="meta text-ink-muted">A note on privacy</p>
        <p className="mt-4 text-[15px] leading-[1.7] text-ink-soft">
          What you share here is private. One person — Nora — reads it first. Nothing is
          forwarded to a practitioner until she's matched you and written a small
          shortlist with reasons. You can stop or skip anything at any time.
        </p>
        <div className="mt-10">
          <Button onClick={onBegin}>Begin →</Button>
        </div>
      </Card>

      <p className="meta mt-10 text-ink-muted">
        Takes about five minutes. Nothing is saved until you submit at the end.
      </p>
    </div>
  );
}

function StepLookingFor({
  value,
  onToggle,
}: {
  value: LookingFor[];
  onToggle: (o: LookingFor) => void;
}) {
  return (
    <div>
      <SectionHeader
        eyebrow="01 / What you're looking for"
        title="What kind of care are you considering?"
        body={
          <>
            Pick anything that feels close. You can choose more than one, or pick "Not
            sure yet" — that's a real answer.
          </>
        }
      />

      <div className="mt-12 grid grid-cols-1 gap-3 md:grid-cols-2">
        {lookingForOptions.map((option) => (
          <ChoiceChip
            key={option}
            label={option}
            selected={value.includes(option)}
            onClick={() => onToggle(option)}
          />
        ))}
      </div>
    </div>
  );
}

function StepStory({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <SectionHeader
        eyebrow="02 / Your story"
        title="What's bringing you here?"
        body={
          <>
            Two paragraphs is plenty. No clinical jargon needed. Tell us what's going on,
            what you've tried, what you'd want to be different a few months from now.
          </>
        }
      />

      <Card className="mt-12">
        <Field
          label="In your own words"
          hint="Whatever you write stays between you and Nora until you're matched."
        >
          <TextArea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="I've been carrying a lot since…"
            rows={10}
          />
        </Field>
      </Card>
    </div>
  );
}

function StepPreferences({
  location,
  setLocation,
  format,
  setFormat,
  budget,
  setBudget,
  genderPreference,
  setGenderPreference,
  availability,
  setAvailability,
  urgency,
  setUrgency,
}: {
  location: string;
  setLocation: (v: string) => void;
  format: SessionFormat | "";
  setFormat: (v: SessionFormat) => void;
  budget: string;
  setBudget: (v: string) => void;
  genderPreference: string;
  setGenderPreference: (v: string) => void;
  availability: string;
  setAvailability: (v: string) => void;
  urgency: Urgency | "";
  setUrgency: (v: Urgency) => void;
}) {
  return (
    <div>
      <SectionHeader
        eyebrow="03 / Preferences"
        title="A few practical pieces."
        body={
          <>
            These help Nora narrow the shortlist. Skip anything that doesn't apply —
            none of this is binding.
          </>
        }
      />

      <Card className="mt-12 space-y-10">
        <Field label="Where are you" hint="City, neighborhood, or just a region.">
          <TextInput
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Brooklyn, NY"
          />
        </Field>

        <div>
          <p className="meta text-ink-muted">How you'd like to meet</p>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            {formatOptions.map((option) => (
              <ChoiceChip
                key={option}
                label={option}
                selected={format === option}
                onClick={() => setFormat(option)}
              />
            ))}
          </div>
        </div>

        <Field
          label="Budget or insurance notes"
          hint="A sentence is plenty. Sliding scale, out-of-network, a number you can hold."
        >
          <TextArea
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            rows={3}
            className="min-h-[88px]"
            placeholder="Out-of-network is okay if there's a superbill. Around $150 / session."
          />
        </Field>

        <Field
          label="Gender preference for your practitioner"
          optional
          hint="Only if it matters to you."
        >
          <TextInput
            value={genderPreference}
            onChange={(e) => setGenderPreference(e.target.value)}
            placeholder="Woman, nonbinary, no preference…"
          />
        </Field>

        <Field
          label="When are you generally free"
          hint="Days, evenings, weekends — a rough shape is fine."
        >
          <TextInput
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            placeholder="Weekday evenings after 6, or Saturday mornings."
          />
        </Field>

        <div>
          <p className="meta text-ink-muted">How soon would you want to start</p>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            {urgencyOptions.map((option) => (
              <ChoiceChip
                key={option}
                label={option}
                selected={urgency === option}
                onClick={() => setUrgency(option)}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function StepConsent({
  consent,
  setConsent,
}: {
  consent: boolean;
  setConsent: (v: boolean) => void;
}) {
  return (
    <div>
      <SectionHeader
        eyebrow="04 / Consent"
        title="One small note before you submit."
        body={
          <>
            Your story is private. Nora reads it first — no practitioner sees anything
            you wrote until she's chosen a small shortlist and written the reasoning
            herself. We don't sell your data. We don't run ads.
          </>
        }
      />

      <Card className="mt-12">
        <button
          type="button"
          onClick={() => setConsent(!consent)}
          aria-pressed={consent}
          className="flex w-full items-start gap-4 rounded-2xl border border-rule p-5 text-left transition-colors hover:border-charcoal/40 hover:bg-sand-deep/30"
        >
          <span
            aria-hidden
            className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
              consent ? "border-charcoal bg-charcoal text-sand" : "border-rule-strong/40 bg-white"
            }`}
          >
            {consent ? <span className="text-[12px] leading-none">✓</span> : null}
          </span>
          <span className="text-[15px] leading-[1.6] text-charcoal">
            I understand this will be read by a person before any practitioner sees it.
          </span>
        </button>
      </Card>
    </div>
  );
}

function StepReview({
  lookingFor,
  story,
  location,
  format,
  budget,
  genderPreference,
  availability,
  urgency,
}: {
  lookingFor: LookingFor[];
  story: string;
  location: string;
  format: SessionFormat | "";
  budget: string;
  genderPreference: string;
  availability: string;
  urgency: Urgency | "";
}) {
  return (
    <div>
      <SectionHeader
        eyebrow="05 / Review"
        title="Here's what we'll send to Nora."
        body={
          <>
            Take a moment to read it back. You can step back to edit anything — nothing
            is sent until you press submit.
          </>
        }
      />

      <Card className="mt-12">
        <dl>
          <DLRow label="Looking for">
            {lookingFor.length ? lookingFor.join(", ") : <em className="text-ink-muted">—</em>}
          </DLRow>
          <DLRow label="Story">
            {story ? (
              <span className="whitespace-pre-wrap">{story}</span>
            ) : (
              <em className="text-ink-muted">—</em>
            )}
          </DLRow>
          <DLRow label="Location">
            {location || <em className="text-ink-muted">—</em>}
          </DLRow>
          <DLRow label="Format">
            {format || <em className="text-ink-muted">—</em>}
          </DLRow>
          <DLRow label="Budget / insurance">
            {budget ? (
              <span className="whitespace-pre-wrap">{budget}</span>
            ) : (
              <em className="text-ink-muted">—</em>
            )}
          </DLRow>
          <DLRow label="Gender preference">
            {genderPreference || <em className="text-ink-muted">—</em>}
          </DLRow>
          <DLRow label="Availability">
            {availability || <em className="text-ink-muted">—</em>}
          </DLRow>
          <DLRow label="Urgency">
            {urgency || <em className="text-ink-muted">—</em>}
          </DLRow>
        </dl>
      </Card>
    </div>
  );
}

function Confirmation() {
  return (
    <div>
      <SectionHeader
        eyebrow="Sent"
        title={
          <>
            Thank you.
            <br />
            <span className="italic text-ocean">We have it from here.</span>
          </>
        }
        body={
          <>
            We'll read this and send back a small shortlist with reasons — three to five
            practitioners, each with a sentence about why we thought of them for you. It
            usually takes a few days. Watch your inbox.
          </>
        }
      />

      <Card className="mt-12">
        <p className="meta text-ink-muted">What happens next</p>
        <ul className="mt-6 space-y-5 text-[15px] leading-[1.7] text-ink-soft">
          <li>
            <span className="font-medium text-charcoal">Nora reads it.</span> A real
            person, not a triage system.
          </li>
          <li>
            <span className="font-medium text-charcoal">A shortlist arrives.</span> By
            email, with the reasoning written in.
          </li>
          <li>
            <span className="font-medium text-charcoal">You reach out directly.</span>{" "}
            From the first message, the relationship is yours.
          </li>
        </ul>
      </Card>

      <div className="mt-12 flex flex-wrap items-center gap-4">
        <LinkButton href="/prototype" tone="primary">
          Back to prototype index
        </LinkButton>
        <LinkButton href="/prototype/seeker" tone="secondary">
          Start over
        </LinkButton>
      </div>
    </div>
  );
}
