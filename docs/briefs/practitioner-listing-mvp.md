# Healing Tides — Practitioner Listing MVP

> **Build brief** for the **first** shippable flow — before the client intake / matching engine.
> **Status:** in build on branch `feat/practitioner-listing-mvp`. **Added:** 2026-05-31.
> **Deadline driver:** must be **demo-able for a practitioner networking event, mid-June 2026.**
> Source: owner (Nora). Related: [SYSTEM.md](../SYSTEM.md), [PHASE-2-SYSTEMS.md](../architecture/PHASE-2-SYSTEMS.md). The matching engine is a **separate** brief; profiles here must be structured to feed it.

Covers: practitioner sign-up, a config-driven profile, a public browsable/filterable directory, a "claim your profile" flow for the existing waitlist, and a minimal admin slice for the owner (Nora).

**Why it ships first:** owner's stated #1 priority; must demo at the mid-June event; converts the existing ~40-person waitlist into live listings while interest is hot; and — critically — **practitioner profile data is not PHI**, so it sidesteps the HIPAA question that gates the client side and lets the team move fast.

**Overriding constraint: flexibility.** Nora will continuously revise categories, specialties, profile fields, and filters. **Build the engine; let Nora own the content as editable data, not hardcoded values.**

## 1. Product intent (the "why")
Give every practitioner a real presence — a profile page with a photo, a story, specialties, and links out — and put them in a directory people can browse and filter. **The bar to beat is Psychology Today:** more personal, more curated, and **each profile is individually discoverable on Google and by LLMs (per-profile SEO is part of the point).** For the June event, Nora shows practitioners "this is what your profile will look like" and they sign up on the spot. Success = a practitioner goes **invite → claimed → published → visible** with minimal hand-holding.

## 2. Core principles (apply throughout)
1. **Config-driven, owner-editable.** Category taxonomy, specialty list, profile fields, and directory filters are stored as data and editable by Nora (eventually in the admin panel; at minimum as structured config a developer updates in minutes). Seed from Nora's profile-questions document. **Version them.**
2. **Profiles must feed the future matcher.** Capture now every field the matcher needs so there's no re-intake: **specialties** (from the shared taxonomy), **modality** (in-person / hybrid / virtual), **location/region**, **insurance accepted**, **practitioner gender**, and a **values / "what healing means to me"** free-text field.
3. **Free for everyone in V1.** No paywalls or billing gates now — but include **dormant data hooks** so tiers and group practices are cheap to add later (§6).
4. **Practitioners are busy and won't babysit a portal.** Short sign-up, lead with a pre-filled claim flow, notifications to their work email.
5. **Instrument everything.** Track application/claim/publish status, profile completeness, and **profile views** (the view counts become upsell evidence later).

## 3. System components
### 3a. Sign-up & auth
- Account creation via **Google auth**, with account deletion (foundation layer).
- A separate **"claim your profile"** path for the waitlist: import the existing ~40 contacts (spreadsheet: first name, last name, email, and specialty/website where given), generate a **tokenized, pre-filled claim link per contact**, finish with "a couple follow-up questions" rather than from scratch. Copy, in Nora's voice: *"We saw you're interested — claim your profile here."*

### 3b. Practitioner profile (schema-driven)
Field set is **config, not hardcoded** (Nora can add/remove/reorder). Seed fields:
- Display name, photo upload, bio.
- **Specialties** — multi-select from the shared category taxonomy (§3d).
- Social / website links.
- **Values / "what healing means to me"** free text (prominent — the differentiator; powers values-based matching later).
- **Modality** (in-person / hybrid / virtual), **location/region**.
- **Insurance accepted** (practitioner business info — not client PHI — fine to store).
- **Practitioner gender** (used as a client preference filter in matching).
- *(Dormant, later)* consultation availability.

Practitioners edit their own profiles anytime. Track a **completeness score** and nudge incomplete profiles.

