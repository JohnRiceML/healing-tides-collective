# Trust & Verification

Implements PRODUCT-SPEC.md §9. Badges communicate **safety / training / expertise**
without implying every practitioner has the same licensure (Healing Tides holds both
licensed clinicians and wellness practitioners).

**Core rule: verified badges are ADMIN-GRANTED, never self-claimed.** A practitioner
can _declare_ credentials (free text, shown as letters after their name); only Healing
Tides can grant a ✓ badge.

## Badge tiers

| Badge | Granted by | Status |
|---|---|---|
| ✓ Licensed Professional | admin (active license verified) | Push 2 |
| ✓ Verified Credentials | admin (certification/training reviewed) | Push 2 |
| ✓ Advanced Certification | admin (specialized training verified) | Push 2 |
| ✓ Verified Identity | admin (gov-ID verified) | Push 2 |
| ✓ Insured Practitioner | admin (liability insurance verified) | Push 2 |
| 🤝 Community Partner | admin (partner org / group practice) | Push 2 |
| 🌊 Founding Member | **derived** from join date (< `FOUNDING_CUTOFF`) | **Push 1 — shipped** |

Source of truth: `app/_lib/verification.ts` (`BADGES`, `BADGE_ORDER`, `derivedBadges`,
`badgesFor`). Rendered by `app/_components/VerificationBadges.tsx` on cards + profiles.

## Push 1 — shipped (no DB change)

- The badge taxonomy + `<VerificationBadges>` component (calm, on-brand pills).
- **Founding Member** derived from `Practitioner.createdAt` — every current member
  qualifies (pre-launch). No migration: `createdAt` is an existing column added to the
  read layer's `CARD_SELECT` / profile select.
- Self-reported **credential letters** ("MSW, LICSW") shown after the name on profiles,
  sourced from `fieldValues.credentials` — clearly distinct from a granted badge.

## Push 2 — admin-granted badges (needs one migration)

Blocked only on DB access (restore `.env.local` → `vercel env pull .env.local
--environment=production`, then `npm run db:migrate`). Plan:

1. **Schema:** add `verificationBadges String[] @default([])` to `Practitioner`
   (+ optional `verifiedAt DateTime?`, `verifiedNote String?`). Migration via
   `npm run db:migrate`.
2. **Read layer:** add `verificationBadges` to `CARD_SELECT` / profile select.
   `badgesFor()` already merges `verificationBadges ∪ derived` — display needs no change.
3. **Admin grant UI:** under `/admin` (gated by `requireAdmin`), a per-practitioner
   badge editor + a `grantBadges` server action (writes the column; never client-trusted).
4. **Credential declaration:** add the credential-type taxonomy (PRODUCT-SPEC §9 groups
   A–F: licensed MH, medical/integrative, nutrition, movement/mind-body, recovery,
   holistic) to the practitioner form (license #, state, expiry, document upload to
   Blob) — the inputs the admin reviews before granting a badge.

Because the new column is only _read_ once it exists, Push 1 ships safely ahead of the
migration; Push 2 is additive.
