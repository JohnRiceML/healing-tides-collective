import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container, Card, DLRow, LinkButton } from "@/app/_components/ui";
import {
  getPractitionerBySlug,
  type PractitionerProfile,
} from "@/lib/practitioners";
import { specialtyLabel, modalityLabel } from "@/app/_lib/taxonomy";
import { PROFILE_SECTIONS, optionLabel } from "@/app/_lib/profile-fields";
import { SITE_URL } from "@/lib/site";
import { VerificationBadges } from "@/app/_components/VerificationBadges";
import { CoverArt } from "../_components/CoverArt";
import { ViewBeacon } from "./ViewBeacon";

/** First sentence (or a trimmed lead) of free text, for meta descriptions. */
function leadFrom(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

/** A calm initial-circle stand-in when a practitioner has no photo. */
function initialOf(name: string): string {
  const first = name.trim().charAt(0);
  return first ? first.toUpperCase() : "·";
}

/** Nora's rich profile fields (from the fieldValues JSON), grouped by section —
 * only the filled ones render. */
function RichProfile({ fieldValues }: { fieldValues: Record<string, string | string[]> }) {
  const filled = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v.length > 0 : Boolean(v && v.trim());
  const sections = PROFILE_SECTIONS.filter((s) =>
    s.fields.some((f) => filled(fieldValues[f.id])),
  );
  if (sections.length === 0) return null;
  return (
    <>
      {sections.map((section) => (
        <section key={section.id} className="mt-12 border-t border-rule pt-10">
          <h2 className="meta text-ink-muted">{section.title}</h2>
          <dl className="mt-2">
            {section.fields
              .filter((field) => filled(fieldValues[field.id]))
              .map((field) => {
                const v = fieldValues[field.id];
                const flat =
                  field.type === "chips" && field.options
                    ? (Array.isArray(v) ? v : [v as string]).map((id) => optionLabel(field.id, id)).join(" · ")
                    : field.type === "tags"
                      ? (Array.isArray(v) ? v : (v as string).split(",").map((s) => s.trim()).filter(Boolean)).join(" · ")
                      : null;
                return (
                  <DLRow key={field.id} label={field.label}>
                    {flat !== null ? flat : <span className="whitespace-pre-line">{v as string}</span>}
                  </DLRow>
                );
              })}
          </dl>
        </section>
      ))}
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPractitionerBySlug(slug);

  if (!p) {
    return {
      title: "Practitioner not found — Healing Tides Collective",
      description: "This practitioner profile isn't here.",
    };
  }

  const source = p.bio?.trim() || p.values?.trim() || "";
  const description = source
    ? leadFrom(source)
    : `${p.displayName} — a practitioner in the Healing Tides Collective.`;
  const url = `${SITE_URL}/practitioners/${p.slug}`;

  return {
    title: `${p.displayName} — Healing Tides Collective`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${p.displayName} — Healing Tides Collective`,
      description,
      url,
      type: "profile",
      ...(p.photoUrl ? { images: [{ url: p.photoUrl, alt: p.displayName }] } : {}),
    },
  };
}

function jsonLd(p: PractitionerProfile) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: p.displayName,
    url: `${SITE_URL}/practitioners/${p.slug}`,
  };
  if (p.bio) data.description = p.bio.replace(/\s+/g, " ").trim();
  if (p.photoUrl) data.image = p.photoUrl;
  if (p.specialties.length > 0) {
    data.knowsAbout = p.specialties.map((id) => specialtyLabel(id));
  }
  if (p.region) data.areaServed = p.region;
  return data;
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getPractitionerBySlug(slug);
  if (!p) notFound();

  // Only ever link out to http(s) — a practitioner-supplied `website` could
  // otherwise carry a javascript:/data: scheme (stored XSS on a public page).
  const safeWebsite =
    p.website && /^https?:\/\//i.test(p.website) ? p.website : null;
  const modality = modalityLabel(p.modality);
  const hasMeta = Boolean(p.region) || Boolean(modality);

  // Self-reported credential letters (e.g. "MSW, LICSW") shown after the name — the
  // ADMIN-verified "Licensed Professional" badge is a separate, granted signal (Push 2).
  const fv = (p.fieldValues ?? null) as Record<string, unknown> | null;
  const credentials =
    typeof fv?.credentials === "string"
      ? fv.credentials.trim()
      : Array.isArray(fv?.credentials)
        ? fv.credentials.filter(Boolean).join(", ")
        : "";

  return (
    <main id="main-content" className="min-h-screen bg-sand text-charcoal">
      {/* Records one view on mount (skips the owner's own visits). */}
      <ViewBeacon slug={p.slug} />

      {/* Structured data — Person profile for per-profile SEO. */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(p)) }}
      />

      <Container size="default" className="py-14 md:py-20">
        {/* Back to directory */}
        <nav aria-label="Breadcrumb">
          <Link
            href="/practitioners"
            className="meta inline-flex items-center gap-2 rounded-full text-ink-muted transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15 focus-visible:ring-offset-4 focus-visible:ring-offset-sand"
          >
            ← All practitioners
          </Link>
        </nav>

        {/* ───── Cover (their default "wide image") ───── */}
        <div className="relative mt-8 h-40 overflow-hidden rounded-3xl border border-rule/50 sm:h-52">
          <CoverArt seed={p.slug} className="h-full w-full" />
        </div>

        {/* Portrait overlaps the cover (`relative z-10` to paint above it); the name
            block then sits BELOW the cover so nothing rides up over the banner. */}
        <div className="relative z-10 -mt-12 px-1 sm:-mt-14">
          {p.photoUrl ? (
            // photoUrl is a Vercel Blob URL — a host not whitelisted in next.config's
            // image remotePatterns — so a plain <img> is the safe, deploy-proof choice.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.photoUrl}
              alt={`Portrait of ${p.displayName}`}
              width={128}
              height={128}
              loading="eager"
              className="h-24 w-24 rounded-full border-4 border-sand object-cover shadow-sm sm:h-28 sm:w-28"
            />
          ) : (
            <div
              aria-hidden
              className="font-display flex h-24 w-24 select-none items-center justify-center rounded-full border-4 border-sand bg-sand-deep text-[34px] leading-none text-teal shadow-sm sm:h-28 sm:w-28"
            >
              {initialOf(p.displayName)}
            </div>
          )}
        </div>

        <header className="mt-5 px-1">
          <p className="meta text-teal">Practitioner</p>
          <h1 className="font-display mt-3 text-[clamp(30px,5vw,48px)] leading-[1.05] tracking-[-0.02em] text-charcoal">
            {p.displayName}
          </h1>
          {credentials ? (
            <p className="mt-2 text-[15px] tracking-[0.01em] text-ink-soft">{credentials}</p>
          ) : null}
          {hasMeta ? (
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-ink-soft">
              {p.region ? <span>{p.region}</span> : null}
              {p.region && modality ? (
                <span aria-hidden className="text-rule-strong/30">
                  ·
                </span>
              ) : null}
              {modality ? <span>{modality}</span> : null}
            </p>
          ) : null}
          <VerificationBadges
            practitioner={{ createdAt: p.createdAt, verificationBadges: p.verificationBadges }}
            className="mt-4"
          />
        </header>

        {/* ───── Specialties ───── */}
        {p.specialties.length > 0 ? (
          <section className="mt-12 border-t border-rule pt-10">
            <h2 className="meta text-ink-muted">Areas of care</h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {p.specialties.map((id) => (
                <li
                  key={id}
                  className="rounded-full border border-charcoal/15 bg-white px-4 py-2 text-[14px] text-ink-soft"
                >
                  {specialtyLabel(id)}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ───── Bio ───── */}
        {p.bio?.trim() ? (
          <section className="mt-12 border-t border-rule pt-10">
            <h2 className="meta text-ink-muted">About</h2>
            <div className="mt-5 max-w-2xl space-y-5 text-[17px] leading-[1.75] text-ink-soft">
              {p.bio
                .split(/\n{2,}/)
                .map((para) => para.trim())
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
            </div>
          </section>
        ) : null}

        {/* ───── What healing means to me — the differentiator ───── */}
        {p.values?.trim() ? (
          <section className="mt-12">
            <Card as="section" className="bg-seafoam/30">
              <p className="meta text-teal">What healing means to me</p>
              <div className="font-display mt-5 max-w-2xl space-y-4 text-[clamp(20px,2.6vw,26px)] leading-[1.45] tracking-[-0.01em] text-charcoal">
                {p.values
                  .split(/\n{2,}/)
                  .map((para) => para.trim())
                  .filter(Boolean)
                  .map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
              </div>
            </Card>
          </section>
        ) : null}

        {/* ───── More about — Nora's rich fields ───── */}
        <RichProfile fieldValues={(p.fieldValues ?? {}) as Record<string, string | string[]>} />

        {/* ───── Details: insurance, gender, website ───── */}
        {p.insuranceAccepted.length > 0 || p.gender || safeWebsite ? (
          <section className="mt-12 border-t border-rule pt-2">
            <dl>
              {p.insuranceAccepted.length > 0 ? (
                <DLRow label="Insurance accepted">
                  {p.insuranceAccepted.join(" · ")}
                </DLRow>
              ) : null}
              {p.gender ? <DLRow label="Gender">{p.gender}</DLRow> : null}
              {safeWebsite ? (
                <DLRow label="Website">
                  <a
                    href={safeWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline rounded-full font-medium text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/20 focus-visible:ring-offset-4 focus-visible:ring-offset-sand"
                  >
                    {safeWebsite.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                </DLRow>
              ) : null}
            </dl>
          </section>
        ) : null}

        {/* ───── Closing: back to the collective ───── */}
        <section className="mt-16 border-t border-rule pt-12">
          <LinkButton href="/practitioners" tone="secondary">
            ← All practitioners
          </LinkButton>
        </section>
      </Container>
    </main>
  );
}
