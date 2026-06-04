import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/app/_components/ui";
import { getPublishedPractitioners } from "@/lib/practitioners";
import { DirectoryFilters } from "./_components/DirectoryFilters";
import { PractitionerCard } from "./_components/PractitionerCard";

export const metadata: Metadata = {
  title: "Find a practitioner — Healing Tides Collective",
  description:
    "Browse the collective — a considered group of therapists and holistic practitioners. Filter by focus and format to find someone whose way of working fits you.",
};

// Reads the live DB on every request — keep it dynamic, don't cache the list.
export const dynamic = "force-dynamic";

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
    q?: string;
    gender?: string;
    accepting?: string;
  }>;
}) {
  const params = await searchParams;
  const specialty = clean(params.specialty);
  const modality = clean(params.modality);
  const q = clean(params.q);
  const gender = clean(params.gender);
  // Checkbox: present (any truthy value, e.g. "on") means "only accepting new clients".
  const acceptingNew = Boolean(clean(params.accepting));

  const hasFilters = Boolean(specialty || modality || q || gender || acceptingNew);
  const practitioners = await getPublishedPractitioners({
    specialty,
    modality,
    q,
    gender,
    acceptingNew,
  });

  return (
    <main id="main-content" className="min-h-screen bg-sand text-charcoal">
      <Container size="wide" className="py-16 md:py-24">
        {/* Header */}
        <header className="max-w-2xl">
          <p className="meta text-ink-muted">The collective</p>
          <h1 className="font-display mt-4 text-[clamp(34px,5vw,52px)] font-light leading-[1.05] tracking-[-0.02em] text-charcoal">
            Meet the collective.
          </h1>
          <p className="mt-5 text-[17px] leading-[1.65] text-ink-soft">
            A small, considered circle of therapists and holistic practitioners — real
            people, each with their own way of working. Take your time, read a few stories,
            and reach out to whoever feels right.
          </p>
        </header>

        {/* Filters */}
        <div className="mt-10 md:mt-12">
          <DirectoryFilters active={{ specialty, modality, q, gender, acceptingNew }} />
        </div>

        {/* Results */}
        <section className="mt-12 md:mt-16" aria-label="Practitioners">
          {practitioners.length > 0 ? (
            <>
              <p className="meta text-ink-muted">
                {practitioners.length} {practitioners.length === 1 ? "person" : "people"} in the
                collective
              </p>
              <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">
                {practitioners.map((p) => (
                  <li key={p.slug}>
                    <PractitionerCard practitioner={p} />
                  </li>
                ))}
              </ul>
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
