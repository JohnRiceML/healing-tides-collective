import type {Metadata} from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {sanityFetch} from '@/sanity/lib/live'
import {urlFor} from '@/sanity/lib/image'
import {POSTS_LIST_QUERY} from '@/sanity/lib/queries'
import {isRetiredPost} from '@/lib/retired-posts'

const TITLE = 'Journal — Healing Tides Collective'
const DESCRIPTION = 'Notes on care, practice, and the spaces in between.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {title: TITLE, description: DESCRIPTION, type: 'website'},
  twitter: {card: 'summary_large_image', title: TITLE, description: DESCRIPTION},
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function BlogIndexPage() {
  const {data: allPosts} = await sanityFetch({query: POSTS_LIST_QUERY})
  const posts = allPosts.filter((p) => !isRetiredPost(p.slug))

  return (
    <main id="main-content" className="min-h-screen bg-sand">
      <header className="mx-auto max-w-[1400px] px-6 pt-24 pb-16 md:px-16 md:pt-36 md:pb-24">
        <Link
          href="/"
          className="meta text-ink-muted hover:text-charcoal transition-colors"
        >
          ← Healing Tides Collective
        </Link>

        <div className="mt-12 grid gap-10 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-7">
            <span className="meta text-teal">Journal</span>
            <h1 className="font-display mt-6 text-[clamp(44px,7vw,96px)] leading-[0.92] tracking-[-0.035em] text-charcoal">
              Notes from the Collective.
            </h1>
          </div>
          <div className="md:col-span-5 md:pt-6">
            <p className="text-[17px] leading-[1.7] text-ink-soft md:text-lg">
              Writing on care, practice, and the spaces in between — from clinicians,
              practitioners, and the people we serve.
            </p>
          </div>
        </div>

        <div className="rule mt-16 md:mt-20" />
      </header>

      <section className="mx-auto max-w-[1400px] px-6 pb-32 md:px-16 md:pb-48">
        {posts.length === 0 ? (
          <p className="meta text-ink-muted">No posts yet.</p>
        ) : (
          <ul className="flex flex-col">
            {posts.map((post) => (
              <li key={post._id} className="border-b border-rule">
                <Link
                  href={`/journal/${post.slug}`}
                  className="group grid gap-6 py-12 md:grid-cols-12 md:gap-12 md:py-20"
                >
                  <div className="md:col-span-2">
                    <p className="meta text-ink-muted">
                      {formatDate(post.publishedAt)}
                    </p>
                  </div>

                  <div className="md:col-span-7">
                    <h2 className="font-display text-[clamp(28px,3.5vw,44px)] leading-[1.05] tracking-[-0.02em] text-charcoal transition-colors group-hover:text-ocean">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-5 max-w-xl text-[16px] leading-[1.7] text-ink-soft md:text-[17px]">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-6 flex items-center gap-4">
                      {post.author?.name && (
                        <span className="meta text-ink-muted">
                          {post.author.name}
                        </span>
                      )}
                      {post.categories && post.categories.length > 0 && (
                        <span className="meta text-ink-muted">
                          ·{' '}
                          {post.categories
                            .map((c) => c?.title)
                            .filter(Boolean)
                            .join(' / ')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    {post.heroImage?.asset && (
                      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-sand-deep">
                        <Image
                          src={urlFor(post.heroImage)
                            .width(800)
                            .fit('crop')
                            .auto('format')
                            .url()}
                          alt={post.heroImage.alt ?? post.title ?? ''}
                          fill
                          sizes="(min-width: 768px) 25vw, 100vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-6 px-6 py-10 md:px-16">
          <p className="font-display text-base text-charcoal">Healing Tides Collective</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/practitioners" className="meta text-teal underline-offset-2 hover:underline">
              Find a practitioner →
            </Link>
            <p className="meta text-ink-muted">© 2026 / Care, matched. By a person.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
