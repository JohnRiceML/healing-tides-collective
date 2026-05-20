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
} from "@/app/prototype/_components/ui";
import type { Modality } from "@/app/prototype/_lib/types";

const MODALITIES: Modality[] = [
  "Therapy",
  "Acupuncture",
  "Reiki",
  "Movement",
  "Trauma-informed support",
];

type FormState = {
  name: string;
  email: string;
  website: string;
  location: string;
  modalities: Modality[];
  licenses: string;
  yearsExperience: string;
  worksBestWith: string;
  notARightFitFor: string;
  traumaInformed: string;
  availability: string;
};

const INITIAL_STATE: FormState = {
  name: "",
  email: "",
  website: "",
  location: "",
  modalities: [],
  licenses: "",
  yearsExperience: "",
  worksBestWith: "",
  notARightFitFor: "",
  traumaInformed: "",
  availability: "",
};

const TOTAL_STEPS = 4;

export default function PractitionerApplyPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleModality = (modality: Modality) => {
    setForm((prev) => ({
      ...prev,
      modalities: prev.modalities.includes(modality)
        ? prev.modalities.filter((m) => m !== modality)
        : [...prev.modalities, modality],
    }));
  };

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <main className="py-16 md:py-24">
      <Container size="narrow">
        {step === 0 ? (
          <Intro onBegin={next} />
        ) : step === 1 ? (
          <PracticeDetails
            form={form}
            update={update}
            toggleModality={toggleModality}
            onBack={back}
            onNext={next}
          />
        ) : step === 2 ? (
          <FitAndApproach form={form} update={update} onBack={back} onNext={next} />
        ) : step === 3 ? (
          <Review form={form} onBack={back} onSubmit={next} />
        ) : (
          <Confirmation />
        )}
      </Container>
    </main>
  );
}

function Intro({ onBegin }: { onBegin: () => void }) {
  return (
    <div>
      <SectionHeader
        eyebrow="Practitioner application"
        title={
          <>
            Apply to join the
            <br />
            <span className="italic text-ocean">collective.</span>
          </>
        }
        body={
          <>
            This is a small, curated collective. We turn away more practitioners than we
            accept.
          </>
        }
      />
      <Card className="mt-12">
        <div className="space-y-5 text-[16px] leading-[1.7] text-ink-soft">
          <p>
            Healing Tides isn&rsquo;t a public directory and it isn&rsquo;t a marketplace.
            Every referral that arrives at your door comes with context &mdash; who the
            person is, what they&rsquo;re carrying, why we thought of you.
          </p>
          <p>
            Tell us about your practice the way you&rsquo;d tell a thoughtful colleague.
            We read every application carefully, and Nora writes back personally.
          </p>
        </div>
        <div className="mt-10 flex justify-end">
          <Button onClick={onBegin}>Begin application</Button>
        </div>
      </Card>
      <p className="meta mt-8 text-ink-muted">
        Takes about ten minutes. You can&rsquo;t save mid-way in this prototype.
      </p>
    </div>
  );
}

