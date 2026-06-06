import type { Metadata } from "next";
import { type ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container, DLRow } from "@/app/_components/ui";
import { getPractitionerBySlug, type PractitionerProfile } from "@/lib/practitioners";
import { specialtyLabel, modalityLabel } from "@/app/_lib/taxonomy";
import { PROFILE_SECTIONS, optionLabel } from "@/app/_lib/profile-fields";
import { SITE_URL } from "@/lib/site";
import { VerificationBadges } from "@/app/_components/VerificationBadges";
import { ProfileCover } from "../_components/ProfileCover";
import { GetMatchedBar } from "../_components/GetMatchedBar";
import { ViewBeacon } from "./ViewBeacon";
import { SaveProfileButton } from "./SaveProfileButton";
import { ExpandableValue } from "./ExpandableValue";

// ── tiny field helpers ────────────────────────────────────────────────────────
function arrify(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string" && x.trim() !== "").map((s) => s.trim());
  if (typeof v === "string" && v.trim()) return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}
function fstr(v: unknown): string | null {
  if (typeof v === "string" && v.trim()) return v.trim();
  if (Array.isArray(v) && typeof v[0] === "string" && v[0].trim()) return v[0].trim();
  return null;
}

// ── icons (calm line set) ─────────────────────────────────────────────────────
type IconProps = { className?: string };
const I = (d: ReactNode) =>
  function Icon({ className = "" }: IconProps) {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className} strokeLinecap="round" strokeLinejoin="round">
        {d}
      </svg>
    );
  };
