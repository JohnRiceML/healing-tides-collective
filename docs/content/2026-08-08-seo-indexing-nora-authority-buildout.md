# SEO, indexing, and Nora authority buildout

**Status:** deployed and verified in production
**Evidence date:** August 8, 2026
**Owner:** Healing Tides Collective

## Executive decision

The fastest defensible path is to repair Google's stale indexing state, strengthen `/about` as the canonical page for Nora L. Hollenkamp, and improve the seven genuine Nora-authored journal entries already on the site. We will not publish a large set of new keyword pages, fabricate first-person expertise, or redirect unrelated retired articles.

This is an evidence-led improvement of existing URLs. It preserves the site's calm editorial design and creates a clearer reader path from Nora's writing to her verified background and to the matching experience.

## Confirmed evidence

### Google Search Console

The Search Console property showed:

- **15 pages not indexed** and **1 indexed page** in the stored Page indexing report.
- **12 URLs** grouped under `Excluded by 'noindex' tag`.
- **3 URLs** grouped under `Discovered - currently not indexed`: `/journal`, Somatic Series Part 2, and Somatic Series Part 3.
- The only stored indexed URL was the retired article `/journal/awareness-was-never-the-problem`.
- The submitted sitemap was successful and had most recently been read on August 8.

The important live check changes the diagnosis: Search Console's live URL test for `/about` on August 8 reported **“URL is available to Google”** and said the page could be indexed. The current production response also has no `X-Robots-Tag: noindex` header and no robots meta noindex. Therefore the global noindex condition is no longer present; Google's report is reflecting an earlier crawl state.

The repository does not contain a rule that would emit the earlier global `X-Robots-Tag`. The exact origin of that historical header is unconfirmed and should not be presented as known.

### Search performance

The supplied three-month Search Console export covered May 7 through August 6:

| Metric | Result |
| --- | ---: |
| Clicks | 12 |
| Impressions | 56 |
| CTR | 21.4% |
| Average position | 9.8 |

This is a very small and primarily branded sample. The homepage received 11 clicks and 52 impressions. Somatic Series Part 1 received 1 click and 5 impressions. No non-brand query has enough evidence yet to be called a winner. The site is too new and too lightly indexed for click-based content pruning or confident traffic forecasts.

### Crawl and URL inventory

The live sitemap contains 15 public URLs. Public sitemap URLs returned `200`, without a noindex header or meta directive. The following decisions apply:

| URL or group | Current evidence | Classification | Action |
| --- | --- | --- | --- |
| `/about` | Live-indexable; stored GSC state is historical noindex | Canonical Nora entity page | Strengthen; add self-canonical, Person schema, verified expertise and Nora-authored article links |
| `/practitioners/nora-l-hollenkamp` | Old same-person profile; now 404 | Superseded duplicate | Permanent redirect to `/about` |
| `/journal` | Discovered, not yet crawled | Useful index page | Improve author positioning, self-canonical and internal paths |
| Seven current journal entries | Genuine Nora-authored content | Keep and improve | Clean heading structure, byline/entity links, presentation titles where supported, series and reader navigation |
| `/journal/awareness-was-never-the-problem` | Retired fabricated first-person source; 404; only stored indexed URL | Remove | Keep 404; Search Console temporary removal submitted August 8; do not redirect to an unrelated page |
| Other retired fabricated posts in `lib/retired-posts.ts` | Blocked from page, listing and sitemap | Remove | Keep 404 and code guard until CMS records can be removed by an authorized editor |
| `/resources/therapy-cost-minnesota` | Published source-backed Minnesota utility | Keep | Retain and use only where it is a natural next step |
| Thin city × specialty care pages | Already protected by a three-distinct-practitioner threshold | Conditional | Keep `noindex,follow` below the threshold; do not create thin Minnesota doorway pages |

### Technical issues found

- Several journal bodies contain a Portable Text `h1`, producing two H1 elements when combined with the page title.
- Nora's author record contains leading/trailing whitespace in the name and role; the presentation layer should trim it.
- Nora's article byline is text rather than a link to the canonical author/entity page.
- Journal Article JSON-LD does not currently connect Nora to `/about`.
- `/about` and `/journal` lack explicit self-canonicals.
- The old Nora practitioner URL has a true one-to-one replacement and should redirect permanently.
- **Resolved 2026-08-18:** the apex HTTPS host now redirects to canonical `www` with a permanent `308`. Plain HTTP still upgrades to HTTPS before the host redirect, but both hops are permanent and the final `www` URL returns `200` with a self-canonical.