### 3c. Directory (public)
- Browsable list of published profiles with **filters** (category/specialty, modality, location, insurance, gender) and **free-text search**. Filter set is config-driven.
- **Each profile is its own SEO-friendly, indexable public page** (clean URL, meta tags, structured data) — ranks on Google, citable by LLMs. Free acquisition channel + a selling point.
- Visibility states: `draft` → `published` (and `hidden` / `needs_review` as needed).

### 3d. Configurable content (the flexibility core)
All editable data, seeded from Nora's document, loaded at runtime.
- **Category taxonomy** — ~7 top-level categories, each with the sub-identities people describe themselves as. Practitioner specialties and (later) client issues draw from this one vocabulary so both sides match cleanly. Example shape:
  ```json
  {
    "id": "anxiety_stress",
    "label": "Anxiety & Stress",
    "identifies_as": ["generalized anxiety", "panic", "work stress", "burnout"]
  }
  ```
- **Profile field schema** — ordered field definitions (`id`, `label`, `type`, `options`, `required`, `role`: `display` | `filter` | `match_signal`), so Nora can change what practitioners are asked.
- **Directory filters** — which fields are exposed as filters and how (chips, dropdowns, toggles).

Because these are data: "add a category" / "make insurance a filter" is a **config edit, not a rebuild.**

### 3e. Admin slice (Nora's command center — MVP floor)
- A list of practitioners with **status** (invited / claimed / published / needs nudge) and **completeness**.
- View, edit, publish/unpublish, and *(dormant)* feature a profile.
- Send invite & follow-up emails to the waitlist — start with a **manual "send"** action; automated follow-up can come from the email infra later.
- Basic counts (applications, published, profile views). Nora will provide a dashboard sketch; treat the above as the functional floor and lay it out to extend toward her sketch.

## 4. Data model notes
- **No client PHI here** — the entire reason listing ships first. Standard PII handling for practitioner accounts (email, etc.).
- **Account type hook:** `account_type` = `individual` now; reserve `group_practice` / `treatment_center` for later — one umbrella account holding multiple sub-listings (a recovery center already wants to list the facility + its sober-housing options).
- **Tier hook:** nullable `tier` / `featured` flags on the practitioner record, unused/unenforced in V1, present so premium placement / dedicated pages / blog features are cheap to switch on later.
- **Match-readiness:** specialties, modality, location, insurance accepted, gender, and the values field stored in **structured** form so the matcher consumes them directly — **no re-intake.**

## 5. Out of scope for this MVP (defer)
- The client intake / matching engine (separate brief) — but profiles must be structured to feed it.
- Any client-side experience.
- Billing / paid tiers (Stripe is wired in the foundation layer, but every listing is free and untiered now).
- Scheduling/calendar, in-app messaging, notes — all later.

## 6. Build priorities / acceptance criteria
1. A practitioner can sign up (or **claim** a pre-filled invite), complete a profile (photo, bio, links, specialties, values, modality, location, insurance, gender), and **publish** it.
2. Published profiles appear in a public directory that is **browsable, filterable, and searchable**, and each has its own **SEO-friendly indexable page**.
3. Practitioners can edit their own profiles; **completeness** is tracked and nudged.
4. Nora can change **categories, specialties, profile fields, and filters without a code deploy.**
5. From the admin slice, Nora can see invited/claimed/published status and **send invite/follow-up emails** to the ~40 waitlist contacts.
6. The data model carries **dormant hooks** for tiers and group-practice/treatment-center accounts; everyone is free and untiered.
7. **All fields the future matching engine needs are captured in structured form** (no re-intake later).
8. The whole thing is **demo-able for the mid-June networking event.**

## 7. Inputs still required (block the content, not the engine)
- **Practitioner profile question set / fields** — Nora's document (incl. the values prompt).
- **Category taxonomy** — the ~7 categories and sub-identities (Nora has a draft).
- **The waitlist** — the ~40-contact spreadsheet (import + pre-filled claim links).
- **Top-level practitioner dashboard sketch** — even rough; sets admin direction.
- **Confirmations:** free-only for V1 (assumed yes); a sketch of future paid tiers to shape the dormant hooks sensibly.
