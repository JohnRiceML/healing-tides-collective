# Moderation & visibility — the trust-&-safety pillar

How an admin takes a practitioner out of public view (and puts them back), and how that
stays in sync with Clerk. Built to be **simple now, a pillar later** — fake-account / abuse
handling layers on top of this without a rewrite.

## The model (two separate levers)

| Lever | Lives in | Controls | Who |
| --- | --- | --- | --- |
| **Visibility** (`PUBLISHED` / `DRAFT` / `HIDDEN`) | our Neon DB | what's public | practitioner (their own draft/publish) **and** admin (hold) |
| **Login** (banned / locked / deleted) | Clerk | whether they can sign in | admin (Clerk dashboard) |

**Public visibility is decided ONLY by our DB** (`lib/practitioners.ts` shows `PUBLISHED` only). Public
pages never call Clerk. So a Clerk ban alone does **not** hide a profile — the webhook below bridges that.

## Admin "Hold" (hide) — migration-free

Mirrors the verification-badge pattern: state lives under reserved `__`-prefixed keys in
`Practitioner.fieldValues`, which the practitioner's own save can never touch (`mergeFieldValues`).

- **Hold** (`/admin` → Visibility → Hold) sets `visibility = HIDDEN` and writes `__hold`
  `{ prev, message, internalNote, by, at }`. `prev` = where they were, so Release restores it.
- **Release** restores `visibility` to `prev` and clears `__hold`.
- `__holdHistory` is an append-only audit (who/when/why, capped at 50).
- A held practitioner **can still edit** but **cannot publish/unpublish** (guarded in
  `app/practitioner/publish-actions.ts`); they see a calm banner with `message` in their editor.
- Nothing is deleted. Soft-hide only.

Code: `app/_lib/moderation.ts` (pure helpers, unit-tested in `tests/moderation.test.ts`),
`app/admin/actions.ts` (`setProfileHold`), `app/admin/HoldControl.tsx` (UI).

## Clerk → DB sync webhook

`app/api/webhooks/clerk/route.ts` — on `user.deleted` or `user.updated` with `banned`/`locked`,
it auto-holds that practitioner's profile (`by: "system (Clerk webhook)"`). This is what keeps a
Clerk ban from leaving a live profile up, and also catches the "user deleted in Clerk but profile
still served" orphan case.

**Setup (one-time):**
1. Add `CLERK_WEBHOOK_SIGNING_SECRET` to Vercel env (Production + Preview).
2. Clerk dashboard → Webhooks → add endpoint `https://www.healingtides.co/api/webhooks/clerk`,
   subscribe to `user.updated` and `user.deleted`, copy its **Signing Secret** into the env var above.
3. Until configured, the route returns `501` (safe no-op).

Account **bans themselves** are still done from the Clerk dashboard; the webhook makes them reflect
on the site.

## Not built yet (deliberate)

- A dedicated `AdminAction` audit **table** (today: per-profile `__holdHistory` JSON). Promote when
  you want cross-practitioner audit/reporting.
- A **review-before-first-publish** gate (the dormant `NEEDS_REVIEW` state). Today practitioners
  self-publish; `/join` copy reflects that. The hold primitive is the same building block.
- An in-app "Remove from platform" button that bans in Clerk **and** hides in one click (today: two
  places — `/admin` hold + Clerk dashboard ban).
- Programmatic email (Resend). Today the admin reaches practitioners via the one-click `mailto` in
  `/admin` + the in-editor banner.
- True data **erasure** (GDPR-style). Today everything is soft-hide. A deliberate, legal-reviewed flow.
