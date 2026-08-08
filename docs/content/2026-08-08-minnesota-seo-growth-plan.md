# Minnesota SEO growth plan — evidence baseline + first build

**Date:** 2026-08-08
**Status:** P1 implemented; measure before expanding
**Sources:** Google Search Console (live property), Serper.dev (Minneapolis-localized Google
results), Similarweb Insights (2026-06 directional estimates), live Healing Tides site/code,
official Minnesota sources.

## Executive decision

Build one genuinely useful Minnesota access page before adding more journal volume:
`/resources/therapy-cost-minnesota`.

The page does not attempt to summarize volatile Minnesota insurance law. It helps a seeker get the
four answers that determine the real price: provider fee, exact network status, plan cost-sharing,
and the correct official directory or complaint route. This follows the repo's prior two-round
content audit, which found statute-restating pages did not converge to publishable accuracy.

Do **not** build Minneapolis modality/city pages yet. Current SERPs reward real local inventory and
the live directory does not yet have enough published supply. Those pages would be doorway content,
not a better result.

## Healing Tides factual profile

- Minnesota-only guided matching across therapy, acupuncture, reiki, movement and
  trauma-informed support.
- Differentiator: a person reads what the seeker sends and narrows the options; the product is not
  positioned as an automated ranking wall.
- Public conversion paths: `/get-matched`, `/practitioners`, practitioner profile pages.
- Editorial journal is Sanity-backed. The new therapy-cost page is a maintained routing utility,
  not a clinician-bylined article.
- The public directory currently has insufficient local supply for indexable city × specialty
  pages. The three-practitioner indexability guard stays in force.

## GSC baseline (2026-05-07 through 2026-08-06)

| Metric | Baseline |
|---|---:|
| Clicks | 12 |
| Impressions | 56 |
| CTR | 21.4% |
| Average position | 9.8 |
| United States | 12 clicks / 54 impressions |
| Mobile | 6 clicks / 28 impressions / position 6.6 |
| Desktop | 6 clicks / 28 impressions / position 13.1 |

Reportable queries were almost entirely branded:

| Query | Clicks | Impressions | CTR | Position | Interpretation |
|---|---:|---:|---:|---:|---|
| healing tides acupuncture | 1 | 17 | 5.9% | 9.3 | Brand + modality; homepage must explain MN scope clearly |
| healing tides | 0 | 4 | 0% | 44.3 | Ambiguous brand term |
| healing tide | 0 | 2 | 0% | 50.0 | Ambiguous singular variant |

Top reportable pages:

| Page | Clicks | Impressions | CTR | Position |
|---|---:|---:|---:|---:|
| `/` | 11 | 52 | 21.2% | 10.2 |
| `/journal/somatic-series-part-1` | 1 | 5 | 20% | 5.2 |
| `/journal/awareness-was-never-the-problem` | 0 | 2 | 0% | 2.0 |

**Conclusion:** the property is too young for GSC to reveal non-brand winners. There is no
positions-4–20 non-brand cluster to optimize yet. SERP fit and product credibility must choose the
first page; GSC becomes the measurement system after launch.

## Minnesota SERP evidence appendix

Serper searches were run on 2026-08-08 with Google localized to Minneapolis, Minnesota. Serper
shows result composition, not search volume. No keyword-volume source was available, so this table
supports intent and competitive-fit judgments only; it does **not** validate demand.

| Query | Dominant result types / representative domains | SERP feature observed | What the evidence supports |
|---|---|---|---|
| `somatic therapy minneapolis` | Directory + local practices: `psychologytoday.com`, `mendmn.com`, Goldenrod, Beginnings & Beyond, The Growlery | Local results / organic directory mix | Supply and real local practice relevance are table stakes |
| `trauma informed therapist minneapolis` | Directories + local clinics | Local/organic mix | A thin city template would not improve the result set |
| `therapy cost minnesota` | Physical-therapy noise, practice fee pages, `simplepractice.com`, `lifestance.com`, `growtherapy.com` | Mixed intent | A neutral verification utility is differentiated; demand remains unknown |
| `does insurance cover therapy minnesota` | State/insurer pages, marketplaces, local practices | Organic informational | Official routing can improve usefulness |
| `therapists who accept medical assistance minnesota` | Directories + `mn.gov/dhs` | Official result prominent | DHS routing belongs in the consolidated guide |
| `out of network therapy reimbursement minnesota` | National explainers and marketplaces | People Also Ask on reimbursement amount / self-pay cost | High claim risk; teach which plan-specific numbers to request |
| `how to choose a therapist minnesota` | Local clinics, University of Minnesota, APA, directories | Organic informational | Credible only with a real Nora-led point of view |
| `somatic therapy vs talk therapy` | Commercial blogs, Reddit, Quora, Facebook | People Also Ask on fit/effectiveness | Opportunity is plausible, but requires clinical review |

### Local finder terms — valuable, but not credible yet

