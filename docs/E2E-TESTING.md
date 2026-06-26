# E2E tests (Playwright) — core pillars

End-to-end coverage of the journeys that matter most, driven through a real browser:

| Pillar | Spec | What it proves |
| --- | --- | --- |
| **Public** | `e2e/public.spec.ts` | Homepage responds; crisis page shows the 988 lifeline; the directory lists a published practitioner; a profile page renders; an unknown slug 404s. |
| **Feedback** | `e2e/feedback.spec.ts` | The widget tab opens its panel; it's hidden inside `/admin`; a submission shows the thank-you. |
| **Practitioner** | `e2e/practitioner.spec.ts` | Signed-out → "sign in"; signed-in practitioner → dashboard; a seeker is invited to set up (never auto-promoted); the editor opens. |
| **Admin** | `e2e/admin.spec.ts` | A non-admin gets a 404; an admin reaches the overview; the feedback queue shows seeded feedback. |

The two static specs (homepage, crisis, widget-opens) run anywhere. Everything that
touches data **skips green** unless a test database is configured (see below).

## The Clerk workaround

Playwright can't drive a real Clerk sign-in (bot detection, hosted UI, real creds). So the
E2E run starts the app with **Clerk disabled** and a **cookie-based test identity** instead:

- `playwright.config.ts` boots the dev server with the Clerk keys blanked (→ `clerkEnabled = false`)
  and `E2E_AUTH_BYPASS=1`.
- In that mode, `getCurrentDbUser()` ([lib/auth.ts](../lib/auth.ts)) reads an **`e2e_uid` cookie**
  (a test user's `clerkUserId`) and resolves it to a real `User` row — so every downstream gate
  (`getPractitioner`, `requireAdmin`) just works.
- A spec "signs in" with `signInAs(context, SEED.published)` ([e2e/_auth.ts](../e2e/_auth.ts)),
  which plants that cookie. No Clerk round-trip.
- Pages that gate on "is auth available" use `authEnabled` (`clerkEnabled || E2E_AUTH_BYPASS`),
  not raw `clerkEnabled`, so the bypass flows through them.

**Why this is safe in production:** two independent guards. (1) `E2E_AUTH_BYPASS` is set only by
the Playwright webServer, never in Vercel. (2) The bypass lives inside the `!clerkEnabled` branch,
and production runs with Clerk **enabled**, so that branch never executes there regardless. In prod,
`authEnabled === clerkEnabled` exactly.

## Running it

Static specs only (no DB) — proves the harness + public pages:

```bash
npx playwright install chromium   # one-time: browser binary
npm run test:e2e
```

Full suite — point at a **throwaway** Postgres (a Neon branch or local), NEVER prod
(`.env.local` → prod Neon; the config refuses to inherit it):

```bash
export TEST_DATABASE_URL="postgres://…"            # a test branch / local DB
DATABASE_URL=$TEST_DATABASE_URL npx prisma db push  # one-time: create the schema
npm run test:e2e                                    # global-setup seeds, then runs
```

`npm run test:e2e:ui` opens the Playwright UI for debugging.

## Notes

- The seed (`e2e/global-setup.ts`) TRUNCATEs and reseeds the test DB each run — fixtures in
  `e2e/fixtures.ts` (`SEED`) are the single source for both seed and assertions.
- The suite runs serially (`workers: 1`) — one app instance, one shared DB.
- This is separate from `npm test` (mocked unit/flow tests) and `npm run test:integration`
  (real-DB read/write layer). E2E is the only tier that drives the actual UI.
