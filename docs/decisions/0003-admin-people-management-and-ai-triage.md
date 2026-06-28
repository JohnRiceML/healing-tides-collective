# ADR 0003 — Admin "people management" is a triage layer (not an approval gate); AI triage is a simple cached pass

- **Status:** Accepted — 2026-06-28
- **Scope:** The admin command center (§9) — the practitioner detail/triage surface, bulk invite, and the daily-action home.
- **Owner:** John (build). Direction set in conversation; founder-facing tool for Nora.
- **Relates to:** ADR [0001](0001-matching-workspace-curation-not-ranker.md) (the seeker-matching side of the admin), ADR [0002](0002-seeker-onboarding-and-optional-accounts.md).

---

## Context

The June-10 brief's §9 admin spec used the words "applied / pending / approve-reject," which implies
an **approval gate** — practitioners apply and wait for Nora to let them in. But the app never built
that concept: practitioners sign up (or claim an invite) → a `DRAFT` profile → they **self-publish**;
moderation is reactive (admin Hold/Release). The ask this session was to "call out the application
queue" and let Nora **view, message, take notes, and have AI categorize accounts + surface insights**.

## Decision

**1. Build a triage / relationship layer, NOT a publish-blocking approval gate.** `/admin` becomes a
daily-action command center ("what needs you today"); `/admin/practitioners/[id]` lets Nora **view**
a profile, keep **private notes**, **email** the practitioner directly, and run a one-click **AI
triage**. Nothing blocks a practitioner from publishing.

**2. The AI layer is a simple, real, on-demand pass — cached + visualized.** One `generateObject`
call (the gateway model `anthropic/claude-haiku-4.5`, the same path as the bio importer) categorizes
the profile (feature / strong / polish / outreach / unclear) and flags 2–3 plain-language insights.
Result is cached in the reserved `__aiTriage` key and shown as a badge in the list + on the detail
page. "The system handles most of this later" = the same pass on a schedule.

**3. Practitioners first; seekers later.** The AI triage ships for practitioner accounts now and is
deferred for seeker intakes.

**4. Storage is migration-free reserved keys; messaging is email now, in-app later.** Notes →
`__adminNotes`, triage → `__aiTriage` (direct-spread writes). Outreach uses the existing Resend layer.

## Why

- **No gate, because a gate makes Nora the bottleneck** and adds friction to a directory that needs
  to *grow*. What she actually needs is to *see who's coming in, sort them, reach out, and remember
  context* — triage, not gatekeeping. The reactive Hold/Release moderation already covers the rare
  "take this down" case.
- **Real AI, kept simple** — the founder explicitly wanted an AI layer, and one cheap haiku call per
  account gives a genuine, useful read (category + insights) without cost or latency concerns
  (on-demand + cached). Reusing the importer's gateway path means **no new key** and a proven
  integration.
- **Practitioners first is the compliance-safe + highest-leverage call.** Practitioner profile data
  is **PII, not client PHI**, so summarizing it for triage is low-risk and ships *now*. Running AI
  over a seeker's private intake story is PHI-adjacent and waits for Christie's HIPAA determination.
  And it compounds the bulk-invite work: invite → they arrive → triage/note/reach-out closes the
  directory-growth loop, the current bottleneck (only ~2 published).
- **Non-judgmental framing is a brand requirement** — the triage is "a read to help you sort, not a
  judgment"; a category describes a *profile's readiness*, never a person.

## Notable implementation decisions (so they aren't re-litigated)

- **Reserved-key writes after a slow async op MUST re-read `fieldValues` fresh.** The AI call (~30–50s)
  and the email send are long windows; spreading a snapshot captured *before* them clobbers any
  concurrent reserved-key write (a note, a hold, a badge). This was a **HIGH lost-update bug caught in
  the pre-deploy review** and fixed by re-reading right before the write — now the canonical rule (see
  [architecture/BRAND-CENTER.md](../architecture/BRAND-CENTER.md) § reserved keys).
- **Practitioner bio is fenced as untrusted data** in the triage prompt (+ a system instruction to
  ignore embedded directions) — the bio is attacker-controlled; the zod-enum output caps blast radius,
  this is defense-in-depth.
- **The panel renders from server props** (router.refresh is the source of truth), not a local
  optimistic copy that could drift from or mask a dropped write.
- **Outreach email sets reply-to** to the admin so a reply reaches a human.

## Consequences / trade-offs

- **Accepted:** the AI read can be wrong or shallow (it's a starting point, re-runnable); a second AI
  vendor surface (gateway) for an admin tool; notes/triage live in the `fieldValues` JSON blob (fine
  at this scale; revisit if they grow).
- **Gained:** a real daily-driver admin + an AI assist, shippable now without the HIPAA gate, that
  directly serves directory growth.

## Alternatives considered

- **A real approve/reject publish gate** — rejected (bottleneck + friction); reactive Hold/Release
  already covers takedowns. Revisit only if quality control demands a pre-publish review.
- **Rules-based "AI" (heuristic tags, no model)** — rejected; the founder wanted a real AI read, and
  the haiku call is cheap/cached.
- **Seekers first** — rejected for now (PHI-adjacent → HIPAA-gated; lower current volume).
- **In-app messaging now** — deferred (needs a Message model + inbox); email covers the need today.
- **A new table for notes/triage** — rejected (migration-free reserved keys fit the established
  pattern).

## Revisit when

- You decide you *do* want a publish-blocking approve/reject gate (then add a `NEEDS_REVIEW` entry
  flow + an approve action).
- Christie's HIPAA call clears → extend triage to seeker intakes.
- Notes/triage volume or query needs outgrow the JSON blob → promote to a table.

**Built by:** lead build + an adversarial pre-deploy review (3 dimensions → per-finding verification;
10 findings → 5 real fixes incl. the HIGH lost-update). Verified: `tsc` + 432 tests + build + screenshots.
