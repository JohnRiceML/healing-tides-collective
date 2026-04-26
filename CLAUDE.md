# Healing Tides Collective — Project Context

## What this is
A modern wellness care-matching platform. Replaces overwhelming directories with a guided "Get Matched" flow that connects users to therapy, acupuncture, reiki, movement, trauma-informed care, and other clinical + holistic services. Two-sided product: users get clarity, providers get qualified referrals.

## Status
- **Phase 0 — Foundation** (started 2026-04-26)
- No code yet. Planning, design spec, and infra setup first.
- Phase 1 deliverable: landing page live on Vercel by 2026-05-24
- **Domain:** `healingtides.co` (owned by founder)

## Where to find things
- `README.md` — directory map and current status
- `planning/timeline.md` — dated deliverables, the source of truth for "what's next"
- `planning/setup-checklist.md` — every account / service / config to stand up (domain, Git, Vercel, GA, GSC, Sanity, Resend)
- `planning/decisions-log.md` — append entries here when a meaningful choice is made
- `docs/design-spec.md` — colors, type, motion, components
- `docs/personas.md` — Overwhelmed Optimizer, Practical Seeker, Curious Seeker
- `docs/positioning.md` — "decision-making tool for care, not a directory"
- `notes/initial-brief.md` — preserved raw founder notes

## Stack (intended, once code starts)
- **Framework:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **CMS:** Sanity
- **Hosting:** Vercel
- **Analytics:** GA4 + Google Search Console
- **Email:** Resend (for matching flow + provider outreach)
- **Forms / matching:** TBD — likely server actions + Sanity-backed practitioner records

## Working principles
- **Voice:** clear, grounded, human. Not clinical, not fluffy. Slightly elevated, approachable.
- **Design feel:** clean, calm confidence, warm tech, spacious, intelligent simplicity.
- **One entry point:** "Get Matched" — works for all three personas.
- **Avoid:** bright blues, dense directory-style listings, generic stock wellness photography.

## When in doubt
The strategic insight is: all three personas (Millennial / Gen X / Gen Z) want the *same thing* — clarity + confidence in choosing care. Tone adapts; the flow does not. Build one funnel, vary the language.
