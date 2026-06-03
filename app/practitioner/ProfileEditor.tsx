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

import { PROFILE_SECTIONS } from "@/app/_lib/profile-fields";

import { MODALITY_OPTIONS, SPECIALTY_OPTIONS } from "./_taxonomy";
import { saveProfile } from "./actions";
import { extractProfileFromSources } from "./extract-actions";
import { ImportStatusBar, type ImportView } from "./ImportStatusBar";
import { describeSource, type ImportData } from "./_extract/types";
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
  const [fieldValues, setFieldValues] = useState<Record<string, string | string[]>>(
    (practitioner.fieldValues as unknown as Record<string, string | string[]> | null) ?? {},
  );

  const [completeness, setCompleteness] = useState(practitioner.completeness);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  // Publish state — mirrors the save UX (a useTransition + an inline result).
  const [visibility, setVisibility] = useState<ProfileVisibility>(practitioner.visibility);
  const [slug, setSlug] = useState<string | null>(practitioner.slug);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishing, startPublish] = useTransition();
  const isPublished = visibility === "PUBLISHED";

  // AI "drop your links / paste a bio → draft" assist — fills the form for review; never saves/publishes.
  const [paste, setPaste] = useState("");
  const [links, setLinks] = useState("");
  const [importView, setImportView] = useState<ImportView | null>(null);
  const [importCollapsed, setImportCollapsed] = useState(false);
  const [extracting, startExtract] = useTransition();
  // New (post-signup) profiles get the import-first welcome, auto-expanded.
  const isNew = practitioner.completeness === 0 && !practitioner.displayName;
  const [importOpen, setImportOpen] = useState(isNew);

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

  // Rich (config-driven) fields → stored in fieldValues.
  const setField = (id: string, value: string | string[]) => {
    dirty();
    setFieldValues((f) => ({ ...f, [id]: value }));
  };
  const toggleChip = (id: string, opt: string) => {
    dirty();
    setFieldValues((f) => {
      const cur = Array.isArray(f[id]) ? (f[id] as string[]) : [];
      return { ...f, [id]: cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt] };
    });
  };

  // Merge an extraction into the form — fills only EMPTY fields (never clobbers).
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
    if (d.insuranceAccepted?.length && !insurance.trim()) {
      setInsurance(d.insuranceAccepted.join(", "));
    }
    if (d.specialties?.length && specialties.length === 0) {
      setSpecialties(d.specialties);
    }
    if (d.fields) {
      setFieldValues((prev) => {
        const next = { ...prev };
        for (const [id, val] of Object.entries(d.fields)) {
          if (val == null) continue;
          const stored = Array.isArray(val) ? val.join(", ") : String(val);
          if (!stored.trim()) continue;
          const cur = next[id];
          const empty =
            cur == null || (Array.isArray(cur) ? cur.length === 0 : String(cur).trim() === "");
          if (empty) next[id] = stored;
        }
        return next;
      });
    }
    setSaved(false);
  }

  // How many currently-EMPTY fields this draft will fill (drives the bar's count).
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
    // Optimistic "reading" rows from what we're about to attempt.
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
      setImportView({
        phase: n === 0 ? "nothing" : result.failedUrls.length ? "partial" : "done",
        sources: result.sources,
        filledCount: n,
        extras: result.extras,
        unmapped: result.unmappedSpecialties,
      });
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await saveProfile({
        displayName, region, website, gender, bio, values, modality, specialties,
        insuranceAccepted: insurance.split(",").map((s) => s.trim()).filter(Boolean),
        fieldValues,
      });
      if (res.ok) {
        setCompleteness(res.completeness);
        setSaved(true);
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-10 ${importView ? (importCollapsed ? "pb-24" : "pb-64") : ""}`}
    >
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

      {/* What's actually required — the form is lighter than it looks. */}
      <p className="rounded-2xl border border-rule bg-white/70 px-5 py-4 text-[14px] leading-[1.6] text-ink-soft">
        <span className="font-medium text-charcoal">You can go live with just your name and a short bio.</span>{" "}
        Everything else is optional — add it now, or anytime after you publish.
      </p>

      {/* Import-first onboarding — drop a link or two / paste a bio, we draft the form
          (you review). Auto-expanded + welcoming for a brand-new (post-signup) profile. */}
      <details
        open={importOpen}
        onToggle={(e) => setImportOpen(e.currentTarget.open)}
        className="group rounded-3xl border border-rule bg-seafoam/20 p-5 md:p-6"
      >
        <summary className="flex cursor-pointer list-none items-center gap-2 marker:hidden">
          <span className="font-display text-[18px] leading-tight text-charcoal">
            {isNew ? "Let's build your profile — the fast way" : "Save time — import from a link or a bio"}
          </span>
          <span
            aria-hidden
            className="ml-auto select-none text-[22px] leading-none text-ink-muted transition-transform duration-200 group-open:rotate-45"
          >
            +
          </span>
        </summary>
        <div className="mt-4 space-y-4">
          <p className="text-[13px] leading-[1.55] text-ink-soft">
            Drop a link or two — your website, your Psychology Today profile — and we&rsquo;ll draft
            your profile for you. Or paste a bio. Nothing is saved until you review and hit Save.
          </p>

          <Field label="Your links" hint="One per line — website, Psychology Today, etc.">
            <TextArea
              value={links}
              onChange={(e) => setLinks(e.target.value)}
              placeholder={"https://your-website.com\nhttps://psychologytoday.com/…"}
              className="min-h-[80px]"
            />
          </Field>

          <Field label="…or paste a bio" optional>
            <TextArea
              id="import-paste"
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              placeholder="Paste your bio / Psychology Today text here"
              className="min-h-[110px]"
            />
          </Field>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Button
              type="button"
              onClick={onBuild}
              disabled={extracting || (!links.trim() && paste.trim().length < 40)}
            >
              {extracting ? "Building your profile…" : "Build my profile"}
            </Button>
            {isNew ? (
              <button
                type="button"
                onClick={() => setImportOpen(false)}
                className="text-[13px] text-ink-muted underline-offset-2 hover:underline"
              >
                I&rsquo;ll fill it in myself
              </button>
            ) : null}
          </div>

          <p className="text-[12px] leading-[1.5] text-ink-muted">
            Most links work — your website, your Psychology Today profile. LinkedIn blocks automated
            visits, so paste that one instead.
          </p>
        </div>
      </details>

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

        <Field label="Areas of focus" hint="Pick 3–8 categories that best reflect your work.">
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

      {/* Nora's rich profile sections — collapsed by default so the form reads light.
          Everything here is optional; add over time. */}
      {PROFILE_SECTIONS.map((section) => (
        <details key={section.id} className="group border-t border-rule/70">
          <summary className="flex cursor-pointer list-none items-center gap-2 py-4 marker:hidden">
            <span className="font-display text-[19px] leading-tight text-charcoal">{section.title}</span>
            <span className="meta text-ink-muted">· optional</span>
            <span
              aria-hidden
              className="ml-auto select-none text-[22px] leading-none text-ink-muted transition-transform duration-200 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="space-y-7 pb-2">
            {section.fields.map((field) => {
              const val = fieldValues[field.id];
              const str = typeof val === "string" ? val : "";
              const arr = Array.isArray(val) ? val : [];
              return (
                <Field key={field.id} label={field.label} hint={field.hint} optional>
                  {field.type === "textarea" ? (
                    <TextArea value={str} placeholder={field.placeholder} onChange={(e) => setField(field.id, e.target.value)} />
                  ) : field.type === "chips" && field.options ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {field.options.map((opt) =>
                        field.single ? (
                          <ChoiceChip key={opt.id} label={opt.label} selected={str === opt.id} onClick={() => setField(field.id, str === opt.id ? "" : opt.id)} />
                        ) : (
                          <ChoiceChip key={opt.id} label={opt.label} selected={arr.includes(opt.id)} onClick={() => toggleChip(field.id, opt.id)} />
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
      ))}

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

      {importView ? (
        <ImportStatusBar
          view={importView}
          collapsed={importCollapsed}
          onToggleCollapse={() => setImportCollapsed((c) => !c)}
          onDismiss={() => setImportView(null)}
          onPasteFocus={() => {
            setImportOpen(true);
            requestAnimationFrame(() => document.getElementById("import-paste")?.focus());
          }}
        />
      ) : null}
    </form>
  );
}
