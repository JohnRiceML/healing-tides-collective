# Healing Tides — flow details (step-by-step)
Every flow traced from the **actual code** — its trigger, ordered steps, the data/state it touches, the key files, and edge-cases/guards. Generated 2026-06-24 by reading the routes/actions/components. High-level catalog: [FLOWS.md](FLOWS.md) · how to validate live: [PROD-TEST-PLAN.md](PROD-TEST-PLAN.md).
> Steps read as **Actor: action → System: response**. Scope: Minnesota-only (v1).

---

## 1 · Seeker / public

### Browse the directory  ·  ✅ Live
**Trigger:** GET /practitioners with optional filter query params

**Steps:**
1. Seeker: Navigates to /practitioners with optional params (specialty, modality, region, ageGroups, q, accepting, sort)
2. System: app/practitioners/page.tsx reads and cleanses searchParams; calls getPublishedPractitioners with filter object
3. System: buildPractitionerWhere() constructs where clause: visibility=PUBLISHED, slug/displayName not null, plus JSON filters and free-text OR search
4. System: DB query returns up to 200 published rows, ordered by recommended (featured/completeness/updatedAt) or newest or name
5. System: Maps rows to PractitionerCard type, derives title/cover/badges from fieldValues JSON
6. System: Calls getDistinctRegions() to populate Location filter dropdown
7. System: Renders DirectoryFilters form (GET /practitioners) with 5 dropdowns + search + checkbox + Apply button
8. System: Renders practitioner grid (3 cols on lg) with each card linking to /practitioners/[slug]
9. System: Renders SortSelect (client island) with Recommended/Newest/Name options; onChange navigates preserving filters
10. System: Renders GetMatchedBar sticky pill at page bottom with CTA to mailto:hello@healingtides.co

**Touches:** practitioner table (visibility=PUBLISHED, slug, displayName, specialties, modality, region, fieldValues JSON) · fieldValues JSON keys: title, cover_design, cover_color, availability_state, age_groups
**Files:** `app/practitioners/page.tsx` · `lib/practitioners.ts` · `app/practitioners/_components/DirectoryFilters.tsx` · `app/practitioners/_components/SortSelect.tsx` · `app/practitioners/_components/GetMatchedBar.tsx`

**Edge cases / guards:**
- Empty directory: renders empty state 'The collective is just getting started'
- Filter returns zero results: renders 'No matches just yet' with clear-filters link
- Search spans displayName/bio/region/values fields; no insurance filter (unverified)
- Age groups and availability state via Prisma JSON path operators on fieldValues

### View a practitioner profile  ·  ✅ Live with instrumentation
**Trigger:** GET /practitioners/[slug]

**Steps:**
1. Seeker: Clicks practitioner card from directory or navigates to /practitioners/[slug]
2. System: app/practitioners/[slug]/page.tsx reads slug, calls getPractitionerBySlug(slug)
3. System: Query Practitioner where visibility=PUBLISHED and slug match; returns null if not found
4. System: If null, notFound() renders 404 page
5. System: Extracts profile: displayName, bio, specialties, modality, region, title, credentials, website, gender, insuranceAccepted, fieldValues JSON
6. System: Generates metadata (title, description from bio/values lead, canonical URL, OG image) and Person JSON-LD schema
7. System: Renders hero: ProfileCover (seed/design/color), overlapping portrait photo or initial avatar, name, credentials, region, verification badges
8. System: Renders primary CTAs: Contact [FirstName] (book/site/mailto) and SaveProfileButton (client localStorage)
9. System: Renders main content: Areas of care pills, About bio, My approach/How I work sections, What healing means quote
10. System: Renders sticky sidebar: Quick details card with icon+label+value pairs (Specialty, Format, Focus, Availability, Languages, Insurance, Earliest start, Investment)
11. System: Renders RichProfile for remaining fields (education, ideal client, video, socials, etc.)
12. System: Renders GetMatchedBar sticky pill at page bottom
13. System: Mounts ViewBeacon client component which fires recordProfileView server action on mount
14. recordProfileView: Logs ProfileView row if not a self-view (owner checking own profile), increments viewCount

**Touches:** practitioner table (visibility, slug, displayName, bio, region, modality, specialties, photoUrl, website, gender, insuranceAccepted, fieldValues, viewCount, userId, createdAt) · profileView table (create on view) · fieldValues JSON: title, cover_design, cover_color, availability_state, age_groups, credentials, style, client_expectations, populations, languages, earliest_start, session_cost, booking_link, video_url, socials · Verification badges via fieldValues.__verification_badges reserved key
**Files:** `app/practitioners/[slug]/page.tsx` · `app/practitioners/[slug]/ViewBeacon.tsx` · `app/practitioners/[slug]/view-actions.ts` · `lib/practitioners.ts` · `app/practitioners/_components/ProfileCover.tsx`

**Edge cases / guards:**
- Unpublished or deleted profile: notFound() renders 404
- Owner views own profile: recordProfileView skips via getCurrentDbUser() check
- Practitioner-supplied URLs: safeHttp() filters to http(s) only, blocks javascript:/data: schemes
- fieldValues mixed types: arrify() and fstr() helpers normalize scalars/arrays/null
- Missing photo: renders initial-letter avatar
- Credentials unverified: plain text only, not in JSON-LD hasCredential (awaiting credential-validation system)

### Get matched (guided intake)  ·  📋 Designed not built
**Trigger:** Seeker clicks GetMatchedBar CTA or navigates to /get-matched

**Steps:**
1. Seeker: Clicks 'Get matched' button on directory or profile, or visits /get-matched
2. System: GetMatchedBar currently links to mailto:hello@healingtides.co?subject=Help%20me%20find%20a%20fit (email fallback)
3. Seeker: Composes email with 1-2 paragraphs describing needs (no form, plain text per landing page)
4. Nora: Receives email, reads seeker story, selects 3-5 practitioners who fit
5. Nora: Replies with shortlist + reasoning for each pick (per promise: written by a person)
6. Seeker: Receives intro; reaches out directly to chosen practitioners

**Touches:** Email (hello@healingtides.co inbox)
**Files:** `app/practitioners/_components/GetMatchedBar.tsx` · `app/HomePageClient.tsx`

**Edge cases / guards:**
- Design doc exists (product/MATCHING-BRIEF-DRAFT.md) but gated on Nora's brief + PHI/crisis decision
- Current implementation is mailto placeholder, not database-backed

### Crisis resources  ·  ✅ Live
**Trigger:** GET /crisis or click 988 link in footer sitewide

**Steps:**
1. Seeker: Clicks 'If you're in crisis' in footer or navigates to /crisis or clicks 988 link
2. System: app/crisis/page.tsx renders static page with header, disclaimer 'This is not emergency care'
3. System: Renders 'Reach a person, 24/7' section with 4 clickable cards: 988 (tel:), Crisis Text Line (sms:741741), SAMHSA (tel:1-800-662-4357), 211 (tel:)
4. System: Renders 'Practices you can try today' section with 3 expandable details: Box breathing, 5-4-3-2-1 grounding, Second-arrow practice
5. System: Renders 'Other places to look' section with 6 external resource links
6. System: Renders final 'Begin' section with quote + CTA back to /practitioners
7. Seeker: (Optional) Clicks crisis line (tel:/sms: protocol), expands grounding practice, or clicks external resource

**Touches:** No database reads; static metadata and hardcoded resource list · Crisis lines: 988, Crisis Text Line (741741), SAMHSA (1-800-662-4357), 211 · Grounding practices: Box breathing, 5-4-3-2-1 grounding, Second-arrow practice · External resources: Open Path Collective, Inclusive Therapists, Therapy for Black Girls, Latinx Therapy, NQTTCN, Open Counseling
**Files:** `app/crisis/page.tsx` · `app/_components/site-footer.tsx`

**Edge cases / guards:**
- 988 and 211 auto-route to nearest Minnesota center; no local numbers hardcoded
- Grounding practices free, no login/download required

## 2 · Practitioner — onboarding & profile

### Sign up (self-serve join)  ·  ✅ Built & live
**Trigger:** Actor navigates to `/join` or clicks 'Sign up' link

**Steps:**
1. Actor: Lands on `/join` (Clerk SignUp component)
2. System: Clerk UI shows sign-up form (email + Google OAuth)
3. Actor: Fills form and submits
4. System: Clerk `auth()` hook captures userId
5. System: Clerk webhook (`/api/webhooks/clerk` user.created) triggers → creates User row in DB
6. System: SignUp forceRedirectUrl routes to `/practitioner`
7. System: `getPractitioner()` in dashboard page checks for Practitioner row (finds none)
8. System: Dashboard shows 'Set up your practitioner profile' card
9. Actor: Clicks 'Set up your practice' button (form action: becomePractitioner)
10. System: `becomePractitioner()` calls `getOrCreatePractitioner()` → creates Practitioner shell (DRAFT, completeness 0)
11. System: Redirects to `/practitioner/edit`

**Touches:** Clerk (identity provider) · User table (clerkUserId, email, role=SEEKER by default) · Practitioner table (new row: DRAFT, completeness=0, visibility=DRAFT, all fields null) · User.role → remains SEEKER until becomePractitioner is called
**Files:** `/app/join/[[...sign-up]]/page.tsx` · `/lib/auth.ts` · `/app/practitioner/actions.ts` · `/app/practitioner/page.tsx` · `/prisma/schema.prisma`

**Edge cases / guards:**
- Seeker account (User without Practitioner row) lands on `/practitioner` → shows 'Set up your practice' card, does NOT auto-promote
- Practitioner.completeness=0 AND !displayName → auto-redirect to /edit on page load (line 158 of page.tsx)
- Clerk webhook delays or fails → fallback: `getCurrentDbUser()` creates row on first request (line 35 of auth.ts)
- Multiple concurrent sign-ups from same email → Clerk prevents, no DB race

### Sign in (returning practitioner)  ·  ✅ Built & live
**Trigger:** Actor navigates to `/sign-in` or clicks 'Sign in' link

**Steps:**
1. Actor: Lands on `/sign-in` (Clerk SignIn component)
2. System: Clerk UI shows sign-in form (email + password or Google OAuth)
3. Actor: Authenticates
4. System: Clerk webhook syncs existing User row (or creates if missing)
5. System: SignIn forceRedirectUrl routes to `/practitioner`
6. System: `getPractitioner()` resolves signed-in user + Practitioner row
7. System: Dashboard renders with profile, status (draft/live/held), profile strength %, etc.

**Touches:** Clerk (identity provider) · User table (read: clerkUserId lookup) · Practitioner table (read: find by userId)
**Files:** `/app/sign-in/[[...sign-in]]/page.tsx` · `/lib/auth.ts` · `/app/practitioner/page.tsx`

**Edge cases / guards:**
- Sign-in to seeker account (no Practitioner row) → dashboard shows 'Set up your practice' card
- Sign-in to on-hold profile → dashboard shows on-hold banner (line 245–254 of page.tsx); profile still editable
- User deleted in Clerk → webhook sets User.clerkUserId to null or deletes row; next login creates new User

