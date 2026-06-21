# Credential validation — build brief for Greg

**For:** Greg (incoming dev) · **Date:** 2026-06-21 · **Owner sign-off:** John (build) + Nora (founder/clinical) + Christie (legal)
**Full scope + research:** [CREDENTIAL-VALIDATION-SCOPING.md](CREDENTIAL-VALIDATION-SCOPING.md) — read it for the per-credential breakdown, legal posture, and risks. This doc is the *how to build it here* hand-off.

Healing Tides is a calm, Minnesota-first wellness/therapy **practitioner directory** (Next.js 16 + Prisma 7 → Neon Postgres, on Vercel). When a practitioner claims a license/credential, we want to **verify it** and show a trustworthy badge. You're building that.

---

## ⚠️ Read this first — what's actually buildable
There is **no fully-automatic verification available today**: no MN licensing board offers a public API, and scraping their portals without written permission is a ToS/CFAA exposure. So:
- **Phase 1 (build now): admin-ASSISTED.** Make the founder's manual review fast + auditable — structured capture, deep-links to the public board lookups, an audit trail, honest badge copy. **No automation, no job, no scraping.**
- **Phase 2 (later, only if Nora commits): automation** via negotiated board access / a paid vendor / legally-reviewed scraping — *then* it becomes a background job. Don't build this for v1.

---

## 🏗️ Architecture — "Vercel background job or microservice?" (answered)
**Phase 1 needs neither.** Admin-assisted verification is **synchronous server actions** inside the existing Next.js app — the admin clicks "verify," opens the board lookup, marks the result. Exactly like the existing `setVerificationBadges` / `setProfileHold` / `createInvite` actions in `app/admin/actions.ts`. No cron, no service. **Just part of the app.**

**Phase 2 automation is a background job — and it lives *in this project*, not in a microservice.** When you add periodic re-checks, expiry reminders, or batch lookups, the pattern on Vercel is:
- A **Vercel Cron Job** (configured in `vercel.ts` / `vercel.json`) that calls an **API route** — e.g. `app/api/cron/verify-credentials/route.ts` — on a schedule (say daily).
- That route is a **queue processor**: query the DB for credential records *due for a check* (status `pending`, or a re-verify date has passed), process a **bounded batch** (stay under the 300s function timeout), update each record's status + write the audit trail, send any practitioner emails via the existing `lib/email.ts`.
- Secure it with a **`CRON_SECRET`** — verify the `Authorization: Bearer` header so only Vercel's scheduler (or you, manually) can trigger it.
- Make it **idempotent + bounded + flagged**: process N records/run, exponential backoff per source, and a `VERIFY_CREDENTIALS_ENABLED` env kill-switch so it's inert until switched on.

**Why in-project cron, not a microservice:** the work is light + infrequent, and it needs the *same* Prisma client, the *same* Neon DB, the *same* email layer, auth, and TypeScript types the app already has. A separate service would mean a second deploy, duplicated DB credentials + secrets, and cross-service coordination — all overhead, zero benefit at this scale. Keep it a cron-triggered route in this repo. *(If one lookup ever becomes long/heavy, or you need durable at-least-once processing across many records, the in-platform upgrade is **Vercel Queues** — still not a separate service.)*

Vercel context (current): Fluid Compute is the default runtime (full Node.js, 300s timeout, no edge limits); Vercel Cron triggers routes on a schedule; crons are declared in `vercel.ts`/`vercel.json`. All native, all in-project.

---

