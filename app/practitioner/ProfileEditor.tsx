"use client";

import { useState, useTransition } from "react";

import { Button, ChoiceChip, Field, LinkButton, TextArea, TextInput } from "@/app/_components/ui";
import type { Modality, ProfileVisibility } from "@/lib/generated/prisma/client";
import type { PractitionerEditorView } from "@/app/_lib/practitioner-view";

import { PROFILE_SECTIONS } from "@/app/_lib/profile-fields";
import { completenessOf } from "@/lib/completeness";

import { MODALITY_OPTIONS, SPECIALTY_OPTIONS } from "./_taxonomy";
import { saveProfile } from "./actions";
import { extractProfileFromSources } from "./extract-actions";
import { polishFieldText } from "./assist-actions";
import { ImportStatusBar, type ImportView } from "./ImportStatusBar";
import { describeSource, type ImportData } from "./_extract/types";
import { adoptImportedPhoto, removeProfilePhoto, uploadProfilePhoto } from "./photo-actions";
import { publishProfile, unpublishProfile } from "./publish-actions";
import { Stepper, WIZARD_STEPS } from "./_components/Stepper";
import { LivePreview } from "./_components/LivePreview";
import { CoverThemePicker } from "./_components/CoverThemePicker";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/site";

// Which rich (optional) profile sections live under which wizard step.
const PRACTICE_SECTION_IDS = ["background", "approach", "who", "availability", "investment"];
const VOICE_SECTION_IDS = ["story", "final"];
const NEXT_HINTS = [
  "how you work and your focus areas",
  "your story and what healing means to you",
  "a final review, then publish",
];