### Claim profile (waitlist → practitioner, email-gated)  ·  ✅ Built & live
**Trigger:** Admin creates invite link (`/admin`) → link emailed to practitioner → actor clicks `/claim/[token]`

**Steps:**
1. System: Admin (or script) creates Invite row: token, email, displayName, prefill JSON (region, title, specialties, etc.)
2. System: Email sent with `/claim/[token]` link (async via Resend)
3. Actor: Clicks link → lands on `/claim/[token]` page
4. System: `getInviteByToken(token)` looks up Invite; checks if claimedAt IS NULL (not yet claimed)
5. System: Page renders prefill preview (title, region) and 'Claim my profile' button
6. Actor: Clicks 'Claim my profile'
7. System: `startClaim(token)` form action checks if user is signed in:
8.   → If signed in: `applyClaim(token)` runs immediately, redirects to `/practitioner/edit`
9.   → If not signed in: sets httpOnly cookie `ht_claim=token`, redirects to `/join`
10. Actor: Signs up at `/join`
11. System: SignUp redirects to `/practitioner` dashboard
12. System: Dashboard detects `ht_claim` cookie (line 133), shows 'Finish claiming your profile' card
13. Actor: Clicks 'Finish claiming'
14. System: `completeClaim()` reads & deletes cookie, calls `applyClaim(token)`
15. System: `applyClaim(token)` atomically:
16.   → `db.invite.updateMany({ WHERE token AND claimedAt IS NULL })` → sets claimedAt + claimedByUserId
17.   → Checks email match (Invite.email vs User.email, case-insensitive)
18.   → Creates/gets Practitioner (getOrCreatePractitioner)
19.   → Fills only empty Practitioner fields from Invite.prefill: displayName, region, website, specialties, title (in fieldValues)
20.   → Recomputes completeness
21. System: Redirects to `/practitioner/edit` on success, or `/claim/[token]?e=<reason>` on failure

**Touches:** Invite table (claimedAt, claimedByUserId update — atomic updateMany guard) · User table (read: email verification) · Practitioner table (create or upsert, fill if-empty from prefill) · Clerk (identity during sign-up) · Resend (email delivery, async)
**Files:** `/app/claim/[token]/page.tsx` · `/app/claim/claim-actions.ts` · `/lib/invites.ts` · `/lib/auth.ts` · `/app/practitioner/page.tsx` · `/prisma/schema.prisma`

**Edge cases / guards:**
- Race: two actors claim same token → atomic updateMany ensures only one wins (count === 0 means already claimed)
- Email mismatch: invite to alice@example.com, but signed in as bob@example.com → error `e=email_mismatch`, user can sign out and retry with correct email
- Claimed but cookie stale (>60min) → `completeClaim()` sees empty cookie, redirects to `/practitioner` (line 49 of claim-actions.ts)
- Fill-if-empty: prefill never overwrites existing Practitioner fields (checked line 91–100 of claim-actions.ts)
- Prefill partial: region present but title missing → only region is filled
- Deleted Invite: token invalid → page shows 'This link isn't valid'

### Import-first onboarding (paste/URLs → Claude extract → draft)  ·  ✅ Built & live
**Trigger:** Actor is in `/practitioner/edit` and clicks 'Import' section (ImportStatusBar); new profiles auto-expand (isNew=true)

**Steps:**
1. Actor: Sees 'Import your profile' collapse box; pastes bio text OR drops profile URLs (1–4 links)
2. Actor: Clicks 'Review and fill' button
3. System: `extractProfileFromSources({ urls?: string[], text?: string })` server action starts
4. System: For each URL:
5.   → `fetchPage(url)` validates URL (https only, not localhost/.local/.internal, not LinkedIn, SSRF check: DNS lookup + private IP filter)
6.   → Fetches page HTML (8s timeout, browser UA, follow redirects)
7.   → Strips HTML tags to text, caches full HTML for structured data parsing
8. System: `parseStructuredData(html, host)` extracts JSON-LD (if present) for verified facts (name, credentials, title, location, education, specialties)
9. System: Runs Claude extraction (Claude Haiku 4.5 via Vercel AI Gateway):
10.   → SYSTEM prompt: 'turn text into structured profile DRAFT; only facts in source; narrative fields can rephrase warmly but stay faithful'
11.   → If structured data found: SYSTEM includes seeded addendum: 'these facts are GROUND TRUTH; never contradict them; focus on narrative (values, ideal_client, etc.)'
12.   → Extracts via `profileExtractSchema` (Zod): displayName, bio, values, region, gender, website, insuranceAccepted, specialties, + rich fields (about_you, client_expectations, ideal_client, etc.)
13. System: Cross-source fill-if-empty merge: first structured data wins facts, then LLM narrative, then paste text, then next URL
14. System: If pasted text, run LLM once on it (same schema)
15. System: Returns ImportResponse: ok=true/false, data (merged ImportData), sources (per-URL summaries with contributed fields + notes), failedUrls, extras, unmappedSpecialties, suggestedPhotoUrl
16. System: Client-side (ImportStatusBar) shows per-source checkmarks + fields contributed + errors; renders extracted data in collapsible preview
17. Actor: Reviews the draft fields (name, bio, specialties, insurance, etc.) in the preview
18. Actor: Clicks 'Accept' → system fills the form fields (client-side state: displayName, bio, region, etc.)
19. Actor: Form is NOT auto-saved; actor must click 'Save' to persist (or continue to next wizard step)

**Touches:** Vercel AI Gateway (Claude Haiku 4.5 model) · External URLs (read-only fetch: DNS, HTTP/HTTPS, SSRF-guarded) · Client-side state only until 'Save' clicked (never writes DB during import) · Practitioner.fieldValues (custom fields like about_you, ideal_client stored when saved)
**Files:** `/app/practitioner/extract-actions.ts` · `/app/practitioner/_extract/*.ts` · `/app/practitioner/ProfileEditor.tsx` · `/app/practitioner/ImportStatusBar.tsx` · `/app/_lib/profile-extract-schema.ts` · `/lib/completeness.ts`

**Edge cases / guards:**
- URL fetch fails (404, timeout, SSRF-blocked) → source marked ok=false with note; other URLs still processed
- HTML too large (>800KB) → sliced to 800KB before parsing
- Structured data missing → run LLM on text only (no seeding)
- LLM returns <40 chars of text → error 'There wasn't enough to work with'
- LinkedIn URL → blocked with specific error 'LinkedIn blocks automated visits'
- Pasted text only, no URLs → run LLM once on pasted text
- Multiple URLs, same host → each fetched separately, merged fill-if-empty
- Own website detected (host matches website field in form) → auto-set website if not present
- Unmapped specialties (LLM returns unknown taxonomy IDs) → collected in unmappedSpecialties array
- Photo URL found in structured data → suggestedPhotoUrl returned for actor to confirm
- Insurance list returned → merged into insuranceAccepted array
- Race: actor pastes while import pending → pending is true, form is read-only

### Build/edit profile (4-step wizard)  ·  ✅ Built & live
**Trigger:** Actor lands on `/practitioner/edit` (after sign-up, claim, or manual edit) OR clicks 'Edit profile' from dashboard

**Steps:**
1. System: `getPractitioner()` resolves signed-in user + Practitioner row; redirects to `/join` if not signed in
2. System: `ProfileEditor` renders with initial state from row: displayName, bio, region, website, etc.
3. System: Wizard step 0–3 freely navigable (Stepper component shows progress)
4. Actor: Fills form fields (name, bio, website, region, gender, modality, specialties 3–8, insurance, availability, etc.)
5. System: Live completeness % recomputes on each keystroke (`completenessOf` function) — no save needed to see progress
6. System: Live 'match strength' list updates showing missing fields (line 88–100 of ProfileEditor.tsx)
7. System: Actor can import at any time (collapse ImportStatusBar); accepted fields merge into form
8. Actor: Clicks 'Save' button (form action: `saveProfile`)
9. System: `saveProfile(input: ProfileInput)` server action:
10.   → Calls `getOrCreatePractitioner()` to verify still signed in + get Practitioner ID
11.   → Sanitizes input: trim strings, validate website (safeWebsite), array bounds
12.   → Computes completeness with `completenessOf()`
13.   → Merges fieldValues (preserves reserved `__` keys like __verified badges; never clobbers them)
14.   → Saves to DB: `db.practitioner.update({ where: { id }, data })`
15.   → Revalidates `/practitioner` cache path
16.   → Returns `{ ok: true, completeness }`
17. System: Client-side saved flag set; 'Saved' toast shows briefly
18. Actor: Navigates wizard steps using 'Continue' button → auto-saves before advancing
19. Actor: At step 3 (Review), sees live preview of public profile (name, bio, specialties, region, photo, cover design, etc.)
20. Actor: Can edit cover design (CoverThemePicker component) — design + color stored in fieldValues.cover_design / cover_color
21. Actor: Can upload photo: `uploadProfilePhoto()` → uploads to Vercel Blob → stores photoUrl
22. Actor: Can click 'Publish' button → runs `publishProfile()` server action

**Touches:** Practitioner table (update: all profile fields, completeness, fieldValues) · Vercel Blob (photo upload) · Next.js revalidateCache (clear `/practitioner` for ISR) · Reserved fieldValues.__verified* keys (admin-granted badges, never overwritten by practitioner save)
**Files:** `/app/practitioner/edit/page.tsx` · `/app/practitioner/ProfileEditor.tsx` · `/app/practitioner/actions.ts` · `/app/practitioner/photo-actions.ts` · `/app/practitioner/_components/Stepper.tsx` · `/app/practitioner/_components/LivePreview.tsx` · `/app/practitioner/_components/CoverThemePicker.tsx` · `/lib/completeness.ts` · `/app/_lib/verification.ts` · `/app/_lib/profile-fields.ts`

**Edge cases / guards:**
- Not signed in → redirects to `/join`
- Seeker account (no Practitioner row) → redirects to `/practitioner`
- On-hold profile → can edit, but Publish button disabled with message
- Completeness 0 & no displayName → auto-redirect to edit on page load (line 158 of page.tsx)
- Save fails (DB error) → returns { ok: false, error: message }
- Photo upload fails → error shown inline; edit can continue
- Multiple concurrent edits (two tabs) → last write wins; on refresh, live state from DB
- Reserved fieldValues keys (e.g., __verified) → mergeFieldValues preserves them; practitioner can't delete
- Specialty taxonomy unknown (custom values) → stored as-is in specialties array
- Coverage import during edit: merges into form state, doesn't save; actor must click Save
- Wizard step navigation: can skip steps, saves on Continue, state persists across steps

### Publish profile (DRAFT → PUBLISHED, directory listing + SEO page)  ·  ✅ Built & live
**Trigger:** Actor clicks 'Publish' button in ProfileEditor step 3 (or dashboard action)

