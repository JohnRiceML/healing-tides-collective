# Milestones

High-level phase gates. Dates here lag the granular weekly plan in `timeline.md` — these are the moments worth celebrating (or panicking about).

> **Status (2026-05-31):** M0–M3 (Phase 1) are **done** — Phase 1 is live. M4/M5 predate the locked Phase 2 architecture (`../docs/architecture/PHASE-2-SYSTEMS.md`) and have been corrected to match it (Prisma/Postgres, not Sanity); their dates await the call recap + Phase 1 retro.

## M0 — Foundation locked
**Target:** 2026-05-03
- Domain owned
- All accounts created (GitHub, Vercel, Sanity, GA, GSC, Resend)
- Logo direction picked (one concept moves forward)

## M1 — Design system v1
**Target:** 2026-05-10
- Final palette + typography
- Logo delivered
- Sanity schema designed
- All v1 copy locked

## M2 — Build complete on preview
**Target:** 2026-05-17
- Landing page rendered end-to-end on Vercel preview
- Waitlist form → confirmation email working
- Analytics events firing
- Mobile responsive, Lighthouse ≥ 95 perf

## M3 — Phase 1 launch
**Target:** 2026-05-24
- Live on production domain
- GSC verified, sitemap submitted
- Waitlist signups flowing
- Phase 1 retro written

## M4 — Phase 2 scoped
**Target:** TBD (after the client call recap is processed + Phase 1 retro)
- Phase 2 product scope confirmed from the call recap (what we charge for, the matching + email flows)
- Practitioner + seeker + matching data model designed in **Prisma/Postgres** (owned by `db-architect` — NOT Sanity)
- Match logic v1 spec'd (rules-based)
- Seeker onboarding flow finalized

## M5 — Get Matched MVP
**Target:** TBD (post-M4 scoping)
- Auth live (Clerk: seeker / practitioner / admin)
- Seeker onboarding flow live, persisted to Postgres
- 10+ practitioners onboarded (in Postgres, not Sanity)
- First real match delivered to a real user