export function ProfileEditor({ practitioner }: { practitioner: PractitionerEditorView }) {
  const [displayName, setDisplayName] = useState(practitioner.displayName ?? "");
  const [region, setRegion] = useState(practitioner.region ?? "");
  const [website, setWebsite] = useState(practitioner.website ?? "");
  const [gender, setGender] = useState(practitioner.gender ?? "");
  const [bio, setBio] = useState(practitioner.bio ?? "");
  const [values, setValues] = useState(practitioner.values ?? "");
  const [modality, setModality] = useState<Modality | "">(practitioner.modality ?? "");
  const [specialties, setSpecialties] = useState<string[]>(practitioner.specialties ?? []);
  const [insurance, setInsurance] = useState((practitioner.insuranceAccepted ?? []).join(", "));
  const [fieldValues, setFieldValues] = useState<Record<string, string | string[]>>(
    (practitioner.fieldValues as unknown as Record<string, string | string[]> | null) ?? {},
  );

  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  // Wizard step (0–3). Freely navigable — this is also the ongoing edit surface.
  const [step, setStep] = useState(0);

  // Publish state — mirrors the save UX (a useTransition + an inline result).
  const [visibility, setVisibility] = useState<ProfileVisibility>(practitioner.visibility);
  const [slug, setSlug] = useState<string | null>(practitioner.slug);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishing, startPublish] = useTransition();
  const isPublished = visibility === "PUBLISHED";
  // Submitted, waiting on Nora. Publishing is gated (see app/_lib/directory-approval.ts):
  // a practitioner we haven't invited lands here instead of going straight into the directory.
  const inReview = visibility === "NEEDS_REVIEW";

  // Admin hold (set in /admin or by the Clerk webhook) — the practitioner can still edit
  // while held, but can't publish/unpublish. Derived server-side (admins, not the
  // practitioner, change this), so it's a constant for the session.
  const held = practitioner.held;
  const heldMsg = practitioner.holdMessage;

  // AI "drop your links / paste a bio → draft" assist — fills the form for review; never saves/publishes.
  // A profile link (e.g. Psychology Today) saved on their invite → pre-seed the importer so
  // claiming → "Build my profile" is one tap. They trigger it themselves (their own profile).
  const savedImportUrl = practitioner.importUrl;
  const [paste, setPaste] = useState("");
  const [links, setLinks] = useState(savedImportUrl ?? "");
  const [importView, setImportView] = useState<ImportView | null>(null);
  const [importCollapsed, setImportCollapsed] = useState(false);
  const [extracting, startExtract] = useTransition();

  // Photo — saved on its own (to Vercel Blob), separate from the main Save button.
  const [photoUrl, setPhotoUrl] = useState(practitioner.photoUrl ?? "");
  const [importedPhotoUrl, setImportedPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoBusy, startPhoto] = useTransition();
  // New (post-signup) profiles get the import-first welcome, auto-expanded.
  const isNew = practitioner.completeness === 0 && !practitioner.displayName;
  const [importOpen, setImportOpen] = useState(isNew || Boolean(savedImportUrl));

  // Live "match strength" — recomputed from the form on every keystroke / import, so
  // the bar fills as fields get addressed (not only on Save).
  const insuranceList = insurance.split(",").map((s) => s.trim()).filter(Boolean);
  const liveCompleteness = completenessOf({
    displayName, bio, values, modality, region, gender,
    specialties, insuranceAccepted: insuranceList, website,
  });
  const missingMatch = [
    { filled: specialties.length > 0, label: "your areas of focus" },
    { filled: !!region.trim(), label: "your location" },
    { filled: Boolean(modality), label: "how you work" },
    { filled: !!values.trim(), label: "what healing means to you" },
    { filled: insuranceList.length > 0, label: "insurance" },
    { filled: !!bio.trim(), label: "a short bio" },
    { filled: !!gender.trim(), label: "your gender" },
    { filled: !!displayName.trim(), label: "your name" },
    { filled: !!website.trim(), label: "your website" },
  ]
    .filter((f) => !f.filled)
    .map((f) => f.label);

  // The hard publish gate — mirrors readyToPublish() in publish-actions.ts (name + bio).
  // Surfacing it client-side turns a server-side rejection into a calm, specific nudge.
  const missingToPublish = [
    { filled: !!displayName.trim(), label: "your name" },
    { filled: !!bio.trim(), label: "a short bio" },
  ]
    .filter((f) => !f.filled)
    .map((f) => f.label);
  const canPublish = missingToPublish.length === 0;

  const statusLabel = held ? "On hold" : isPublished ? "Live" : inReview ? "In review" : "Draft";

  function runSave() {
    start(async () => {
      const res = await saveProfile({
        displayName, region, website, gender, bio, values, modality, specialties,
        insuranceAccepted: insurance.split(",").map((s) => s.trim()).filter(Boolean),
        fieldValues,
      });
      if (res.ok) setSaved(true);
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    runSave();
  }

  function goToStep(n: number) {
    setStep(Math.max(0, Math.min(WIZARD_STEPS.length - 1, n)));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function onContinue() {
    runSave();
    goToStep(step + 1);
  }

  function onPublish() {
    setPublishError(null);
    startPublish(async () => {
      const res = await publishProfile();
      if (res.ok) {
        // Not everyone goes straight live — an uninvited profile is submitted for review.
        setVisibility(res.pendingReview ? "NEEDS_REVIEW" : "PUBLISHED");
        setSlug(res.slug);
      } else setPublishError(res.error);
    });
  }
  function onUnpublish() {
    setPublishError(null);
    startPublish(async () => {
      const res = await unpublishProfile();
      if (res.ok) setVisibility("DRAFT");
      else setPublishError(res.error);
    });
  }

  const dirty = () => setSaved(false);
  // Focus areas are capped at 8 (the "pick 3–8" rule — taxonomy.ts leaves enforcement to the
  // editor). The minimum of 3 stays advisory via the hint + publish checklist.
  const MAX_SPECIALTIES = 8;
  const toggleSpecialty = (id: string) => {
    dirty();
    setSpecialties((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : s.length >= MAX_SPECIALTIES ? s : [...s, id],
    );
  };
  const setField = (id: string, value: string | string[]) => {
    dirty();
    setFieldValues((f) => ({ ...f, [id]: value }));
  };
  const toggleChip = (id: string, opt: string, max?: number) => {
    dirty();
    setFieldValues((f) => {
      const cur = Array.isArray(f[id]) ? (f[id] as string[]) : [];
      if (cur.includes(opt)) return { ...f, [id]: cur.filter((x) => x !== opt) };
      // Hard cap (e.g. "Your style" is 1–3): ignore adds beyond the field's max.
      if (typeof max === "number" && cur.length >= max) return f;
      return { ...f, [id]: [...cur, opt] };
    });
  };

  function applyExtract(d: ImportData) {
    const fillIfEmpty = (cur: string, set: (v: string) => void, val?: string) => {
      if (val && val.trim() && !cur.trim()) set(val.trim());
    };
    fillIfEmpty(displayName, setDisplayName, d.displayName);
    fillIfEmpty(bio, setBio, d.bio);
    fillIfEmpty(values, setValues, d.values);
    fillIfEmpty(region, setRegion, d.region);
    fillIfEmpty(gender, setGender, d.gender);
    fillIfEmpty(website, setWebsite, d.website);
    if (d.insuranceAccepted?.length && !insurance.trim()) setInsurance(d.insuranceAccepted.join(", "));
    if (d.specialties?.length && specialties.length === 0) setSpecialties(d.specialties);
    if (d.fields) {
      setFieldValues((prev) => {
        const next = { ...prev };
        for (const [id, val] of Object.entries(d.fields)) {
          if (val == null) continue;
          const stored = Array.isArray(val) ? val.join(", ") : String(val);
          if (!stored.trim()) continue;
          const cur = next[id];
          const empty = cur == null || (Array.isArray(cur) ? cur.length === 0 : String(cur).trim() === "");
          if (empty) next[id] = stored;
        }
        return next;
      });
    }
    setSaved(false);
  }

  function countFills(d: ImportData): number {
    let n = 0;
    const empty = (s: string) => !s.trim();
    if (d.displayName?.trim() && empty(displayName)) n++;
    if (d.bio?.trim() && empty(bio)) n++;
    if (d.values?.trim() && empty(values)) n++;
    if (d.region?.trim() && empty(region)) n++;
    if (d.gender?.trim() && empty(gender)) n++;
    if (d.website?.trim() && empty(website)) n++;
    if (d.insuranceAccepted?.length && empty(insurance)) n++;
    if (d.specialties?.length && specialties.length === 0) n++;
    for (const [id, val] of Object.entries(d.fields ?? {})) {
      const has = Array.isArray(val) ? val.length > 0 : String(val ?? "").trim() !== "";
      if (!has) continue;
      const cur = fieldValues[id];
      const isEmpty = cur == null || (Array.isArray(cur) ? cur.length === 0 : String(cur).trim() === "");
      if (isEmpty) n++;
    }
    return n;
  }

  function onBuild() {
    const urls = links.split(/\n+/).map((s) => s.trim()).filter(Boolean);
    const reading: ImportView["sources"] = [
      ...urls.map((u) => {
        let host = u;
        try { host = new URL(u).hostname.toLowerCase(); } catch { /* keep raw */ }
        return { id: u, host, ...describeSource(host), ok: false, usedStructured: false, contributed: [] };
      }),
      ...(paste.trim()
        ? [{ id: "paste", host: "", ...describeSource(""), ok: false, usedStructured: false, contributed: [] }]
        : []),
    ];
    setImportCollapsed(false);
    setImportView({ phase: "reading", sources: reading, filledCount: 0, extras: [], unmapped: [] });
    startExtract(async () => {
      const res = await extractProfileFromSources({ urls, text: paste });
      if (!res.ok) {
        setImportView({
          phase: "failed",
          sources: res.result?.sources ?? reading,
          filledCount: 0,
          extras: res.result?.extras ?? [],
          unmapped: res.result?.unmappedSpecialties ?? [],
          error: res.error,
        });
        return;
      }
      const { result } = res;
      const n = countFills(result.data);
      applyExtract(result.data);
      if (result.suggestedPhotoUrl && !photoUrl) setImportedPhotoUrl(result.suggestedPhotoUrl);
      setImportView({
        phase: n === 0 ? "nothing" : result.failedUrls.length ? "partial" : "done",
        sources: result.sources,
        filledCount: n,
        extras: result.extras,
        unmapped: result.unmappedSpecialties,
      });
    });
  }

  function onPhotoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoError(null);
    startPhoto(async () => {
      const fd = new FormData();
      fd.append("photo", file);
      const res = await uploadProfilePhoto(fd);
      if (res.ok) { setPhotoUrl(res.photoUrl); setImportedPhotoUrl(null); }
      else setPhotoError(res.error);
    });
  }
  function onAdoptPhoto() {
    if (!importedPhotoUrl) return;
    setPhotoError(null);
    startPhoto(async () => {
      const res = await adoptImportedPhoto(importedPhotoUrl);
      if (res.ok) { setPhotoUrl(res.photoUrl); setImportedPhotoUrl(null); }
      else setPhotoError(res.error);
    });
  }
  function onRemovePhoto() {
    setPhotoError(null);
    startPhoto(async () => {
      const res = await removeProfilePhoto();
      if (res.ok) setPhotoUrl("");
    });
  }

  // The rich (optional) sections as a collapsible group — used in steps 2 & 3.
  const richSection = (sectionId: string) => {
    const section = PROFILE_SECTIONS.find((s) => s.id === sectionId);
    if (!section) return null;
    return (
      <details key={section.id} className="group border-t border-rule/70">
        <summary className="flex cursor-pointer list-none items-center gap-2 rounded-2xl py-4 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15 focus-visible:ring-offset-2 focus-visible:ring-offset-sand">
          <span className="font-display text-[18px] leading-tight text-charcoal">{section.title}</span>
          <span className="meta text-ink-muted">· optional</span>
          <span aria-hidden className="ml-auto select-none text-[22px] leading-none text-ink-muted transition-transform duration-200 group-open:rotate-45">+</span>
        </summary>
        <div className="space-y-7 pb-2">
          {section.fields.map((field) => {
            const val = fieldValues[field.id];
            const str = typeof val === "string" ? val : "";
            const arr = Array.isArray(val) ? val : [];
            return (
              <Field key={field.id} label={field.label} hint={field.hint} optional>
                {field.type === "textarea" ? (
                  <>
                    <TextArea value={str} placeholder={field.placeholder} onChange={(e) => setField(field.id, e.target.value)} />
                    <PhraseAssist fieldId={field.id} draft={str} onUse={(text) => setField(field.id, text)} />
                  </>
                ) : field.type === "chips" && field.options ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {field.options.map((opt) =>
                      field.single ? (
                        <ChoiceChip key={opt.id} label={opt.label} selected={str === opt.id} onClick={() => setField(field.id, str === opt.id ? "" : opt.id)} />
                      ) : (
                        <ChoiceChip key={opt.id} label={opt.label} selected={arr.includes(opt.id)} onClick={() => toggleChip(field.id, opt.id, field.max)} />
                      ),
                    )}
                  </div>
                ) : (
                  <TextInput value={str} placeholder={field.placeholder} onChange={(e) => setField(field.id, e.target.value)} />
                )}
              </Field>
            );
          })}
        </div>
      </details>
    );
  };

  // Availability lives in the optional "Availability" section, so it's easy to skip — but
  // seekers filter on it, so an unset field means we can't show the "Accepting new clients"
  // badge. The checklist names it rather than letting it stay quietly blank.
  const availabilityValue = fieldValues.availability_state;
  const availabilitySet = Array.isArray(availabilityValue)
    ? availabilityValue.length > 0
    : typeof availabilityValue === "string" && availabilityValue.trim() !== "";

  const checklist = [
    { label: "Add your name", done: !!displayName.trim() },
    { label: "Write a short bio", done: !!bio.trim() },
    { label: "Add how you work", done: Boolean(modality) },
    { label: "Choose 3–8 focus areas", done: specialties.length >= 3 },
    { label: "Write your healing note", done: !!values.trim() },
    { label: "Say if you’re taking new clients", done: availabilitySet },
  ];

  const coverDesignValue = typeof fieldValues.cover_design === "string" ? fieldValues.cover_design : "";
  const coverColorValue = typeof fieldValues.cover_color === "string" ? fieldValues.cover_color : "";

  return (
    <form onSubmit={onSubmit} className={importView ? (importCollapsed ? "pb-24" : "pb-64") : ""}>
      <Stepper step={step} onStep={goToStep} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_minmax(0,340px)] lg:items-start lg:gap-10">
        {/* ───── LEFT: the panel ───── */}
        <div className="min-w-0 rounded-3xl border border-rule/80 bg-white p-6 shadow-[0_1px_0_rgba(31,58,95,0.02),0_18px_40px_-34px_rgba(31,58,95,0.2)] md:p-8">
          {/* Heading + match-strength */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="meta text-teal">Step {step + 1} of {WIZARD_STEPS.length} · {WIZARD_STEPS[step]}</p>
              <h1 className="font-display mt-2 text-[clamp(26px,3.6vw,38px)] font-light leading-[1.05] tracking-[-0.02em] text-charcoal">
                Build your profile
              </h1>
              <p className="mt-3 max-w-md text-[15px] leading-[1.6] text-ink-soft">
                This is what people will see. The &ldquo;what healing means to me&rdquo; note is the
                heart of it — write it the way you&rsquo;d say it out loud.
              </p>
            </div>

            <div className="w-full shrink-0 rounded-2xl border border-rule/70 bg-sand/40 p-4 lg:w-[300px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] text-ink-soft">
                  Profile status:{" "}
                  <span className={`ml-1 rounded-full px-2 py-0.5 text-[12px] font-medium ${held ? "bg-ocean/10 text-ocean" : isPublished ? "bg-teal/15 text-teal" : inReview ? "bg-sage/25 text-ocean" : "bg-charcoal/[0.06] text-ink-muted"}`}>
                    {statusLabel}
                  </span>
                </span>
                <span className="text-[13px] text-ink-soft">
                  Match strength: <span className="font-medium text-charcoal">{liveCompleteness}%</span>
                </span>
              </div>
              <div aria-hidden className="mt-3 h-1.5 overflow-hidden rounded-full bg-rule/60">
                <div className="h-full rounded-full bg-teal transition-[width] duration-700 ease-out" style={{ width: `${liveCompleteness}%` }} />
              </div>
              <p className="mt-3 text-[12.5px] leading-[1.5] text-ink-muted">
                {liveCompleteness >= 80
                  ? "Strong — people see a full picture of you."
                  : missingMatch.length
                    ? `Adding ${missingMatch.slice(0, 1).join("")} will improve matching.`
                    : "A fuller profile gets matched to more of the right people."}
              </p>
            </div>
          </div>

          {/* Held banner (every step) */}
          {held ? (
            <div className="mt-7 rounded-2xl border border-ocean/15 bg-ocean/[0.04] p-5">
              <p className="font-display text-[17px] leading-tight text-charcoal">Your profile is on hold</p>
              <p className="mt-2 text-[14.5px] leading-[1.6] text-charcoal">{heldMsg}</p>
              <p className="mt-2 text-[13.5px] leading-[1.6] text-ink-soft">
                It isn&rsquo;t public right now and publishing is paused — but nothing is lost, and you
                can still edit. Questions? Email{" "}
                <a href={CONTACT_MAILTO} className="link-underline font-medium text-charcoal">{CONTACT_EMAIL}</a>.
              </p>
            </div>
          ) : null}

          {/* ───── STEP 1 · Basics ───── */}
          {step === 0 ? (
            <div className="mt-8 space-y-7">
              <Field label="Your photo" optional>
                <div className="flex items-center gap-5">
                  {photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoUrl} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
                  ) : (
                    <span aria-hidden className="font-display flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-sand-deep text-[26px] text-teal">
                      {(displayName.trim()[0] ?? "·").toUpperCase()}
                    </span>
                  )}
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-charcoal/20 bg-white px-5 py-2.5 text-[14px] font-medium text-charcoal transition-colors hover:border-charcoal/40 hover:bg-sand-deep/50 focus-within:outline-none focus-within:ring-2 focus-within:ring-charcoal/20 focus-within:ring-offset-2 focus-within:ring-offset-sand ${photoBusy ? "pointer-events-none opacity-50" : ""}`}>
                        {photoBusy ? "Working…" : photoUrl ? "Replace photo" : "Upload a photo"}
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="sr-only" onChange={onPhotoFile} disabled={photoBusy} />
                      </label>
                      {photoUrl ? (
                        <button type="button" onClick={onRemovePhoto} disabled={photoBusy} className="rounded-full px-1 text-[13px] text-ink-muted underline-offset-2 hover:text-charcoal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15">Remove</button>
                      ) : null}
                    </div>
                    {importedPhotoUrl && !photoUrl ? (
                      <button type="button" onClick={onAdoptPhoto} disabled={photoBusy} className="rounded-full px-1 text-left text-[13px] text-teal underline underline-offset-2 hover:text-ocean">Use the photo we found from your import →</button>
                    ) : null}
                    {photoError ? (
                      <p role="alert" className="text-[13px] leading-[1.5] text-ocean">{photoError}</p>
                    ) : (
                      <p className="text-[12px] leading-[1.5] text-ink-muted">A friendly headshot — JPG, PNG, or WebP, up to 6 MB. Saved as soon as you pick it.</p>
                    )}
                  </div>
                </div>
              </Field>

              <Field label="Cover style" hint="Pick a design, then a color — shown on your profile and card.">
                <CoverThemePicker
                  design={coverDesignValue}
                  color={coverColorValue}
                  onDesignChange={(id) => setField("cover_design", id)}
                  onColorChange={(id) => setField("cover_color", id)}
                />
              </Field>

              <Field label="Display name">
                <TextInput value={displayName} onChange={(e) => { setDisplayName(e.target.value); dirty(); }} placeholder="Your name or business name" />
              </Field>

              <div className="grid gap-7 md:grid-cols-2">
                <Field label="Location / region">
                  <TextInput value={region} onChange={(e) => { setRegion(e.target.value); dirty(); }} placeholder="City, state or region" />
                </Field>
                <Field label="Website" optional>
                  <TextInput type="url" value={website} onChange={(e) => { setWebsite(e.target.value); dirty(); }} placeholder="https://yourwebsite.com" />
                </Field>
              </div>

              {/* Import-first assist */}
              <details open={importOpen} onToggle={(e) => setImportOpen(e.currentTarget.open)} className="group rounded-3xl border border-rule bg-seafoam/20 p-5 md:p-6">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-2xl marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15">
                  <span className="font-display text-[17px] leading-tight text-charcoal">
                    Save time — import from a link or bio
                  </span>
                  <span aria-hidden className="ml-auto select-none text-[22px] leading-none text-ink-muted transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <div className="mt-4 space-y-4">
                  <p className="text-[13px] leading-[1.55] text-ink-soft">
                    Drop a link or two — your website, your Psychology Today profile — and we&rsquo;ll draft
                    your profile for you. Or paste a bio. Nothing is saved until you review and hit Save.
                  </p>
                  {savedImportUrl ? (
                    <p className="rounded-xl border border-teal/30 bg-white/70 px-3 py-2 text-[13px] leading-[1.5] text-charcoal">
                      We saved your Psychology Today link — it&rsquo;s ready below. Just press{" "}
                      <span className="font-medium">Build my profile</span>.
                    </p>
                  ) : null}
                  <Field label="Your links" hint="One per line — website, Psychology Today, etc.">
                    <TextArea value={links} onChange={(e) => setLinks(e.target.value)} placeholder={"https://your-website.com\nhttps://psychologytoday.com/…"} className="min-h-[80px]" />
                  </Field>
                  <Field label="…or paste a bio" optional>
                    <TextArea id="import-paste" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Paste your bio / Psychology Today text here" className="min-h-[110px]" />
                  </Field>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <Button type="button" onClick={onBuild} disabled={extracting || (!links.trim() && paste.trim().length < 40)}>
                      {extracting ? "Building your profile…" : "Build my profile"}
                    </Button>
                  </div>
                  <p className="text-[12px] leading-[1.5] text-ink-muted">
                    Most links work — your website, your Psychology Today profile. LinkedIn blocks automated
                    visits, so paste that one instead.
                  </p>
                </div>
              </details>

              <p className="text-[13px] leading-[1.55] text-ink-muted">You can skip optional fields for now.</p>
            </div>
          ) : null}

          {/* ───── STEP 2 · Practice details ───── */}
          {step === 1 ? (
            <div className="mt-8 space-y-7">
              <Field label="How you work">
                <div className="grid gap-3 sm:grid-cols-3">
                  {MODALITY_OPTIONS.map((m) => (
                    <ChoiceChip key={m.id} label={m.label} selected={modality === m.id} onClick={() => { setModality(m.id); dirty(); }} />
                  ))}
                </div>
              </Field>

              <Field label="Areas of focus" hint="Pick 3–8 categories that best reflect your work.">
                <div className="grid gap-3 sm:grid-cols-2">
                  {SPECIALTY_OPTIONS.map((s) => (
                    <ChoiceChip key={s.id} label={s.label} selected={specialties.includes(s.id)} onClick={() => toggleSpecialty(s.id)} />
                  ))}
                </div>
              </Field>

              <div className="grid gap-7 md:grid-cols-2">
                <Field label="Your gender" hint="Some people prefer a practitioner of a particular gender.">
                  <TextInput value={gender} onChange={(e) => { setGender(e.target.value); dirty(); }} placeholder="e.g. Woman" />
                </Field>
                <Field label="Insurance accepted" optional hint="Comma-separated.">
                  <TextInput value={insurance} onChange={(e) => { setInsurance(e.target.value); dirty(); }} placeholder="Aetna, BCBS, Cigna" />
                </Field>
              </div>

              <div className="pt-1">{PRACTICE_SECTION_IDS.map(richSection)}</div>
            </div>
          ) : null}

          {/* ───── STEP 3 · Your voice ───── */}
          {step === 2 ? (
            <div className="mt-8 space-y-7">
              <Field label="What healing means to me" hint="The heart of your profile. Plain, warm, in your own voice.">
                <TextArea value={values} onChange={(e) => { setValues(e.target.value); dirty(); }} placeholder="When I sit with someone…" className="min-h-[180px]" />
                <PhraseAssist fieldId="values" draft={values} onUse={(text) => { setValues(text); dirty(); }} />
              </Field>
              <Field label="Short bio">
                <TextArea value={bio} onChange={(e) => { setBio(e.target.value); dirty(); }} placeholder="A couple of sentences about you and your practice." />
                <PhraseAssist fieldId="bio" draft={bio} onUse={(text) => { setBio(text); dirty(); }} />
              </Field>
              <div className="pt-1">{VOICE_SECTION_IDS.map(richSection)}</div>
            </div>
          ) : null}

          {/* ───── STEP 4 · Review & publish ───── */}
          {step === 3 ? (
            <div className="mt-8 space-y-7">
              <div className="rounded-2xl border border-rule/70 bg-sand/40 p-5">
                <p className="meta text-ink-muted">Review</p>
                <p className="mt-2 text-[14.5px] leading-[1.6] text-ink-soft">
                  Here&rsquo;s the shape of your profile — jump back to any step to change something.
                </p>
                <dl className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  {[
                    ["Name", displayName.trim() || "—"],
                    ["Location", region.trim() || "—"],
                    ["How you work", MODALITY_OPTIONS.find((m) => m.id === modality)?.label ?? "—"],
                    ["Focus areas", specialties.length ? `${specialties.length} chosen` : "none yet"],
                    ["Short bio", bio.trim() ? "added" : "missing"],
                    ["What healing means to me", values.trim() ? "added" : "missing"],
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-baseline justify-between gap-3 border-b border-rule/50 py-1.5 last:border-0">
                      <dt className="text-[13px] text-ink-muted">{label}</dt>
                      <dd className="text-[13.5px] font-medium text-charcoal">{val}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Publish / status */}
              <section aria-labelledby="publish-heading" className="rounded-2xl border border-rule/70 bg-white p-6">
                <div className="flex items-center gap-3">
                  <span aria-hidden className={`inline-block h-2 w-2 shrink-0 rounded-full ${held ? "bg-ocean" : isPublished ? "bg-teal" : inReview ? "bg-sage" : "bg-rule-strong/30"}`} />
                  <h2 id="publish-heading" className="font-display text-[19px] leading-tight text-charcoal">
                    {held
                      ? "Your profile is on hold"
                      : isPublished
                        ? "Your profile is live"
                        : inReview
                          ? "Your profile is with Nora for a read"
                          : "Ready to publish?"}
                  </h2>
                </div>

                {held ? (
                  <p className="mt-3 text-[14.5px] leading-[1.6] text-ink-soft">
                    Publishing is paused while your profile is on hold. You can still edit everything;
                    reach out to <a href={CONTACT_MAILTO} className="link-underline font-medium text-charcoal">{CONTACT_EMAIL}</a> with questions.
                  </p>
                ) : inReview ? (
                  <>
                    <p className="mt-3 text-[14.5px] leading-[1.6] text-ink-soft">
                      Thank you — it&rsquo;s submitted. Everyone listed here is offering real care to people
                      in Minnesota, so Nora reads each new profile before it joins the directory. Yours
                      isn&rsquo;t public yet.
                    </p>
                    <p className="mt-2 text-[14.5px] leading-[1.6] text-ink-soft">
                      Nothing is lost, and you can keep editing — anything you save is part of what she
                      reads. Questions, or want to tell her about your practice? Email{" "}
                      <a href={CONTACT_MAILTO} className="link-underline font-medium text-charcoal">{CONTACT_EMAIL}</a>.
                    </p>
                    <div className="mt-5">
                      <Button type="button" tone="ghost" onClick={onUnpublish} disabled={publishing}>
                        {publishing ? "Moving it back…" : "Move it back to draft"}
                      </Button>
                    </div>
                    {publishError ? <p role="alert" className="mt-4 text-[14px] leading-[1.6] text-ocean">{publishError}</p> : null}
                  </>
                ) : (
                  <>
                    <p className="mt-3 text-[14.5px] leading-[1.6] text-ink-soft">
                      {isPublished
                        ? "People looking for care can find you. You can take it down any time — nothing is permanent."
                        : "Only you can see this right now. Publish when you’re ready, at your own pace. You need at least a name and a short bio. If we haven’t met you yet, Nora reads your profile before it joins the directory."}
                    </p>
                    {isPublished ? (
                      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
                        {slug ? (
                          <LinkButton href={`/practitioners/${slug}`} target="_blank" rel="noreferrer" tone="secondary">View your public page →</LinkButton>
                        ) : null}
                        <Button type="button" tone="ghost" onClick={onUnpublish} disabled={publishing}>{publishing ? "Taking it down…" : "Take it down"}</Button>
                      </div>
                    ) : (
                      <div className="mt-5">
                        {!canPublish ? (
                          <p className="mb-3 rounded-xl border border-rule bg-sand/60 px-4 py-3 text-[13.5px] leading-[1.55] text-ink-soft">
                            Almost there — add {missingToPublish.join(" and ")} to publish.
                          </p>
                        ) : null}
                        <Button type="button" onClick={onPublish} disabled={publishing || !canPublish}>{publishing ? "Publishing…" : "Publish profile"}</Button>
                      </div>
                    )}
                    {publishError ? <p role="alert" className="mt-4 text-[14px] leading-[1.6] text-ocean">{publishError}</p> : null}
                  </>
                )}
              </section>
            </div>
          ) : null}

          {/* ───── Footer ───── */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-rule/70 pt-6">
            <button type="button" onClick={runSave} disabled={pending} className="rounded-full px-1 text-[14px] font-medium text-ink-soft underline-offset-4 transition-colors hover:text-charcoal hover:underline disabled:opacity-50">
              {pending ? "Saving…" : saved ? "Saved ✓" : "Save for later"}
            </button>
            <div className="flex items-center gap-4">
              {step > 0 ? (
                <button type="button" onClick={() => goToStep(step - 1)} className="text-[14px] font-medium text-ink-muted transition-colors hover:text-charcoal">← Back</button>
              ) : null}
              {step < WIZARD_STEPS.length - 1 ? (
                <div className="flex items-center gap-4">
                  <span className="hidden text-[13px] text-ink-muted sm:inline">Next up: {NEXT_HINTS[step]}.</span>
                  <Button type="button" onClick={onContinue}>Continue →</Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* ───── RIGHT: sidebar ───── */}
        <aside className="space-y-5 lg:sticky lg:top-24">
          <LivePreview name={displayName} region={region} photoUrl={photoUrl} specialties={specialties} seed={slug ?? practitioner.id} design={coverDesignValue} color={coverColorValue} />

          <div className="rounded-3xl border border-rule/80 bg-white p-5">
            <p className="meta text-ink-muted">What helps you get matched</p>
            <ul className="mt-3.5 space-y-2.5">
              {checklist.map((it) => (
                <li key={it.label} className="flex items-center gap-2.5 text-[14px]">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${it.done ? "bg-teal text-sand" : "border border-rule text-transparent"}`}>
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-3 w-3"><path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <span className={it.done ? "text-charcoal" : "text-ink-soft"}>{it.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3 rounded-3xl border border-rule/70 bg-seafoam/20 p-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-seafoam/60 text-teal">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-[18px] w-[18px]">
                <path d="M4 20C4 12 9 5 20 4c0 11-7 16-15 16-1 0-1-3-1-3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 16c2-3 5-6 9-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <p className="text-[13px] leading-[1.55] text-ink-soft">
              We keep it simple so you can focus on what matters most. We&rsquo;ll guide you step by step.
            </p>
          </div>
        </aside>
      </div>

      {importView ? (
        <ImportStatusBar
          view={importView}
          collapsed={importCollapsed}
          onToggleCollapse={() => setImportCollapsed((c) => !c)}
          onDismiss={() => setImportView(null)}
          onPasteFocus={() => {
            setStep(0);
            setImportOpen(true);
            requestAnimationFrame(() => document.getElementById("import-paste")?.focus());
          }}
        />
      ) : null}
    </form>
  );
}

