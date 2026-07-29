# Retiring the six fabricated posts

**Status: not done. Blocked on Sanity write access — see below.**

There is **no Sanity token at all** in `.env.local` (only `NEXT_PUBLIC_SANITY_DATASET` and
`NEXT_PUBLIC_SANITY_PROJECT_ID`); reads work because the dataset is public-read, and every write
fails with `Insufficient permissions; permission "update" required`. The Sanity CLI is a dead end
too — it's logged in as `aipeekaboofounder@gmail.com`, which isn't a member of this project
(`project user not found for user ID … in project b1sa414t`).

Two ways to unblock, in order of preference:

1. **`npx sanity login`** in this repo, as whichever account owns project `b1sa414t`. The CLI then
   carries real credentials and no secret has to exist on disk. Cleanest option.
2. An **Editor token** from sanity.io/manage → project → API → Tokens, set as `SANITY_API_TOKEN`
   in `.env.local`.

Six published journal posts were written under two invented author personas, "Maya Chen" and
"Daniel Park". The byline was the smaller half of the problem.

## What's actually wrong with them

The bodies are roughly 27,000 words of fabricated first-person memoir and fabricated sources:

| Post (`_id`) | The problem |
|---|---|
| `post-intake-call-qa` | Clinical guidance sourced to **"Dr. Robin Hayes," a therapist who does not exist**, quoted at length with an invented fourteen-year practice history |
| `post-insurance-vs-cashpay` | **"Three Brooklyn-based clinicians I interviewed"** — interviews that never happened; patient surveys that never happened |
| `post-somatic-vs-talk` | Invented childhood trauma, including a specific 1998 memory, and a memoir scene in **a parking lot in Eagle Rock** (Los Angeles) |
| `post-waitlist-math` | Invented personal waitlist history — "I was number 47," "the subway home," "nineteen public bathrooms" |
| `post-front-door-for-care` | Written explicitly from outside the company: "I edit this Journal," "the people who started Healing Tides Collective." Incoherent under any real byline |
| `a54776c0-e3ab-4f35-ad1e-5df5859251c5` | Invented personal history; cross-references the other fabrications as though they were real reporting |

Note the geography: **subway, Brooklyn, Eagle Rock.** New York and Los Angeles, on a Minnesota-only
directory.

## Why these were not simply re-bylined to Nora

That was the initial instinct and it's the wrong fix. Moving invented autobiography and invented
interviews under a practising LICSW's name would have Nora personally attesting to a fabricated
mental-health history and to sources that don't exist — a professional-conduct exposure on top of the
YMYL/E-E-A-T problem, and a worse position than the fake personas. The fabrication is in the prose,
not the label.

**The seven posts already bylined to Nora are her own genuine writing and are not affected.**

## Before you start: this only works as of commit `0f2c66f`

Clearing `publishedAt` is what retires a post — but when this runbook was first written, **that
wasn't actually true**, and following it would have accomplished nothing visible.

Two of the four post queries didn't filter on `publishedAt`. `POST_BY_SLUG_QUERY` matched on slug
alone, so a retired post would have vanished from the listing and the sitemap while still serving in
full at its own URL — to anyone holding the link, and to every crawler that had already indexed it.
`POST_SLUGS_QUERY` feeds `generateStaticParams`, so it would also have been prerendered to disk. The
cleanup would have looked complete and left all six readable.

That's fixed and deployed, with a regression test. **If you are somehow running against code older
than `0f2c66f`, deploy first** — otherwise this whole procedure is theatre.

## The steps

Unpublishing here means clearing `publishedAt`. Nothing is deleted and every document stays in
Sanity, so this is fully reversible by setting the date back.

1. **Unpublish `post-intake-call-qa` first.** It's live, indexed, and attributes clinical advice to a
   nonexistent clinician. If only one thing happens today, this is it.
2. Unpublish the remaining five listed above.
3. Delete the author documents `author-maya-chen` and `author-daniel-park` so they can't be
   reattached. Do this *after* the posts are unpublished.
4. Fix Nora's author record (`1371e218-5f15-424c-a2a9-2c6d666bd55b`): her name is stored as
   `" Nora Hollenkamp"` with a **leading space**, which renders in bylines *and* in the JSON-LD
   `author.name`. Her role is `"Founder "` with a trailing space — worth considering whether it should
   carry her clinical credential instead, for E-E-A-T. That's her call.
5. Check Search Console afterward for the retired URLs, and confirm they've dropped from the sitemap.

## Interim: they are already blocked in code

Because Sanity write access wasn't available and the content was live, all six are blocked at the
application layer via `lib/retired-posts.ts`. The journal page 404s them, `generateStaticParams`
won't prerender them, and they're filtered from the listing and the sitemap. Verified by production
build: seven journal pages prerender, all of them Nora's own writing.

**This is a stopgap, and step 6 below removes it.** Nothing in Sanity was touched — every document
is intact.

6. Once the six are retired in Sanity, **delete `lib/retired-posts.ts` and its three call sites**
   (`app/journal/[slug]/page.tsx`, `app/journal/page.tsx`, `app/sitemap.ts`), plus the
   "retired posts — the stopgap block" test. Then confirm the URLs still 404, now because
   `publishedAt` is clear rather than because a constant says so.

## Then what

Three of the six were on genuinely good topics — insurance vs. cash-pay, what an intake call is like,
and waiting lists. Those get rewritten under Nora's own byline from
[mn-insurance-research.md](mn-insurance-research.md), which is statute-verified and Minnesota-specific.
The first is drafted at [drafts/mn-therapy-insurance-guide.md](drafts/mn-therapy-insurance-guide.md),
with `[NORA]` placeholders where her experience belongs rather than invented content.

Nothing new publishes until the six are retired. A guide about trustworthy care shouldn't land on a
journal that still carries invented sources.
