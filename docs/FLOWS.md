# Healing Tides — flows catalog & checklist

Every flow in the system: what it does, the route/trigger, and its status. Use it as a **reference** (what exists) and a **checklist** (tick a flow once you've confirmed it live). Companions: [EXPERIENCE-MAP](architecture/EXPERIENCE-MAP.md) (the journeys), [PROD-TEST-PLAN](PROD-TEST-PLAN.md) (how to validate each on prod), [SYSTEM](SYSTEM.md) (where the code lives).

**Legend:** ✅ built & live · 🟡 partial · 📋 designed, not built · ⏸ parked · ⚙ needs config
**Scope:** Minnesota-only (v1) — see [SYSTEM § Scope](SYSTEM.md).

---

## 1 · Seeker / public (no account)
- [ ] ✅ **Land + explore** — `/` chapter-scroll landing → About (Meet Nora), Journal.
- [ ] ✅ **Browse the directory** — `/practitioners` → filter (specialty · format · region · ages · accepting-new) + free-text search + sort.
- [ ] ✅ **View a practitioner** — `/practitioners/[slug]` → bio, specialties, quick-details, contact/booking link, `Person` JSON-LD.
- [ ] 📋 **Get matched (guided)** — today the "Get matched" bar is a `mailto`. The guided seeker intake → ranked match is *designed* (the matching brief) and gated on Nora + the PHI/crisis decisions.
- [ ] ✅ **Crisis resources** — `/crisis` + the 988 line in the footer sitewide.

## 2 · Practitioner — onboarding & profile
- [ ] ✅ **Sign up** — `/join` (Clerk + Google) → lands on the dashboard.
- [ ] ✅ **Sign in** — `/sign-in` (returning practitioner).
- [ ] ✅ **Import-first onboarding** — paste a bio / drop profile URLs → Claude extracts → fills empty fields (never overwrites typed values).
- [ ] ✅ **Build / edit profile** — `/practitioner/edit` 4-step wizard (Basics · Practice details · Your voice · Review). Saves between steps; completeness % updates.
- [ ] ✅ **Publish / unpublish** — publish-gate (name + bio required) → appears in `/practitioners` + gets its SEO page. Unpublish removes it.
- [ ] ✅ **Dashboard** — `/practitioner` → profile strength, "your brand" band, "how people find you."
- [ ] ✅ ⚙ **Account deletion** — Clerk `UserButton` → delete → profile hides. *(Hide, not hard-erase — erasure semantics are a pending Christie decision.)*

## 3 · Practitioner — brand center *(the flagship retention surface)*
- [ ] ✅ **Open brand center** — `/practitioner/brand` → 5-part framework (who you are · for · found · trusted · remembered) as growing moons + demoted progress scores.
- [ ] ✅ ⚙ **Visibility audit** — "Check my visibility" → real Google SERP + map-pack (Serper) → the moons/scores move; cached to a reserved key. *(needs `SERPER_API_KEY`)*
- [ ] ✅ **Seeker-mirror** — what nearby seekers actually search (their questions + words), MN-targeted.
- [ ] ✅ **Momentum** — gain-only "how your presence is growing" over time.
- [ ] ✅ **Start here** — one grounded next step (a free Google Business Profile when not on the local map).

## 4 · Claim flow (waitlist → practitioner) · *live since the migration*
- [ ] ✅ **Admin mints a claim link** — `/admin` → "Create claim link" (name + email + region) → tokenized URL, no Practitioner row created.
- [ ] ✅ ⚙ **Invite delivered** — auto-emails the link when configured; always copyable. *(needs `EMAIL_FROM`)*
- [ ] ✅ **Claim** — `/claim/[token]` → sign up with the **invited email** (email-matched) → "Finish claiming" on the dashboard → profile prefilled from the invite.
- [ ] ✅ **Claimed-once guard** — atomic claim (no double-claim race), no duplicate rows, surfaced failures.

## 5 · Admin cockpit *(launch-rollout control)* ⚙ needs `ADMIN_EMAILS`
- [ ] ✅ **Admin gate** — `/admin` ADMIN-only (404 for everyone else); `noindex`.
- [ ] ✅ **Practitioner list** — stats + table with **search (name/email) + status filter** (All / Published / Drafts / On hold / Needs review).
- [ ] ✅ **Invites management** — the sent-invites list: status (pending/claimed) · copy link · **resend** · **revoke** (unclaimed only — never deletes a claim).
- [ ] ✅ ⚙ **Completeness reminders** — "Send N reminders" to under-80% practitioners (7-day cooldown, skips held). *(needs `EMAIL_FROM`)*
- [ ] ✅ **Verification badges** — grant/revoke; shows on the public profile immediately.
- [ ] ✅ **Moderation** — hold (hides from public + practitioner banner, non-destructive) / release.

## 6 · System / background
- [ ] ✅ ⚙ **Email send** — Resend, fetch-based, never-throws; powers invites + reminders. *(needs `EMAIL_FROM` + verified domain)*
- [ ] ✅ ⚙ **Clerk → DB sync** — webhook (`/api/webhooks/clerk`): `user.updated`/`deleted` → auto-hide a banned/deleted account. *(needs `CLERK_WEBHOOK_SIGNING_SECRET`)*
- [ ] ✅ **Profile-view instrumentation** — `ProfileView` → the dashboard 7-day trend.
- [ ] ✅ **Visibility-scan cache** — `__presenceScan` + `__presenceScanHistory` reserved keys (migration-free).
- [ ] ✅ **Safe DB migrations + backups** — `db:migrate:safe` → review → `db:migrate:deploy`; `db:backup`; the 5 DB-expert agents. See [DB-OPERATIONS](DB-OPERATIONS.md).

## 7 · Designed / future (not built)
- [ ] 📋 **Seeker guided intake → matching** — the brief's actual thesis. Drafted ([MATCHING-BRIEF-DRAFT](product/MATCHING-BRIEF-DRAFT.md)); gated on Nora's brief + the PHI/crisis decisions.
- [ ] 📋 **Credential validation** — admin-assisted MVP scoped + handoff-ready for Greg ([FOR-GREG](product/CREDENTIAL-VALIDATION-FOR-GREG.md)); blocked on Nora's credential shortlist.
- [ ] 📋 **Admin command center (full)** — the 8-section dashboard; needs Nora's sketch.
- [ ] 📋 **Out-of-state handling** — MN-only message/waitlist UX; Nora's call on tone.
- [ ] ⏸ **Stripe / billing** — parked (last); schema fields ready, wired when pricing's set after the free-intro window.

---

**How to use this as a checklist:** the ⚙ flows need their config set first (see [PROD-TEST-PLAN § 0](PROD-TEST-PLAN.md)). Walk each ✅ flow on the live site and tick it; the 📋/⏸ rows are the forward roadmap, not things to test yet.
