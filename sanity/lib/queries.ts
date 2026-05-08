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
      "categories": categories[]->{title, "slug": slug.current}
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
    "author": author->{
      name,
      "slug": slug.current,
      role,
      image,
      bio
    },
    "categories": categories[]->{title, "slug": slug.current}
  }
`)

export const POST_SLUGS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)]{ "slug": slug.current }
`)
