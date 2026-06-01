"use client";

import { useState, useTransition } from "react";

import {
  Button,
  ChoiceChip,
  Field,
  SectionHeader,
  TextArea,
  TextInput,
} from "@/app/_components/ui";
import type { Modality, Practitioner } from "@/lib/generated/prisma/client";

import { MODALITY_OPTIONS, SPECIALTY_OPTIONS } from "./_taxonomy";
import { saveProfile } from "./actions";

export function ProfileEditor({ practitioner }: { practitioner: Practitioner }) {
  const [displayName, setDisplayName] = useState(practitioner.displayName ?? "");
  const [region, setRegion] = useState(practitioner.region ?? "");
  const [website, setWebsite] = useState(practitioner.website ?? "");
  const [gender, setGender] = useState(practitioner.gender ?? "");
  const [bio, setBio] = useState(practitioner.bio ?? "");
  const [values, setValues] = useState(practitioner.values ?? "");
  const [modality, setModality] = useState<Modality | "">(practitioner.modality ?? "");
  const [specialties, setSpecialties] = useState<string[]>(practitioner.specialties ?? []);
  const [insurance, setInsurance] = useState((practitioner.insuranceAccepted ?? []).join(", "));

  const [completeness, setCompleteness] = useState(practitioner.completeness);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const dirty = () => setSaved(false);
  const toggleSpecialty = (id: string) => {
    dirty();
    setSpecialties((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await saveProfile({
        displayName, region, website, gender, bio, values, modality, specialties,
        insuranceAccepted: insurance.split(",").map((s) => s.trim()).filter(Boolean),
      });
      if (res.ok) {
        setCompleteness(res.completeness);
        setSaved(true);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      <SectionHeader
        eyebrow="Your profile"
        title="Build your profile"
        body="This is what people will see. The “what healing means to me” note is the heart of it — write it the way you'd say it out loud."
      />

      {/* completeness */}
      <div>
        <div className="flex items-baseline justify-between">
          <span className="meta text-ink-muted">{practitioner.visibility.toLowerCase()}</span>
          <span className="text-[13px] text-ink-soft">{completeness}% complete</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-rule/60">
          <div
            className="h-full rounded-full bg-teal transition-[width] duration-500"
            style={{ width: `${completeness}%` }}
          />
        </div>
      </div>

      <div className="space-y-7">
        <Field label="Display name">
          <TextInput value={displayName} onChange={(e) => { setDisplayName(e.target.value); dirty(); }} placeholder="e.g. Nora Hollenkamp, LICSW" />
        </Field>

        <div className="grid gap-7 md:grid-cols-2">
          <Field label="Location / region">
            <TextInput value={region} onChange={(e) => { setRegion(e.target.value); dirty(); }} placeholder="e.g. Saint Paul, MN" />
          </Field>
          <Field label="Website" optional>
            <TextInput type="url" value={website} onChange={(e) => { setWebsite(e.target.value); dirty(); }} placeholder="https://" />
          </Field>
        </div>

        <Field label="How you work">
          <div className="grid gap-3 sm:grid-cols-3">
            {MODALITY_OPTIONS.map((m) => (
              <ChoiceChip
                key={m.id}
                label={m.label}
                selected={modality === m.id}
                onClick={() => { setModality(m.id); dirty(); }}
              />
            ))}
          </div>
        </Field>

        <Field label="Specialties" hint="Choose all that fit. (Placeholder list — your real categories come from Nora's taxonomy.)">
          <div className="grid gap-3 sm:grid-cols-2">
            {SPECIALTY_OPTIONS.map((s) => (
              <ChoiceChip
                key={s.id}
                label={s.label}
                selected={specialties.includes(s.id)}
                onClick={() => toggleSpecialty(s.id)}
              />
            ))}
          </div>
        </Field>

        <Field label="Short bio">
          <TextArea value={bio} onChange={(e) => { setBio(e.target.value); dirty(); }} placeholder="A couple of sentences about you and your practice." />
        </Field>

        <Field label="What healing means to me" hint="The differentiator. Plain, warm, in your own voice.">
          <TextArea value={values} onChange={(e) => { setValues(e.target.value); dirty(); }} placeholder="When I sit with someone…" className="min-h-[180px]" />
        </Field>

        <div className="grid gap-7 md:grid-cols-2">
          <Field label="Your gender" hint="Some people prefer a practitioner of a particular gender.">
            <TextInput value={gender} onChange={(e) => { setGender(e.target.value); dirty(); }} placeholder="e.g. Woman" />
          </Field>
          <Field label="Insurance accepted" optional hint="Comma-separated.">
            <TextInput value={insurance} onChange={(e) => { setInsurance(e.target.value); dirty(); }} placeholder="Aetna, BCBS, Cigna" />
          </Field>
        </div>
      </div>

      <div className="flex items-center gap-4 border-t border-rule/70 pt-7">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : saved ? "Saved ✓" : "Save profile"}
        </Button>
        <span className="text-[13px] text-ink-muted">
          Photo upload &amp; publishing coming next.
        </span>
      </div>
    </form>
  );
}