**Steps:**
1. System: Client-side guard: checks missingToPublish list (name + bio required); if missing, shows calm nudge (line 104–110 of ProfileEditor.tsx)
2. Actor: Clicks 'Publish' button (button disabled until missingToPublish is empty)
3. System: `publishProfile()` server action runs:
4.   → Calls `getOrCreatePractitioner()` to verify signed in
5.   → Checks `readHold(p.fieldValues)` — if admin-held, returns error with message (line 47–49 of publish-actions.ts)
6.   → Calls `readyToPublish({ displayName, bio })` — requires both non-empty (line 17–19)
7.   → If Practitioner already has a slug, reuses it (stable for indexing); else generates one via `uniqueSlug(base, selfId)`,
8.   → `uniqueSlug()` checks collision-free by trying base name, then base-2, base-3, etc., up to base-99, then fallback base-<first6ofID>
9.   → Attempts atomic update: `db.practitioner.update({ WHERE id, data: { visibility: PUBLISHED, slug } })`
10.   → On Prisma unique-constraint error (P2002) + first attempt + no existing slug: retries with fresh slug (line 74–76)
11.   → On success: revalidates `/practitioner`, `/practitioners`, `/practitioners/[slug]` cache paths
12. System: Returns `{ ok: true, slug }` or `{ ok: false, error }`
13. Client-side: On success, sets visibility='PUBLISHED' + slug state; 'View public page' button appears
14. System: Profile now appears in `/practitioners` directory (filtered by visibility='PUBLISHED')
15. System: `/practitioners/[slug]` SEO page is live with Person JSON-LD, meta tags, og:image, etc.

**Touches:** Practitioner table (update: visibility='PUBLISHED', slug assignment/reuse) · Next.js revalidateCache (ISR for directory + slug page) · Database unique constraint on Practitioner.slug
**Files:** `/app/practitioner/publish-actions.ts` · `/app/practitioner/ProfileEditor.tsx` · `/app/practitioners/[slug]/page.tsx` · `/lib/slug.ts`

**Edge cases / guards:**
- Admin hold active → error message 'Your profile is on hold'; publish blocked
- Missing name or bio → client-side guard prevents button enable; server-side double-checks (readyToPublish)
- Slug collision race: two practitioners publishing simultaneously → uniqueSlug + retry loop handles (one wins, other gets -2 or -3)
- Retry exhausted (99 attempts fail) → fallback slug with user ID: base-<6char>
- Already published → visibility=PUBLISHED, slug unchanged, revalidates cache (idempotent)
- Profile on hold, but admin releases it → hold flag cleared in fieldValues; next publish succeeds
- Seeker (no Practitioner row) calls publishProfile → getOrCreatePractitioner returns null, error 'You're not signed in.'

### Unpublish profile (PUBLISHED → DRAFT, hides from directory)  ·  ✅ Built & live
**Trigger:** Actor clicks 'Unpublish' button on dashboard or ProfileEditor

