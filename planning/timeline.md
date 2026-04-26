# Timeline — Phase 1: Landing Page

**Kickoff:** 2026-04-26 (Sun)
**Phase 1 goal:** Landing page live with waitlist capture, GA + GSC verified, Sanity wired in for editable copy.
**Phase 1 launch target:** **2026-05-24 (Sun)** — 4 weeks.

---

## Week 1 — Foundation (Apr 26 → May 3)
**Theme:** Pin down identity, get accounts standing, no code yet.

| Date | Deliverable | Owner |
|---|---|---|
| ~~Mon Apr 27~~ | ~~Domain shortlist~~ — **DONE 2026-04-26: `healingtides.co` owned by founder** | ~~~~ |
| Mon Apr 27 | Confirm registrar access + WHOIS/auto-renew settings; check if `.com` is available for defensive purchase | Founder + John |
| Tue Apr 28 | GitHub repo created (private) | John |
| Wed Apr 29 | Vercel project created, linked to repo, custom domain attached (placeholder) | John |
| Wed Apr 29 | Sanity project created, dataset configured | John |
| Thu Apr 30 | GA4 property created, measurement ID captured | John |
| Thu Apr 30 | Google Search Console property created (DNS verification pending domain) | John |
| Fri May 1 | Resend account, sending domain DKIM/SPF records added | John |
| Fri May 1 | Logo direction approved (3 concepts → 1) | Founder |
| Sat May 2 | Decisions log updated; week 1 retro | John |

**Exit criteria:** domain registered, repo + Vercel + Sanity + GA + GSC + Resend all created and accessible; logo direction picked.

---

## Week 2 — Design & Copy (May 4 → May 10)
**Theme:** Lock visual system, write final copy. Still no production code.

| Date | Deliverable | Owner |
|---|---|---|
| Mon May 4 | Final palette + typography pair locked (`docs/design-spec.md` v1.0) | John |
| Tue May 5 | Logo final files (SVG, PNG, favicon set) | Designer / Founder |
| Wed May 6 | Hero + reassurance copy locked | Founder |
| Thu May 7 | "How it works" + practitioner section copy locked | Founder |
| Fri May 8 | Sanity schema designed (page sections, care types) | John |
| Sat May 9 | Sanity studio populated with v1 copy | Founder |

**Exit criteria:** every word that will appear on v1 is in Sanity; design spec is v1.0; logo is delivered.

---

## Week 3 — Build (May 11 → May 17)
**Theme:** Spin up landing page using Claude design.

| Date | Deliverable | Owner |
|---|---|---|
| Mon May 11 | Next.js 16 project scaffolded, Tailwind v4 configured with brand tokens | John |
| Tue May 12 | Hero + nav rendered from Sanity | John |
| Wed May 13 | All sections rendered; Framer Motion scroll-ins | John |
| Thu May 14 | Waitlist form → Resend confirmation email | John |
| Thu May 14 | GA4 + GTM (if used) wired in | John |
| Fri May 15 | Mobile responsive pass; Lighthouse ≥ 95 perf | John |
| Sat May 16 | Internal review with founder, copy + layout edits | John + Founder |

**Exit criteria:** site renders end-to-end on Vercel preview, waitlist works, analytics fires.

---

## Week 4 — Polish & Launch (May 18 → May 24)
**Theme:** Production hardening, soft launch.

| Date | Deliverable | Owner |
|---|---|---|
| Mon May 18 | Founder QA pass (every word, every link, every breakpoint) | Founder |
| Tue May 19 | OG image + favicons finalized | John |
| Tue May 19 | GSC verified, sitemap submitted | John |
| Wed May 20 | Final copy edits applied | John |
| Thu May 21 | Domain live on production (DNS cutover) | John |
| Fri May 22 | Soft launch to founder's network | Founder |
| Sat May 23 | First analytics review (do events fire? any 404s?) | John |
| Sun May 24 | **Phase 1 retro + Phase 2 kickoff doc** | John + Founder |

**Exit criteria:** site is live on the real domain, waitlist signups are flowing, GA + GSC are healthy.

---

## Phase 2 (preview, not yet scoped)
**Earliest start:** 2026-05-25
**Theme:** Get-Matched flow MVP — the actual matching tool.
- Practitioner schema in Sanity
- Onboarding questionnaire (likely 5–7 questions)
- Match logic v1 (rules-based, not ML)
- Match results screen
- Practitioner-side intake form

Phase 2 timeline TBD after Phase 1 retro. Don't pre-commit dates.

---

## Slip rules
- If a Week 1 item slips past Saturday, it pushes Week 2 back by the same amount. Don't compress design or copy time to recover.
- Logo is the single most likely critical-path delay. If it's not landed by **2026-05-08**, ship landing page with a typographic wordmark.
- Copy revisions late in Week 4 are normal — bake in a half day for them.
