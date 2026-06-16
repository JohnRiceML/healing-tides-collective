# Pre-launch runbook

Do these **before** pointing real practitioners / real users at the site. They rotate the credentials that were shared in chat during setup, move auth + the database onto production-grade footing, and isolate test data from prod.

> **Who does what:** the dashboard steps (Neon, Clerk, Google Cloud, Vercel env) are **John's** — they need account access I don't have. I can update `.env.local`, push env via the Vercel CLI, and verify the result on request. Each step lists how to confirm it worked.
>
> **Env var reference** (names used by the app):
> - **Neon:** `DATABASE_URL` (pooled, app) · `DATABASE_URL_UNPOOLED` (direct, migrations)
> - **Clerk:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (`pk_…`) · `CLERK_SECRET_KEY` (`sk_…`)
> - **Sanity** (not secret, not rotated): `NEXT_PUBLIC_SANITY_PROJECT_ID` · `NEXT_PUBLIC_SANITY_DATASET`
>
> Vercel marks the Neon/Clerk integration vars **"Sensitive"**, so `vercel env pull` returns them blank — set values in the **Vercel dashboard** (Settings → Environment Variables), scoped to **Production / Preview / Development** as noted.

---

## 1. Rotate the Neon database password 🔴
The `DATABASE_URL` password (`npg_…`) was pasted in chat — rotate it.

1. **Neon Console** → your project → **Roles** (or *Connection Details*) → **reset/rotate** the role password.
2. Copy the new strings: the **pooled** connection string → `DATABASE_URL`, the **direct/unpooled** one → `DATABASE_URL_UNPOOLED`.
3. Update them everywhere:
   - **Vercel** → Settings → Environment Variables → update both, for **Production** (and Preview, until step 4 gives Preview its own branch).
   - **Local** `.env.local`.
4. **Redeploy** so the new env is picked up (push to `main`, or trigger a redeploy).

✅ **Verify:** the live editor (`/practitioner`) saves; `/practitioners` loads; no DB errors in Vercel → Logs.
ℹ️ If Neon was added via the Vercel Marketplace integration, rotating in the Neon console may auto-sync to Vercel — confirm the Vercel value matches the new string.

## 2. Clerk — production instance + key rotation 🔴
This removes the **"Development mode"** badge, gives real Google sign-in on the domain, and rotates the exposed dev keys.

1. **Clerk Dashboard** → create / enable the **Production** instance for the app.
2. **Google OAuth (your own creds — production Clerk requires them):**
   - **Google Cloud Console** → APIs & Services → **Credentials** → create an **OAuth 2.0 Client ID** (Web application).
   - Add the **Authorized redirect URI** that Clerk shows for the production instance (and the domain origin).
   - Paste the Google **client ID + secret** into **Clerk → SSO → Google**.
3. **Domain:** in Clerk, add `www.healingtides.co` and create the **DNS records** Clerk provides (the `clerk.*` / `accounts.*` CNAMEs) at your DNS host.
4. Copy the **production** keys: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (`pk_live_…`) + `CLERK_SECRET_KEY` (`sk_live_…`).
5. Update **Vercel (Production)** + local `.env.local`; **delete** the old `pk_test_…` / `sk_test_…` (the exposed dev keys then no longer matter).
6. **Redeploy.**

✅ **Verify:** `/join` + `/sign-in` show **no "Development mode" badge**; Google sign-in works end-to-end on `www.healingtides.co`; the card footer reads "Secured by Clerk" without the dev stripe.

## 3. Neon — Launch plan + backups 🟠
The Free plan keeps only ~6h of point-in-time recovery; real data needs more.

1. **Neon Console** → upgrade the project to **Launch** (7-day PITR).
2. *(Optional)* schedule a periodic `pg_dump` to object storage for an extra cold backup (PITR covers most cases).

✅ **Verify:** the project shows **Launch** + a 7-day history window.

## 4. Neon — dev branch (isolate test data) 🟠
Local + Preview currently share the prod DB; a branch isolates them so testing never touches real practitioner data.

1. **Neon Console** → **Branches** → create a branch (e.g. `dev`) off the main branch.
2. Point **local** `.env.local` `DATABASE_URL` / `DATABASE_URL_UNPOOLED` at the **dev branch** strings.
3. In **Vercel**, set the **Preview** env's `DATABASE_URL` / `DATABASE_URL_UNPOOLED` to the **dev branch** (keep **Production** on the main branch).

✅ **Verify:** a Preview deploy + local dev read/write the dev branch (check the row counts per branch in Neon), and Production is untouched.

## 5. ✅ Already done
- **Merge `feat/practitioner-listing-mvp` → `main`** — `main` is the production branch (Vercel auto-deploys it); **CI** (`tsc` + Vitest) gates every push/PR.

---

## After all steps
- Tick the boxes in [`docs/BUILD-TRACKER.md`](BUILD-TRACKER.md) § *Config owed by John*.
- Scrub any remaining exposed creds from notes / chat history.
- Smoke-test the full practitioner flow on prod with the new prod Clerk instance: sign up → build profile → publish → public page renders → appears in `/practitioners`.