// "Help me phrase this" — the OPTIONAL AI writing assist for a narrative field.
// It drafts a warmer version FROM the practitioner's own words (polishFieldText) and
// shows it in a calm inline card BELOW the textarea. It proposes; they choose — "Use
// this" replaces the value (via the parent's setField, which marks dirty), "Keep mine"
// dismisses. Nothing is ever overwritten without the click.
function PhraseAssist({
  fieldId,
  draft,
  onUse,
}: {
  fieldId: string;
  draft: string;
  onUse: (text: string) => void;
}) {
  const [pending, start] = useTransition();
  const [suggestion, setSuggestion] = useState<{ text: string; note?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Match the server floor — no point offering to shape a near-empty field.
  const tooShort = draft.trim().length < 40;

  function onShape() {
    setError(null);
    setSuggestion(null);
    start(async () => {
      const res = await polishFieldText(fieldId, draft);
      if (res.ok) setSuggestion({ text: res.suggestion, note: res.note });
      else setError(res.error);
    });
  }

  return (
    <div className="mt-2.5">
      {!suggestion ? (
        <button
          type="button"
          onClick={onShape}
          disabled={pending || tooShort}
          aria-busy={pending}
          className="rounded-full px-1 text-[13px] font-medium text-teal underline-offset-2 hover:text-ocean hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
        >
          {pending ? "Shaping…" : "Help me phrase this"}
        </button>
      ) : null}

      <div aria-live="polite">
        {suggestion ? (
          <div className="mt-2 rounded-2xl border border-teal/25 bg-seafoam/20 p-4">
            <p className="meta text-teal">A shaped version — yours to take or leave</p>
            <p className="mt-2 whitespace-pre-wrap text-[14.5px] leading-[1.6] text-charcoal">{suggestion.text}</p>
            {suggestion.note ? (
              <p className="mt-2 text-[12px] leading-[1.5] text-ink-muted">{suggestion.note}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={() => {
                  onUse(suggestion.text);
                  setSuggestion(null);
                }}
              >
                Use this
              </Button>
              <button
                type="button"
                onClick={() => setSuggestion(null)}
                className="rounded-full px-1 text-[13px] font-medium text-ink-muted underline-offset-4 transition-colors hover:text-charcoal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15"
              >
                Keep mine
              </button>
            </div>
          </div>
        ) : null}
        {error ? <p role="alert" className="mt-2 text-[13px] leading-[1.5] text-ocean">{error}</p> : null}
      </div>
    </div>
  );
}
