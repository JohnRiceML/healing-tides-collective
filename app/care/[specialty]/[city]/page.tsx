import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container, LinkButton } from "@/app/_components/ui";
import { CareHeroWash, Leaf, MeshColumn } from "@/app/care/_components/care-ui";
import { PractitionerCard } from "@/app/practitioners/_components/PractitionerCard";
import { getPublishedPractitioners } from "@/lib/practitioners";
import { SITE_URL } from "@/lib/site";
import {
  carePageDescription,
  carePagePath,
  carePageTitle,
  carePageTopics,
  isIndexable,
  nearbyCities,
  resolveCarePage,
  siblingSpecialties,
} from "@/lib/care-pages";

// ISR: these pages are stable content that changes only when the network does. An hour keeps a
// newly published practitioner visible quickly without rebuilding on every crawl.
export const revalidate = 3600;
export const dynamicParams = true;

// Deliberately empty: pages generate on first request and are then cached (ISR). The full
// inventory is `allCarePages()` — prerendering it would make `next build` depend on the DB
// being reachable (the same rule sitemap.ts follows) for ~200 pages nobody may request.
export function generateStaticParams() {
  return [];
}

async function load(specialtySlug: string, citySlug: string) {
  const page = resolveCarePage(specialtySlug, citySlug);
  if (!page) return null;
  // Practitioners who name this specialty AND whose free-text region matches the city.
  const matches = await getPublishedPractitioners({
    specialty: page.specialty.id,
    citySlug: page.city.slug,
  }).catch(() => []);
  return { page, matches };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ specialty: string; city: string }>;
}): Promise<Metadata> {
  const { specialty, city } = await params;
  const data = await load(specialty, city);
  if (!data) return {};
  const title = carePageTitle(data.page);
  const description = carePageDescription(data.page, data.matches.length);
  const url = `${SITE_URL}${carePagePath(data.page)}`;
  // The doorway-page guard: a page with no real local supply behind it stays out of the index
  // (and out of the sitemap) until the network fills in. It still renders for anyone who lands.
  const indexable = isIndexable(data.matches.length);
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: indexable ? undefined : { index: false, follow: true },
    openGraph: { title, description, url, type: "website" },
  };
}