const IconSpark = I(<path d="M12 3l1.7 5.1a3 3 0 0 0 1.9 1.9L20.7 12l-5.1 1.7a3 3 0 0 0-1.9 1.9L12 20.7l-1.7-5.1a3 3 0 0 0-1.9-1.9L3.3 12l5.1-1.7a3 3 0 0 0 1.9-1.9z" stroke="currentColor" strokeWidth="1.5" />);
const IconScreen = I(<><rect x="3" y="4.5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M8.5 20h7M12 16.5V20" stroke="currentColor" strokeWidth="1.5" /></>);
const IconTarget = I(<><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" /></>);
const IconCalendar = I(<><rect x="4" y="5.5" width="16" height="14.5" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" stroke="currentColor" strokeWidth="1.5" /></>);
const IconGlobe = I(<><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" /><path d="M4 12h16M12 4c2.5 2.4 2.5 13.6 0 16M12 4c-2.5 2.4-2.5 13.6 0 16" stroke="currentColor" strokeWidth="1.5" /></>);
const IconShield = I(<path d="M12 3.5l6.5 2.5v5c0 4-2.7 6.8-6.5 8-3.8-1.2-6.5-4-6.5-8V6L12 3.5zM9.5 12l1.8 1.8L15 10" stroke="currentColor" strokeWidth="1.5" />);
const IconClock = I(<><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" /><path d="M12 8v4.5l3 1.8" stroke="currentColor" strokeWidth="1.5" /></>);
const IconTag = I(<><path d="M4 12.5V5a1 1 0 0 1 1-1h7.5L20 11.5a1.5 1.5 0 0 1 0 2.1L13.6 20a1.5 1.5 0 0 1-2.1 0L4 12.5z" stroke="currentColor" strokeWidth="1.5" /><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" /></>);
function Leaf({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path d="M4 20C4 12 9 5 20 4c0 11-7 16-15 16-1 0-1-3-1-3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 16c2-3 5-6 9-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** First sentence (or a trimmed lead) of free text, for meta descriptions. */
function leadFrom(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

function initialOf(name: string): string {
  const first = name.trim().charAt(0);
  return first ? first.toUpperCase() : "·";
}

/** Remaining rich fields (those not already surfaced in the hero/sidebar). */
function RichProfile({
  fieldValues,
  exclude,
}: {
  fieldValues: Record<string, string | string[]>;
  exclude: Set<string>;
}) {
  const filled = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v.length > 0 : Boolean(v && v.trim());
  const sections = PROFILE_SECTIONS.map((s) => ({
    ...s,
    fields: s.fields.filter((f) => !exclude.has(f.id) && filled(fieldValues[f.id])),
  })).filter((s) => s.fields.length > 0);
  if (sections.length === 0) return null;
  return (
    <>
      {sections.map((section) => (
        <section key={section.id} className="mt-10 border-t border-rule pt-8">
          <h2 className="meta text-ink-muted">{section.title}</h2>
          <dl className="mt-2">
            {section.fields.map((field) => {
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPractitionerBySlug(slug);
  if (!p) {
    return { title: "Practitioner not found — Healing Tides Collective", description: "This practitioner profile isn't here." };
  }
  const source = p.bio?.trim() || p.values?.trim() || "";
  const description = source ? leadFrom(source) : `${p.displayName} — a practitioner in the Healing Tides Collective.`;
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
  if (p.specialties.length > 0) data.knowsAbout = p.specialties.map((id) => specialtyLabel(id));
  if (p.region) data.areaServed = p.region;
  return data;
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPractitionerBySlug(slug);
  if (!p) notFound();

  const fv = (p.fieldValues ?? {}) as Record<string, unknown>;
  const firstName = p.displayName.trim().split(/\s+/)[0] || p.displayName;
  const modality = modalityLabel(p.modality);

  // Only ever link out to http(s) — a practitioner-supplied URL could otherwise carry
  // a javascript:/data: scheme (stored XSS on a public page).
  const safeHttp = (s: string | null) => (s && /^https?:\/\//i.test(s) ? s : null);
  const safeWebsite = safeHttp(p.website);
  const bookingLink = safeHttp(fstr(fv.booking_link));

  // How a seeker reaches this person: their booking link, else website, else a note to us.
  const contactHref =
    bookingLink ||
    safeWebsite ||
    `mailto:hello@healingtides.co?subject=${encodeURIComponent(`Connecting with ${p.displayName} on Healing Tides`)}`;
  const contactExternal = /^https?:\/\//i.test(contactHref);

  const credentials = arrify(fv.credentials).join(", ");
  const styleItems = arrify(fv.style).map((id) => optionLabel("style", id));
  const approachText = fstr(fv.client_expectations);
  const availState = fstr(fv.availability_state);
  const focus = fstr(fv.populations) || arrify(fv.age_groups).map((id) => optionLabel("age_groups", id)).join(", ") || null;
  const languages = arrify(fv.languages).join(", ");

  // Sidebar "Quick details" — only the rows we actually have data for.
  const quick = [
    { label: "Specialty", value: p.title || (p.specialties[0] ? specialtyLabel(p.specialties[0]) : null), Icon: IconSpark },
    { label: "Format", value: modality, Icon: IconScreen },
    { label: "Focus", value: focus, Icon: IconTarget },
    { label: "Availability", value: availState ? optionLabel("availability_state", availState) : null, Icon: IconCalendar },
    { label: "Languages", value: languages || null, Icon: IconGlobe },
    { label: "Insurance", value: p.insuranceAccepted.length ? p.insuranceAccepted.join(", ") : null, Icon: IconShield },
    { label: "Earliest start", value: fstr(fv.earliest_start), Icon: IconClock },
    { label: "Investment", value: fstr(fv.session_cost), Icon: IconTag },
  ].filter((r) => Boolean(r.value));

  // Fields surfaced in the hero/sidebar — don't repeat them in the long-tail list.
  const surfaced = new Set([
    "title", "credentials", "availability_state", "populations", "age_groups",
    "style", "client_expectations", "languages", "earliest_start", "session_cost", "booking_link",
  ]);

  const contactProps = contactExternal ? { target: "_blank", rel: "noopener noreferrer" as const } : {};

  return (
    <main id="main-content" className="min-h-screen bg-sand text-charcoal">
      <ViewBeacon slug={p.slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(p)) }} />

      <Container size="wide" className="pb-16 pt-6 md:pb-24 md:pt-8">
        <nav aria-label="Breadcrumb">
          <Link
            href="/practitioners"
            className="meta inline-flex items-center gap-2 rounded-full text-ink-muted transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15 focus-visible:ring-offset-4 focus-visible:ring-offset-sand"
          >
            ← All practitioners
          </Link>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:items-start lg:gap-12">
          {/* ───────────── LEFT: the story ───────────── */}
          <div className="min-w-0">
            {/* Cover */}
            <div className="relative h-44 overflow-hidden rounded-3xl border border-rule/50 sm:h-56">
              <ProfileCover seed={p.slug} className="h-full w-full" />
            </div>

            {/* Portrait overlapping the cover */}
            <div className="relative z-10 -mt-12 px-1 sm:-mt-14">
              {p.photoUrl ? (
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
              <h1 className="font-display mt-3 text-[clamp(30px,5vw,46px)] leading-[1.05] tracking-[-0.02em] text-charcoal">
                {p.displayName}
              </h1>
              {credentials ? <p className="mt-2 text-[15px] tracking-[0.01em] text-ink-soft">{credentials}</p> : null}
              {p.region ? <p className="mt-2 text-[15px] text-ink-soft">{p.region}</p> : null}
              <VerificationBadges
                practitioner={{ createdAt: p.createdAt, verificationBadges: p.verificationBadges }}
                className="mt-4"
              />

              {/* Primary actions */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href={contactHref}
                  {...contactProps}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-6 py-3 text-[14px] font-medium tracking-[0.01em] text-sand transition-colors hover:bg-charcoal/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-sand"
                >
                  Contact {firstName}
                </a>
                <SaveProfileButton slug={p.slug} />
              </div>
            </header>

            {/* Areas of care */}
            {p.specialties.length > 0 ? (
              <section className="mt-10 border-t border-rule pt-8">
                <h2 className="meta text-ink-muted">Areas of care</h2>
                <ul className="mt-5 flex flex-wrap gap-2.5">
                  {p.specialties.map((id) => (
                    <li key={id} className="rounded-full border border-charcoal/15 bg-white px-4 py-2 text-[14px] text-ink-soft">
                      {specialtyLabel(id)}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* About */}
            {p.bio?.trim() ? (
              <section className="mt-10 border-t border-rule pt-8">
                <h2 className="meta text-ink-muted">About</h2>
                <div className="mt-4 space-y-4 text-[16px] leading-[1.7] text-ink-soft">
                  {p.bio.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </section>
            ) : null}

            {/* My approach + How I work */}
            {approachText || styleItems.length > 0 ? (
              <section className="mt-10 border-t border-rule pt-8">
                <div className="grid gap-x-10 gap-y-8 sm:grid-cols-[1.5fr_1fr]">
                  {approachText ? (
                    <div>
                      <h2 className="meta text-ink-muted">My approach</h2>
                      <div className="mt-4 space-y-4 text-[15.5px] leading-[1.7] text-ink-soft">
                        {approachText.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean).map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {styleItems.length > 0 ? (
                    <div>
                      <h2 className="meta text-ink-muted">How I work</h2>
                      <ul className="mt-4 grid grid-cols-1 gap-x-5 gap-y-2.5 sm:grid-cols-1">
                        {styleItems.map((label) => (
                          <li key={label} className="flex items-center gap-2.5 text-[14.5px] text-charcoal">
                            <Leaf className="h-4 w-4 shrink-0 text-sage" />
                            {label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}

            {/* What healing means to me */}
            {p.values?.trim() ? (
              <section className="mt-10">
                <div className="rounded-3xl border border-rule/70 bg-seafoam/30 p-7 md:p-8">
                  <p className="meta text-teal">What healing means to me</p>
                  <div className="font-display mt-4 space-y-4 text-[clamp(19px,2.4vw,24px)] leading-[1.45] tracking-[-0.01em] text-charcoal">
                    {p.values.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean).map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}

            {/* Remaining rich detail (education, ideal client, logistics, …) */}
            <RichProfile fieldValues={fv as Record<string, string | string[]>} exclude={surfaced} />

            {/* Gender + website (kept understated) */}
            {p.gender || safeWebsite ? (
              <section className="mt-10 border-t border-rule pt-2">
                <dl>
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
          </div>

          {/* ───────────── RIGHT: sticky sidebar ───────────── */}
          <aside className="space-y-6 lg:sticky lg:top-24">
            {/* Quick details */}
            <div className="rounded-3xl border border-rule/80 bg-white p-6 shadow-[0_1px_0_rgba(31,58,95,0.02),0_18px_40px_-34px_rgba(31,58,95,0.22)]">
              <h2 className="font-display text-[20px] leading-tight tracking-[-0.01em] text-charcoal">Quick details</h2>
              {quick.length > 0 ? (
                <dl className="mt-4">
                  {quick.map((row, i) => (
                    <div
                      key={row.label}
                      className={`flex items-start gap-3.5 py-3.5 ${i > 0 ? "border-t border-rule/60" : ""}`}
                    >
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-seafoam/45 text-teal">
                        <row.Icon className="h-[18px] w-[18px]" />
                      </span>
                      <div className="min-w-0">
                        <dt className="text-[13px] font-semibold leading-tight text-charcoal">{row.label}</dt>
                        <dd className="mt-1 text-[14px] leading-[1.45] text-ink-soft">
                          <ExpandableValue text={row.value ?? ""} lines={1} />
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>
              ) : null}

              <div className="mt-5 flex gap-2.5 rounded-2xl bg-seafoam/30 p-4">
                <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                <p className="text-[13px] italic leading-[1.55] text-ink-soft">
                  If you&rsquo;re not sure whether this is the right fit, you can still reach out. Healing
                  often begins with a conversation.
                </p>
              </div>

              <a
                href={contactHref}
                {...contactProps}
                className="mt-4 flex w-full items-center justify-center rounded-full bg-charcoal px-6 py-3.5 text-[15px] font-medium text-sand transition-colors hover:bg-charcoal/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Reach out
              </a>
            </div>
          </aside>
        </div>

        {/* "Looking for a fit?" — floats at the bottom as you scroll, then settles. */}
        <GetMatchedBar
          title="Looking for a fit?"
          body={"Tell us what you need and we’ll help you find the right practitioner."}
        />
      </Container>
    </main>
  );
}
