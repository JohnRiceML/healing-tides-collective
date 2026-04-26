# Decisions Log

Append-only log of meaningful choices. Format:

```
## YYYY-MM-DD — Short title
**Decision:** What we picked.
**Why:** The reasoning.
**Alternatives considered:** What we passed on.
**Revisit when:** Trigger for re-evaluating.
```

---

## 2026-04-26 — Project kickoff
**Decision:** Project is named "Healing Tides Collective" as working name. Phase 1 = landing page + waitlist, Phase 2 = Get Matched flow.
**Why:** Founder's preferred name; no domain or trademark check yet. Phase 1 narrows scope so we can validate brand + capture demand before building the matching engine.
**Alternatives considered:** Going straight to MVP matching tool — rejected as too risky without brand validation and audience.
**Revisit when:** Domain availability check completes, OR after first 50 waitlist signups (validate name resonates).

## 2026-04-26 — Stack choice
**Decision:** Next.js 16 + React 19 + Tailwind v4 + Sanity + Vercel + Resend.
**Why:** Matches John's existing toolchain (Augurian, ClawPort, CreatorReach). Reuse muscle memory. Sanity is cleanest editorial CMS for a non-technical founder. Resend is simple for transactional email.
**Alternatives considered:** Webflow (rejected — founder doesn't have it, John doesn't build there), Framer (rejected — same), Astro (rejected — Next.js gives us a better Phase 2 path for matching logic).
**Revisit when:** If founder wants to self-edit visual design later — would push us back toward Webflow / Framer.

## 2026-04-26 — Color direction
**Decision:** Sand / charcoal / ocean / teal / sage / seafoam palette per `docs/design-spec.md`.
**Why:** Aligns with founder's references (Lifetime, Kairos, Sacred Woman). Muted, warm, elevated.
**Alternatives considered:** Brighter coastal blues — rejected per founder note "avoid overly bright blues."
**Revisit when:** Logo design might shift one accent, or photography direction reveals the palette feels too cool.

## 2026-04-26 — Domain: healingtides.co
**Decision:** Use `healingtides.co` as the production domain. Founder already owns it.
**Why:** Available, on-brand, founder is committed to the name. `.co` is widely accepted; tradeoff is occasional `.com` mistypes.
**Alternatives considered:** Wait and try to acquire `healingtides.com` first. Rejected because (a) we don't know if it's available without checking, (b) `.co` is a fine TLD and we shouldn't block launch on the `.com`.
**Follow-up:** Cheap defensive move — check if `healingtides.com` is available; if so, grab it for redirect to `.co`.
**Revisit when:** Quarterly brand review, or if a `.com` collision causes user confusion in analytics.

## 2026-04-26 — Visual references locked from 4 founder images
**Decision:** Founder shared four reference images that anchor the visual direction. Saved to `assets/inspiration/`. The synthesis is documented in `inspiration/mood-board.md` ("Synthesized direction" table).
**Why:** Replaces guessed direction with concrete founder taste. Confirms: spaciousness, mature plants as architecture, warm wood, 90/10 neutral-with-color-pop, real bodies in real practice, confident large-display type (per prAna ref).
**Alternatives considered:** Continuing with text-only direction — rejected, the images sharpened "warm tech" considerably.
**Revisit when:** Logo lands, or first landing page render — re-validate that the page reads with the same temperature as these references.

## 2026-04-26 — Phase 1 ships waitlist, not matching
**Decision:** Landing page + email waitlist only on first launch. No questionnaire, no practitioner directory, no booking.
**Why:** Validate name, brand, and demand before building the harder thing. Waitlist signups become the audience for Phase 2 launch.
**Alternatives considered:** Ship a fake-door "Get Matched" button that just collects email — rejected as too cute. The waitlist framing is honest and still captures intent.
**Revisit when:** End of Phase 1 (2026-05-24).
