import type {Metadata} from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {sanityFetch} from '@/sanity/lib/live'
import {client} from '@/sanity/lib/client'
import {urlFor} from '@/sanity/lib/image'
import {POST_BY_SLUG_QUERY, POST_SLUGS_QUERY} from '@/sanity/lib/queries'
import {PortableTextRenderer} from '../_components/PortableTextRenderer'
import {JournalCompanion} from '../_components/JournalCompanion'
import {buildStructuredData} from '@/lib/journal-seo'
import {isRetiredPost} from '@/lib/retired-posts'
import {SITE_URL} from '@/lib/site'
import {
  SOMATIC_SERIES,
  cleanPerson,
  isNoraAuthor,
  isTherapyCostRelevant,
  journalBodyForDisplay,
  journalPresentation,
} from '@/lib/journal-presentation'

export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await client.fetch(POST_SLUGS_QUERY)
  // Don't prerender a retired post — a prerendered page is a served page.
  return slugs
    .filter((s) => !isRetiredPost(s.slug as string))
    .map((s) => ({slug: s.slug as string}))
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{slug: string}>
}): Promise<Metadata> {
  const {slug} = await params
  if (isRetiredPost(slug)) return {title: 'Not found', robots: {index: false, follow: false}}
  const post = await client.fetch(POST_BY_SLUG_QUERY, {slug})
  if (!post) return {title: 'Not found'}
  const presentation = journalPresentation(slug, post.title)
  const title = post.seo?.metaTitle?.trim() || presentation.title
  const description =
    post.seo?.metaDescription?.trim() || presentation.description || post.excerpt || undefined
  const ogImageSource = post.seo?.ogImage?.asset ? post.seo.ogImage : post.heroImage
  const ogImageUrl = ogImageSource?.asset
    ? urlFor(ogImageSource).width(1200).height(630).fit('crop').auto('format').url()
    : undefined

  return {
    title,
    description,
    // Always emit a canonical — the Sanity field is a manual override, not the source of truth.
    alternates: {canonical: post.canonicalUrl ?? `${SITE_URL}/journal/${slug}`},
    openGraph: {
      title,
      description,
      type: 'article',
      url: post.canonicalUrl ?? `${SITE_URL}/journal/${slug}`,
      images: ogImageUrl ? [{url: ogImageUrl, width: 1200, height: 630}] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  }
}


export default async function PostPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  // Retired ahead of the Sanity cleanup — checked before the fetch, so the body never loads.
  if (isRetiredPost(slug)) notFound()
  const {data: post} = await sanityFetch({query: POST_BY_SLUG_QUERY, params: {slug}})

  if (!post) notFound()

  const presentation = journalPresentation(slug, post.title)
  const author = post.author
  const authorName = cleanPerson(author?.name)
  const authorRole = cleanPerson(author?.role)
  const noraAuthor = isNoraAuthor(author)
  const noraReviewer = isNoraAuthor(post.reviewedBy)
  const authorDisplayName = noraAuthor ? 'Nora L. Hollenkamp, MSW, LICSW' : authorName
  const authorDisplayRole = noraAuthor
    ? 'Founder · Licensed Independent Clinical Social Worker'
    : authorRole
  const bodyForDisplay = journalBodyForDisplay(slug, post.body)

  const heroImageUrl = post.heroImage?.asset
    ? urlFor(post.heroImage).width(1200).height(630).fit('crop').auto('format').url()
    : null
  const jsonLd = buildStructuredData({
    ...post,
    title: presentation.title,
    excerpt: presentation.description ?? post.excerpt,
    dateModified: presentation.editorialUpdatedAt ?? post.publishedAt,
    author: post.author
      ? {name: authorDisplayName, role: authorDisplayRole, url: noraAuthor ? `${SITE_URL}/about` : undefined}
      : null,
    heroImageUrl,
    canonicalUrl: post.canonicalUrl ?? `${SITE_URL}/journal/${slug}`,
  })

  return (
    <main id="main-content" className="min-h-screen bg-sand">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: jsonLd}}
        />
      )}
      <div className="mx-auto max-w-[1400px] px-6 pt-12 md:px-16 md:pt-16">
        <Link
          href="/journal"
          className="meta text-muted-ink hover:text-charcoal transition-colors"
        >
          ← Journal
        </Link>
      </div>

      <header className="mx-auto max-w-3xl px-6 pt-12 md:px-10 md:pt-20">
        <span className="meta text-teal-ink">
          {formatDate(post.publishedAt)}
          {post.categories && post.categories.length > 0 && (
            <>
              {' · '}
              {post.categories
                .map((c) => c?.title)
                .filter(Boolean)
                .join(' / ')}
            </>
          )}
        </span>

        <h1 className="font-display mt-8 text-[clamp(40px,6vw,80px)] leading-[0.95] tracking-[-0.035em] text-charcoal">
          {presentation.title}
        </h1>

        {(presentation.description ?? post.excerpt) && (
          <p className="mt-8 text-[19px] leading-[1.55] text-ink-soft md:text-[22px]">
            {presentation.description ?? post.excerpt}
          </p>
        )}

        <div className="rule mt-12" />

        {authorName && (
          <div className="mt-6 flex items-center gap-4">
            {author?.image?.asset && (
              <div className="relative h-12 w-12 overflow-hidden rounded-full bg-sand-deep">
                <Image
                  src={urlFor(author.image)
                    .width(120)
                    .height(120)
                    .fit('crop')
                    .auto('format')
                    .url()}
                  alt={author.image.alt ?? authorName}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
            )}
            <div>
              {noraAuthor ? (
                <Link href="/about" className="font-display text-base text-charcoal underline decoration-charcoal/20 underline-offset-4 hover:decoration-charcoal">
                  {authorDisplayName}
                </Link>
              ) : (
                <p className="font-display text-base text-charcoal">{authorDisplayName}</p>
              )}
              {authorDisplayRole && (
                <p className="meta text-muted-ink">{authorDisplayRole}</p>
              )}
            </div>
          </div>
        )}
        {post.reviewedBy?.name && (
          <p className="mt-5 text-[13px] leading-relaxed text-ink-soft">
            Clinically reviewed by{' '}
            {noraReviewer ? (
              <Link href="/about" className="link-underline font-medium text-charcoal">
                {cleanPerson(post.reviewedBy.name)}
              </Link>
            ) : (
              <span className="font-medium text-charcoal">{cleanPerson(post.reviewedBy.name)}</span>
            )}
            {cleanPerson(post.reviewedBy.role) ? `, ${cleanPerson(post.reviewedBy.role)}` : ''}
            {post.reviewedAt
              ? ` · ${new Date(post.reviewedAt).toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}`
              : ''}
          </p>
        )}
      </header>

      {post.heroImage?.asset && (
        <figure className="mx-auto mt-16 max-w-[1100px] px-6 md:px-10">
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-sand-deep">
            <Image
              src={urlFor(post.heroImage)
                .width(2000)
                .fit('crop')
                .auto('format')
                .url()}
              alt={post.heroImage.alt ?? presentation.title}
              fill
              sizes="(min-width: 1100px) 1100px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </figure>
      )}

      {presentation.editorialContext && (
        <aside className="mx-auto mt-14 max-w-2xl px-6 md:px-10" aria-label="Editorial context">
          <div className="rounded-lg border border-rule bg-sand-deep/40 p-6 md:p-8">
            <p className="meta text-teal-ink">
              {presentation.seriesPosition ? 'A note on this series' : 'An update to this article'}
            </p>
            <p className="mt-3 text-[15px] leading-[1.7] text-ink-soft">
              {presentation.editorialContext}
            </p>
            {presentation.showCrisisLink && (
              <p className="mt-3 text-[14px] leading-[1.7] text-ink-soft">
                If thoughts of suicide or immediate safety concerns feel current,{' '}
                <Link href="/crisis" className="link-underline font-medium text-charcoal">
                  use the immediate-support routes
                </Link>.
              </p>
            )}
            {presentation.seriesPosition && presentation.seriesPosition > 1 && (
              <p className="mt-3 text-[13px] leading-[1.7] text-muted-ink">
                For scientific context, compare the theory&rsquo;s{' '}
                <a
                  href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12302812/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-[15px]"
                >
                  Porges (2025), the theory author&rsquo;s current account
                </a>{' '}
                with a{' '}
                <a
                  href="https://pubmed.ncbi.nlm.nih.gov/41768017/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-[15px]"
                >
                  Grossman et al. (2026), an expert critique
                </a>.
              </p>
            )}
          </div>
        </aside>
      )}

      <article className="mx-auto max-w-2xl px-6 py-16 md:px-10 md:py-24">
        {bodyForDisplay.length > 0 && <PortableTextRenderer value={bodyForDisplay} />}
      </article>

      <JournalCompanion slug={slug} />

      {presentation.seriesPosition && (
        <nav className="mx-auto max-w-2xl px-6 pb-16 md:px-10" aria-label="Somatic Series">
          <p className="meta text-teal-ink">Nora&rsquo;s Somatic Series</p>
          <ol className="mt-5 divide-y divide-rule border-y border-rule">
            {SOMATIC_SERIES.map((entry, index) => {
              const current = entry.slug === slug
              return (
                <li key={entry.slug}>
                  <Link
                    href={`/journal/${entry.slug}`}
                    aria-current={current ? 'page' : undefined}
                    className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-4 py-5"
                  >
                    <span className="meta text-muted-ink">0{index + 1}</span>
                    <span className={`font-display text-[19px] leading-snug ${current ? 'text-teal' : 'text-charcoal group-hover:text-ocean'}`}>
                      {entry.title}
                    </span>
                    <span aria-hidden className="text-muted-ink">{current ? 'Here' : '→'}</span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </nav>
      )}

      <aside className="mx-auto max-w-2xl px-6 pb-16 md:px-10 md:pb-24" aria-label="Continue with Healing Tides">
        <div className="rounded-lg bg-charcoal px-6 py-8 text-sand md:px-9 md:py-10">
          <p className="meta text-sand/65">Continue at your pace</p>
          <h2 className="font-display mt-4 text-[clamp(26px,3vw,36px)] leading-tight">
            Learn who is behind the writing, or take a practical next step.
          </h2>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
            <Link href="/about" className="meta text-sand underline decoration-sand/35 underline-offset-4 hover:decoration-sand">
              Meet Nora →
            </Link>
            {isTherapyCostRelevant(slug) && (
              <Link href="/resources/therapy-cost-minnesota" className="meta text-sand underline decoration-sand/35 underline-offset-4 hover:decoration-sand">
                Understand therapy costs →
              </Link>
            )}
            <Link href="/get-matched" className="meta rounded-full bg-sand px-4 py-2 text-charcoal transition-colors hover:bg-white">
              Get Matched →
            </Link>
          </div>
        </div>
      </aside>

      {(post.citations?.length ?? 0) > 0 && (
        <section className="mx-auto max-w-2xl px-6 pb-16 md:px-10">
          <p className="meta text-muted-ink">Sources</p>
          <ul className="mt-3 space-y-1.5">
            {(post.citations ?? [])
              .filter((c) => c?.label && c?.url)
              .map((c, i) => (
                <li key={`${c.url}-${i}`} className="text-[14px] leading-relaxed text-ink-soft">
                  <a
                    href={c.url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline"
                  >
                    {c.label}
                  </a>
                </li>
              ))}
          </ul>
        </section>
      )}

      <footer className="border-t border-rule">
        <div className="mx-auto max-w-2xl px-6 py-16 md:px-10 md:py-24">
          {authorName && author?.bio && (
            <div className="mb-16">
              <p className="meta text-teal-ink">About the author</p>
              <div className="mt-6 flex items-start gap-5">
                {author.image?.asset && (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-sand-deep">
                    <Image
                      src={urlFor(author.image)
                        .width(160)
                        .height(160)
                        .fit('crop')
                        .auto('format')
                        .url()}
                      alt={author.image.alt ?? authorName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  {noraAuthor ? (
                    <Link href="/about" className="font-display text-xl text-charcoal underline decoration-charcoal/20 underline-offset-4 hover:decoration-charcoal">
                      {authorDisplayName}
                    </Link>
                  ) : (
                    <p className="font-display text-xl text-charcoal">{authorDisplayName}</p>
                  )}
                  {authorDisplayRole && (
                    <p className="meta mt-1 text-muted-ink">{authorDisplayRole}</p>
                  )}
                  <div className="mt-4 text-[16px] leading-[1.7] text-ink-soft">
                    <PortableTextRenderer value={author.bio} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <Link
            href="/journal"
            className="meta inline-flex items-center gap-2 text-charcoal hover:text-ocean transition-colors"
          >
            <span>← All Journal entries</span>
          </Link>
        </div>

        <div className="border-t border-rule">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-6 px-6 py-10 md:px-16">
            <p className="font-display text-base text-charcoal">
              Healing Tides Collective
            </p>
            <p className="meta text-muted-ink">© 2026 / Care, matched. By a person.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
