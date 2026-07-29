import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container, LinkButton } from "@/app/_components/ui";
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

  return (
    <main id="main-content" className="min-h-screen bg-sand text-charcoal">
      <Container size="wide" className="py-14 md:py-20">
        <nav aria-label="Breadcrumb" className="meta text-ink-muted">
          <Link href="/practitioners" className="hover:text-charcoal">
            All practitioners
          </Link>
        </nav>

        <header className="mt-4 max-w-2xl">
          <p className="meta text-teal">{city.name}, Minnesota</p>
          <h1 className="font-display mt-3 text-[clamp(28px,4vw,42px)] font-light leading-[1.06] tracking-[-0.02em]">
            {carePageTitle(page)}
          </h1>
          <p className="mt-4 text-[16px] leading-[1.65] text-ink-soft">
            {carePageDescription(page, matches.length)}
          </p>
        </header>

        {/* What this kind of care covers — real phrases from Nora's taxonomy, not keyword filler. */}
        <section className="mt-10 max-w-2xl">
          <h2 className="font-display text-[21px] leading-tight text-charcoal">
            What {specialty.label.toLowerCase()} support can hold
          </h2>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {topics.map((t) => (
              <span key={t} className="rounded-full bg-seafoam/40 px-3 py-1 text-[13px] text-ocean">
                {t}
              </span>
            ))}
          </div>
          <p className="mt-4 text-[14px] leading-[1.65] text-ink-soft">
            Everyone arrives with their own version of this. A first conversation is usually about
            finding out whether someone feels like the right person to sit with — not about having
            the words already sorted out.
          </p>
        </section>

        {/* The supply — honest either way. Never a fabricated count. */}
        <section className="mt-12">
          <h2 className="font-display text-[21px] leading-tight text-charcoal">
            {matches.length > 0
              ? `Practitioners near ${city.name}`
              : `Our ${city.name} network is still growing`}
          </h2>

          {matches.length > 0 ? (
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {matches.map((p) => (
                <PractitionerCard key={p.slug} practitioner={p} />
              ))}
            </div>
          ) : (
            <div className="mt-5 max-w-2xl rounded-3xl border border-dashed border-rule bg-white/60 px-6 py-10">
              <p className="text-[15px] leading-[1.65] text-ink-soft">
                We don&rsquo;t have someone listed for this in {city.name}{" "}
                yet — we&rsquo;d rather say so than pad a page. Tell us what you&rsquo;re looking
                for and a real person will help you find the right fit, here or elsewhere in
                Minnesota.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <LinkButton href="/get-matched">Find your fit</LinkButton>
                <Link
                  href="/practitioners"
                  className="inline-flex items-center rounded-full px-4 py-2 text-[14px] text-teal ring-1 ring-rule transition hover:ring-teal/40"
                >
                  Browse everyone
                </Link>
              </div>
            </div>
          )}
        </section>

        {matches.length > 0 && (
          <section className="mt-12 max-w-2xl rounded-3xl border border-teal/30 bg-seafoam/20 px-6 py-8">
            <h2 className="font-display text-[20px] leading-tight text-charcoal">
              Not sure who&rsquo;s right?
            </h2>
            <p className="mt-2 text-[15px] leading-[1.65] text-ink-soft">
              You can reach out to anyone here directly — or talk it through with our guide and let
              a real person help you narrow it down.
            </p>
            <div className="mt-5">
              <LinkButton href="/get-matched">Find your fit</LinkButton>
            </div>
          </section>
        )}

        {/* The internal mesh: same care elsewhere, other care here. */}
        <section className="mt-14 grid gap-10 border-t border-rule/70 pt-10 sm:grid-cols-2">
          <div>
            <h2 className="meta text-ink-muted">{specialty.label} elsewhere in Minnesota</h2>
            <ul className="mt-3 flex flex-col gap-1.5">
              {nearby.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/care/${specialty.id}/${c.slug}`}
                    className="text-[14px] text-teal underline-offset-2 hover:underline"
                  >
                    {specialty.label} in {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="meta text-ink-muted">Other kinds of care in {city.name}</h2>
            <ul className="mt-3 flex flex-col gap-1.5">
              {siblings.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/care/${s.id}/${city.slug}`}
                    className="text-[14px] text-teal underline-offset-2 hover:underline"
                  >
                    {s.label} in {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <p className="mt-12 text-[13px] leading-[1.6] text-ink-muted">
          Healing Tides is a Minnesota directory, not a crisis service. If you need support right
          now, call or text{" "}
          <Link href="/crisis" className="text-teal underline-offset-2 hover:underline">
            988
          </Link>
          .
        </p>
      </Container>
    </main>
  );
}
