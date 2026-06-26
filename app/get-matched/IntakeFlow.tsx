"use client";

import { useState, useTransition, type Dispatch, type SetStateAction } from "react";

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
} from "@/app/_components/ui";
import { CATEGORIES } from "@/app/_lib/taxonomy";
import {
  CARE_TYPES,
  FORMATS,
  AGE_GROUPS,
  INSURANCE,
  URGENCY,
  STYLE_PREFS,
  insuranceToBool,
} from "@/lib/seeker-intake";
import { submitIntake } from "./actions";

const FORM_STEPS = 7; // steps 1..7, between Welcome (0) and Confirmation (8)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const labelOf = (opts: readonly { value: string; label: string }[], v: string) =>
  opts.find((o) => o.value === v)?.label ?? "";

export function IntakeFlow() {
  const [step, setStep] = useState(0);
  const [submitting, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [story, setStory] = useState("");
  const [priorTherapy, setPriorTherapy] = useState("");
  const [stylePreference, setStylePreference] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [region, setRegion] = useState("");
  const [format, setFormat] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [genderPreference, setGenderPreference] = useState("");
  const [insurance, setInsurance] = useState("");
  const [insuranceName, setInsuranceName] = useState("");
  const [availability, setAvailability] = useState("");
  const [urgency, setUrgency] = useState("");
  const [budgetNote, setBudgetNote] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);

  const toggle = (set: Dispatch<SetStateAction<string[]>>) => (v: string) =>
    set((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  const goNext = () => {
    setError(null);
    setStep((s) => Math.min(s + 1, 8));
  };
  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  function submit() {
    setError(null);
    start(async () => {
      const res = await submitIntake({
        name,
        email,
        story,
        priorTherapy,
        stylePreference,
        lookingFor,
        specialties,
        region,
        format,
        ageGroup,
        genderPreference,
        usesInsurance: insuranceToBool(insurance),
        insuranceName,
        budgetNote,
        availability,
        urgency,
      });
      if (res.ok) setStep(8);
      else setError(res.error);
    });
  }

  if (step === 0)
    return (
      <Container size="narrow">
        <Welcome onBegin={goNext} />
      </Container>
    );
  if (step === 8)
    return (
      <Container size="narrow">
        <Confirmation />
      </Container>
    );

  const canContinue =
    step === 2
      ? story.trim().length >= 10
      : step === 6
        ? Boolean(name.trim() && EMAIL_RE.test(email.trim()) && consent)
        : true;

  return (
    <Container size="narrow">
      <div className="mb-10 flex items-center justify-between">
        <p className="meta text-ink-muted">
          Step {step} of {FORM_STEPS}
        </p>
        <StepDots total={FORM_STEPS} current={step - 1} />
      </div>

      {step === 1 ? <StepCare value={lookingFor} onToggle={toggle(setLookingFor)} /> : null}
      {step === 2 ? <StepStory value={story} onChange={setStory} /> : null}
      {step === 3 ? (
        <StepExperience
          priorTherapy={priorTherapy}
          setPriorTherapy={setPriorTherapy}
          stylePreference={stylePreference}
          setStylePreference={setStylePreference}
        />
      ) : null}
      {step === 4 ? <StepFocus value={specialties} onToggle={toggle(setSpecialties)} /> : null}
      {step === 5 ? (
        <StepPrefs
          region={region}
          setRegion={setRegion}
          format={format}
          setFormat={setFormat}
          ageGroup={ageGroup}
          setAgeGroup={setAgeGroup}
          genderPreference={genderPreference}
          setGenderPreference={setGenderPreference}
          insurance={insurance}
          setInsurance={setInsurance}
          insuranceName={insuranceName}
          setInsuranceName={setInsuranceName}
          budgetNote={budgetNote}
          setBudgetNote={setBudgetNote}
          availability={availability}
          setAvailability={setAvailability}
          urgency={urgency}
          setUrgency={setUrgency}
        />
      ) : null}
      {step === 6 ? (
        <StepContact name={name} setName={setName} email={email} setEmail={setEmail} consent={consent} setConsent={setConsent} />
      ) : null}
      {step === 7 ? (
        <StepReview
          lookingFor={lookingFor}
          story={story}
          priorTherapy={priorTherapy}
          stylePreference={stylePreference}
          specialties={specialties}
          region={region}
          format={format}
          ageGroup={ageGroup}
          genderPreference={genderPreference}
          insurance={insurance}
          insuranceName={insuranceName}
          budgetNote={budgetNote}
          availability={availability}
          urgency={urgency}
          name={name}
          email={email}
        />
      ) : null}

      {error ? (
        <p role="alert" className="mt-6 text-[14px] text-ocean">
          {error}
        </p>
      ) : null}

      <div className="mt-12 flex items-center justify-between">
        <Button tone="ghost" onClick={goBack}>
          ← Back
        </Button>
        {step === 7 ? (
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Sending…" : "Send to Nora"}
          </Button>
        ) : (
          <Button onClick={goNext} disabled={!canContinue}>
            Continue →
          </Button>
        )}
      </div>
    </Container>
  );
}

function Welcome({ onBegin }: { onBegin: () => void }) {
  return (
    <div>
      <SectionHeader
        eyebrow="Find your fit"
        title={
          <>
            Tell us where you are.
            <br />
            <span className="italic text-ocean">Plain language is enough.</span>
          </>
        }
        body="A few short steps. Write the way you'd write to a friend who happens to know the right people — no clinical jargon, no forms to perform on. A couple of sentences is plenty."
      />
      <Card className="mt-12">
        <p className="meta text-ink-muted">A note on privacy</p>
        <p className="mt-4 text-[15px] leading-[1.7] text-ink-soft">
          What you share here is private. One person — Nora — reads it first. Nothing goes to a practitioner until
          she&rsquo;s matched you and written a small shortlist with reasons. You can skip anything, and nothing is saved
          until you send it at the end.
        </p>
        <div className="mt-10">
          <Button onClick={onBegin}>Begin →</Button>
        </div>
      </Card>
      <p className="meta mt-10 text-ink-muted">Takes about five minutes.</p>
    </div>
  );
}

function ChipGrid({ children }: { children: React.ReactNode }) {
  return <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2">{children}</div>;
}

function StepCare({ value, onToggle }: { value: string[]; onToggle: (v: string) => void }) {
  return (
    <div>
      <SectionHeader
        eyebrow="01 / What you're looking for"
        title="What kind of care are you considering?"
        body={`Pick anything that feels close — you can choose more than one, or "Not sure yet." That's a real answer.`}
      />
      <ChipGrid>
        {CARE_TYPES.map((c) => (
          <ChoiceChip key={c} label={c} selected={value.includes(c)} onClick={() => onToggle(c)} />
        ))}
      </ChipGrid>
    </div>
  );
}

function StepStory({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <SectionHeader
        eyebrow="02 / Your story"
        title="What's bringing you here?"
        body="A couple of paragraphs is plenty. Tell us what's going on, anything you've tried, and what you'd want to feel different a few months from now."
      />
      <Card className="mt-12">
        <Field label="In your own words" hint="Whatever you write stays between you and Nora until you're matched.">
          <TextArea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="I've been carrying a lot since…"
            rows={9}
          />
        </Field>
      </Card>
    </div>
  );
}

function StepExperience({
  priorTherapy,
  setPriorTherapy,
  stylePreference,
  setStylePreference,
}: {
  priorTherapy: string;
  setPriorTherapy: (v: string) => void;
  stylePreference: string;
  setStylePreference: (v: string) => void;
}) {
  return (
    <div>
      <SectionHeader
        eyebrow="03 / Your experience so far"
        title="Have you tried this before?"
        body="Optional, but it really helps Nora find a better fit — especially if past care didn't land."
      />
      <Card className="mt-12 space-y-10">
        <Field
          label="If you've worked with someone before"
          optional
          hint="What helped, what didn't, and — if it wasn't a fit — what felt off. Even a line is useful."
        >
          <TextArea
            value={priorTherapy}
            onChange={(e) => setPriorTherapy(e.target.value)}
            rows={4}
            className="min-h-[110px]"
            placeholder="I saw someone a couple years ago — it felt too much like just talking in circles…"
          />
        </Field>
        <div>
          <p className="meta text-ink-muted">What kind of work feels right</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {STYLE_PREFS.map((o) => (
              <ChoiceChip key={o.value} label={o.label} selected={stylePreference === o.value} onClick={() => setStylePreference(o.value)} />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function StepFocus({ value, onToggle }: { value: string[]; onToggle: (v: string) => void }) {
  return (
    <div>
      <SectionHeader
        eyebrow="04 / Areas of focus"
        title="Anything specific you'd want support with?"
        body="Optional — pick any that fit, or skip and let your story speak for itself."
      />
      <ChipGrid>
        {CATEGORIES.map((c) => (
          <ChoiceChip key={c.id} label={c.label} selected={value.includes(c.id)} onClick={() => onToggle(c.id)} />
        ))}
      </ChipGrid>
    </div>
  );
}

type PrefProps = {
  region: string;
  setRegion: (v: string) => void;
  format: string;
  setFormat: (v: string) => void;
  ageGroup: string;
  setAgeGroup: (v: string) => void;
  genderPreference: string;
  setGenderPreference: (v: string) => void;
  insurance: string;
  setInsurance: (v: string) => void;
  insuranceName: string;
  setInsuranceName: (v: string) => void;
  budgetNote: string;
  setBudgetNote: (v: string) => void;
  availability: string;
  setAvailability: (v: string) => void;
  urgency: string;
  setUrgency: (v: string) => void;
};

function PillRow({
  options,
  value,
  onPick,
}: {
  options: readonly { value: string; label: string }[];
  value: string;
  onPick: (v: string) => void;
}) {
  return (
    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {options.map((o) => (
        <ChoiceChip key={o.value} label={o.label} selected={value === o.value} onClick={() => onPick(o.value)} />
      ))}
    </div>
  );
}

function StepPrefs(p: PrefProps) {
  return (
    <div>
      <SectionHeader
        eyebrow="05 / Preferences"
        title="A few practical pieces."
        body="These help Nora narrow the shortlist. Skip anything that doesn't apply — none of it is binding."
      />
      <Card className="mt-12 space-y-10">
        <Field label="Where are you" hint="City, neighborhood, or just a region.">
          <TextInput value={p.region} onChange={(e) => p.setRegion(e.target.value)} placeholder="Saint Paul, MN" />
        </Field>

        <div>
          <p className="meta text-ink-muted">How you&rsquo;d like to meet</p>
          <PillRow options={FORMATS} value={p.format} onPick={p.setFormat} />
        </div>

        <div>
          <p className="meta text-ink-muted">Who is this care for</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {AGE_GROUPS.map((o) => (
              <ChoiceChip key={o.value} label={o.label} selected={p.ageGroup === o.value} onClick={() => p.setAgeGroup(o.value)} />
            ))}
          </div>
        </div>

        <div>
          <p className="meta text-ink-muted">Insurance</p>
          <PillRow options={INSURANCE} value={p.insurance} onPick={p.setInsurance} />
          {p.insurance === "yes" ? (
            <div className="mt-3">
              <TextInput
                value={p.insuranceName}
                onChange={(e) => p.setInsuranceName(e.target.value)}
                placeholder="Which plan? e.g. HealthPartners, BCBS"
                aria-label="Insurance plan"
              />
            </div>
          ) : null}
        </div>

        <Field label="Budget notes" optional hint="A sentence is plenty — sliding scale, a number you can hold, out-of-network is okay.">
          <TextArea
            value={p.budgetNote}
            onChange={(e) => p.setBudgetNote(e.target.value)}
            rows={2}
            className="min-h-[80px]"
            placeholder="Around $150 / session; out-of-network is okay if there's a superbill."
          />
        </Field>

        <Field label="Gender preference for your practitioner" optional hint="Only if it matters to you.">
          <TextInput
            value={p.genderPreference}
            onChange={(e) => p.setGenderPreference(e.target.value)}
            placeholder="Woman, nonbinary, no preference…"
          />
        </Field>

        <Field label="When are you generally free" optional hint="Days, evenings, weekends — a rough shape is fine.">
          <TextInput
            value={p.availability}
            onChange={(e) => p.setAvailability(e.target.value)}
            placeholder="Weekday evenings after 6, or Saturday mornings."
          />
        </Field>

        <div>
          <p className="meta text-ink-muted">How soon would you want to start</p>
          <PillRow options={URGENCY} value={p.urgency} onPick={p.setUrgency} />
        </div>
      </Card>
    </div>
  );
}

type ContactProps = {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  consent: boolean;
  setConsent: (v: boolean) => void;
};

function StepContact(p: ContactProps) {
  return (
    <div>
      <SectionHeader
        eyebrow="06 / Where to reach you"
        title="Where should your shortlist go?"
        body="Just a name and an email. Your story is read by a person — Nora — before any practitioner sees a thing."
      />
      <Card className="mt-12 space-y-10">
        <Field label="Your name">
          <TextInput value={p.name} onChange={(e) => p.setName(e.target.value)} placeholder="First name is fine" autoComplete="name" />
        </Field>
        <Field label="Email" hint="This is where your shortlist arrives.">
          <TextInput
            type="email"
            value={p.email}
            onChange={(e) => p.setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </Field>
        <button
          type="button"
          onClick={() => p.setConsent(!p.consent)}
          aria-pressed={p.consent}
          className="flex w-full items-start gap-4 rounded-2xl border border-rule p-5 text-left transition-colors hover:border-charcoal/40 hover:bg-sand-deep/30"
        >
          <span
            aria-hidden
            className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
              p.consent ? "border-charcoal bg-charcoal text-sand" : "border-rule-strong/40 bg-white"
            }`}
          >
            {p.consent ? <span className="text-[12px] leading-none">✓</span> : null}
          </span>
          <span className="text-[15px] leading-[1.6] text-charcoal">
            I understand this is read by a person before any practitioner sees it.
          </span>
        </button>
      </Card>
    </div>
  );
}

type ReviewProps = {
  lookingFor: string[];
  story: string;
  priorTherapy: string;
  stylePreference: string;
  specialties: string[];
  region: string;
  format: string;
  ageGroup: string;
  genderPreference: string;
  insurance: string;
  insuranceName: string;
  budgetNote: string;
  availability: string;
  urgency: string;
  name: string;
  email: string;
};

function StepReview(r: ReviewProps) {
  const dash = <em className="text-ink-muted">—</em>;
  const focusLabels = r.specialties
    .map((id) => CATEGORIES.find((c) => c.id === id)?.label)
    .filter(Boolean)
    .join(", ");
  const insuranceLine = [labelOf(INSURANCE, r.insurance), r.insurance === "yes" ? r.insuranceName : null]
    .filter(Boolean)
    .join(" · ");
  return (
    <div>
      <SectionHeader
        eyebrow="07 / Review"
        title="Here's what we'll send to Nora."
        body="Read it back. You can step back to edit anything — nothing is sent until you press the button."
      />
      <Card className="mt-12">
        <dl>
          <DLRow label="Name">{r.name || dash}</DLRow>
          <DLRow label="Email">{r.email || dash}</DLRow>
          <DLRow label="Looking for">{r.lookingFor.length ? r.lookingFor.join(", ") : dash}</DLRow>
          <DLRow label="Your story">{r.story ? <span className="whitespace-pre-wrap">{r.story}</span> : dash}</DLRow>
          <DLRow label="Past experience">{r.priorTherapy ? <span className="whitespace-pre-wrap">{r.priorTherapy}</span> : dash}</DLRow>
          <DLRow label="Kind of work">{labelOf(STYLE_PREFS, r.stylePreference) || dash}</DLRow>
          <DLRow label="Areas of focus">{focusLabels || dash}</DLRow>
          <DLRow label="Location">{r.region || dash}</DLRow>
          <DLRow label="Format">{labelOf(FORMATS, r.format) || dash}</DLRow>
          <DLRow label="Care for">{labelOf(AGE_GROUPS, r.ageGroup) || dash}</DLRow>
          <DLRow label="Insurance">{insuranceLine || dash}</DLRow>
          <DLRow label="Budget notes">{r.budgetNote ? <span className="whitespace-pre-wrap">{r.budgetNote}</span> : dash}</DLRow>
          <DLRow label="Gender preference">{r.genderPreference || dash}</DLRow>
          <DLRow label="Availability">{r.availability || dash}</DLRow>
          <DLRow label="Timing">{labelOf(URGENCY, r.urgency) || dash}</DLRow>
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
        body="We'll read this and send back a small shortlist — a few practitioners, each with a sentence about why we thought of them for you. It usually takes a few days. Watch your inbox."
      />
      <Card className="mt-12">
        <p className="meta text-ink-muted">What happens next</p>
        <ul className="mt-6 space-y-5 text-[15px] leading-[1.7] text-ink-soft">
          <li>
            <span className="font-medium text-charcoal">Nora reads it.</span> A real person, not a triage system.
          </li>
          <li>
            <span className="font-medium text-charcoal">A shortlist arrives by email,</span> with the reasoning written in.
          </li>
          <li>
            <span className="font-medium text-charcoal">You reach out directly.</span> From the first message, the relationship is yours.
          </li>
        </ul>
      </Card>
      <div className="mt-12 flex flex-wrap items-center gap-4">
        <LinkButton href="/practitioners" tone="primary">
          Meanwhile, browse the collective →
        </LinkButton>
        <LinkButton href="/" tone="secondary">
          Back home
        </LinkButton>
      </div>
    </div>
  );
}
