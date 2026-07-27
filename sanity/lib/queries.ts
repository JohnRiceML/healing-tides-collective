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

export const POST_BY_SLUG_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug][0]{
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
    "reviewedBy": reviewedBy->{name, role},
    reviewedAt,
    citations[]{label, url},
    "categories": categories[]->{title, "slug": slug.current, color}
  }
`)

export const POST_SLUGS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)]{ "slug": slug.current }
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
