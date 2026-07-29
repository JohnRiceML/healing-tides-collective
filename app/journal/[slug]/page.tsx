import type {Metadata} from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {sanityFetch} from '@/sanity/lib/live'
import {client} from '@/sanity/lib/client'
import {urlFor} from '@/sanity/lib/image'
import {POST_BY_SLUG_QUERY, POST_SLUGS_QUERY} from '@/sanity/lib/queries'
import {PortableTextRenderer} from '../_components/PortableTextRenderer'
import {buildStructuredData} from '@/lib/journal-seo'
import {SITE_URL} from '@/lib/site'

export const dynamicParams = true

export async function generateStaticParams() {
  const slugs = await client.fetch(POST_SLUGS_QUERY)
  return slugs.map((s) => ({slug: s.slug as string}))
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
  const post = await client.fetch(POST_BY_SLUG_QUERY, {slug})
  if (!post) return {title: 'Not found'}
  const title = post.seo?.metaTitle ?? post.title ?? 'Healing Tides Collective'
  const description = post.seo?.metaDescription ?? post.excerpt ?? undefined
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
  const {data: post} = await sanityFetch({query: POST_BY_SLUG_QUERY, params: {slug}})

  if (!post) notFound()

  const heroImageUrl = post.heroImage?.asset
    ? urlFor(post.heroImage).width(1200).height(630).fit('crop').auto('format').url()
    : null
  const jsonLd = buildStructuredData({
    ...post,
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
          className="meta text-ink-muted hover:text-charcoal transition-colors"
        >
          ← Journal
        </Link>
      </div>

      <header className="mx-auto max-w-3xl px-6 pt-12 md:px-10 md:pt-20">
        <span className="meta text-teal">
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
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mt-8 text-[19px] leading-[1.55] text-ink-soft md:text-[22px]">
            {post.excerpt}
          </p>
        )}

        <div className="rule mt-12" />

        {post.author?.name && (
          <div className="mt-6 flex items-center gap-4">
            {post.author.image?.asset && (
              <div className="relative h-12 w-12 overflow-hidden rounded-full bg-sand-deep">
                <Image
                  src={urlFor(post.author.image)
                    .width(120)
                    .height(120)
                    .fit('crop')
                    .auto('format')
                    .url()}
                  alt={post.author.image.alt ?? post.author.name ?? ''}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <p className="font-display text-base text-charcoal">{post.author.name}</p>
              {post.author.role && (
                <p className="meta text-ink-muted">{post.author.role}</p>
              )}
            </div>
          </div>
        )}
        {post.reviewedBy?.name && (
          <p className="mt-5 text-[13px] leading-relaxed text-ink-soft">
            Clinically reviewed by{' '}
            <Link href="/about" className="link-underline font-medium text-charcoal">
              {post.reviewedBy.name}
            </Link>
            {post.reviewedBy.role ? `, ${post.reviewedBy.role}` : ''}
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
              alt={post.heroImage.alt ?? post.title ?? ''}
              fill
              sizes="(min-width: 1100px) 1100px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </figure>
      )}

      <article className="mx-auto max-w-2xl px-6 py-16 md:px-10 md:py-24">
        {post.body && <PortableTextRenderer value={post.body} />}
      </article>

      {(post.citations?.length ?? 0) > 0 && (
        <section className="mx-auto max-w-2xl px-6 pb-16 md:px-10">
          <p className="meta text-ink-muted">Sources</p>
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
          {post.author?.name && post.author.bio && (
            <div className="mb-16">
              <p className="meta text-teal">About the author</p>
              <div className="mt-6 flex items-start gap-5">
                {post.author.image?.asset && (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-sand-deep">
                    <Image
                      src={urlFor(post.author.image)
                        .width(160)
                        .height(160)
                        .fit('crop')
                        .auto('format')
                        .url()}
                      alt={post.author.image.alt ?? post.author.name ?? ''}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-display text-xl text-charcoal">{post.author.name}</p>
                  {post.author.role && (
                    <p className="meta mt-1 text-ink-muted">{post.author.role}</p>
                  )}
                  <div className="mt-4 text-[16px] leading-[1.7] text-ink-soft">
                    <PortableTextRenderer value={post.author.bio} />
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
            <p className="meta text-ink-muted">© 2026 / Care, matched. By a person.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