- `somatic therapy minneapolis`: Psychology Today plus real local practices (Mend, Goldenrod,
  Beginnings & Beyond, The Growlery); Reddit also ranks. Google wants directories with inventory or
  a practice that actually provides the service.
- `trauma informed therapist minneapolis`: Psychology Today, MN Trauma Project and local clinics.
- `acupuncture minneapolis`: local clinics dominate; Yelp and a community-acupuncture result also
  appear.
- `reiki minneapolis`: Minnesota Reiki Center and individual local practitioners dominate.
- `therapist accepting new clients minneapolis`: large directories and clinics with live
  availability dominate.

Healing Tides should enter these SERPs only when it can render several published, relevant local
profiles and verify availability. Until then, the page type Google rewards is not one Healing Tides
can truthfully supply.

### Cost and access — the clearest gap

- `therapy cost minnesota`: mixed intent and a weak result set—physical therapy noise, individual
  fee pages, national averages and provider sales pages. No result gives Minnesotans a concise
  process for determining *their* number.
- `does insurance cover therapy minnesota`: insurer pages, national marketplaces and individual
  practices. They answer from their own product perspective; the neutral routing layer is missing.
- `therapists who accept medical assistance minnesota`: directory-heavy. The official DHS result
  explains the important fee-for-service versus managed-care routing distinction, but searchers
  have to find and interpret it themselves.
- `out of network therapy reimbursement minnesota`: national reimbursement content dominates;
  People Also Ask focuses on reimbursement amount and Minnesota self-pay cost. This topic has high
  utility but high claim risk, so the P1 page teaches which numbers to request rather than promising
  a percentage.

### Decision content — credible P2

- `how to choose a therapist minnesota`: a local clinic, University of Minnesota, APA and large
  directories rank. Healing Tides has strong product alignment, but this deserves a real Nora-led
  perspective rather than generic generated advice.
- `somatic therapy vs talk therapy`: weak commercial blogs, Reddit, Quora and Facebook occupy much
  of page one; People Also Ask includes effectiveness, downsides and fit. The gap is real, but a
  responsible answer requires clinician authorship/review and first-hand practice context.

## Similarweb competitor read (directional, not keyword evidence)

Snapshot: June 2026.

| Domain | Est. monthly visits | Direction / implication |
|---|---:|---|
| psychologytoday.com | 19.8M | Massive directory authority; do not imitate its inventory game |
| growtherapy.com | 7.3M | Growing national booking/insurance marketplace; strong transactional depth |
| lifestance.com | 2.0M | Large provider network; brand and insurer/location pages |
| therapyden.com | 313K | Smaller directory, still far beyond HTC's current inventory |
| therapy-mn.com | 18.4K | Local practice can win qualified terms with specific service pages |
| mendmn.com | 5.5K | Small local practice ranks for somatic intent through genuine specialty relevance |
| mntraumaproject.org | 1.6K | Tiny site can rank with a real Minnesota trauma directory/entity |
| healingtides.co | below Similarweb measurement | GSC is the reliable baseline |

The endpoint exposed only domain-level estimates for this pass—not landing pages, keyword themes,
traffic-source splits or audience overlap—so none of those unavailable fields informed the score.
The small local winners matter more than the large-site totals: the observed SERPs include small
Minnesota sites when a page represents a real practice, directory or local authority. Healing Tides
therefore needs useful original routing and real practitioner supply, not scaled templates.

## Editorial opportunity score (initial hypothesis)

These values are a prioritization heuristic, not keyword-volume or ranking forecasts. Each dimension
is 0–5: **Demand proxy** (0 = no evidence, 1 = one relevant SERP observation, 2 = several
intent-confirming SERP observations but no quantified demand, 3 = repeat GSC impressions or
corroborated third-party volume, 5 = sustained qualified GSC demand);
qualified intent; HTC differentiation; current feasibility; competition attainability based on
observed result types; and genuine Minnesota utility. Maximum 30. Because GSC has no reportable
non-brand demand and no volume source was available, every new cluster is capped at 2 for demand.

| Opportunity / cluster | Current HTC page metrics | Demand | Intent | Difference | Feasible | Attainable | MN utility | Total | Action / priority | Evidence |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| Therapy cost + insurance routing in MN | No page / no GSC data | 2 | 5 | 5 | 5 | 4 | 5 | **26** | **P1 measured experiment** | Mixed/weak SERP; official-routing gap |
| Homepage: explain Minnesota human matching | 11 clicks / 52 impressions / pos. 10.2 | 2 | 5 | 5 | 5 | 4 | 5 | **26** | **P1 improve** | GSC page data + branded query mix |
| How to choose a therapist in MN | No page / no GSC data | 2 | 5 | 5 | 3 | 3 | 4 | **22** | P2, Nora-led | Local clinic + U of M + APA results |
| Somatic therapy vs talk therapy | Related journal page: 1 click / 5 impressions | 2 | 4 | 4 | 2 | 4 | 2 | **18** | P2, clinician-reviewed | Weak commercial/community SERP; PAA risk |
| Medical Assistance therapist finder page | No page / no GSC data | 2 | 5 | 3 | 3 | 2 | 5 | **20** | Consolidate into P1; re-evaluate | Directory-heavy SERP + DHS official route |
| Minneapolis modality/city pages | Guarded/no indexable supply | 2 | 5 | 2 | 0 | 1 | 2 | **12** | **Reject now** | Real practices/directories dominate |
| Broad `therapy minneapolis` | Guarded/no indexable supply | 2 | 5 | 1 | 0 | 0 | 2 | **10** | **Reject** | Inventory-led local intent |
| Generic `benefits of reiki/acupuncture` | No relevant page metrics | 2 | 2 | 1 | 2 | 1 | 0 | **8** | **Reject** | Low local/product differentiation |

