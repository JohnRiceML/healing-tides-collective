// Pure JSON-LD builder for journal posts — extracted from the slug page so it's unit-testable
// (page files can't export helpers). Auto-generates Article schema; when a post carries a
// clinical review (reviewedBy/reviewedAt) it upgrades to Article + MedicalWebPage, which is the
// schema.org home of `reviewedBy`/`lastReviewed` — the structured E-E-A-T signal for YMYL health
// content. A hand-authored `structuredData` override always wins (validated in the Sanity schema).

import { SITE_URL } from '@/lib/site'

export type JournalFaqItem = {question?: string; answer?: string}
export type JournalFaqSectionBlock = {_type?: string; faqs?: JournalFaqItem[]}

export type JournalSeoPost = {
  title?: string | null
  excerpt?: string | null
  publishedAt?: string | null
  canonicalUrl?: string | null
  structuredData?: string | null
  heroImageUrl?: string | null
  author?: {name?: string | null; role?: string | null} | null
  reviewedBy?: {name?: string | null; role?: string | null} | null
  reviewedAt?: string | null
  body?: unknown[] | null
}

/** Keep JSON-LD safe inside a <script> tag. */
export function escapeJsonLd(json: string): string {
  return json.replace(/</g, '\\u003c').replace(/-->/g, '--\\u003e')
}

export function buildStructuredData(post: JournalSeoPost): string | null {
  if (post.structuredData) {
    try {
      const parsed = JSON.parse(post.structuredData)
      return escapeJsonLd(JSON.stringify(parsed))
    } catch {
      return null
    }
  }

  const reviewed = Boolean(post.reviewedBy?.name)
  const article: Record<string, unknown> = {
    '@context': 'https://schema.org',
    // MedicalWebPage carries reviewedBy/lastReviewed; the dual type keeps Article's coverage.
    '@type': reviewed ? ['Article', 'MedicalWebPage'] : 'Article',
  }
  if (post.title) article.headline = post.title
  if (post.excerpt) article.description = post.excerpt
  if (post.publishedAt) {
    article.datePublished = post.publishedAt
    // dateModified defaults to publish; a clinical review overwrites it below.
    article.dateModified = post.publishedAt
  }
  if (post.canonicalUrl) article.mainEntityOfPage = post.canonicalUrl
  article.inLanguage = 'en-US'
  article.publisher = {
    '@type': 'Organization',
    name: 'Healing Tides Collective',
    url: SITE_URL,
  }
  if (post.author?.name) {
    const author: Record<string, unknown> = {'@type': 'Person', name: post.author.name}
    if (post.author.role) author.jobTitle = post.author.role
    article.author = author
  }
  if (reviewed && post.reviewedBy?.name) {
    const reviewer: Record<string, unknown> = {'@type': 'Person', name: post.reviewedBy.name}
    if (post.reviewedBy.role) reviewer.jobTitle = post.reviewedBy.role
    article.reviewedBy = reviewer
    if (post.reviewedAt) {
      article.lastReviewed = post.reviewedAt
      article.dateModified = post.reviewedAt
    }
  }
  if (post.heroImageUrl) article.image = post.heroImageUrl

  const faqBlocks = ((post.body ?? []) as JournalFaqSectionBlock[]).filter(
    (b) => b?._type === 'faqSection' && Array.isArray(b.faqs) && b.faqs.length > 0,
  )
  const faqItems = faqBlocks
    .flatMap((b) => b.faqs ?? [])
    .filter((f): f is Required<JournalFaqItem> => Boolean(f?.question && f?.answer))
    .map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {'@type': 'Answer', text: f.answer},
    }))

  if (faqItems.length === 0) {
    return escapeJsonLd(JSON.stringify(article))
  }

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems,
  }
  return escapeJsonLd(JSON.stringify([article, faqPage]))
}
