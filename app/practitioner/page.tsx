import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Button, Card, Container, LinkButton } from "@/app/_components/ui";
import { getPractitioner } from "@/lib/auth";
import { becomePractitioner } from "./actions";
import { completeClaim } from "@/app/claim/claim-actions";
import { authEnabled } from "@/lib/clerk-enabled";
import { holdMessage, isOnHold } from "@/app/_lib/moderation";
import { badgesFor, grantedBadgesFrom } from "@/app/_lib/verification";
import { VerificationBadges } from "@/app/_components/VerificationBadges";
import { PublicPagePreview } from "./_components/PublicPagePreview";
import { CopyLinkButton } from "./_components/CopyLinkButton";
import { VisibilityCard } from "./_components/VisibilityCard";
import { SITE_URL } from "@/lib/site";
import { PresencePanel } from "./_components/PresencePanel";
import { findabilityStage, weeklyViewBuckets, presenceNextStep } from "@/lib/presence";
import { getWeeklyViewDates } from "@/lib/presence-data";
import { buildBrand } from "@/lib/brand";
import { buildBrandSignals } from "@/lib/brand-signals";
import { readPresenceScan } from "@/lib/presence-scan";
import { BrandTiles } from "./_components/brand/BrandTiles";

export const metadata: Metadata = {
  title: "Your dashboard — Healing Tides Collective",
};

export const dynamic = "force-dynamic";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" className="min-h-screen bg-sand text-charcoal">
      <Container size="wide" className="py-12 md:py-16">
        {children}
      </Container>
    </main>
  );
}

