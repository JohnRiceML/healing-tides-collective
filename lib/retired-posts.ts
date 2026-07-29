/**
 * TEMPORARY. Journal posts blocked at the application layer.
 *
 * These six were published under two invented author personas, "Maya Chen" and "Daniel Park".
 * The bylines were the smaller half of the problem — the bodies are roughly 27,000 words of
 * fabricated first-person memoir and fabricated sources: invented childhood trauma, "three
 * Brooklyn-based clinicians I interviewed", and clinical guidance attributed at length to
 * "Dr. Robin Hayes", a therapist who does not exist. The geography is New York and Los Angeles
 * on a Minnesota-only directory.
 *
 * They should be retired in Sanity by clearing `publishedAt`. That can't happen yet: there is no
 * Sanity write credential anywhere (`.env.local`, `.env.example` and the Vercel production env all
 * carry only the two public NEXT_PUBLIC_SANITY_* vars), and the Sanity CLI is authenticated as an
 * account that isn't a member of this project. Rather than leave fabricated clinical guidance
 * serving under a licensed clinician's brand for as long as that takes, the app refuses to serve
 * them.
 *
 * This is a stopgap, and stopgaps rot. Deleting it is a step in
 * docs/content/retire-fabricated-posts.md — once the posts are retired in Sanity, this whole file
 * and its three call sites come out. The guard test in tests/content-foundation.test.ts fails if a
 * slug listed here is still reachable, so the two can't silently drift apart.
 *
 * Nothing here touches Sanity. Every document is intact and restoring one is a matter of removing
 * its slug from this list.
 */
export const RETIRED_POST_SLUGS: ReadonlySet<string> = new Set([
  "what-an-intake-call-should-feel-like", // clinical guidance sourced to a therapist who doesn't exist
  "insurance-vs-cashpay", // interviews and patient surveys that never happened
  "somatic-or-talk", // invented childhood trauma; a Los Angeles memoir scene
  "on-waiting-lists", // invented personal waitlist history, set on a subway
  "on-building-a-front-door-for-care", // written from outside the company; incoherent under any real byline
  "awareness-was-never-the-problem", // invented personal history; cites the other fabrications as reporting
]);

export function isRetiredPost(slug: string | null | undefined): boolean {
  return !!slug && RETIRED_POST_SLUGS.has(slug);
}
