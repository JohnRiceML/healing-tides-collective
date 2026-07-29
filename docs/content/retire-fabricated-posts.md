# Retiring the six fabricated posts

**Status: not done. Blocked on a Sanity write token — the one in `.env.local` is read-only.**

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

## The steps

Unpublishing here means clearing `publishedAt` — that's what the journal's queries filter on. Nothing
is deleted and every document stays in Sanity, so this is fully reversible by setting the date back.

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

## Then what

Three of the six were on genuinely good topics — insurance vs. cash-pay, what an intake call is like,
and waiting lists. Those get rewritten under Nora's own byline from
[mn-insurance-research.md](mn-insurance-research.md), which is statute-verified and Minnesota-specific.
The first is drafted at [drafts/mn-therapy-insurance-guide.md](drafts/mn-therapy-insurance-guide.md),
with `[NORA]` placeholders where her experience belongs rather than invented content.

Nothing new publishes until the six are retired. A guide about trustworthy care shouldn't land on a
journal that still carries invented sources.