type Status = "held" | "live" | "draft";
function StatusPill({ status }: { status: Status }) {
  const m = {
    live: { label: "Live", dot: "bg-teal", pill: "bg-teal/15 text-teal" },
    held: { label: "On hold", dot: "bg-ocean", pill: "bg-ocean/10 text-ocean" },
    draft: { label: "Draft", dot: "bg-rule-strong/40", pill: "bg-charcoal/5 text-ink-muted" },
  }[status];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium ${m.pill}`}>
      <span aria-hidden className={`h-2 w-2 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

// ── small icons ───────────────────────────────────────────────────────────────
const ico = "h-[18px] w-[18px]";
function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={ico} strokeLinecap="round">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function IconBookmark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={ico}>
      <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function IconEye() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={ico}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function IconShield({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path d="M12 3.5l6.5 2.5v5c0 4-2.7 6.8-6.5 8-3.8-1.2-6.5-4-6.5-8V6L12 3.5zM9.5 12l1.8 1.8L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function BoostArt() {
  // A soft megaphone + botanical sprig — decorative, bottom-right of the boost card.
  return (
    <svg viewBox="0 0 120 100" fill="none" aria-hidden className="h-full w-full">
      <g opacity="0.55" stroke="#5f8f8b" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 52l40-16v34l-40-12z" fill="#a8bfa3" fillOpacity="0.5" strokeWidth="2" />
        <path d="M30 52H22a4 4 0 0 0-4 4v4a4 4 0 0 0 4 4h8" strokeWidth="2" fill="#cfe0d8" fillOpacity="0.6" />
        <path d="M40 64v10a4 4 0 0 0 8 0v-6" strokeWidth="2" />
        <path d="M78 44c6 2 6 12 0 16M84 38c10 4 10 24 0 30" strokeWidth="1.8" opacity="0.7" />
      </g>
      <g opacity="0.5" fill="#5a8268">
        <path d="M96 78c-8 2-14-2-16-10 9-1 15 3 16 10z" />
        <path d="M98 76c7-3 10-9 9-17-8 2-11 9-9 17z" opacity="0.85" />
        <path d="M100 80c0-10 3-16 9-21" stroke="#5a8268" strokeWidth="1.6" fill="none" opacity="0.6" />
      </g>
    </svg>
  );
}

export default async function PractitionerHome() {
  if (!authEnabled) {
    return (
      <Shell>
        <p className="text-ink-soft">
          Auth isn&rsquo;t configured yet. Add Clerk keys to{" "}
          <code className="rounded bg-charcoal/5 px-1">.env.local</code>.
        </p>
      </Shell>
    );
  }

  const result = await getPractitioner();
  if (!result) {
    return (
      <Shell>
        <p className="text-ink-soft">
          You&rsquo;re not signed in.{" "}
          <Link href="/join" className="underline">Join or sign in</Link>.
        </p>
      </Shell>
    );
  }

  // Signed in, but not a practitioner yet. Promotion is an explicit choice — never a
  // side effect of landing here — so a seeker browsing the app stays a seeker. If they
  // arrived via a claim link (the ht_claim cookie), offer to finish that instead.
  if (!result.practitioner) {
    const claiming = Boolean((await cookies()).get("ht_claim")?.value);
    return (
      <Shell>
        <Card className="mx-auto max-w-xl text-center">
          <h1 className="font-serif text-2xl text-charcoal">
            {claiming ? "Finish claiming your profile" : "Set up your practitioner profile"}
          </h1>
          <p className="mt-3 text-ink-soft">
            {claiming
              ? "You’re almost in. Finish claiming to set up your pre-filled profile in the collective."
              : "You’re signed in. Create your practitioner profile to join the collective and become findable in the directory."}
          </p>
          <form action={claiming ? completeClaim : becomePractitioner} className="mt-6">
            <Button type="submit">{claiming ? "Finish claiming" : "Set up your practice"}</Button>
          </form>
          <p className="mt-4 text-[13px] text-ink-muted">
            Just looking for care?{" "}
            <Link href="/practitioners" className="underline">Browse the collective</Link>.
          </p>
        </Card>
      </Shell>
    );
  }

  const p = result.practitioner;
  if (p.completeness === 0 && !p.displayName) redirect("/practitioner/edit");

  const fv = (p.fieldValues ?? {}) as Record<string, unknown>;
  const held = isOnHold(p);
  const status: Status = held ? "held" : p.visibility === "PUBLISHED" ? "live" : "draft";
  const isLive = status === "live";
  const firstName = (p.displayName ?? "").trim().split(/\s+/)[0] || "there";
  const memberSince = new Date(p.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const completeness = p.completeness;
  const coverDesign = typeof fv.cover_design === "string" ? fv.cover_design : null;
  const coverColor = typeof fv.cover_color === "string" ? fv.cover_color : null;
  const arrify = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : typeof v === "string" && v.trim() ? [v] : [];
  const credentials = arrify(fv.credentials).join(", ");
  const role = typeof fv.title === "string" ? fv.title : "";
  const ageGroups = arrify(fv.age_groups);
  const badges = badgesFor({ createdAt: p.createdAt, verificationBadges: grantedBadgesFrom(p.fieldValues) });
  const isFounding = badges.some((b) => b.id === "founding_member");
  const editCta = completeness >= 100 ? "Edit profile" : "Finish profile";

  // "Your presence" — findable, not promotional. Own-profile signals only; no comparison.
  const hasContactLink =
    Boolean(p.website?.trim()) || (typeof fv.booking_link === "string" && fv.booking_link.trim() !== "");
  const specialtiesCount = p.specialties?.length ?? 0;
  const hasRegion = Boolean(p.region?.trim());
  const findability = findabilityStage({
    published: p.visibility === "PUBLISHED",
    completeness,
    hasContactLink,
    specialtiesCount,
    hasRegion,
  });
  const presenceViews = weeklyViewBuckets(await getWeeklyViewDates(p.id), new Date());
  const presenceStep = presenceNextStep({
    published: p.visibility === "PUBLISHED",
    hasBio: Boolean(p.bio?.trim()),
    specialtiesCount,
    hasIdealClient: typeof fv.ideal_client === "string" && fv.ideal_client.trim() !== "",
    hasContactLink,
    hasRegion,
  });

  // The 5-part brand read — same shared signals as the brand center, so the tiles match.
  const brandScan = readPresenceScan(fv);
  const brand = buildBrand(buildBrandSignals(p, presenceViews, brandScan));
  const brandLastChecked =
    brandScan?.checkedAt && !Number.isNaN(Date.parse(brandScan.checkedAt))
      ? new Date(brandScan.checkedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : undefined;

  const availabilityDone =
    (typeof fv.availability_state === "string" && fv.availability_state !== "") ||
    (Array.isArray(fv.availability_state) && fv.availability_state.length > 0);
  const steps = [
    { label: "Add how you work", sub: "Share your approach and modalities", done: Boolean(p.modality) },
    { label: "Choose your focus areas", sub: "Pick 3–8 that fit your work", done: p.specialties.length >= 3 },
    { label: "Write your healing note", sub: "The heart of your profile", done: Boolean(p.values?.trim()) },
    { label: "Add insurance", sub: "Help clients see what you accept", done: p.insuranceAccepted.length > 0 },
    { label: "Add availability", sub: "Let clients know you’re open", done: availabilityDone },
  ];
  const nextSteps = [...steps].sort((a, b) => Number(a.done) - Number(b.done)).slice(0, 4);

  return (
    <Shell>
      {/* Header */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="meta text-ink-muted">Your dashboard</p>
          <h1 className="font-display mt-3 text-[clamp(30px,5vw,46px)] font-light leading-[1.04] tracking-[-0.02em] text-charcoal">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 text-[14px] text-ink-soft">Member since {memberSince}</p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <StatusPill status={status} />
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/practitioner/edit" tone="primary">{editCta} →</LinkButton>
            {isLive && p.slug ? (
              <LinkButton href={`/practitioners/${p.slug}`} target="_blank" rel="noreferrer" tone="secondary">
                View public page
              </LinkButton>
            ) : null}
          </div>
        </div>
      </header>

      {/* On-hold banner */}
      {held ? (
        <div className="mt-7 rounded-3xl border border-ocean/15 bg-ocean/[0.04] p-6">
          <p className="font-display text-[18px] leading-tight text-charcoal">Your profile is on hold</p>
          <p className="mt-2 text-[15px] leading-[1.6] text-ink-soft">{holdMessage(p.fieldValues)}</p>
          <p className="mt-2 text-[14px] leading-[1.6] text-ink-muted">
            It isn&rsquo;t public right now and publishing is paused — but nothing is lost, and you can
            still edit it. Questions? Email{" "}
            <a href="mailto:nora@healingtides.co" className="link-underline font-medium text-charcoal">nora@healingtides.co</a>.
          </p>
        </div>
      ) : null}

      {/* ───── Top row ───── */}
      <div className="mt-8 grid gap-5 lg:grid-cols-[1.3fr_0.95fr_1.05fr]">
        {/* Profile strength — coastal image panel (left) + content (right) */}
        <Card className="relative overflow-hidden !p-0">
          <div className="flex">
            {/* Coastal image panel with a wave badge */}
            <div className="relative w-[34%] shrink-0 overflow-hidden bg-seafoam/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/join-cove.png"
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                style={{ filter: "saturate(1.45) brightness(1.03)" }}
              />
              {/* green wash — warmer + more alive */}
              <div className="absolute inset-0 bg-gradient-to-b from-seafoam/25 via-sage/25 to-teal/40" />
              <span className="absolute left-1/2 top-8 z-10 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border border-white/70 bg-sand/90 text-[#5a8268] shadow-sm backdrop-blur-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-6 w-6">
                  <path d="M4 20C4 12 9 5 20 4c0 11-7 16-15 16-1 0-1-3-1-3z" />
                  <path d="M8 16c2-3 5-6 9-8" />
                </svg>
              </span>
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 p-6">
              <p className="meta text-ink-muted">Profile strength</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-[40px] leading-none text-charcoal">{completeness}%</span>
                <span className="text-[14px] text-ink-muted">complete</span>
              </div>
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-rule/60">
                <div className="h-full rounded-full bg-teal transition-[width] duration-700 ease-out" style={{ width: `${completeness}%` }} />
              </div>
              <p className="mt-4 text-[14px] leading-[1.6] text-ink-soft">
                The more complete your profile, the better we match you. Add a few more details to stand
                out and help more clients find you.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                <LinkButton href="/practitioner/edit" tone="primary">{editCta}</LinkButton>
                <Link href="/practitioner/edit" className="text-[14px] font-medium text-teal transition-colors hover:text-ocean">
                  See what&rsquo;s missing →
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {/* Insights */}
        <Card className="!p-6">
          <p className="meta text-ink-muted">Insights</p>
          <ul className="mt-5 space-y-5">
            {[
              { Icon: IconChart, value: p.viewCount as number | null, label: "Profile views", sub: "People have viewed your profile so far." },
              { Icon: IconBookmark, value: null, label: "Saved", sub: "People who saved your profile" },
              { Icon: IconEye, value: null, label: "In matches", sub: "Seen in matches each week" },
            ].map((row) => (
              <li key={row.label} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-seafoam/45 text-teal">
                  <row.Icon />
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-[15px] leading-tight text-charcoal">
                    {row.value === null ? (
                      <span className="rounded-full bg-charcoal/[0.06] px-2 py-0.5 text-[11px] font-medium text-ink-muted">Soon</span>
                    ) : (
                      <span className="font-display text-[22px] leading-none text-charcoal">{row.value}</span>
                    )}
                    <span className="font-medium">{row.label}</span>
                  </p>
                  <p className="mt-1 text-[12.5px] leading-[1.45] text-ink-muted">{row.sub}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[13px] font-medium text-ink-muted">View all insights →</p>
        </Card>

        {/* Your public page */}
        <Card className="!p-6">
          <p className="meta text-ink-muted">Your public page</p>
          <div className="mt-3">
            <PublicPagePreview
              name={p.displayName ?? ""}
              credentials={credentials}
              role={role}
              region={p.region ?? ""}
              specialties={p.specialties ?? []}
              modality={p.modality}
              ageGroups={ageGroups}
              photoUrl={p.photoUrl ?? ""}
              design={coverDesign}
              color={coverColor}
              seed={p.slug ?? p.id}
            />
          </div>
          {isLive && p.slug ? (
            <div className="mt-4 flex flex-col gap-2">
              <LinkButton href={`/practitioners/${p.slug}`} target="_blank" rel="noreferrer" tone="secondary" className="w-full">
                View public page →
              </LinkButton>
              <CopyLinkButton url={`${SITE_URL}/practitioners/${p.slug}`} className="w-full" />
            </div>
          ) : (
            <p className="mt-4 text-[13px] leading-[1.55] text-ink-muted">
              {held ? "Hidden while on hold." : "Publish your profile to get a public page."}
            </p>
          )}
        </Card>
      </div>

      {/* ───── Bottom row ───── */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[0.85fr_1.05fr_1.45fr]">
        {/* Your standing */}
        <Card className="!p-6">
          <p className="meta text-ink-muted">Your standing</p>
          {badges.length > 0 ? (
            <div className="mt-4">
              <VerificationBadges practitioner={{ createdAt: p.createdAt, verificationBadges: grantedBadgesFrom(p.fieldValues) }} />
            </div>
          ) : null}
          {isFounding ? (
            <p className="mt-4 text-[14px] leading-[1.6] text-ink-soft">
              Thank you for being one of our founding members.
            </p>
          ) : null}
          <div className="mt-4 flex gap-2.5 border-t border-rule/60 pt-4">
            <IconShield className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
            <p className="text-[13px] leading-[1.55] text-ink-muted">
              Verified trust badges are granted by the Healing Tides team.
            </p>
          </div>
        </Card>

        {/* What to do next */}
        <Card className="!p-6">
          <p className="meta text-ink-muted">What to do next</p>
          <ul className="mt-4 space-y-3.5">
            {nextSteps.map((s) => (
              <li key={s.label} className="flex items-start gap-3">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${s.done ? "bg-teal text-sand" : "border border-rule text-transparent"}`}>
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-3 w-3"><path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <div className="min-w-0">
                  <p className={`text-[14.5px] leading-tight ${s.done ? "text-ink-muted" : "font-medium text-charcoal"}`}>{s.label}</p>
                  <p className="mt-0.5 text-[12.5px] leading-[1.45] text-ink-muted">{s.sub}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/practitioner/edit" className="mt-5 inline-block text-[14px] font-medium text-teal transition-colors hover:text-ocean">
            See all profile steps →
          </Link>
        </Card>

        {/* Boost your presence — coming soon */}
        <Card className="relative overflow-hidden !bg-sand-deep/40 !p-6">
          <div aria-hidden className="pointer-events-none absolute -bottom-2 -right-2 z-0 h-28 w-32 select-none opacity-90">
            <BoostArt />
          </div>
          <div className="relative z-10">
            <p className="meta flex items-center gap-1.5 text-ink-muted">
              Coming soon
              <span aria-hidden className="text-sage">✦</span>
            </p>
            <h3 className="font-display mt-2 text-[21px] leading-tight tracking-[-0.01em] text-charcoal">
              Boost your presence
            </h3>
            <p className="mt-2 max-w-[20rem] text-[14px] leading-[1.6] text-ink-soft">
              Soon you&rsquo;ll be able to promote your profile inside Healing Tides and partner with us
              on thoughtful content that helps more people discover your work.
            </p>
            <p className="mt-2 max-w-[20rem] text-[13px] leading-[1.55] text-ink-muted">
              Paid promotion and featured storytelling for aligned visibility.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
              <a
                href="mailto:nora@healingtides.co?subject=Boost%20my%20presence%20waitlist"
                className="inline-flex items-center justify-center rounded-full bg-charcoal px-5 py-2.5 text-[14px] font-medium text-sand transition-colors hover:bg-charcoal/90"
              >
                Join the waitlist
              </a>
              <a
                href="mailto:nora@healingtides.co?subject=How%20does%20Boost%20work%3F"
                className="text-[14px] font-medium text-teal transition-colors hover:text-ocean"
              >
                Learn how it works →
              </a>
            </div>
          </div>
        </Card>
      </div>

      {/* Your brand — the 5-part shape at a glance, a doorway into the brand center */}
      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="meta text-ink-muted">Your brand</h2>
          <Link
            href="/practitioner/brand"
            className="text-[13.5px] font-medium text-teal transition-colors hover:text-ocean"
          >
            Open your brand center →
          </Link>
        </div>
        <Card className="mt-3 !p-6">
          <p className="max-w-2xl text-[15px] leading-[1.6] text-ink-soft">
            How the right person finds and remembers you. {brand.overall}
          </p>
          {brand.nextStep ? (
            <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-xl bg-seafoam/35 px-4 py-3 text-[13.5px] leading-[1.5] text-charcoal">
              <span className="meta shrink-0 text-teal">Begin with</span>
              <span>{brand.nextStep.insight.what}</span>
            </p>
          ) : null}
          <div className="mt-5">
            <BrandTiles dimensions={brand.dimensions} hrefBase="/practitioner/brand" compact />
          </div>
        </Card>
      </section>

      {/* How people find you — the live findability detail + on-demand local check */}
      <section className="mt-8">
        <h2 className="meta text-ink-muted">How people find you</h2>
        <div className="mt-3">
          <PresencePanel findability={findability} views={presenceViews} nextStep={presenceStep} region={p.region} />
        </div>
        <div className="mt-5">
          <VisibilityCard lastCheckedLabel={brandLastChecked} />
        </div>
      </section>
    </Shell>
  );
}