## Nora evidence boundary

The following facts are already published and verifiable in the project and may be used without invention:

- Nora L. Hollenkamp, MSW, LICSW; she/her.
- Minnesota LICSW license number 25149, with a link to the Minnesota Board of Social Work lookup.
- MSW, University of Minnesota, 2016.
- Published experience across hospitals, schools, hospice and community settings. Duration claims require Nora to reconcile conflicting public profiles before reuse.
- Saint Paul in-person practice and telehealth across Minnesota.
- Published approaches and specialty areas already shown on `/about`.
- Seven current journal entries attributed to Nora in Sanity.

We will not add awards, memberships, outcomes, testimonials, personal history, clinical-review claims, or quotations that are not already evidenced. The existing endorsement remains unchanged.

Sanity is readable but the available CLI identity does not have authorized project write access. Body-level editorial changes therefore require Nora or another authorized Sanity editor. The code layer can safely improve titles presented to users, heading hierarchy, caveats, author linking and related navigation without pretending that Nora reviewed new prose.

## Search and competitor evidence

Localized Minneapolis SERP checks show three distinct patterns:

1. **Somatic therapy + Minnesota/Minneapolis/Saint Paul** is mainly provider and directory intent, led by local practices and large directories. Healing Tides does not yet have sufficient matching supply to justify thin local service pages.
2. **Somatic therapy vs. talk therapy**, **polyvagal theory explained**, and **neuroception** are informational intents. The last two require careful scientific framing because the underlying model is debated; they are not quick keyword expansions.
3. **Finding or choosing a therapist in Minnesota/Twin Cities** is a useful decision-making intent. Healing Tides already has a Twin Cities article that should be improved before another overlapping guide is created.

People-also-ask themes include what somatic therapy involves, what sessions cost, whether insurance covers it, and what happens during a session. These are useful future editorial inputs, not permission to make universal clinical or coverage claims.

The Similarweb endpoint gives directional domain-level estimates, not keyword demand. June estimates showed Psychology Today at a scale that is not comparable to Healing Tides; small Minnesota practices and organizations ranged from unmeasured to low-thousands estimates. Those values do not prove rankability and are not used as volume forecasts.

## Opportunity decisions

| Opportunity | Current page / metric | Recommended action | Priority | Evidence and constraint |
| --- | --- | --- | --- | --- |
| Restore public indexing | 12 historical-noindex URLs; live `/about` test now indexable | Deploy stronger canonical/entity signals, validate the noindex fix, request crawling for priority pages | P0 | Direct GSC stored + live tests |
| Nora authority/entity | `/about`; 0 URL-level performance isolated in export | Make `/about` the canonical Nora page and connect all genuine bylines and articles | P0 | Same-person old profile, verified credentials, seven authored posts |
| Somatic Series | Part 1: 1 click / 5 impressions / avg position 5.2; Parts 2–3 discovered | Clarify titles, enforce one H1, add series navigation and careful editorial context | P1 | Only non-home page with a click; SERPs show informational demand but medical framing risk |
| Finding a therapist in the Twin Cities | No reportable clicks in small export | Keep URL; improve title hygiene, author links and next-step navigation | P1 | Distinct local decision intent; existing content is the right asset |
| Therapy cost in Minnesota | New page, no GSC history | Retain; link only from related decision journeys | P1 | Local SERP questions and official-source utility; no performance history yet |
| New “somatic therapy Minnesota” landing pages | No current page and insufficient practitioner supply | Do not build yet | Hold | SERP is provider/local inventory intent; thin pages would not satisfy it |
| New choosing-a-therapist guide | Existing Twin Cities article overlaps | Gather Nora input and improve existing content first | Hold | Avoid cannibalization and invented expertise |
| Polyvagal/neuroception expansion | Existing Parts 2–3 | Require Nora/editorial and evidence review before substantive expansion | Hold | Scientific debate and YMYL trust risk |

## Implementation plan