**Steps:**
1. System: Client-side: show confirmation modal (implied, typical UX)
2. Actor: Confirms unpublish
3. System: `unpublishProfile()` server action:
4.   → Calls `getOrCreatePractitioner()` to verify signed in
5.   → Checks `readHold()` — if held, returns error (actor can't unpublish while held, only admin can release)
6.   → Updates: `db.practitioner.update({ WHERE id, data: { visibility: DRAFT } })`
7.   → Revalidates `/practitioner`, `/practitioners`, `/practitioners/[slug]` cache paths
8. System: Returns `{ ok: true }` or `{ ok: false, error }`
9. Client-side: On success, visibility='DRAFT' state updates; 'View public page' button disappears
10. System: Profile removed from `/practitioners` directory listing
11. System: `/practitioners/[slug]` now returns 404 (hidden from public)

**Touches:** Practitioner table (update: visibility='DRAFT'; slug remains for re-publish stability) · Next.js revalidateCache
**Files:** `/app/practitioner/publish-actions.ts` · `/app/practitioner/ProfileEditor.tsx`

**Edge cases / guards:**
- Admin hold active → error 'Your profile is on hold'; unpublish blocked
- Already draft → visibility=DRAFT, update is idempotent, revalidates
- Seeker account → getOrCreatePractitioner returns null, error 'You're not signed in.'

### Dashboard (practitioner home page)  ·  ✅ Built & live
**Trigger:** Actor navigates to `/practitioner` or is redirected there after sign-up/claim

**Steps:**
1. System: `getPractitioner()` resolves signed-in user + Practitioner row
2. System: If not signed in → shows 'You're not signed in' prompt with link to `/join`
3. System: If signed in but no Practitioner → shows 'Set up your practitioner profile' card; actor clicks 'Set up your practice' (becomePractitioner action)
4. System: If signed in + has Practitioner:
5.   → Reads completeness %, status (live/draft/held), profile strength visual
6.   → Shows 4 'next steps' cards (highest-impact incomplete fields)
7.   → Renders profile preview (cover design, name, credentials, specialties, photo)
8.   → Shows 'Your standing' verification badges (if granted)
9.   → Shows 'How people find you' (findability stage + weekly view trend) if published
10.   → Shows 'Your brand' 5-part shape (brand center doorway) — if visibility_scan exists
11.   → Shows profile view count (denormalized from ProfileView rows)
12.   → If on-hold: shows on-hold banner with message; profile still editable
13. Actor: Navigates to `/practitioner/edit` via CTA button
14. Actor: Views public page via 'View public page' button (if published)

**Touches:** Practitioner table (read: all fields for display) · ProfileView table (read: count + 7-day trend) · Reserved fieldValues.__presenceScan key (brand visibility audit result) · Moderation hold flag (fieldValues.__hold key)
**Files:** `/app/practitioner/page.tsx` · `/app/practitioner/_components/PublicPagePreview.tsx` · `/app/practitioner/_components/PresencePanel.tsx` · `/app/practitioner/_components/VisibilityCard.tsx` · `/app/practitioner/_components/brand/BrandTiles.tsx` · `/lib/presence.ts` · `/lib/brand.ts` · `/lib/auth.ts`

**Edge cases / guards:**
- Not signed in → no profile loaded, prompt to sign in
- Seeker account (User exists, no Practitioner) → dashboard shows 'Set up your practice' card
- Completeness=0, no displayName → auto-redirect to `/edit`
- On-hold profile → on-hold banner shown; status pill says 'On hold'; all editing allowed, publish/unpublish blocked
- Published profile → shows 'Live' status, 'View public page' button visible
- Draft profile → shows 'Draft' status, 'View public page' button hidden
- No views yet → view count shows 0
- No brand scan yet → brand tiles show loading/coming-soon state

### Account deletion (user deletes account via Clerk)  ·  ✅ Built & live · ⚙ needs clarification: erasure semantics pending Christie decision (currently: hide, not delete)
**Trigger:** Actor navigates to Clerk UserButton (top-right avatar) → 'Manage account' / 'Delete account' → Clerk deletion modal

**Steps:**
1. Actor: Clicks Clerk UserButton avatar
2. System: Clerk menu appears (sign out, manage account, delete account)
3. Actor: Clicks 'Delete account'
4. System: Clerk shows confirmation modal
5. Actor: Confirms deletion
6. System: Clerk deletes user from its system; fires `user.deleted` webhook
7. System: Webhook (`/api/webhooks/clerk`) receives event
8. System: Webhook handler hides Practitioner: updates visibility='HIDDEN' (line 49 of FLOWS.md: 'Hide, not hard-erase')
9. System: Practitioner profile disappears from `/practitioners` directory
10. System: `/practitioners/[slug]` returns 404 for that profile

**Touches:** Clerk (identity deletion) · User table (delete or clerkUserId nullified by webhook) · Practitioner table (update: visibility='HIDDEN', data retained for legal/audit) · Webhook (`/api/webhooks/clerk`)
**Files:** `/api/webhooks/clerk.ts` · `/prisma/schema.prisma`

**Edge cases / guards:**
- Data is hidden, not erased: Practitioner row remains for audit/legal review (as noted in FLOWS.md)
- Profile was published: slug entry hidden from directory, slug itself may be reused later by new practitioner
- Views recorded: ProfileView rows remain (historical only, not displayed)
- Webhook delay: if actor refreshes immediately, profile may briefly still show; eventual consistency
- Webhook failure: profile stays PUBLISHED; manual admin action needed to hide (not ideal, but safe)

## 3 · Practitioner — brand center

### Open brand center  ·  ✅ built & live (tested on counsel-post.vercel.app and healing-tides-collective locally)
**Trigger:** GET /practitioner/brand (signed-in practitioner)

**Steps:**
1. Actor: navigates to /practitioner/brand → System: route handler verifies auth via getPractitioner()
2. System: checks Clerk auth, returns 404 if not signed in; checks if practitioner row exists, shows prompt if not
3. System: reads practitioner row (id, displayName, bio, values, photoUrl, specialties, region, visibility, slug, website, modality, fieldValues)
4. System: reads last cached presence scan from fieldValues.__presenceScan (reserved key)
5. System: reads presence history from fieldValues.__presenceScanHistory (reserved key)
6. System: builds BrandSignals from practitioner profile + cached scan (published status, completeness %, hasBio/hasValues/hasPhoto/hasModality/hasWebsite/hasRegion, specialtiesCount, weeklyViews)
7. System: runs buildBrand(signals) → returns 5-dimension Brand object: who_you_are / who_youre_for / where_found / why_trusted / how_remembered, each with score (0–100 from insight states), state (not_started/forming/on_its_way/settled from score bands), and up to 3 insights (what/whyCare/whatNext/lift/state/cta)
8. System: derives seeker language from cached scan questions + relatedSearches + foundTerms, mirrored against practitioner's own text (bio+values+specialties+fieldValues), excludes region from mirror
9. System: builds momentum from presence history snapshots (rolling trend of appeared count across checks), gains-only framing
10. System: picks grounded next step: if profile is published+has-bio+has-photo AND checked for map AND not on map, leads with Google Business Profile; else framework's most-foundational gap (first not_started insight, else first forming)
11. Actor: receives rendered HTML with BrandHero + thesis section + StartHere card + five dimensions with moons + SeekerLanguageCard + MomentumCard + DimensionChapter for each (where_found chapter hosts VisibilityCard)

**Touches:** Practitioner (id, displayName, bio, values, photoUrl, specialties, region, visibility, slug, website, modality, fieldValues, completeness) · ProfileView (for weekly view bucket counts, not shown but used) · fieldValues.__presenceScan (reserved key: checkedAt, coverage, foundTerms, knowledgeGraphPresent, inAnyMapPack, reviewsKnown, questions, relatedSearches) · fieldValues.__presenceScanHistory (reserved key: array of {checkedAt, appeared, total, foundTerms} snapshots, max 8) · fieldValues.__hold (sibling reserved key, never overwritten) · fieldValues.__verified (sibling reserved key, never overwritten)
**Files:** `app/practitioner/brand/page.tsx` · `lib/brand.ts` · `lib/brand-signals.ts` · `lib/presence-scan.ts` · `lib/presence-history.ts` · `lib/seeker-language.ts` · `lib/brand-next-step.ts` · `app/practitioner/_components/brand/BrandHero.tsx` · `app/practitioner/_components/brand/BrandTiles.tsx` · `app/practitioner/_components/brand/MoonState.tsx` · `app/practitioner/_components/brand/DimensionChapter.tsx` · `app/practitioner/_components/brand/SeekerLanguageCard.tsx` · `app/practitioner/_components/brand/MomentumCard.tsx`

**Edge cases / guards:**
- Clerk not configured (clerkEnabled false) → show auth setup message, no crash
- Not signed in → redirect to /join with link
- Signed in but no practitioner row → prompt to set up profile with link to /practitioner/edit
- No region set → runVisibilityAudit() returns unconfigured reason; brand page still renders, showing calm 'not checked yet' invitations for Serper-backed signals
- No presence scan yet (first visit) → all Serper-backed signals (coverage, inAnyMapPack, knowledgeGraphPresent) are undefined, dimensions show 'not checked yet' state
- Presence scan exists but is stale (old checkedAt) → still used, renders with 'Last checked {date}' label in VisibilityCard
- Profile published + bio + photo present but not on map AND map was checked → grounded next step overrides framework's next step with Google Business Profile CTA
- Weekly view dates include future timestamps → filtered out (ago < 0), never crash
- fieldValues is malformed/missing → readPresenceScan returns null, buildBrand shows calm 'not checked yet' throughout
- Special characters in specialty labels → displayed plainly, no markdown/HTML processing

### Run visibility audit  ·  ✅ built & live (end-to-end tested; Serper integration gated on SERPER_API_KEY; best-effort caching on DB write, no crash on failure)
**Trigger:** POST /practitioner/visibility-actions.runVisibilityAudit (via VisibilityCard 'Check my visibility' button)

**Steps:**
1. Actor: clicks 'Check my visibility' button in VisibilityCard → useTransition starts runVisibilityAudit server action
2. System: getPractitioner() verifies auth; returns {ok: false, reason: 'unauthenticated'} if not signed in
3. System: checks practitioner row exists; returns {ok: false, reason: 'not_practitioner'} if missing
4. System: reads practitioner.specialties and practitioner.region; returns {ok: false, reason: 'no_region'} if region is empty
5. System: checks process.env.SERPER_API_KEY; returns {ok: false, reason: 'unconfigured'} if missing
6. System: builds coverage queries: expands each specialty id via CATEGORIES.subcategories into rich labels (e.g., 'Trauma & Recovery' → 'Trauma Healing', 'Nervous System Healing'), or falls back to specialty label if already a subcategory; appends region to each; dedupes by query; caps at 8 terms
7. System: geo-targets queries via toSerperLocation(region) → 'Saint Paul, Minnesota, United States'; resolves city names within Minnesota, omits state suffix for MN
8. System: for each coverage query, calls searchSerpPage(query, {num: 10, location}) → Serper /search endpoint fetches organic results + peopleAlsoAsk + relatedSearches + knowledgeGraph presence
9. System: runs buildCoverage(perTerm, identity) → evaluates each SERP page for practitioner appearance via website host match OR profile URL match OR name word-boundary match in title; orders appear-first, then by nearest opportunity (position), de-dupes and caps questions (8) + related searches (8)
10. System: samples local map pack (Serper /places) for the top 3 appeared-first coverage terms; evaluates each pack via evaluateMapPack(places, identity) → tags entries as isYou (website host OR name match); builds youInPack boolean
11. System: runs buildPresenceScan({coverage, perTermKnowledgeGraph, sampledMapPacks, checkedAt}) → aggregates signals: appeared count, found term labels, knowledge-graph presence (OR across all terms), inAnyMapPack (OR across sampled), reviewsKnown (any entry isYou + has ratingCount > 0), persists questions + relatedSearches
12. System: re-reads fresh practitioner.fieldValues from DB (to avoid clobbering concurrent admin edits like __hold or __verified)
13. System: computes presenceDelta(prev, next) → compares foundTerms, marks firstCheck, lists newlyAppeared terms (gain-only)
14. System: merges scan into fresh fieldValues via applyPresenceScan + appendSnapshot to history, persists as nextFieldValues (preserves __hold, __verified siblings)
15. System: writes DB update: Practitioner.update({where: {id}, data: {fieldValues}})
16. System: revalidates paths /practitioner/brand and /practitioner (Next.js cache bust)
17. System: returns {ok: true, coverage, scan, delta}
18. Actor: receives result, calls router.refresh() if ok; VisibilityCard renders CoverageMap with overview dot chart + term rows + questions + related-search tags
19. System: BrandHero re-renders (server-revalidated), moons update to reflect new Serper signals

**Touches:** Serper.dev API: POST /search (8 calls per audit, {num: 10, location, geo-target}), POST /places (up to 3 calls for map packs) · Practitioner (id, displayName, website, slug for identity matching; specialties, region for query building; fieldValues for fresh read before write) · fieldValues.__presenceScan (written: {checkedAt ISO, coverage, foundTerms, knowledgeGraphPresent, inAnyMapPack, reviewsKnown, questions, relatedSearches}) · fieldValues.__presenceScanHistory (appended: {checkedAt, appeared, total, foundTerms}, kept max 8 snapshots, same-day replaces) · SERPER_API_KEY environment variable (must be set; missing returns unconfigured) · Next.js revalidatePath for /practitioner/brand and /practitioner cache bust
**Files:** `app/practitioner/visibility-actions.ts` · `lib/serper.ts` · `lib/visibility.ts` · `lib/presence-scan.ts` · `lib/presence-history.ts` · `lib/geo.ts` · `app/_lib/taxonomy.ts` · `app/practitioner/_components/VisibilityCard.tsx`

**Edge cases / guards:**
- SERPER_API_KEY missing → returns {ok: false, reason: 'unconfigured'}, audit never runs
- No specialties set → buildCoverageQueries falls back to ['therapist {region}'], one query instead of rich expansion
- Region is empty string after trim → returns {ok: false, reason: 'no_region'}, can't geo-target
- All 8+ specialty subcategories collapse to same query (de-duped) → fewer than 8 final queries, e.g. 5
- Serper /search call times out or returns HTTP error → searchSerpPage returns EMPTY_PAGE ([], [], [], false), coverage shows 0 appeared, audit still completes
- Serper /places call fails → evaluateMapPack([], identity) returns {entries: [], youInPack: false}, inAnyMapPack stays undefined
- DB write fails (race, constraint, etc.) → delta computed against old snapshot, delta = {firstCheck: false, newlyAppeared: []}, audit returns ok: true with audit data but no cache update
- Practitioner.fieldValues is very large (multiple previous scans, __hold history, etc.) → applyPresenceScan spreads it all; presenceScan + presenceHistory are the only keys modified, siblings preserved exactly
- Concurrent audit and admin hold toggle → applyPresenceScan re-reads fresh fieldValues before write, so hold survives, audit data overwrites old scan data only
- Website URL is invalid or has unusual TLD → hostOf() catches exceptions, returns null; map-pack entries never match by host, only by name
- Practitioner name contains regex special chars (e.g., 'O'Brien') → matchVia() escapes name before regex, word-boundary match works correctly
- Search query returns >10 results in organic → only first 10 evaluated (num: 10 in Serper call), can't see if they're deeper in page 2

### Seeker-mirror (derive seeker language)  ·  ✅ built & live (pure, unit-tested logic; mirroring is never prescriptive, always invitational)
**Trigger:** GET /practitioner/brand (server-side within page render)

**Steps:**
1. System: reads cached presence scan from fieldValues.__presenceScan (or null if no scan yet)
2. System: if scan exists, extracts questions (peopleAlsoAsk from all queries) + relatedSearches (related-search keywords from all queries) + foundTerms (labels of queries where practitioner appeared)
3. System: collects practitioner's own text: bio + values + specialties (via specialtyLabel) + fieldValues rich fields (about_you, ideal_client, populations, client_message, why_healing_tides), joined into one profileText string
4. System: calls deriveSeekerLanguage(scan, profileText, {exclude: [region]}) → tokenizes profile text (fold case, normalize accents, split, filter >3 chars, stem) into profileTokens set; excludes region from the mirror (region appears in every local search + the profile, would create false echoes)
5. System: for each related-search term, checks echoes(significantWords(term, exclude), profileTokens) → extracts >3 char care-words from the term (not stopwords, not excluded), checks if EVERY care-word appears as a whole word in profileTokens; returns SeekerWord {term, echoed: boolean}
6. System: builds SeekerLanguage {hasData: boolean, showingUpFor: string[], questions: string[], words: SeekerWord[]}
7. System: passes to SeekerLanguageCard component for render

**Touches:** fieldValues.__presenceScan (questions, relatedSearches, foundTerms arrays) · Practitioner (bio, values, specialties, fieldValues.about_you/ideal_client/populations/client_message/why_healing_tides, region for exclusion) · CATEGORIES + specialtyLabel() for specialty label lookup
**Files:** `lib/seeker-language.ts` · `app/practitioner/_components/brand/SeekerLanguageCard.tsx`

**Edge cases / guards:**
- No scan yet (first visit) → questions/relatedSearches/foundTerms all null → deriveSeekerLanguage returns {hasData: false, showingUpFor: [], questions: [], words: []} → SeekerLanguageCard shows invitation to run a check, no data
- Scan exists but all three signal arrays are empty → hasData is false (requires length > 0 in at least one), shows invitation
- Region contains non-ASCII (e.g., 'Montréal') → fold() normalizes to 'Montreal', excludes tokens properly
- Specialty label is empty string → specialtyLabel() returns ''; join produces no extra spaces, ok
- Related-search term has zero significant care-words (e.g., 'therapy near me' after stopword filter) → echoed is false (words.length === 0 → echoes returns false), term shown as unechoed
- Related-search term matches only partial profile words (e.g., 'couples grief work' but profile only has 'couples' and 'grief', not 'work') → echoed is false (echoes requires ALL words match), shown as open door
- Same related-search appears in multiple queries → dedupeCap(relatedSearches, 8) keeps only first occurrence, max 8 total
- Profile has no text at all (empty bio, no specialties, no fieldValues) → profileTokens is empty set, echoed is always false for every seeker word
- Question text is very long (e.g., 'What are the symptoms of complex PTSD and how do therapists treat it in couples therapy?') → split as-is, significant words extracted, no truncation

### Momentum (show presence growth over time)  ·  ✅ built & live (gain-only framing, no falling charts, motivational copy per state)
**Trigger:** GET /practitioner/brand (server-side render of MomentumCard if history.length > 0)

**Steps:**
1. System: reads presence history from fieldValues.__presenceScanHistory (array of PresenceSnapshot objects or [])
2. System: calls buildMomentum(history) → determines state (new / growing / steady / quiet), computes newlyFound terms
3. System: if history.length === 0, returns {state: 'new', checks: 0, ...} → MomentumCard skipped (render: null)
4. System: if history.length === 1, state = 'new' (no trend to compare yet)
5. System: if history.length >= 2:
6.   - first = history[0] (oldest snapshot), last = history[length-1] (newest)
7.   - if last.appeared === 0, state = 'quiet' (nothing showing up yet)
8.   - else if last.appeared > first.appeared, state = 'growing' (more searches find them)
9.   - else state = 'steady' (holding or dipped, never framed as loss)
10. System: computes newlyFound as terms that appear in last.foundTerms but not first.foundTerms (gain-only)
11. System: returns Momentum {state, checks: history.length, firstCheckedAt, appearedSeries: [numbers], newlyFound: [terms]}
12. System: passes to MomentumCard component
13. System: MomentumCard renders headline + description per state (from COPY[state]), gain-framed copy (e.g., 'Your presence is growing' or 'Your presence is holding steady', never 'falling')
14. System: draws Sparkline (quiet bar chart, no axes, heights 8px base + 28px at peak) only if state !== 'quiet' AND last.appeared >= first.appeared (never draws falling chart visually, though dips are mentioned in copy)

**Touches:** fieldValues.__presenceScanHistory (array of {checkedAt ISO, appeared: number, total: number, foundTerms: string[]}) · fieldValues.__presenceScan (written to history on each audit)
**Files:** `lib/presence-history.ts` · `app/practitioner/_components/brand/MomentumCard.tsx`

**Edge cases / guards:**
- History length is 1 → state = 'new' ('Your first reading is here'), no sparkline, no newlyFound display
- All 8 snapshots are same day → appendSnapshot replaces the day's entry, keeping only 1 per day, so sparkline reflects day-level granularity not per-click spamming
- appeared count dips between checks (e.g., 3 → 2 → 1) → last < first, state = 'steady' (gain-only framing), dipped flag prevents sparkline from drawing, copy says 'holding steady' not 'declining'
- appeared stays 0 across all checks (no searches hit yet) → state = 'quiet', sparkline skipped, copy: 'Still early'
- newlyFound has >5 items → slice(0, 5) caps display at 5 terms in the UI
- foundTerms in history snapshots are empty [] → newlyFound is [], section doesn't render
- checkedAt timestamps are out of order in history (corrupt data) → dayOf() compares YYYY-MM-DD as strings, still dedupes same-day entries, no crash; but trend read may be strange
- MAX_SNAPSHOTS is 8 → after 9 checks, the oldest snapshot is dropped, appearing over ~8–9 days of daily checks or 1–2 weeks of sparse checks

### Start here (pick grounded next step)  ·  ✅ built & live (grounded logic: GBP is real ROI lever, led when profile is ready + checked + not-on-map; otherwise profile-first framework)
**Trigger:** GET /practitioner/brand (server-side render of StartHere card before the five parts)

**Steps:**
1. System: builds Brand object with 5 dimensions, each with 0–3 insights, each insight with a state (not_started / forming / on_its_way / settled)
2. System: runs pickNextStep(dimensions) → finds first not_started insight in dimension order, else first forming; returns {dimensionId, insight} or null
3. System: checks if grounded next step overrides: pickGroundedNextStep(frameworkNextStep, {mapChecked, onMap, profileReady})
4. System: conditions: mapChecked = (scan?.inAnyMapPack !== undefined) — did we actually run the map-pack check?; onMap = (scan?.inAnyMapPack === true); profileReady = (published + has-bio + has-photo)
5. System: if profileReady AND mapChecked AND !onMap → returns LOCAL_MAP_NEXT_STEP (Google Business Profile CTA instead of profile nudge)
6. System: else → returns frameworkNextStep (the first profile gap, or null if nothing's pressing)
7. System: if groundedStep is null → renders 'Where you are' card: 'Your brand is in good shape — there's nothing pressing right now'
8. System: if groundedStep exists → renders StartHere card: {what, whyCare, whatNext, lift (Gentle/Moderate/Deeper), ctaHref, ctaLabel}; lift label shows energy level, not urgency

**Touches:** Brand object (dimensions and insights) · fieldValues.__presenceScan (inAnyMapPack for mapChecked and onMap) · Practitioner visibility, bio, photoUrl (for profileReady)
**Files:** `lib/brand-next-step.ts` · `app/practitioner/brand/page.tsx`

**Edge cases / guards:**
- Profile is published + bio + photo BUT no region → profileReady is false (requires region for local-map check to be meaningful), doesn't override to GBP step
- Map was never checked (scan undefined or inAnyMapPack undefined) → mapChecked is false, doesn't override; shows framework's first gap (e.g., 'add your region')
- Map was checked and practitioner IS on map → onMap is true, doesn't override; framework step (if any) still shown
- Framework next step is null AND grounded override doesn't apply → renders the 'nothing pressing' variant, no CTA
- Insight has no ctaHref → CTA section doesn't render, just 'Gentle/Moderate/Deeper · no rush' label
- LOCAL_MAP_NEXT_STEP is hardcoded external link → ctaHref is 'https://www.google.com/business/', opens in new tab (target='_blank')
- Multiple insights have same state → framework picks first in dimension order, so order is deterministic and testable

## 4 · Claim flow

### Admin mints a claim link  ·  ✅ live
**Trigger:** /admin POST createInvite(email, displayName, prefill)

**Steps:**
1. Admin: enters email + optional name + optional prefill data (region, title, website, specialties)
2. System: validates admin role via Clerk auth (requireAdmin)
3. System: validates email format (regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/)
4. System: generates opaque 24-char URL-safe token (randomBytes(18).toString('base64url'))
5. System: creates Invite row: token, email (lowercased), displayName, prefill JSON, createdAt, claimedAt=null
6. System: attempts async email send via Resend if RESEND_API_KEY + EMAIL_FROM are set
7. System: returns { ok: true, url: 'https://healingtides.co/claim/[token]', emailed: boolean, emailReason? }
8. Admin: receives copyable URL in UI; can manually send if email layer failed

**Touches:** Invite table (create) · Clerk auth (requireAdmin) · Resend API (sendEmail) · EMAIL_FROM, RESEND_API_KEY env vars
**Files:** `/app/admin/actions.ts` · `/lib/invites.ts` · `/lib/email.ts` · `/lib/email-templates.ts`

**Edge cases / guards:**
- Email validation fails (422 HTTP from Resend) → ok: true returned (row created, emailed: false, emailReason: 'http_error')
- EMAIL_FROM malformed (missing local-part) → logs error, returns ok: true with emailReason: 'not_configured'
- Email layer unconfigured (missing RESEND_API_KEY or EMAIL_FROM) → ok: true with emailed: false, emailReason: 'not_configured'; link is still usable by hand-copy
- Network fault during sendEmail → caught, logged, ok: true with emailReason: 'exception'
- Duplicate email invite → no guard; admin can create N invites for same email (earlier ones are still claimable)

### Invite delivered (email or copy)  ·  ✅ live (email best-effort; copy always works)
**Trigger:** Resend POST /emails or admin copies /claim/[token] manually

**Steps:**
1. System: if emailConfigured(): Resend receives POST with { from, to: [email], subject, html, text }
2. Resend: returns { id } on success or HTTP error on reject (e.g., 422 unverified domain)
3. System: logs HTTP errors and network exceptions; never throws (best-effort contract)
4. System: returns SendResult { ok: true, id } or { ok: false, reason: 'http_error'|'exception'|'not_configured' }
5. Admin: views /admin invites list, can click Copy button for manual dispatch (Slack, email, calendar link, etc.)
6. Practitioner: receives email or clicks copied link

**Touches:** Resend API (POST https://api.resend.com/emails) · RESEND_API_KEY (Bearer auth header) · EMAIL_FROM (verified Resend domain)
**Files:** `/lib/email.ts` · `/lib/email-templates.ts` · `/app/admin/page.tsx`

**Edge cases / guards:**
- Resend domain not verified → 422 from Resend → logged, SendResult.ok=false
- API key rotated/invalid → 401 from Resend → logged, SendResult.ok=false
- Practitioner email misspelled in invite → delivered to wrong address; no guard (Nora's data entry responsibility)
- Email client blocks HTML → plaintext fallback always included in payload

### Claim via /claim/[token]  ·  ✅ live
**Trigger:** Practitioner clicks link or navigates to /claim/[token]

**Steps:**
1. Practitioner: visits /claim/[token] (dynamic, force-dynamic, not indexed)
2. System: ClaimPage reads Invite via token (getInviteByToken)
3. System: if Invite not found → render 'This link isn\'t valid' page
4. System: if Invite.claimedAt !== null → render 'Already claimed' page
5. System: if Invite.claimedAt is null → extract prefill via readPrefill(), render welcome
6. System: render prefill summary (region + title) if provided; display claim button
7. Practitioner: clicks 'Claim my profile' button
8. System: form action='startClaim' POSTs token as hidden field
9. System: startClaim() reads token, checks inviteIsClaimable()
10. System: if already signed in (getCurrentDbUser) → applyClaim immediately → redirect to /practitioner/edit or /claim/[token]?e=reason
11. System: if not signed in → set httpOnly cookie ht_claim=token (60 min maxAge) → redirect to /join

**Touches:** Invite table (read, no write yet) · Clerk auth (getCurrentDbUser) · httpOnly cookies (set ht_claim)
**Files:** `/app/claim/[token]/page.tsx` · `/app/claim/claim-actions.ts` · `/lib/invites.ts`

**Edge cases / guards:**
- Practitioner already signed in with a different email → can claim immediately; fails at applyClaim email_mismatch
- Token malformed or expired → getInviteByToken returns null → 'invalid link' page
- Token guessed (24 random bytes = 2^144 space; collision near-impossible) → getInviteByToken returns null → 'invalid link' page

### Finish claiming + prefill  ·  ✅ live
**Trigger:** POST /join (Clerk sign-up completion) → redirect /practitioner (dashboard) → form action completeClaim

**Steps:**
1. Practitioner: completes Clerk sign-up (/join multi-step: email/password or OAuth)
2. Clerk: redirects to forceRedirectUrl=/practitioner
3. System: /practitioner page (getPractitioner) detects signed-in user (no practitioner profile yet)
4. System: reads ht_claim cookie (jar.get(CLAIM_COOKIE))
5. System: if cookie present → render 'Finish claiming your profile' CTA button
6. System: if no cookie → render 'Set up your practice' CTA button
7. Practitioner: clicks 'Finish claiming' button (form action=completeClaim)
8. System: completeClaim() reads jar.get(CLAIM_COOKIE), deletes cookie, calls applyClaim(token)
9. System: applyClaim() reads Invite by token via getInviteByToken()
10. System: checks inviteIsClaimable(invite) (invite exists && invite.claimedAt === null)
11. System: gets signed-in user via getCurrentDbUser(); verifies email matches invite.email (case-insensitive)
12. System: ATOMIC: db.invite.updateMany({ where: { token, claimedAt: null }, data: { claimedAt: now, claimedByUserId: user.id } })
13. System: if count === 0 → concurrent claim lost race → redirect /claim/[token]?e=claimed
14. System: if count === 1 → won race, proceed to prefill
15. System: getOrCreatePractitioner() → upsert Practitioner row (userId), promote user.role to PRACTITIONER if needed
16. System: buildClaimUpdate(practitioner, invite) → decide which fields to fill (fill-if-empty pattern)
17. System: apply: displayName, region, website (safeWebsite), specialties, title (into fieldValues)
18. System: recompute completeness based on new state
19. System: db.practitioner.update() with filled fields
20. System: redirect /practitioner/edit if ok, or /claim/[token]?e=reason if email mismatch

**Touches:** Invite table (updateMany write, atomic CAS on claimedAt) · User table (read, role promotion) · Practitioner table (upsert, update with prefill fields + completeness) · Clerk auth (getCurrentDbUser) · httpOnly cookies (delete ht_claim) · reserved keys: none in applyClaim, but fieldValues can carry admin-owned keys (see mergeFieldValues)
**Files:** `/app/claim/claim-actions.ts` · `/lib/invites.ts` · `/lib/auth.ts` · `/app/practitioner/page.tsx` · `/app/practitioner/actions.ts`

**Edge cases / guards:**
- Email mismatch (Practitioner email !== invite.email) → applyClaim returns { ok: false, reason: 'email_mismatch' } → redirect /claim/[token]?e=email_mismatch → page renders error + 'email us' fallback
- No signed-in user (session expired) → applyClaim returns { ok: false, reason: 'no_user' } → redirect /claim/[token]
- Invite already claimed by another user (concurrent claim, this request loses CAS) → updateMany count === 0 → applyClaim returns { ok: false, reason: 'claimed' }
- Cookie expired (60 min, or cleared) → completeClaim reads empty jar.get() → redirect /practitioner (no claim)
- Practitioner already has displayName → buildClaimUpdate respects fill-if-empty, never overwrites
- Prefill website is malformed → safeWebsite() sanitizes or returns null; field left empty

### Claimed-once guard (atomicity + visibility)  ·  ✅ live (Postgres transaction isolation enforces atomicity)
**Trigger:** during applyClaim() → concurrent POST /claim/claim-actions.ts:completeClaim

**Steps:**
1. Request A & B both call applyClaim(token) for the same invite simultaneously
2. Both read the same Invite via getInviteByToken() → both see claimedAt: null
3. Both verify email matches their signed-in user → both pass
4. Request A executes: db.invite.updateMany({ where: { token, claimedAt: null }, data: { claimedAt: now, claimedByUserId: userA.id } })
5. Postgres: A wins CAS, claimedAt flipped from null → timestamp, updateMany count = 1
6. Request B executes: db.invite.updateMany({ where: { token, claimedAt: null }, data: { ... } })
7. Postgres: no rows match token + claimedAt: null (A changed it) → updateMany count = 0
8. Request A: applyClaim returns { ok: true }, proceeds to Practitioner upsert, prefill, role promotion
9. Request B: applyClaim returns { ok: false, reason: 'claimed' }, redirect /claim/[token]?e=claimed
10. Practitioner B sees 'This profile's already claimed' page, can contact admin to revoke/resend a new link

**Touches:** Invite table (updateMany with WHERE claimedAt: null guard) · Postgres MVCC (atomic CAS) · User table (only winning request promotes role) · Practitioner table (only winning request creates/upserts)
**Files:** `/app/claim/claim-actions.ts` · `/lib/invites.ts`

**Edge cases / guards:**
- Both requests from same signed-in user (user refreshes page rapidly) → first wins, second sees 'claimed' → UX hiccup but no data corruption
- Requests from different users, same email (e.g., email forwarding) → first wins; second sees email_mismatch or claimed depending on Clerk state
- Request between read (inviteIsClaimable) and write (updateMany) pauses → invite claimed by another request in between → updateMany count = 0 → claimed reason

### Resend claim (admin, unclaimed only)  ·  ✅ live
**Trigger:** /admin POST resendInvite(token)

**Steps:**
1. Admin: views /admin invites table, clicks 'Resend' on an invite
2. System: form action='resendInvite' POSTs token
3. System: resendInvite() checks admin via requireAdmin()
4. System: reads Invite by token via db.invite.findUnique({ where: { token } })
5. System: if invite.claimedAt !== null → return { ok: false, error: 'Already claimed — nothing to resend.' }
6. System: if invite.claimedAt === null → attempt email send via sendEmail({ to: invite.email, ...claimInviteEmail({ name: invite.displayName, url }) })
7. System: returns { ok: true, emailed, emailReason? } regardless of send result
8. Admin: sees success toast; email dispatch is best-effort (same as initial create)

**Touches:** Invite table (read only) · Clerk auth (requireAdmin) · Resend API (sendEmail)
**Files:** `/app/admin/actions.ts`

**Edge cases / guards:**
- Invite already claimed → refuse (no resend allowed, preserves welcome email from original claim)
- Email layer unconfigured → emailReason: 'not_configured', ok: true (admin can copy link by hand)
- Resend rejects (invalid domain, rotated key) → logged, emailReason: 'http_error', ok: true

### Revoke claim (admin, unclaimed only)  ·  ✅ live (load-bearing guard: claimedAt: null)
**Trigger:** /admin POST revokeInvite(token)

**Steps:**
1. Admin: views /admin invites table, clicks 'Revoke' on an invite
2. System: form action='revokeInvite' POSTs token
3. System: revokeInvite() checks admin via requireAdmin()
4. System: db.invite.deleteMany({ where: { token, claimedAt: null } })
5. System: if count === 0 → return { ok: false, error: 'Couldn\'t revoke — it may already be claimed.' }
6. System: if count === 1 → Invite row deleted, return { ok: true }
7. System: revalidatePath('/admin')
8. Admin: sees success toast; /claim/[token] now returns 'invalid link' to any practitioner with that URL

**Touches:** Invite table (deleteMany with claimedAt: null guard) · Clerk auth (requireAdmin)
**Files:** `/app/admin/actions.ts`

**Edge cases / guards:**
- Invite already claimed → deleteMany count = 0 (WHERE claimedAt: null never matches) → error returned, nothing deleted (safety: never erase a claim record)
- Admin double-clicks revoke → first succeeds (count=1), second fails gracefully (count=0, error 'may already be claimed')
- Race: practitioner claims between admin's read and revoke → deleteMany sees claimedAt !== null → count = 0 → error

## 5 · Admin cockpit

### Admin gate  ·  ✅ Built & live
**Trigger:** GET /admin

**Steps:**
1. Practitioner: Visits /admin
2. System: Calls requireAdmin() → checks Clerk user + DB User row
3. System: Verifies user.role === 'ADMIN' OR email in ADMIN_EMAILS env allowlist
4. System: Non-admin gets 404 (notFound); route existence hidden
5. Admin: Sees admin page with stats + invites + practitioners table

**Touches:** users table · Clerk identity · ADMIN_EMAILS env var
**Files:** `/app/admin/page.tsx` · `/lib/auth.ts`

**Edge cases / guards:**
- Signed-out user → null from Clerk → 404
- User without admin role and email not in allowlist → 404
- Email allowlist is comma-separated, case-insensitive, env-driven (no DB write)
- Clerk-verified emails are trustworthy; no extra verification needed

### Practitioner list + search/filter  ·  ✅ Built & live
**Trigger:** Page render (GET /admin) + client-side filter

**Steps:**
1. Admin: Page renders
2. System: getAdminPractitioners() queries all Practitioner rows (incl. drafts)
3. System: Joins User.email for each practitioner
4. System: Reads __hold + __verified from fieldValues for each
5. System: Returns AdminPractitionerRow[] with visibility, completeness, badges, held status
6. Admin: Sees table with name, status badge, completeness %, views, updated date
7. Admin: Types in search box (client-side filter: name or email, lowercase match)
8. Admin: Clicks status filter button (All / Published / Drafts / On hold / Needs review)
9. System: Filters rendered rows in real-time

**Touches:** practitioners table · users table (join for email) · fieldValues JSON (__hold, __verified keys)
**Files:** `/app/admin/page.tsx` · `/app/admin/PractitionersTable.tsx` · `/app/admin/_data.ts`

**Edge cases / guards:**
- Practitioner with no user row → email is null (shouldn't happen; User.role promoted on claim)
- fieldValues malformed → defensive read returns sensible defaults (no hold, no badges)
- Held practitioner shows 'On hold' status badge in table
- Draft practitioner with visibility=DRAFT can't be viewed publicly but is visible here
- Search is case-insensitive client-side (trim + lowercase comparison)

### Invites management — track/resend/revoke  ·  ✅ Built & live
**Trigger:** Page render (GET /admin) shows InvitesList

**Steps:**
1. Admin: Page loads
2. System: getAdminInvites() queries all Invite rows (newest first)
3. System: Reads prefill.region for each invite
4. System: Maps claimedAt to 'pending' or 'claimed' status
5. Admin: Sees invites table with email, displayName, region, sent date, status, actions
6. Admin: Clicks 'Copy link' button → clipboard.writeText('/claim/[token]')
7. Admin: Clicks 'Resend email' button (unclaimed only)
8. System: Calls resendInvite(token) → queries Invite row
9. System: Validates invite exists + claimedAt is null
10. System: Sends email via Resend if configured; returns {ok, emailed, emailReason}
11. Admin: Sees feedback: 'Email re-sent ✓' or 'Email is off — copy the link instead'
12. Admin: Clicks 'Revoke' button (unclaimed only)
13. System: Calls revokeInvite(token) → deleteMany({token, claimedAt: null})
14. System: Row removed from DB; revalidatePath('/admin')
15. Admin: Row disappears from table

**Touches:** invites table (read all; delete unclaimed) · Resend (email service) · EMAIL_FROM env var
**Files:** `/app/admin/InvitesList.tsx` · `/app/admin/actions.ts` · `/app/admin/_data.ts` · `/lib/email.ts`

**Edge cases / guards:**
- Claimed invite: resend and revoke buttons disabled; row shows 'Claimed' + '—' link
- Email not configured: emailReason='not_configured'; link still works by hand
- Email failure: emailReason='http_error' or 'exception'; invite row preserved (email is best-effort)
- Revoke on claimed invite: deleteMany returns count=0 → error shown, row unchanged
- Double-click resend: useTransition prevents concurrent calls

### Completeness reminders  ·  ✅ Built & live; ⚙ needs EMAIL_FROM
**Trigger:** Admin clicks 'Send N reminders' button

**Steps:**
1. Admin: Sees CompletenessReminders widget with eligible count
2. Admin: Clicks 'Send N reminder(s)' button
3. System: Calls sendCompletenessReminders() (server action)
4. System: requireAdmin() verifies admin access
5. System: emailConfigured() checks for RESEND_API_KEY + EMAIL_FROM
6. System: Calls getReminderCandidates() → all practitioners with email, completeness, held, lastReminder
7. System: selectReminderRecipients() filters:
8.   - Has email address
9.   - NOT on an admin hold
10.   - Completeness < 80% (configurable)
11.   - NOT reminded in last 7 days (cooldown via __completenessReminder key)
12. System: For each eligible recipient:
13.   - Sends completenessReminderEmail via Resend
14.   - On success: reads fresh Practitioner row, writes __completenessReminder timestamp to fieldValues
15.   - On failure: continues to next (best-effort)
16. System: Returns {ok: true, sent: N, eligible: M}
17. Admin: Sees 'Sent N reminder(s).' feedback

**Touches:** practitioners table (read all; update fieldValues) · Resend (email service) · RESEND_API_KEY + EMAIL_FROM env vars · fieldValues JSON (__completenessReminder reserved key)
**Files:** `/app/admin/CompletenessReminders.tsx` · `/app/admin/actions.ts` · `/app/admin/_data.ts` · `/lib/completeness-reminders.ts` · `/lib/email-templates.ts`

**Edge cases / guards:**
- Email not configured: returns {ok: false, error: 'Email isn't switched on yet'}
- Held practitioner: skipped even if under 80% (don't nudge moderated profiles)
- Practitioner reminded today: skipped (7-day cooldown via __completenessReminder)
- Double-click: cooldown key prevents re-send within 7 days (idempotent)
- Email send fails for one recipient: continues to next; sent count reflects successes only
- Practitioner deletes/updates fieldValues concurrently: fresh read + spread merge prevents clobber

### Verification badges — grant/revoke  ·  ✅ Built & live
**Trigger:** Admin clicks badge toggle in PractitionersTable

**Steps:**
1. Admin: Sees BadgeEditor row in practitioners table (6 grantable badges)
2. Admin: Clicks badge toggle (Licensed, Credentials, Advanced, ID, Insured, Partner)
3. System: Optimistic update: setGranted([...badges]) or setGranted(badges.filter(x => x !== id))
4. System: Calls setVerificationBadges(practitionerId, next)
5. System: requireAdmin() verifies access
6. System: sanitizeGrant(badges) → de-dup + validate only grantable badges
7. System: Queries current Practitioner row, reads fieldValues
8. System: Writes __verified key with clean badge array to fieldValues
9. System: Preserves all other fieldValues (incl. __hold, __completenessReminder)
10. System: Executes db.practitioner.update with new fieldValues
11. System: revalidatePath('/admin') + revalidatePath('/practitioners', 'layout') (directory + profile)
12. Admin: Sees badge state update immediately (optimistic)

**Touches:** practitioners table (update fieldValues) · fieldValues JSON (__verified reserved key) · BADGE_ORDER + BADGES config (app/_lib/verification.ts)
**Files:** `/app/admin/BadgeEditor.tsx` · `/app/admin/actions.ts` · `/app/_lib/verification.ts`

**Edge cases / guards:**
- Founding Member badge: derived from createdAt < FOUNDING_CUTOFF; never grantable (read-only)
- Practitioner tries to self-grant: mergeFieldValues strips __verified; can't succeed
- Concurrent admin edits: last one wins (optimistic then server result)
- Invalid badge id in request: sanitizeGrant filters it out; clean array stored
- Badge displayed immediately on public profile via badgesFor(practitioner)

### Moderation — hold/release profile  ·  ✅ Built & live
**Trigger:** Admin clicks 'Hold...' or 'Release hold' in PractitionersTable

**Steps:**
1. Admin: Clicks 'Hold...' button for a practitioner
2. System: HoldControl expands to show textarea form (message + internal note)
3. Admin: Types practitioner-facing message ('Your profile is under review, please reach out…')
4. Admin: Types private internal note (never shown to practitioner)
5. Admin: Clicks 'Hide profile' button
6. System: Calls setProfileHold(practitionerId, {held: true, message, internalNote})
7. System: requireAdmin() verifies access
8. System: Queries current Practitioner row (visibility + fieldValues)
9. System: readHold(fieldValues) → checks if already held
10. System: If NOT already held: coercePrev(current.visibility) → determines restore visibility
11. System: If already held: preserves prior visibility from existing __hold.prev
12. System: applyHold(fieldValues, {prev, message, internalNote, by (admin.email), at (now)}) →
13.   - Sets __hold object with all params
14.   - Appends history entry to __holdHistory array (capped at 50 entries)
15.   - Preserves all other fieldValues (incl. __verified, __completenessReminder)
16. System: db.practitioner.update: visibility=HIDDEN + new fieldValues
17. System: revalidatePath('/admin') + '/practitioners' + '/practitioner' (directory + editor banner)
18. Admin: Row shows 'Release hold' button; form closes
19. Practitioner: Profile hidden from public; sees hold message in their editor; can still edit but not publish
20. Admin: Later clicks 'Release hold' button
21. System: applyRelease(fieldValues, {by, at}) →
22.   - Removes __hold
23.   - Appends 'release' entry to __holdHistory
24. System: db.practitioner.update: visibility=restored (from __hold.prev) + cleaned fieldValues
25. System: revalidatePath same as hold
26. Admin: Row shows 'Hold...' button again
27. Practitioner: Profile restored to prior visibility; hold message cleared

**Touches:** practitioners table (update visibility + fieldValues) · fieldValues JSON (__hold, __holdHistory reserved keys)
**Files:** `/app/admin/HoldControl.tsx` · `/app/admin/actions.ts` · `/app/_lib/moderation.ts`

**Edge cases / guards:**
- Re-hold (already held, edit message): __hold.prev preserved; doesn't overwrite with HIDDEN
- Release to incorrect state (e.g. visibility wasn't PUBLISHED when held): coercePrev defaults to DRAFT if state is HIDDEN
- Held but visibility column never set to HIDDEN: readHold + visibility both check; either marks as held
- Practitioner publishes while held: publish-actions.ts checks isOnHold() and blocks (separate gate)
- Hold message shown in editor via holdMessage(fieldValues) with calm default if empty
- Audit trail: __holdHistory is append-only, capped at 50 entries; supports compliance review
- Concurrent edits (practitioner saves + admin holds): fresh read + spread merge prevents fieldValues clobber (same pattern as reminders)

### Invite creation — admin mints claim link  ·  ✅ Built & live; ⚙ needs EMAIL_FROM
**Trigger:** Admin fills InviteCreator form and clicks 'Create claim link'

**Steps:**
1. Admin: Enters email, optional name, optional region
2. Admin: Clicks 'Create claim link'
3. System: Calls createInvite({email, displayName, prefill: {region}})
4. System: requireAdmin() verifies access
5. System: Validates email format
6. System: Generates token via newInviteToken() (opaque, unguessable)
7. System: db.invite.create({token, email, displayName, prefill (as JSON)})
8. System: If email configured: sends claimInviteEmail via Resend to email
9. System: Email send is best-effort; failure never fails the invite (row is source of truth)
10. System: Returns {ok: true, url, emailed, emailReason}
11. Admin: Sees URL '/claim/[token]' displayed
12. Admin: Sees 'Email re-sent ✓' or 'Email is off — copy the link instead'
13. Admin: Clicks 'Copy' → clipboard.writeText(url) or sends manually
14. Practitioner: Receives email with claim link (or admin sends manually)
15. Practitioner: Clicks link → /claim/[token]
16. System: claim route validates token, queries Invite row
17. System: Redirects to /sign-up with claimToken query param
18. Practitioner: Clerk sign-up (Google + email) with email pre-filled from invite
19. Practitioner: On success, User + Practitioner created, Invite marked claimedAt
20. Practitioner: Redirected to /claim/[token] confirm page
21. Practitioner: Clicks 'Finish claiming' → profile hydrated from invite.prefill + dashboard

**Touches:** invites table (create) · Resend (email service) · EMAIL_FROM + SITE_URL env vars · Clerk (sign-up redirect)
**Files:** `/app/admin/InviteCreator.tsx` · `/app/admin/actions.ts` · `/lib/invites.ts` · `/lib/email.ts` · `/lib/email-templates.ts` · `/app/claim/[token]/page.tsx`

**Edge cases / guards:**
- Email already exists: creates a new Invite row (no unique constraint); only one can be claimed
- Invalid email format: returns {ok: false, error: 'That doesn't look like a valid email address.'}
- Email configured but send fails: Invite row persists; emailed=false, emailReason='http_error'|'exception'
- Email not configured: emailed=false, emailReason='not_configured'; URL still works by hand
- Claimed Invite: can't resend or revoke (separate checks in those actions)
- Double-create same email: second Invite row created; first one unchanged (stateless)

### Admin stats display  ·  ✅ Built & live
**Trigger:** Page render (GET /admin)

**Steps:**
1. Admin: Page renders
2. System: getAdminStats() queried in parallel with practitioners/invites/candidates
3. System: Counts:
4.   - All practitioners (regardless of visibility)
5.   - Published practitioners only
6.   - Draft practitioners only
7.   - Sum of all viewCounts (denormalized from Practitioner table)
8. Admin: Sees 4-stat grid: Total | Published | Drafts | Total views

**Touches:** practitioners table (count + aggregate)
**Files:** `/app/admin/page.tsx` · `/app/admin/_data.ts`

**Edge cases / guards:**
- No practitioners: stats show 0 across board
- HIDDEN/NEEDS_REVIEW counted in Total but not in Published
- viewCount denormalized; ProfileView is source of truth but counts are never re-synced (eventual consistency)

## 6 · System / background

### Email Send via Resend  ·  ✅ Live; never throws on user-facing paths; Resend is the prod email provider (verified domain required)
**Trigger:** Admin: create invite, resend invite, or send completeness reminders; System: Clerk webhook

**Steps:**
1. Admin/System: Call sendEmail(msg) with {to, subject, html, text, replyTo?}
2. sendEmail: Check RESEND_API_KEY + EMAIL_FROM configured and valid (regex: local@domain)
3. System: Return {ok: false, reason: 'not_configured'} if missing or malformed (never throws on user path)
4. sendEmail: POST to https://api.resend.com/emails with headers (Authorization: Bearer {key}, Content-Type: application/json)
5. Resend API: Return 2xx with {id} on success, or 4xx/5xx on failure
6. sendEmail: Parse response, catch network exceptions, return {ok: true, id} or {ok: false, reason: 'http_error'|'exception'}
7. System: Log only message string on error (never raw error to avoid leaking auth headers)

**Touches:** process.env.RESEND_API_KEY (Resend auth) · process.env.EMAIL_FROM (verified domain format) · External: Resend API (https://api.resend.com/emails)
**Files:** `lib/email.ts` · `lib/email-templates.ts` · `app/admin/actions.ts`

**Edge cases / guards:**
- EMAIL_FROM present but malformed (e.g. '@domain.com') → treated as not_configured with console.error, never 422 from Resend
- Network timeout → caught as exception, returns {ok: false, reason: 'exception'}, logs message string only
- Resend 422 on a present-but-unverified domain → sendEmail bubbles as http_error, caller shows UI feedback
- Concurrent email send failures → best-effort per recipient, some succeed while others fail (no batch rollback)
- Email address validation done by caller (createInvite, sendCompletenessReminders); sendEmail trusts input

### Clerk → DB Sync Webhook (Auto-hide on ban/delete)  ·  ✅ Live; soft (hide, not erase); audit trail preserved in __holdHistory; OPEN DECISION: voluntary user.deleted should erase per Christie (not yet implemented)
**Trigger:** POST /api/webhooks/clerk from Clerk (user.updated or user.deleted)

**Steps:**
1. Clerk: Fire user.updated or user.deleted event to webhook URL
2. Route: Extract svix signature headers (svix-id, svix-timestamp, svix-signature)
3. Route: Check CLERK_WEBHOOK_SIGNING_SECRET env; return 501 if missing (fail-safe, not 500)
4. Route: Verify webhook signature via new Webhook(secret).verify(body, headers); return 400 on invalid signature
5. Route: Parse event data; extract clerkUserId and check if banned=true || locked=true (for user.updated) or event.type=user.deleted
6. Route: Query DB: SELECT Practitioner WHERE user.clerkUserId = {id}, visibility != HIDDEN
7. Route: If practitioner exists AND should hide: call applyHold to set __hold fieldValues key
8. Route: UPDATE Practitioner SET visibility=HIDDEN, fieldValues={...__hold, ...__verified, ...rest} (reserved keys preserved via spread)
9. Route: Return 200 ok (always, even if DB update fails, since Clerk retries on non-2xx)

**Touches:** process.env.CLERK_WEBHOOK_SIGNING_SECRET (Svix verify key) · DB: users table (clerkUserId foreign key lookup) · DB: practitioners table (visibility, fieldValues.__hold, fieldValues.__holdHistory) · Reserved keys: __hold (HoldRecord), __holdHistory (array), __verified (preserved), __presenceScan (preserved), __presenceScanHistory (preserved)
**Files:** `app/api/webhooks/clerk/route.ts` · `app/_lib/moderation.ts` · `prisma/schema.prisma`

**Edge cases / guards:**
- CLERK_WEBHOOK_SIGNING_SECRET not set → return 501 'not configured' (loud in logs, no DB hit)
- Signature verification fails → return 400, webhook can be replayed
- Practitioner already HIDDEN (visibility=HIDDEN) → skip update (idempotent), still return 200
- Practitioner row missing (user has no profile) → no-op, return 200
- Concurrent hold + profile save → __hold is appended to fresh read via direct spread, __verified survives
- DB update fails → route still returns 200 (Clerk will retry on non-2xx); hold message appears on next practitioner boot
- Multiple webhooks for same user (e.g. user.updated fired twice) → idempotent (already HIDDEN check prevents double-write)

### Profile-View Instrumentation (ViewBeacon + recordProfileView)  ·  ✅ Live; feeds the dashboard 7-day trend graph; self-views excluded; fire-and-forget design prevents page slowdown
**Trigger:** Seeker: navigate to /practitioners/[slug] (published practitioner page)

**Steps:**
1. Page: Render ProfilePage with <ViewBeacon slug={slug}> near the bottom (invisible component)
2. React: Mount ViewBeacon on initial hydration (useRef guard ensures single fire per load, ignores StrictMode double-invoke in dev)
3. ViewBeacon: Call recordProfileView(slug) server action (fire-and-forget, no await, no UI feedback)
4. Server Action: Query DB: SELECT Practitioner WHERE slug={slug} AND visibility=PUBLISHED; return null if not found or hidden
5. Server Action: Get current user via getCurrentDbUser(); if owner is viewing their own profile, skip counting (return early)
6. Server Action: INSERT ProfileView (practitionerId, viewedAt=now); increment Practitioner.viewCount via {increment: 1}
7. Server Action: Catch ALL exceptions silently; never throw to page or client (views are best-effort instrumentation)

**Touches:** DB: profile_views table (new row per view, practitionerId FK, viewedAt index) · DB: practitioners table (viewCount denormalized counter, incremented via atomic operation) · Clerk session (getCurrentDbUser to check ownership)
**Files:** `app/practitioners/[slug]/ViewBeacon.tsx` · `app/practitioners/[slug]/view-actions.ts` · `lib/auth.ts` · `prisma/schema.prisma`

**Edge cases / guards:**
- Profile is DRAFT or HIDDEN → query returns null, no ProfileView created (never count hidden profiles)
- Viewer is the practitioner (owner) → skip after getCurrentDbUser check, count is zero
- Database unconfigured locally → exception caught, silently swallowed, view not recorded but page still renders
- React 18 StrictMode in dev → useRef.current guard prevents double-count; only one INSERT per mount
- Concurrent calls (page loaded twice in tabs) → both succeed, two ProfileView rows created (no dedup — counts real visitors)
- viewCount already high → increment still atomic, no race condition (Prisma {increment} is SQL ATOMIC)
- ProfileView row insert fails but Practitioner update succeeds (or vice versa) → partial instrumentation (eventual consistency); next page load may retry

### Visibility-Scan Cache (__presenceScan + __presenceScanHistory)  ·  ✅ Live; migration-free (reserved `__` keys); gain-only framing (brand law); cached to avoid re-scanning; brand page reads from cache on every visit (no live Serper calls)
**Trigger:** Practitioner: click 'Check my visibility' on /practitioner/brand (runVisibilityAudit action)

**Steps:**
1. Brand Page: User clicks 'Check my visibility' button, calls runVisibilityAudit() server action
2. Server Action: Authenticate via getPractitioner(); return {ok: false, reason: 'unauthenticated'} if not signed in
3. Server Action: Check if result.practitioner exists; return {ok: false, reason: 'not_practitioner'} if seeker/unlinked
4. Server Action: Build coverage queries from specialties + region via buildCoverageQueries; return {ok: false, reason: 'no_region'} if empty
5. Server Action: Check process.env.SERPER_API_KEY; return {ok: false, reason: 'unconfigured'} if missing
6. Server Action: Construct Serper geo-target via toSerperLocation(region, {defaultState: 'Minnesota'}) for MN-aware search
7. Serper: For each coverage term (up to 8): POST to https://google.serper.dev/search with {q, num: 10, location, gl: 'us'}; fetch {organic, peopleAlsoAsk, relatedSearches, knowledgeGraph}
8. Serper: For top 3 coverage terms: POST to https://google.serper.dev/places with same geo-target; fetch local map-pack entries
9. Server Action: Pure aggregation in buildPresenceScan: collect which searches the practitioner appears in (foundTerms), whether KG present, whether in any map-pack, whether has reviews
10. Server Action: Re-read fresh fieldValues from DB (critical: scan spends seconds in Serper, re-read avoids clobbering concurrent hold or profile save)
11. Server Action: Compute PresenceDelta (gained terms since last scan) via presenceDelta(prev, next); nil if first check
12. Server Action: Persist via applyPresenceScan + appendSnapshot (both direct spread onto fresh fieldValues, preserving __hold/__verified siblings)
13. Server Action: UPDATE Practitioner SET fieldValues={...__presenceScan, ...__presenceScanHistory, ...rest}
14. Server Action: revalidatePath('/practitioner/brand') to bust Next.js cache and show new moon states immediately
15. Server Action: Return {ok: true, coverage, scan, delta} for client to render moons + newly-found terms

**Touches:** process.env.SERPER_API_KEY (Google SERP API key) · DB: practitioners table (fieldValues.__presenceScan, fieldValues.__presenceScanHistory reserved keys) · External: Serper API /search (per-term query → ~8 calls), Serper API /places (per-sampled-term → ~3 calls) · Reserved keys: __presenceScan (PresenceScan: {checkedAt, coverage, foundTerms, knowledgeGraphPresent, inAnyMapPack, reviewsKnown, questions, relatedSearches}) · Reserved keys: __presenceScanHistory (append-only PresenceSnapshot[] capped at 8 entries for momentum calc)
**Files:** `app/practitioner/visibility-actions.ts` · `lib/presence-scan.ts` · `lib/presence-history.ts` · `lib/visibility.ts` · `lib/serper.ts` · `lib/geo.ts`

**Edge cases / guards:**
- No region set on profile → query build returns empty, action returns {ok: false, reason: 'no_region'}
- SERPER_API_KEY missing → searchSerpPage/searchPlaces return empty/[], buildCoverage produces zero-coverage scan, still persists
- Concurrent visibility scan + hold action → re-read fresh before write preserves __hold and __verified
- Concurrent visibility scan + practitioner profile save → reserved __presenceScan/__presenceScanHistory keys are never touched by mergeFieldValues (which strips `__` keys), so no clobber
- Serper call times out after N seconds → exception caught in searchSerpPage, returns EMPTY_PAGE {organic: [], peopleAlsoAsk: [], ...}, coverage reads as zero coverage but action returns ok=true
- First check (no prior scan) → presenceDelta returns {firstCheck: true, newlyAppeared: []}, UI shows 'new' momentum state
- All searches dropped (foundTerms became empty) → gain-framed only, never shown as loss; newlyFound is empty
- Practice moved to new region → region field updated, next scan builds new queries, old history kept but no longer applies

### Safe DB Migrations + Backups  ·  ✅ Live; prod-safe design: generate-only first (no --apply), scan output, deploy separately via --deploy (never reset); backups downloadable for manual restore
**Trigger:** Dev: npm run db:migrate:safe -- <migration_name> | npm run db:migrate:deploy | npm run db:backup

**Steps:**
1. Dev: Run npm run db:migrate:safe -- <name> (name validated as alphanumeric + underscores)
2. Script: Show current migration state via npx prisma migrate status (may exit non-zero if pending/drift; that's expected)
3. Script: Record set of existing migration folders in prisma/migrations/ before generating
4. Script: Call npx prisma migrate dev --create-only --name <name> to GENERATE migration SQL without applying it
5. Script: Identify EXACTLY the new folder created (diff against before set, guards against stale folder re-scan)
6. Script: If no new folder generated → exit 0 (schema already matches DB); nothing to deploy
7. Script: Read generated migration.sql file; print it to stdout for dev review
8. Script: Scan SQL for destructive statements: DROP TABLE, DROP COLUMN, DROP CONSTRAINT, DROP INDEX, ALTER TABLE DROP, ALTER COLUMN TYPE, SET NOT NULL, RENAME COLUMN, TRUNCATE
9. Script: If destructive found → log warning list (human-readable), mention column RENAME shows as DROP+ADD (data loss), tell dev to review + delete folder if unintended
10. Script: If safe (only ADD) → log ✓, no warnings
11. Script: Print next steps: 1. review SQL 2. npm run db:backup (optional but wise) 3. npm run db:migrate:deploy
12. Dev: Run npm run db:migrate:deploy (applies pending migrations via npx prisma migrate deploy — never reset, never prompt to wipe DB)
13. Dev: Run npm run db:backup (downloads current DB snapshot to local file for manual rollback prep)

**Touches:** prisma/migrations/ directory (generated .sql files) · DATABASE_URL (read for deploy; never reset) · DATABASE_URL_UNPOOLED (used by prisma CLI for migrations via prisma.config.ts)
**Files:** `scripts/db-safe-migrate.mjs` · `scripts/db-backup.mjs` · `docs/DB-OPERATIONS.md` · `prisma/schema.prisma` · `prisma.config.ts`

**Edge cases / guards:**
- Migration name invalid (contains spaces, hyphens) → script exits 1 with usage help; no folder created
- Schema already matches DB (no diff) → migrate dev --create-only outputs 'no migrations generated'; script exits 0
- Destructive statements in SQL → script lists them but does NOT block (dev choice to review/delete folder); deploy still waits for next run
- Dev force-applied changes to production DB without migrations → prisma migrate status shows DRIFT; safe-migrate will detect it on next run (dev must fix schema.prisma or drift manually)
- Multiple devs run --create-only in parallel → prisma may create duplicate folders with different timestamps; script uses before/after diff to pick the right one, but conflict marker folders should be cleaned up
- DB unpooled connection times out → deploy still attempts via direct URL; may fail gracefully with Prisma error (not caught by script)
- Vercel Postgres (Neon) DDL lock timeout → script continues (migration SQL written but apply hangs); manual recovery needed (see DB-OPERATIONS.md)