function PracticeDetails({
  form,
  update,
  toggleModality,
  onBack,
  onNext,
}: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  toggleModality: (m: Modality) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div>
      <StepDots total={TOTAL_STEPS} current={0} />
      <div className="mt-8">
        <SectionHeader
          eyebrow="Step one of four"
          title="Your practice"
          body="The basics &mdash; how to reach you, where you work, and what you offer."
        />
      </div>
      <Card className="mt-12">
        <div className="space-y-8">
          <Field label="Name">
            <TextInput
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Your full name"
            />
          </Field>
          <Field label="Email">
            <TextInput
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@yourpractice.com"
            />
          </Field>
          <Field label="Website" optional>
            <TextInput
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
              placeholder="https://"
            />
          </Field>
          <Field
            label="Location"
            hint="City and state, or note if your practice is fully virtual."
          >
            <TextInput
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="Portland, OR &mdash; or Virtual"
            />
          </Field>
          <Field
            label="Modalities"
            hint="Choose the ones that genuinely describe your work. You can pick more than one."
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {MODALITIES.map((m) => (
                <ChoiceChip
                  key={m}
                  label={m}
                  selected={form.modalities.includes(m)}
                  onClick={() => toggleModality(m)}
                />
              ))}
            </div>
          </Field>
          <Field
            label="Licenses or certifications"
            hint="A brief list is fine &mdash; LCSW, LAc, registered yoga teacher, etc."
          >
            <TextArea
              value={form.licenses}
              onChange={(e) => update("licenses", e.target.value)}
              className="min-h-[100px]"
            />
          </Field>
          <Field label="Years of experience">
            <TextInput
              inputMode="numeric"
              value={form.yearsExperience}
              onChange={(e) => update("yearsExperience", e.target.value)}
              placeholder="e.g. 8"
            />
          </Field>
        </div>
      </Card>
      <div className="mt-10 flex items-center justify-between">
        <Button tone="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}

function FitAndApproach({
  form,
  update,
  onBack,
  onNext,
}: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div>
      <StepDots total={TOTAL_STEPS} current={1} />
      <div className="mt-8">
        <SectionHeader
          eyebrow="Step two of four"
          title="Fit and approach"
          body="This is the part we read most carefully. Speak plainly."
        />
      </div>
      <Card className="mt-12">
        <div className="space-y-8">
          <Field
            label="Who you work best with"
            hint="The people who tend to thrive in your care &mdash; in your own words, not a marketing bio."
          >
            <TextArea
              value={form.worksBestWith}
              onChange={(e) => update("worksBestWith", e.target.value)}
            />
          </Field>
          <Field
            label="Who you are not the right fit for"
            hint="This helps us refer well. It&rsquo;s not a disqualifier."
          >
            <TextArea
              value={form.notARightFitFor}
              onChange={(e) => update("notARightFitFor", e.target.value)}
            />
          </Field>
          <Field
            label="Trauma-informed experience"
            hint="Training, lived experience, the lineage of your practice &mdash; whatever&rsquo;s true."
          >
            <TextArea
              value={form.traumaInformed}
              onChange={(e) => update("traumaInformed", e.target.value)}
            />
          </Field>
          <Field
            label="Availability for referrals"
            hint="A realistic number is more useful than an aspirational one."
          >
            <TextInput
              value={form.availability}
              onChange={(e) => update("availability", e.target.value)}
              placeholder="e.g. 2 new clients per month"
            />
          </Field>
        </div>
      </Card>
      <div className="mt-10 flex items-center justify-between">
        <Button tone="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}

function Review({
  form,
  onBack,
  onSubmit,
}: {
  form: FormState;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <div>
      <StepDots total={TOTAL_STEPS} current={2} />
      <div className="mt-8">
        <SectionHeader
          eyebrow="Step three of four"
          title="Read it back"
          body="A last look before it lands in Nora&rsquo;s inbox. Go back to change anything that doesn&rsquo;t feel right."
        />
      </div>
      <Card className="mt-12">
        <dl>
          <DLRow label="Name">{form.name || <Empty />}</DLRow>
          <DLRow label="Email">{form.email || <Empty />}</DLRow>
          <DLRow label="Website">{form.website || <Empty />}</DLRow>
          <DLRow label="Location">{form.location || <Empty />}</DLRow>
          <DLRow label="Modalities">
            {form.modalities.length > 0 ? form.modalities.join(", ") : <Empty />}
          </DLRow>
          <DLRow label="Licenses">{form.licenses || <Empty />}</DLRow>
          <DLRow label="Years of experience">
            {form.yearsExperience || <Empty />}
          </DLRow>
          <DLRow label="Works best with">{form.worksBestWith || <Empty />}</DLRow>
          <DLRow label="Not the right fit for">
            {form.notARightFitFor || <Empty />}
          </DLRow>
          <DLRow label="Trauma-informed">{form.traumaInformed || <Empty />}</DLRow>
          <DLRow label="Availability">{form.availability || <Empty />}</DLRow>
        </dl>
      </Card>
      <div className="mt-10 flex items-center justify-between">
        <Button tone="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onSubmit}>Submit application</Button>
      </div>
    </div>
  );
}

function Empty() {
  return <span className="text-ink-muted">&mdash;</span>;
}

function Confirmation() {
  return (
    <div>
      <SectionHeader
        eyebrow="Application received"
        title={
          <>
            Thank you for
            <br />
            <span className="italic text-ocean">writing to us.</span>
          </>
        }
      />
      <Card className="mt-12 bg-seafoam/40">
        <div className="space-y-5 text-[16px] leading-[1.7] text-charcoal">
          <p>
            We&rsquo;ll read your application carefully. If it&rsquo;s a fit, Nora will
            write back personally &mdash; usually within a week.
          </p>
          <p className="text-ink-soft">
            We don&rsquo;t do auto-replies, status dashboards, or applicant portals. When
            you hear from us, it will be from a person.
          </p>
        </div>
      </Card>
      <div className="mt-12 flex items-center justify-between">
        <LinkButton href="/prototype" tone="secondary">
          Back to prototype
        </LinkButton>
        <p className="meta text-ink-muted">No further action needed.</p>
      </div>
    </div>
  );
}