The design direction is a calm, editorial, credentialed author experience for Minnesota care seekers and readers. It will keep the existing Fraunces/Inter typography, sand/charcoal/teal palette, spacious article rhythm and restrained motion. The signature differentiator is a connected **“Writing by Nora”** field-notes rail on her canonical page, not a generic SEO author box. No outside visual inspiration is needed because this extends the established system.

The coherent first release is:

1. Add a permanent old-profile-to-`/about` redirect.
2. Give `/about` a self-canonical, verified Person structured data and a live list of genuine Nora articles.
3. Add `/journal` self-canonical and a clear Nora editorial signal.
4. Trim author fields, link Nora's byline and author bio to `/about`, and connect Nora's Article schema to the same URL.
5. Make the visible article title and metadata more descriptive for the Somatic Series while preserving every URL.
6. Convert body-level H1 blocks to H2 so each article has one H1.
7. Add series/related navigation based on reader journey rather than sitewide cross-linking.
8. Add tests for presentation rules and structured data; run typecheck, unit tests, build, rendered HTML and browser checks.
9. After deployment, verify live headers/canonicals/redirects, start Search Console noindex validation and request indexing for a small set of priority URLs.

## Definition of done

- No public sitemap URL emits a noindex response or meta directive unless an explicit thin-page rule requires it.
- `/about` is the canonical Nora entity page in visible links and structured data.
- The old Nora profile permanently redirects to `/about`.
- Journal pages have exactly one H1 and preserve their current URLs.
- No fabricated or retired article is reintroduced or redirected misleadingly.
- Claims remain within the verified evidence boundary.
- Typecheck, tests, production build, crawl checks and mobile/desktop browser inspection pass.
- Independent technical SEO, search strategy, trust/claims, UX/conversion and adversarial reviewers complete their checks; findings are classified and resolved or explicitly deferred.

## Implementation record

The build now includes:

- `/about` as Nora's canonical entity page, with a verified-claims-only Person graph, a descriptive search title, an official Minnesota Board license-verification route, and a live Sanity-backed rail of selected genuine Nora articles.
- A permanent `308` from the superseded `/practitioners/nora-l-hollenkamp` profile to `/about`.
- A homepage server metadata wrapper so `/` has its own canonical while the immersive experience remains a client component; the first visual chapter now supplies the page H1.
- Self-canonicals and correct Open Graph URLs on `/`, `/about`, `/journal`, `/get-matched`, `/for-practitioners`, `/crisis`, `/practitioners`, and every journal entry.
- Crawlable, page-level `noindex,follow` on `/join`, `/sign-in`, and `/save-account`; they are no longer blocked in `robots.txt`, so a crawler can actually receive the directive.
- One-H1 journal structure, trimmed author fields, Nora byline links, per-article Open Graph URLs, Nora-connected Article structured data, and reviewer identity links that fail closed to plain text for anyone other than Nora.
- Descriptive, URL-preserving Somatic Series titles and descriptions, series navigation, source labels, and visible scientific-context notes. Explicit future CMS SEO titles retain precedence over code defaults.
- A current-state note and safer description for the Twin Cities therapist article, including an adjacent immediate-support route for the article's suicide-related language.
- Reader-journey links that show the Minnesota therapy-cost guide only where cost is a natural next step.
- No automatic FAQ rich-result markup; FAQ blocks remain visible reader content.
- The seasonal reflection is not promoted in the new Nora authority rail until its cold-plunge language receives a safety review.
- A mobile feedback control that becomes a compact bottom-left pill instead of covering the middle of article copy.
- A generated 1200×630 brand social image, with fallback Open Graph/Twitter metadata pointing to a real image and Organization schema pointing to the actual logo asset.
- Explicit duplicate handling for `/get-matched/form` and every practitioner-directory filter, using `noindex,follow` plus the clean parent canonical.
- Sitewide readable muted and teal tokens, plus a keyboard-contained feedback dialog with initial focus, Escape close and focus restoration.

## Review finding ledger

### Critical

No independent reviewer reported a critical finding.

### Major findings resolved in this release

