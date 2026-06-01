"use client";

import { useState, useTransition } from "react";

import {
  Button,
  ChoiceChip,
  Field,
  LinkButton,
  SectionHeader,
  TextArea,
  TextInput,
} from "@/app/_components/ui";
import type {
  Modality,
  Practitioner,
  ProfileVisibility,
} from "@/lib/generated/prisma/client";

import { MODALITY_OPTIONS, SPECIALTY_OPTIONS } from "./_taxonomy";
import { saveProfile } from "./actions";
import { publishProfile, unpublishProfile } from "./publish-actions";

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

  // Publish state — mirrors the save UX (a useTransition + an inline result).
  const [visibility, setVisibility] = useState<ProfileVisibility>(practitioner.visibility);
  const [slug, setSlug] = useState<string | null>(practitioner.slug);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishing, startPublish] = useTransition();
  const isPublished = visibility === "PUBLISHED";

  function onPublish() {
    setPublishError(null);
    startPublish(async () => {
      const res = await publishProfile();
      if (res.ok) {
        setVisibility("PUBLISHED");
        setSlug(res.slug);
      } else {
        setPublishError(res.error);
      }
    });
  }

  function onUnpublish() {
    setPublishError(null);
    startPublish(async () => {
      const res = await unpublishProfile();
      if (res.ok) {
        setVisibility("DRAFT");
      } else {
        setPublishError(res.error);
      }
    });
  }

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
          <span className="meta text-ink-muted">{visibility.toLowerCase()}</span>
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

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-rule/70 pt-7">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : saved ? "Saved ✓" : "Save profile"}
        </Button>
        <span className="text-[13px] text-ink-muted">
          Photo upload coming next.
        </span>
      </div>

      {/* Status + publish — additive, calm, trauma-informed. The publish actions
          re-derive the practitioner from the session and enforce a name+bio bar. */}
      <section
        aria-labelledby="publish-heading"
        className="rounded-3xl border border-rule/80 bg-white p-7 shadow-[0_1px_0_rgba(31,58,95,0.02),0_18px_40px_-32px_rgba(31,58,95,0.18)] md:p-8"
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={`inline-block h-2 w-2 shrink-0 rounded-full ${
              isPublished ? "bg-teal" : "bg-rule-strong/30"
            }`}
          />
          <h2 id="publish-heading" className="font-display text-[20px] leading-tight text-charcoal">
            {isPublished ? "Your profile is live" : "Your profile is a draft"}
          </h2>
        </div>
        <p className="mt-3 text-[15px] leading-[1.6] text-ink-soft">
          {isPublished
            ? "People looking for care can find you. You can take it down any time — nothing is permanent."
            : "Only you can see this right now. Publish when you're ready, at your own pace."}
        </p>

        {isPublished ? (
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
            {slug ? (
              <LinkButton
                href={`/practitioners/${slug}`}
                target="_blank"
                rel="noreferrer"
                tone="secondary"
              >
                View your public page →
              </LinkButton>
            ) : null}
            <Button type="button" tone="ghost" onClick={onUnpublish} disabled={publishing}>
              {publishing ? "Taking it down…" : "Take it down"}
            </Button>
          </div>
        ) : (
          <div className="mt-6">
            <Button type="button" onClick={onPublish} disabled={publishing}>
              {publishing ? "Publishing…" : "Publish profile"}
            </Button>
          </div>
        )}

        {publishError ? (
          <p role="alert" className="mt-4 text-[14px] leading-[1.6] text-ocean">
            {publishError}
          </p>
        ) : null}
      </section>
    </form>
  );
}