## What to build — Phase 1 (admin-assisted MVP, ~2–3 weeks)
Fits the **existing `__verified` badge system** (`app/_lib/verification.ts`) with **NO database migration** — everything is stored in reserved `__`-prefixed `fieldValues` JSON keys (the project's migration-free pattern; see [DB-OPERATIONS.md](../DB-OPERATIONS.md) + the `__hold`/`__verified`/`__presenceScan` precedent). **`mergeFieldValues` strips incoming `__` keys**, so a practitioner can never self-grant a badge — that guard is load-bearing.

1. **Credential taxonomy module** (`lib/credentials-taxonomy.ts`): ~10 MN credential types (LICSW, LMFT, LPCC, LADC, RN/APRN, LAc, RYT, Reiki, LMT), each tagged `verificationMethod: 'state_board' | 'directory' | 'manual_only'` + the public board-lookup URL for the licensed ones. **Single source of truth** — get the exact list from Nora (blocking, below).
2. **Structured credential form** in the practitioner editor: per-credential `{ type (dropdown), licenseNumber, state, expiresAt?, optional doc → Vercel Blob }`. Store practitioner claims under a new reserved key **`__credentialClaims`**.
3. **Admin Verification Hub** (extend `app/admin/BadgeEditor.tsx` or a new `CredentialVerificationManager.tsx`): a "pending review" list; per licensed credential a **"Open board lookup"** deep-link (admin clicks → reads the public MN portal → decides). For LMT/Reiki/RYT (no public authority): review the uploaded doc or accept self-reported.
4. **Grant via the existing `setVerificationBadges` action** + a **required notes field**.
5. **Audit trail** under a reserved key `__verificationAttempt`/history: `{ credential, status: pending|verified|notfound|lapsed, method: manual, verifiedBy, verifiedAt, notes }` — the legal due-diligence record on *every* grant.
6. **Honest badge copy** (exact wording from Christie): *"Licensed Professional — verified by Healing Tides on [DATE]; license active and in good standing on the verification date."* Hide unverified credentials in Phase 1.
7. **Backfill** existing practitioners' free-text `credentials` into `__credentialClaims` (status `pending`) so Nora has a worklist.

## Phase 2 — automation (the background job; only if Nora commits)
Promote storage to a real `CredentialVerification` table (a migration — founder-run, see DB-OPERATIONS.md), then add the **Vercel Cron route** described above to process due records via the chosen path (negotiated board access / paid vendor / legally-reviewed scraping). Lapsed-credential handling: **never** silently pull a badge — 7-day grace + email first (Christie signs off the policy).

---

## Guardrails (non-negotiable)
- **No scrapers / cron / programmatic board queries in the MVP** — ToS/CFAA exposure; needs Christie first.
- **PII:** store only name + license# needed for lookup; **never log license numbers**; uploaded docs are admin-only in Blob, never shown to seekers; retain ~2 yrs after revocation then soft-delete. Test with **synthetic** license #s only (e.g. `MN1234567`), never real ones.
- **Liability:** a badge implies due diligence — the audit trail + "active on [DATE]" wording are what keep that defensible.
- The verified badge feeds matching as a **trust boost, never a hard gate** (reiki/yoga/massage have no licensing authority — don't bury them).

## Blocking prerequisites + open decisions
- **🔒 Owed by Nora (blocks the taxonomy + form):** the shortlist of ~10 credential types + the 3–5 priority MN boards. Confirm this is in hand before coding the taxonomy module.
- **Christie (legal):** exact badge wording; the lapsed/disciplined-license policy; whether/when Phase-2 automation is allowed (and which path).
- Full decision table in [CREDENTIAL-VALIDATION-SCOPING.md](CREDENTIAL-VALIDATION-SCOPING.md).

## Working in this repo
- **Stack:** Next.js 16 App Router (read `node_modules/next/dist/docs/` — it has breaking changes vs. older Next), React 19, Tailwind v4, Prisma 7 → Neon, Clerk auth. Calm/trauma-informed voice ("practitioner" not "provider") — design canon: `docs/design/STYLE-GUIDE.md`.
- **DB:** migration-free reserved keys for the MVP (no migration). If Phase 2 needs a table, migrations are **founder-run** via the safe flow — [DB-OPERATIONS.md](../DB-OPERATIONS.md). Never accept a `prisma migrate` reset prompt.
- **Ship loop:** branch → `npx tsc --noEmit` + `npx vitest run` + `npm run build` + secret-scan the diff → commit → (founder approves) merge to `main` (Vercel auto-deploys). Add a flow test: *practitioner adds credential → admin verifies → badge appears → audit entry written*.
- **Existing pieces to reuse:** `app/_lib/verification.ts` (badges), `app/admin/actions.ts` (action patterns), `lib/email.ts` (sending), `app/_lib/profile-fields.ts` (the form config), the `db-integrity` / `db-architect` agents in `.claude/agents/` (PII + schema review).