- Added missing H1 and canonical/Open Graph signals on primary public routes.
- Changed account-door handling from robots-blocked/index-ambiguous to crawlable `noindex,follow`.
- Replaced the weak Nora search title with her full name and verified credentials.
- Added “somatic” and “Polyvagal Theory” context to the relevant Somatic titles without targeting local provider intent.
- Preserved explicit Sanity SEO-title precedence over presentation defaults.
- Removed the disputed “20+ years” duration from About metadata, visible copy, the README, and this evidence record.
- Removed invented wording that said a framework was used in Nora's practice.
- Replaced the broken Minnesota Board license URL with its current official verification landing page.
- Added a visible current-state correction to the stale prelaunch Twin Cities article, removed its obsolete prelaunch body blocks at presentation time, and stopped presenting its old “trusted practitioners” excerpt in search/listing surfaces.
- Removed repeated legacy Somatic title blocks while preserving the authored body and current URLs.
- Fixed the real `accepting` directory-filter key and classified the alternate matching form so parameter/intent duplicates cannot enter the index.
- Replaced the missing global social image, corrected the About portrait dimensions, and aligned structured-data modification dates with visible editorial updates.
- Made verified Nora credentials visible directly in article bylines.
- Corrected sitewide small-text contrast and completed modal focus behavior for the feedback panel.

### Major content debt explicitly held

- Somatic Parts 2–3 still contain body-level physiological claims that require Nora/authorized-Sanity editorial review. The release adds prominent, accurate warnings and balanced primary literature as an interim safeguard; it does not label those body claims settled science.
- The seasonal reflection's cold-plunge suggestion requires safety review in Sanity. It remains a genuine published article but is excluded from the new `/about` promotion rail.
- Nora's license status, fee, availability and other time-sensitive practice details should receive a dated official-source check before each substantive About-page refresh. The page gives readers the official Board route and does not claim a current verification date.

### Minor findings resolved

- Therapy-cost navigation is now intent-aware rather than a boilerplate link on every article.
- Journal introduction copy now says “featuring” Nora, so it remains truthful when another genuine author is published.
- Reviewers other than Nora no longer inherit a link to Nora's page.
- Polyvagal source anchors use bibliographic labels.
- The Twin Cities article's suicide-related language now has an adjacent crisis-support link.
- Automated source-contract tests now pin the homepage H1/canonical, primary route canonicals, account-door noindex behavior, redirect semantics, presentation rules and schema behavior.

## Verification record before deployment

- `npx tsc --noEmit`: passed.
- Vitest: **55 files / 564 tests passed**.
- `npm run build`: passed on Next.js 16.2.4; 23 static pages generated.
- Optimized local HTML crawl: primary public routes returned 200, self-canonical and one H1; journal Article JSON-LD parsed; old Nora profile returned `308 → /about`; retired fabricated article returned `404` with noindex.
- Mobile browser checks at 390 px: `/about`, Somatic Part 2 and the Twin Cities article each had `scrollWidth === innerWidth === 390`, one H1, no duplicate/stale opening headings, the updated bottom-left feedback control and the expected canonical. The feedback dialog received focus, exposed modal semantics and closed by keyboard.
- Desktop full-page browser inspection: calm editorial hierarchy, readable cards/links and no horizontal overflow.
- Final independent release judge: **APPROVE**, with no release blockers after a separate typecheck, 564-test run, production build and rendered-route audit.

## Production verification

- Production deployment from `main` commit `8fdcb18` completed August 8, 2026.
- A post-deploy crawl verified 200 responses, self-canonicals and one H1 on the primary indexable routes; `noindex,follow` on account doors, the alternate matching form and the filtered directory URL; `308 → /about` on the old Nora profile; and 404/noindex on the retired fabricated article.
- All 15 submitted sitemap URLs remained unique and indexable. The generated social image returned `200 image/png`, and no rendered page referenced the missing legacy `/og.jpg` path.

## Search Console actions

- A temporary removal request was submitted August 8 for the fabricated, already-404 `/journal/awareness-was-never-the-problem` URL so the only stale indexed result does not continue surfacing while Google recrawls it.
- The stored 12-URL noindex report is not treated as current truth: the August 8 live test for `/about` said it was available to Google and indexable.
- After production verification, Search Console validation was started for the historical 12-URL “Excluded by ‘noindex’ tag” issue on August 8.
- Search Console accepted indexing requests for the deliberately small priority set: `/about`, `/journal`, `/journal/somatic-series-part-1`, and `/resources/therapy-cost-minnesota`. Each was added to Google's priority crawl queue. These are discovery prompts, not indexing or ranking guarantees.
