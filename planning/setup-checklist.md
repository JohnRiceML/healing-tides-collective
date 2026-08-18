# Setup Checklist

Every account, integration, and config required to stand up Phase 1. Check off as we go.

> **Status (2026-05-31):** Phase 1 is live — repo, Vercel, Sanity, GA, and the landing are done (see git history); §1–§10 below are now mostly a Phase-1 record. **Phase 2 backend provisioning (Neon / Clerk / Stripe) is in [§11](#11-phase-2--backend-services-provision-when-phase-2-build-starts).** Full env contract + patterns: `../docs/architecture/PHASE-2-SYSTEMS.md`.

---

## 1. Domain

- [x] **Domain selected: `healingtides.co`** (owned by founder as of 2026-04-26)
- [ ] Confirm registrar + access (founder to share login or transfer to shared registrar)
- [ ] Verify WHOIS privacy is on
- [ ] Verify auto-renew is on
- [ ] Move DNS to Cloudflare for cleaner management later (optional but recommended)
- [ ] Quick check: is `healingtides.com` available? If yes, consider grabbing it defensively to redirect → `.co` (prevents brand confusion later)
- [ ] Trademark sanity check (USPTO TESS — search "Healing Tides" wordmark)

**Note on `.co` vs `.com`:** `.co` is fine — used by major brands (Twitter's t.co, etc.) and recognized as legitimate. The only real cost is occasional user confusion typing `.com`. Mitigations: (a) own `.com` defensively if cheap, (b) make the URL prominent in marketing, (c) email forwarding from `@healingtides.com` if we own it.

---

## 2. GitHub

- [x] **Repo created: https://github.com/JohnRiceML/healing-tides-collective** (public, 2026-04-26)
- [x] `.gitignore` for Next.js included
- [x] Initial commit pushed (planning + docs + assets)
- [x] Default branch: `main`
- [ ] Add founder as collaborator (read access at minimum) — share GitHub username with John
- [ ] Decide whether to keep public or flip to private after launch (currently public per founder request)
- [ ] Branch protection on `main` (require PR — optional for solo, helpful if others join)

---

## 3. Vercel

- [ ] Create Vercel team / project
- [ ] Connect GitHub repo
- [ ] Configure environment variables (placeholders for now):
  - `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - `NEXT_PUBLIC_SANITY_DATASET`
  - `SANITY_API_TOKEN` (read-only for ISR)
  - `NEXT_PUBLIC_GA_MEASUREMENT_ID`
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL`
- [ ] Attach custom domain (after domain registered)
- [ ] Enable Vercel Analytics (optional, GA is primary)
- [ ] Enable preview comments for founder review

---

## 4. Sanity CMS

- [ ] Create Sanity project (free tier is fine for v1)
- [ ] Project name: Healing Tides Collective
- [ ] Dataset: `production`
- [ ] CORS origins: localhost + vercel preview + production domain
- [ ] Initial schema (designed in Week 2):
  - `homePage` (singleton — hero, sections)
  - `careType` (name, description, icon)
  - `siteSettings` (singleton — nav, footer, social)
- [ ] Create founder as editor user
- [ ] Generate read-only API token, store in Vercel env

---

## 5. Google Analytics 4

- [ ] Create GA4 property under personal/agency Google account
- [ ] Property name: Healing Tides Collective
- [ ] Time zone + currency set
- [ ] Capture measurement ID (`G-XXXXXXXXXX`)
- [ ] Configure events:
  - `page_view` (default)
  - `cta_click` (Get Matched, For Practitioners)
  - `waitlist_submit` (success)
  - `waitlist_error`
- [ ] Enable Google Signals (demographics) only if founder consents to ads remarketing later
- [ ] Set up conversion event for `waitlist_submit`

---

## 6. Google Search Console

- [ ] Create property (DNS verification preferred — easier across subdomains)
- [ ] Verify via Cloudflare TXT record
- [ ] Submit sitemap (`/sitemap.xml`) once site is live
- [ ] Link GA4 property to GSC
- [x] Set preferred domain: `www.healingtides.co` is canonical and the apex permanently redirects to it with `308` (verified 2026-08-18)

---

## 7. Resend (email)

- [ ] Create Resend account
- [ ] Add sending domain (e.g., `mail.healingtides.com`)
- [ ] Add DKIM, SPF, DMARC records to DNS
- [ ] Verify domain (Resend dashboard)
- [ ] Generate API key, store in Vercel env
- [ ] Create welcome email template (waitlist confirmation)
- [ ] From address: `hello@healingtides.com` (or founder's preference)

---

## 8. Logo + brand assets

- [ ] Three concept directions sketched (designer or AI-assisted)
- [ ] Direction picked
- [ ] Final SVG (master)
- [ ] PNG exports (transparent, light bg, dark bg) at 1x/2x/3x
- [ ] Favicon set (`favicon.ico`, `apple-touch-icon.png`, `icon-192`, `icon-512`)
- [ ] Open Graph image (1200x630, typographic on sand)
- [ ] Files committed to `assets/` in repo

---

## 9. Legal / housekeeping

- [ ] Privacy policy (Termly or hand-written — keep it short, plain English)
- [ ] Terms of service (Termly is fine for v1)
- [ ] Cookie consent banner (if GA is on — required for EU traffic; consider geo-gating)
- [ ] Founder email forwarder set up (`hello@healingtides.com` → personal email) — easy in Cloudflare Email Routing

---

## 10. Post-launch (first 7 days after Phase 1 launch)

- [ ] Confirm GA events firing for live traffic
- [ ] Confirm GSC isn't flagging crawl errors
- [ ] Check waitlist signups land in expected place
- [ ] Set up weekly digest of signups (Resend audience or simple email)
- [ ] Founder shares with first 20 contacts; collect qualitative feedback

---

## 11. Phase 2 — backend services (provision when Phase 2 build starts)

Provision via the **Vercel Marketplace** (auto-injects env vars). Each system is owned by an agent in `.claude/agents/`. Full env contract + the reference patterns: `../docs/architecture/PHASE-2-SYSTEMS.md`.

### Neon (Postgres) — the only datastore for now
- [x] Add the **Neon** integration from the Vercel Marketplace (Storage tab) — *done 2026-05-31*
- [x] **Leave the "Custom Prefix" field empty** — confirmed; injected `DATABASE_URL` (pooled) + `DATABASE_URL_UNPOOLED` (direct), plus harmless `PG*`/`POSTGRES_*` extras.
- [x] Prisma scaffolded (`prisma/schema.prisma`, `prisma.config.ts` — connection lives here in Prisma 7, *not* the schema — `lib/db.ts`; client → `lib/generated/prisma`). `tsc` passes.
- [ ] **Rotate the Neon password** (exposed in chat during setup), then `vercel env pull .env.local`.
- [ ] Run the first migration: `npm run db:migrate` (creates the `users` table).
- [ ] Do **not** add Blob / Upstash / Edge Config yet — only on a concrete trigger (see architecture doc)

### Clerk (auth)
- [ ] Add the **Clerk** integration from the Vercel Marketplace
- [ ] Env: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- [ ] Wire the `user.created/updated/deleted` webhook → local `User` mirror (svix-verified)
- [ ] Define roles: SEEKER / PRACTITIONER / ADMIN

### Stripe (billing)
- [ ] Create the Stripe account — **its own**, isolated to Healing Tides
- [ ] Env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, price ID(s)
- [ ] Wire the subscription/payment webhook → mirror state onto `User`
- [ ] **Open scope (needs the call recap):** what do we charge for, and are practitioners paid *through* the platform? If yes → **Stripe Connect** (bigger build). See architecture doc.

### Resend (extends §7)
- [ ] Verify `healingtides.co` as a sending domain in Resend (DKIM/SPF/DMARC) so `hello@healingtides.co` can send — until then, CTAs route to Nora's direct email (`EMAIL_FROM`)
