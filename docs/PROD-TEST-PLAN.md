# Production test plan — validate the live system

**For:** John (+ Nora for the admin flows) · How to use: set the config prereqs, then walk each flow on the **live site** and check it off. Priority: **P0** = launch-critical, **P1** = important, **P2** = good to confirm. The ★ flow is the one that proves the most.

> **Already verified (skip):** the DB migration (the `invites` table exists + matches the schema), that email *can* send (a real test send landed), 300 tests + build green, the claim logic is flow-tested. What's below needs *your* Clerk auth, *your* admin access, and *your* inbox — things the agent can't impersonate.

---

## 0 · Config prerequisites — set in Vercel, then redeploy
These gate the tests; do them first.

- [ ] **`EMAIL_FROM`** — a valid `@healingtides.co` address (it was malformed `@healingtides.co` with no local-part). Without it, emails won't send.
- [ ] **`ADMIN_EMAILS`** — your sign-in email. Without it, `/admin` 404s for everyone.
- [ ] **`SERPER_API_KEY`** — powers the brand-center visibility audit.
- [ ] **`CLERK_WEBHOOK_SIGNING_SECRET`** + the Clerk dashboard webhook (`user.updated` + `user.deleted`) — powers ban/delete auto-hide.
- [ ] **Rotate** the Neon / Clerk / Serper creds shared in chat — security, before real traffic.
- [ ] **Redeploy** after any env change.

---

## A · Practitioner onboarding · **P0**
- [ ] **A1 — Sign up.** Go to `/join` → sign up (Clerk + Google). → *Expected:* account created, you land on `/practitioner` (your dashboard).
- [ ] **A2 — Build a profile.** `/practitioner/edit` → the 4-step wizard (Basics · Practice details · Your voice · Review). Fill it in. → *Expected:* saves between steps; completeness % rises.
- [ ] **A3 — Publish.** Hit Publish. → *Expected:* the publish-gate only blocks if name/bio missing; once published, your profile appears in **`/practitioners`** and has its own page at **`/practitioners/your-slug`**.

## B · Claim flow · **P0 ★ (the one that proves the most)**
- [ ] **B1 — Mint a claim link.** `/admin` → "Create claim link" with a test name + an email *you control*. → *Expected:* a claim URL appears, and the invite shows in the **Sent invites** list as "Pending."
- [ ] **B2 — Claim it end-to-end.** Open the claim URL (incognito) → `/claim/[token]` shows the prefilled name → sign up with **the invited email** → on the dashboard, "Finish claiming" → your new profile is **prefilled** from the invite. → *Expected:* the invite flips to "Claimed"; no duplicate practitioner row; you can't claim it twice.

## C · Email · **P0** *(needs `EMAIL_FROM`)*
- [ ] **C1 — Invite email arrives.** In B1, mint the invite to **your own inbox**. → *Expected:* the calm "your place is ready" email lands (check spam on first send) with a working claim link.
- [ ] **C2 — Completeness reminder.** `/admin` → "Send reminders" (with a profile under 80% that has an email). → *Expected:* the "finish when you're ready" email arrives; a second click within 7 days sends nothing (cooldown).

## D · Public directory + profile · **P1**
- [ ] **D1 — Directory.** `/practitioners` (signed out, as a seeker) → use the specialty / format / region filters + free-text search. → *Expected:* only PUBLISHED profiles show; filters narrow correctly; drafts/held never appear.
- [ ] **D2 — Profile page.** Open a published `/practitioners/[slug]`. → *Expected:* bio, specialties, quick-details render; the contact/booking link works; view "Source" → the JSON-LD `Person` block is present (jobTitle, knowsAbout, areaServed).

## E · Brand center · **P1** *(needs `SERPER_API_KEY`)*
- [ ] **E1 — Visibility audit.** `/practitioner/brand` → run "Check my visibility." → *Expected:* it takes ~30–60s (real Google calls), then the 5 moons/scores move, the seeker-mirror shows real questions/words, momentum appears.
- [ ] **E2 — Calm + honest.** → *Expected:* no scores on the at-a-glance faces (revealed on tap), no red/✗, the "Start here" step + thesis read calm. MN locale is used (not the server's).

## F · Admin cockpit · **P1** *(needs `ADMIN_EMAILS`)*
- [ ] **F1 — List + search.** `/admin` → the practitioner table; search by name/email; the status chips (All / Published / Drafts / On hold) filter; "N of M" updates.
- [ ] **F2 — Invites management.** The Sent-invites list → Resend an unclaimed invite (email re-sends), Revoke an unclaimed invite (it disappears); a Claimed invite is read-only.
- [ ] **F3 — Verification badges.** Toggle a badge on a practitioner → it shows on their public profile immediately.
- [ ] **F4 — Moderation.** Hold a published profile → it vanishes from `/practitioners` + the practitioner sees a banner; Release → it returns. Nothing is deleted.

## G · Safety + compliance · **P2**
- [ ] **G1 — Crisis.** `/crisis` loads with resources; the footer 988 line is present sitewide.
- [ ] **G2 — Account deletion.** Clerk `UserButton` → delete account → the profile hides from public (today: hide, not hard-erase — the documented behavior).
- [ ] **G3 — Ban webhook.** *(needs the Clerk webhook secret)* Ban/delete an account in the Clerk dashboard → the profile auto-hides.

---

## Tips
- Use an **incognito window** (or a second browser) to test the seeker/claim side while signed in as admin in the main one.
- For the claim test, use **two different emails** you control (the admin email + the invited email) — the claim is email-matched.
- If a step fails, note exactly what you saw and the agent can diagnose + fix immediately.
