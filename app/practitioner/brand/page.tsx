import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/app/_components/ui";
import { getPractitioner } from "@/lib/auth";
import { clerkEnabled } from "@/lib/clerk-enabled";
import { weeklyViewBuckets } from "@/lib/presence";
import { getWeeklyViewDates } from "@/lib/presence-data";
import { buildBrand, type BrandSignals } from "@/lib/brand";

import { DimensionChapter } from "../_components/brand/DimensionChapter";
import { VisibilityCard } from "../_components/VisibilityCard";

const LIFT_WORD = { gentle: "Gentle", moderate: "Moderate", deeper: "Deeper" } as const;

export const metadata: Metadata = {
  title: "Your brand — Healing Tides",
  // This is a private, signed-in surface about an individual practitioner — never
  // something we want a search engine to index.
  robots: { index: false, follow: false },
};

// Read-only DB calls (getPractitioner, getWeeklyViewDates) per request — never static.
export const dynamic = "force-dynamic";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" className="min-h-screen bg-sand text-charcoal">
      <Container size="default" className="py-12 md:py-16">
        {children}
      </Container>
    </main>
  );
}

export default async function PractitionerBrandPage() {
  // Same calm gates the dashboard uses — never promote a seeker, never crash on
  // an un-configured auth setup.
  if (!clerkEnabled) {
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
          <Link href="/join" className="underline">
            Join or sign in
          </Link>
          .
        </p>
      </Shell>
    );
  }

  if (!result.practitioner) {
    return (
      <Shell>
        <p className="text-ink-soft">
          You&rsquo;re signed in.{" "}
          <Link href="/practitioner" className="underline">
            Set up your practitioner profile
          </Link>{" "}
          to begin tending your brand.
        </p>
      </Shell>
    );
  }

  const p = result.practitioner;
  const fv = (p.fieldValues ?? {}) as Record<string, unknown>;

  // ── Build the brand signals from this practitioner's own profile only ───────────
  // No comparison to anyone else. The Serper-backed signals (coverage / map pack /
  // knowledge graph) are deliberately left UNDEFINED — they're checked on demand from
  // inside the VisibilityCard embed, never eagerly on this read.
  const weekly = weeklyViewBuckets(await getWeeklyViewDates(p.id), new Date());

  const signals: BrandSignals = {
    published: p.visibility === "PUBLISHED",
    completeness: p.completeness,
    hasBio: Boolean(p.bio?.trim()),
    hasValues: Boolean(p.values?.trim()),
    hasPhoto: Boolean(p.photoUrl?.trim()),
    hasModality: Boolean(p.modality),
    hasWebsite: Boolean(p.website?.trim()),
    hasRegion: Boolean(p.region?.trim()),
    specialtiesCount: p.specialties?.length ?? 0,
    weeklyViews: { thisWeek: weekly.thisWeek, total: weekly.total },
    // coverage / inAnyMapPack / knowledgeGraphPresent / reviewsKnown: undefined (on-demand)
  };

  const brand = buildBrand(signals);

  return (
    <Shell>
      {/* ── Section header ─────────────────────────────────────────────────────── */}
      <header>
        <p className="meta text-ink-muted">Your brand</p>
        <h1 className="font-display mt-3 text-[clamp(30px,5vw,46px)] font-light leading-[1.04] tracking-[-0.02em] text-charcoal">
          Your brand, cared for
        </h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-[1.65] text-ink-soft">
          Your brand is simply how the right person recognizes you when they go looking for
          care. {brand.overall}
        </p>
      </header>

      {/* ── Where to begin: the one grounded next step ─────────────────────────── */}
      {brand.nextStep ? (
        <div className="mt-8 rounded-3xl border border-teal/25 bg-seafoam/25 p-6 md:p-7">
          <p className="meta text-teal">Where to begin</p>
          <p className="font-display mt-2 text-[19px] leading-[1.3] text-charcoal">
            {brand.nextStep.insight.what}
          </p>
          <p className="mt-2 max-w-xl text-[14.5px] leading-[1.6] text-ink-soft">
            {brand.nextStep.insight.whyCare}
          </p>
          <p className="mt-3 max-w-xl text-[14.5px] leading-[1.6] text-charcoal">
            {brand.nextStep.insight.whatNext}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            {brand.nextStep.insight.ctaHref ? (
              <Link
                href={brand.nextStep.insight.ctaHref}
                className="rounded-full bg-charcoal px-4 py-2 text-[13.5px] font-medium text-sand transition-opacity hover:opacity-90"
              >
                {brand.nextStep.insight.ctaLabel ?? "Open my profile"}
              </Link>
            ) : null}
            <span className="text-[13px] text-ink-muted">
              {LIFT_WORD[brand.nextStep.insight.lift]} · no rush
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-3xl bg-seafoam/25 p-6 md:p-7">
          <p className="meta text-teal">Where you are</p>
          <p className="mt-2 max-w-xl text-[15px] leading-[1.65] text-charcoal">
            Your brand is in good shape — there&rsquo;s nothing pressing to tend. Look through
            the parts below whenever you&rsquo;re curious about how you show up.
          </p>
        </div>
      )}

      {/* ── The five dimensions — collapsed; the one to begin with opens ───────── */}
      <p className="mt-10 text-[14px] text-ink-muted">
        The five parts of your brand. Open any one to see where you are and what you might tend.
      </p>
      <div className="mt-3 space-y-3.5">
        {brand.dimensions.map((d) => {
          const open = d.id === (brand.nextStep?.dimensionId ?? "where_found");
          return d.id === "where_found" ? (
            // "Where you're found" hosts the on-demand local-search check (Serper):
            // the coverage map + local map pack live inside this chapter.
            <DimensionChapter key={d.id} dimension={d} defaultOpen={open}>
              <VisibilityCard />
            </DimensionChapter>
          ) : (
            <DimensionChapter key={d.id} dimension={d} defaultOpen={open} />
          );
        })}
      </div>

      {/* ── Reassurance + lift legend ──────────────────────────────────────────── */}
      <footer className="mt-12 border-t border-rule/70 pt-6">
        <p className="text-[15px] leading-[1.65] text-ink-soft">
          We&rsquo;ll never compare you to other practitioners. This is only ever a
          read of your own presence — your pace, your path.
        </p>
        <dl className="mt-5 flex flex-wrap gap-x-7 gap-y-2 text-[13px] leading-[1.5] text-ink-muted">
          <div className="inline-flex gap-1.5">
            <dt className="font-medium text-ink-soft">Gentle</dt>
            <dd>a small, easy step</dd>
          </div>
          <div className="inline-flex gap-1.5">
            <dt className="font-medium text-ink-soft">Moderate</dt>
            <dd>a little more care</dd>
          </div>
          <div className="inline-flex gap-1.5">
            <dt className="font-medium text-ink-soft">Deeper</dt>
            <dd>a piece worth sitting with</dd>
          </div>
        </dl>
      </footer>
    </Shell>
  );
}
