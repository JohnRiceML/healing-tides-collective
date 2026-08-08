// Pure JSON-LD builder for journal posts — extracted from the slug page so it's unit-testable
// (page files can't export helpers). Auto-generates Article schema; when a post carries a
// clinical review (reviewedBy/reviewedAt) it upgrades to Article + MedicalWebPage, which is the
// schema.org home of `reviewedBy`/`lastReviewed`. Structured data describes visible facts; it is
// not treated as a ranking or rich-result shortcut. A hand-authored `structuredData` override
// always wins (validated in the Sanity schema).

import { SITE_URL } from '@/lib/site'

export type JournalSeoPost = {
  title?: string | null
  excerpt?: string | null
  publishedAt?: string | null
  dateModified?: string | null
  canonicalUrl?: string | null
  structuredData?: string | null
  heroImageUrl?: string | null
  author?: {name?: string | null; role?: string | null; url?: string | null} | null
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

  const authorName = post.author?.name?.trim()
  const authorRole = post.author?.role?.trim()
  const reviewerName = post.reviewedBy?.name?.trim()
  const reviewerRole = post.reviewedBy?.role?.trim()
  const reviewed = Boolean(reviewerName)
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
  if (post.dateModified) article.dateModified = post.dateModified
  if (post.canonicalUrl) article.mainEntityOfPage = post.canonicalUrl
  article.inLanguage = 'en-US'
  article.publisher = {
    '@type': 'Organization',
    name: 'Healing Tides Collective',
    url: SITE_URL,
  }
  if (authorName) {
    const author: Record<string, unknown> = {'@type': 'Person', name: authorName}
    if (authorRole) author.jobTitle = authorRole
    if (post.author?.url) author.url = post.author.url
    article.author = author
  }
  if (reviewed && reviewerName) {
    const reviewer: Record<string, unknown> = {'@type': 'Person', name: reviewerName}
    if (reviewerRole) reviewer.jobTitle = reviewerRole
    article.reviewedBy = reviewer
    if (post.reviewedAt) {
      article.lastReviewed = post.reviewedAt
      article.dateModified = post.reviewedAt
    }
  }
  if (post.heroImageUrl) article.image = post.heroImageUrl

  return escapeJsonLd(JSON.stringify(article))
}