## P1 brief — implemented

**URL:** `/resources/therapy-cost-minnesota`
**Intent:** understand the likely cost of therapy and what to verify before choosing a practitioner
**Primary cluster:** therapy cost Minnesota; does insurance cover therapy Minnesota
**Secondary cluster:** therapists who accept Medical Assistance Minnesota; out-of-network therapy
reimbursement Minnesota; self-pay therapy questions
**Audience:** a Minnesota seeker who has a name or shortlist but does not yet know the real price
**Reason to exist:** current results give averages, single-practice fees, directories or insurer
sales answers. The missing layer is a neutral sequence for obtaining a plan-specific number.
**Angle:** “Ask for the fee. Confirm the network. Write down the plan's answer and call reference.”
**Title:** Therapy costs in Minnesota: what to ask — Healing Tides
**H1:** What will therapy actually cost?
**CTA:** Get matched; budget, location and format become part of the request
**Schema:** WebPage only; FAQ markup deliberately omitted because it is not a current Google Search enhancement
**Evidence:** MNsure plan comparison/types; DHS provider routing; MDH general regulator routing;
Minnesota Commerce mental-health coverage/complaint route
**Claims deliberately excluded:** a universal Minnesota price, typical reimbursement percentage,
coverage guarantee, legal rights summary, payer-specific benefit promises, availability counts.

## Content architecture + internal linking

```text
Homepage (clear Minnesota + human-matching entity description)
  ├── Get matched
  ├── Practitioner directory / profiles
  ├── Therapy-cost Minnesota resource
  │     ├── MNsure official comparison + plan types
  │     ├── DHS MHCP provider routing
  │     ├── MDH regulator routing + Commerce mental-health coverage help
  │     ├── Get matched
  │     └── Practitioner directory
  └── Journal
```

The resource is linked in the app-wide footer and sitemap. It links into both conversion paths and
to the official entities that own changing plan information. It does not compete with practitioner
profiles or care pages.

## Technical SEO implemented (deployment pending)

- Unique title, description, canonical, Open Graph and Twitter metadata.
- One H1 with a descriptive heading hierarchy.
- WebPage JSON-LD matching visible content; no obsolete FAQ rich-result claim.
- Sitemap entry with last-modified date.
- Global footer link prevents orphaning.
- Homepage metadata now names Minnesota and human-guided matching.
- Care-page link eligibility corrected: distinct-practitioner counting, fail-closed metadata, and
  filter-before-limit mesh selection.

## Measurement plan

Use 2026-08-08 as the launch boundary. Check at 14, 30, 60 and 90 days; do not judge the page in the
first week.

1. Indexing: resource discovered, crawled and indexed; canonical selected as `www` URL.
2. Query growth: non-brand impressions for the primary/secondary clusters.
3. Rankings: number of queries in top 50, top 20 and top 10; avoid celebrating average position
   without impressions.
4. CTR: title/description performance once impressions exceed a useful sample.
5. Organic entrances and clicks into `/get-matched` or `/practitioners` (GA4).
6. Cannibalization: confirm the resource owns cost/coverage queries and practitioner pages own
   name/service queries.

## Next content gates

1. **Nora-led choosing-care guide:** build only with her direct perspective, not generated
   clinician voice.
2. **Somatic vs talk therapy:** proceed only with a named clinical reviewer and primary clinical
   sources; answer fit and tradeoffs, not “which is better.”
3. **Local modality pages:** the enforced automated gate is currently at least three distinct
   published practitioners for the city × specialty. Unique local editorial utility is the next
   gate to build before treating those routes as a content-growth program; it is not enforced yet.
4. **Medical Assistance expansion:** split from the cost resource only after GSC shows enough query
   demand to justify a separate intent; otherwise keep the cluster consolidated.

## Rejected high-volume work

- Broad `therapy minneapolis`, `acupuncture minneapolis`, `reiki minneapolis`: the searcher wants a
  provider now. Without real relevant supply, Healing Tides would be a worse answer.
- One page per Minnesota city: thin localization and guaranteed cannibalization at current scale.
- Generic modality-benefit articles: weak differentiation, lower conversion intent and elevated
  health-claim risk.
- Statute-heavy insurance explainers: two independent audit rounds already showed non-converging
  accuracy failures. Route to the authority instead.
