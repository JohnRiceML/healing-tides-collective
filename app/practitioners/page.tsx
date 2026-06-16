import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Container } from "@/app/_components/ui";
import {
  getDistinctRegions,
  getPublishedPractitioners,
  normalizeSort,
} from "@/lib/practitioners";
import { DirectoryFilters } from "./_components/DirectoryFilters";
import { DirectoryHeaderArt } from "./_components/DirectoryHeaderArt";
import { GetMatchedBar } from "./_components/GetMatchedBar";
import { PractitionerCard } from "./_components/PractitionerCard";
import { SortSelect } from "./_components/SortSelect";

export const metadata: Metadata = {
  title: "Find a practitioner — Healing Tides Collective",
  description:
    "Browse the collective — a considered group of therapists and holistic practitioners. Filter by specialty, location, and format to find someone whose way of working fits you.",
};

// Reads the live DB on every request — keep it dynamic, don't cache the list.
export const dynamic = "force-dynamic";

const ART_MASK =
  "linear-gradient(to left, #000 52%, transparent 94%)";

/** Trim a raw query value; treat empty strings as "not provided". */
function clean(value: string | undefined): string | undefined {
  const v = value?.trim();
  return v ? v : undefined;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    specialty?: string;
    modality?: string;
    region?: string;
    ageGroups?: string;
    q?: string;
    accepting?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const specialty = clean(params.specialty);
  const modality = clean(params.modality);
  const region = clean(params.region);
  const ageGroups = clean(params.ageGroups);
  const q = clean(params.q);
  // Checkbox: present (any truthy value, e.g. "on") means "only accepting new clients".
  const acceptingNew = Boolean(clean(params.accepting));
  const sort = normalizeSort(clean(params.sort));

  const hasFilters = Boolean(specialty || modality || region || ageGroups || q || acceptingNew);
  const [practitioners, regions] = await Promise.all([
    getPublishedPractitioners({ specialty, modality, region, ageGroups, q, acceptingNew }, sort),
    getDistinctRegions(),
  ]);

  return (
    <main id="main-content" className="min-h-screen bg-sand text-charcoal">
      <Container size="wide" className="pb-16 pt-6 md:pb-20 md:pt-8">
        {/* Header — text left, atmospheric watercolor art bleeding off the top-right */}
        <header className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-10 right-0 z-0 hidden w-[min(46%,540px)] select-none md:block"
            style={{
              maskImage: ART_MASK,
              WebkitMaskImage: ART_MASK,
            }}
          >
            <DirectoryHeaderArt className="h-auto w-full" />
          </div>

          <div className="relative z-10 max-w-xl">
            <p className="meta text-teal">The collective</p>
            <h1 className="font-display mt-3 text-[clamp(31px,4.2vw,44px)] font-light leading-[1.04] tracking-[-0.02em] text-charcoal">
              Meet the collective.
            </h1>
            <p className="mt-3.5 text-[15.5px] leading-[1.6] text-ink-soft">
              A small, considered circle of therapists and holistic practitioners. Browse by
              specialty, location, and format to find someone who feels like the right fit.
            </p>
            <p className="mt-3 text-[14px] leading-[1.6] text-ink-muted">
              New to this?{" "}
              <Link href="/journal" className="font-medium text-teal underline-offset-2 hover:underline">
                The Journal
              </Link>{" "}
              explores different kinds of care and what they feel like.
            </p>
          </div>
        </header>

        {/* Filters */}
        <div className="relative z-10 mt-7 md:mt-8">
          <DirectoryFilters
            active={{ specialty, modality, region, ageGroups, q, acceptingNew }}
            regions={regions}
            sort={sort}
          />
        </div>

        {/* Results */}
        <section className="relative z-10 mt-7 md:mt-8" aria-label="Practitioners">
          {practitioners.length > 0 ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-[14px] leading-none text-ink-soft">
                  <span className="font-medium text-charcoal">{practitioners.length}</span>{" "}
                  {practitioners.length === 1 ? "practitioner" : "practitioners"} in the collective
                </p>
                <Suspense fallback={null}>
                  <SortSelect value={sort} />
                </Suspense>
              </div>

              <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">
                {practitioners.map((p) => (
                  <li key={p.slug}>
                    <PractitionerCard practitioner={p} />
                  </li>
                ))}
              </ul>

              <GetMatchedBar
                title="Not sure where to start?"
                body={"Tell us what you need and we’ll help you find a fit."}
              />
            </>
          ) : hasFilters ? (
            <EmptyState
              title="No matches just yet."
              body="Try widening your search — clear a filter to see more of the collective."
              action={
                <Link
                  href="/practitioners"
                  className="link-underline mt-6 inline-block rounded-full text-[15px] font-medium text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/20 focus-visible:ring-offset-4 focus-visible:ring-offset-white"
                >
                  clear filters
                </Link>
              }
            />
          ) : (
            <EmptyState
              title="The collective is just getting started."
              body="New practitioners are being welcomed in. Check back soon — there will be people here to meet."
            />
          )}
        </section>
      </Container>
    </main>
  );
}

/** Calm, non-alarming empty state (no red, no shame — the reader sets the pace). */
function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-rule/70 bg-white/50 px-8 py-16 text-center md:py-20">
      <h2 className="font-display text-[clamp(22px,3vw,30px)] leading-[1.15] tracking-[-0.01em] text-charcoal">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-md text-[16px] leading-[1.65] text-ink-soft">{body}</p>
      {action}
    </div>
  );
}
