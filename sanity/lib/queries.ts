import {defineQuery} from 'next-sanity'

export const POSTS_LIST_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current) && publishedAt < now()]
    | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      heroImage,
      publishedAt,
      "author": author->{name, "slug": slug.current, image},
      "categories": categories[]->{title, "slug": slug.current, color}
    }
`)

// `publishedAt < now()` is the ONLY thing standing between a draft and the public web — there is no
// preview/draft mode in this app. Without it, clearing a post's date removed it from the listing and
// the sitemap while leaving it fully readable at its own URL, so "unpublishing" didn't unpublish
// anything a crawler or a shared link could still reach. A future-dated post leaked the same way.
// Every post query filters on it. Don't add one that doesn't.
export const POST_BY_SLUG_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug && publishedAt < now()][0]{
    _id,
    title,
    "slug": slug.current,
    excerpt,
    heroImage,
    publishedAt,
    body,
    seo,
    canonicalUrl,
    structuredData,
    "author": author->{
      name,
      "slug": slug.current,
      role,
      image,
      bio,
      email,
      website,
      social
    },
    "reviewedBy": reviewedBy->{name, role, "slug": slug.current},
    reviewedAt,
    citations[]{label, url},
    "categories": categories[]->{title, "slug": slug.current, color}
  }
`)

// Feeds generateStaticParams — prerendering an unpublished post would put it on disk and serve it.
export const POST_SLUGS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current) && publishedAt < now()]{ "slug": slug.current }
`)

// Published, live posts (matches the listing's `publishedAt < now()` filter) with a
// lastModified date — for the sitemap, so each post is indexed individually.
export const POST_SITEMAP_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current) && publishedAt < now()]
    | order(publishedAt desc) {
      "slug": slug.current,
      "lastModified": coalesce(_updatedAt, publishedAt)
    }
`)

// Nora's canonical author page uses the same publication rule as the journal and sitemap.
// The app still applies the retired-post denylist because those records cannot yet be deleted
// by the current read-only Sanity identity.
export const NORA_POSTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current) && publishedAt < now() && author->slug.current == "nora-hollenkamp"]
    | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      publishedAt
    }
`)
