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

## Push 2 — admin badge-granting (shipped, **no migration**)

The Neon connection strings are marked "Sensitive" in Vercel, so they can't be pulled to
run a migration without manual dashboard access. Rather than block on that, Push 2 ships
the admin-granted badges with **zero schema change**, storing them under a reserved key in
the existing `fieldValues` JSON:

- **Storage:** `fieldValues.__verified = ["licensed_professional", …]`. Only the admin
  action `setVerificationBadges` (`/admin/actions.ts`, `requireAdmin`-gated) writes it.
- **Self-claim guard:** `mergeFieldValues` (used by the practitioner's `saveProfile`)
  STRIPS any client attempt to set a `__`-prefixed key and PRESERVES the admin-set ones —
  so a practitioner can edit their own fields but never grant or wipe `__verified`.
- **Read:** `grantedBadgesFrom(fieldValues)` (read layer + admin data) → `verificationBadges`;
  `badgesFor()` merges `verificationBadges ∪ derived`. Display unchanged from Push 1.
- **Admin UI:** `/admin` has a per-practitioner toggle (`BadgeEditor`) for the six
  grantable badges; changes revalidate the directory + profiles immediately.

**To use it:** a user must have `User.role = ADMIN` (set out-of-band — needs DB access).

### Optional graduation to a dedicated column

If/when a migration is convenient (real Neon string in `.env.local` → `npm run db:migrate`),
add `verificationBadges String[] @default([])` to `Practitioner` and have `grantedBadgesFrom`
prefer the column, then the reserved key. Purely additive — no display or admin-UI change.

### Still ahead (not in Push 2)

Credential declaration form (PRODUCT-SPEC §9 groups A–F: license #, state, expiry, document
upload to Blob) — the inputs the admin reviews before granting a badge.