export default async function CarePage({
  params,
}: {
  params: Promise<{ specialty: string; city: string }>;
}) {
  const { specialty: specialtySlug, city: citySlug } = await params;
  const data = await load(specialtySlug, citySlug);
  if (!data) notFound();

  const { page, matches } = data;
  const { specialty, city } = page;
  const topics = carePageTopics(specialty);
  const nearby = nearbyCities(city);
  const siblings = siblingSpecialties(specialty);

  // Same topic set as before (carePageTopics stays the source of truth) — just laid out
  // under the subcategory each phrase belongs to, so it reads as an editorial map of the
  // care rather than a flat blob of chips.
  const topicSet = new Set(topics);
  const topicGroups = specialty.subcategories
    .map((s) => ({ label: s.label, topics: s.topics.filter((t) => topicSet.has(t)) }))
    .filter((g) => g.topics.length > 0);
  // Specialties carry 1–4 subcategories; size the grid to the real count so a short
  // specialty doesn't leave a hole where a fourth column would be.
  const topicGridClass =
    topicGroups.length >= 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : topicGroups.length === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : topicGroups.length === 2
          ? "mx-auto max-w-3xl sm:grid-cols-2"
          : "mx-auto max-w-xs";

  return (
    <main id="main-content" className="min-h-screen bg-sand text-charcoal">
      {/* ───────── Hero — a watercolour band bleeding off the top, dissolving into sand ───────── */}
      <div className="relative isolate overflow-hidden">
        <CareHeroWash specialtyId={specialty.id} citySlug={city.slug} />

        <Container size="wide" className="relative pb-14 pt-6 md:pb-20 md:pt-8">
          <nav aria-label="Breadcrumb">
            <Link
              href="/practitioners"
              className="meta inline-flex items-center gap-2 rounded-full text-ink-muted transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15 focus-visible:ring-offset-4 focus-visible:ring-offset-sand"
            >
              ← All practitioners
            </Link>
          </nav>

          <header className="rise mx-auto mt-12 max-w-3xl text-center md:mt-16">
            <p className="meta text-teal">{city.name}, Minnesota</p>
            <h1 className="font-display mt-5 text-[clamp(32px,5.2vw,54px)] leading-[1.04] tracking-[-0.02em] text-charcoal">
              {carePageTitle(page)}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-[16px] leading-[1.7] text-ink-soft md:text-[17px]">
              {carePageDescription(page, matches.length)}
            </p>
            {/* Trust, quietly — the collective has a real person behind it. */}
            <p className="mx-auto mt-9 max-w-lg text-[13px] leading-[1.6] text-ink-muted">
              Every introduction is reviewed by a person —{" "}
              <Link
                href="/about"
                className="font-medium text-ink-soft underline-offset-2 hover:text-charcoal hover:underline"
              >
                Nora L. Hollenkamp, MSW, LICSW
              </Link>
              .
            </p>
          </header>
        </Container>
      </div>

      <Container size="wide" className="pb-16 md:pb-24">
        {/* ───────── What this care can hold — real phrases from Nora's taxonomy ───────── */}
        <section className="border-t border-rule/70 pt-12 md:pt-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-[clamp(24px,3vw,32px)] leading-[1.15] tracking-[-0.015em] text-charcoal">
              What {specialty.label.toLowerCase()} support can hold
            </h2>
            <p className="mt-4 text-[15px] leading-[1.7] text-ink-soft">
              Everyone arrives with their own version of this. A first conversation is usually about
              finding out whether someone feels like the right person to sit with — not about having
              the words already sorted out.
            </p>
          </div>

          <div className={`mt-10 grid gap-x-10 gap-y-8 md:mt-12 md:gap-y-10 ${topicGridClass}`}>
            {topicGroups.map((g) => (
              <div key={g.label} className="border-t border-rule pt-4 md:pt-5">
                <p className="meta text-teal">{g.label}</p>
                <ul className="mt-3.5 space-y-2">
                  {g.topics.map((t) => (
                    <li key={t} className="text-[14.5px] leading-[1.5] text-ink-soft">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ───────── The supply — honest either way. Never a fabricated count. ───────── */}
        <section className="mt-16 border-t border-rule/70 pt-12 md:mt-24 md:pt-16">
          {matches.length > 0 ? (
            <>
              <div className="mx-auto max-w-2xl text-center">
                <p className="meta text-ink-muted">
                  {matches.length} {matches.length === 1 ? "practitioner" : "practitioners"}
                </p>
                <h2 className="font-display mt-4 text-[clamp(24px,3vw,32px)] leading-[1.15] tracking-[-0.015em] text-charcoal">
                  Practitioners near {city.name}
                </h2>
              </div>
              <div className="mt-10 grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">
                {matches.map((p) => (
                  <PractitionerCard key={p.slug} practitioner={p} />
                ))}
              </div>
            </>
          ) : (
            /* A warm human note, not an error card — we'd rather say so than pad a page. */
            <div className="mx-auto max-w-2xl rounded-[2rem] border border-rule/70 bg-white/70 px-7 py-12 text-center shadow-[0_1px_0_rgba(31,58,95,0.02),0_18px_40px_-34px_rgba(31,58,95,0.18)] md:px-14 md:py-16">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-seafoam/50 text-teal">
                <Leaf className="h-5 w-5" />
              </span>
              <h2 className="font-display mt-6 text-[clamp(23px,3vw,30px)] leading-[1.15] tracking-[-0.015em] text-charcoal">
                Our {city.name} network is still growing.
              </h2>
              <p className="mx-auto mt-5 max-w-md text-[16px] leading-[1.7] text-ink-soft">
                We don&rsquo;t have someone listed for this in {city.name}{" "}
                yet — we&rsquo;d rather say so than pad a page. Tell us what you&rsquo;re looking
                for and a real person will help you find the right fit, here or elsewhere in
                Minnesota.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <LinkButton href="/get-matched">Find your fit</LinkButton>
                <LinkButton href="/practitioners" tone="secondary">
                  Browse everyone
                </LinkButton>
              </div>
            </div>
          )}
        </section>

        {/* ───────── One next step, for anyone still weighing it up ───────── */}
        {matches.length > 0 && (
          <section className="mt-14 md:mt-20">
            <div className="mx-auto flex max-w-4xl flex-col items-center rounded-[2rem] border border-rule/70 bg-seafoam/25 px-7 py-12 text-center md:px-14 md:py-14">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-teal">
                <Leaf className="h-5 w-5" />
              </span>
              <h2 className="font-display mt-6 text-[clamp(22px,2.6vw,28px)] leading-[1.2] tracking-[-0.015em] text-charcoal">
                Not sure who&rsquo;s right?
              </h2>
              <p className="mt-4 max-w-md text-[15.5px] leading-[1.7] text-ink-soft">
                You can reach out to anyone here directly — or talk it through with our guide and
                let a real person help you narrow it down.
              </p>
              <div className="mt-8">
                <LinkButton href="/get-matched">Find your fit</LinkButton>
              </div>
            </div>
          </section>
        )}

        {/* ───────── The internal mesh: same care elsewhere, other care here ───────── */}
        <section className="mt-16 border-t border-rule/70 pt-12 md:mt-24 md:pt-16">
          <p className="font-display text-center text-[19px] leading-[1.3] text-ink-soft md:text-[21px]">
            Looking a little wider?
          </p>
          <div className="mx-auto mt-10 grid max-w-4xl gap-x-16 gap-y-12 sm:grid-cols-2">
            <MeshColumn
              heading={`${specialty.label} elsewhere in Minnesota`}
              items={nearby.map((c) => ({
                href: `/care/${specialty.id}/${c.slug}`,
                before: `${specialty.label} in`,
                emphasis: c.name,
              }))}
            />
            <MeshColumn
              heading={`Other kinds of care in ${city.name}`}
              items={siblings.map((s) => ({
                href: `/care/${s.id}/${city.slug}`,
                emphasis: s.label,
                after: `in ${city.name}`,
              }))}
            />
          </div>
        </section>

        {/* ───────── Safety line — quiet, never alarming ───────── */}
        <p className="mx-auto mt-16 max-w-lg text-center text-[13px] leading-[1.65] text-ink-muted md:mt-20">
          Healing Tides is a Minnesota directory, not a crisis service. If you need support right
          now, call or text{" "}
          <Link
            href="/crisis"
            className="font-medium text-charcoal underline-offset-2 hover:underline"
          >
            988
          </Link>
          .
        </p>
      </Container>
    </main>
  );
}
