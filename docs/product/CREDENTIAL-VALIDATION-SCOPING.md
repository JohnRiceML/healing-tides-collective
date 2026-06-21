# Credential validation — scoping & Greg handoff

**Status:** SCOPING (2026-06-20). A 4-lens research pass (credential landscape · legal/trust · architecture). Intended as a hand-off so a dev (Greg) can start without re-discovering the hard parts. Companion to the existing manual badge system ([verification.md](verification.md), `app/_lib/verification.ts`).

> **🗺️ Scope: MINNESOTA ONLY (v1)** — every board, lookup, and credential type below is MN-specific by design (see [SYSTEM.md § Scope](../SYSTEM.md)). Multi-state is a future expansion, not a gap.

---

## ⚠️ The honest verdict (read this first)
**There is no fully-automatic credential verification available today, and "automatic" should not be promised.** All three research lenses independently confirmed it:
- **No MN licensing board** (Social Work, Behavioral Health & Therapy, Nursing, Medical Practice) offers a public, documented, queryable **API** — only HTML lookup *portals*, several behind bot-detection (ShieldSquare).
- **Scraping those portals** without written board permission violates their ToS and carries **CFAA risk** — a real legal exposure, not a technicality.
- So the buildable, responsible MVP is **admin-assisted verification**: make Nora's manual review *fast, structured, and auditable* — not autonomous. The badge should promise *"a human (Nora) verified this on [DATE]"*, never an instant ✓.

True automation is a **later, deliberate investment** (negotiated board access, a paid verification vendor, or legally-reviewed scraping) — each a commitment Nora/Christie must opt into. Don't build it for v1.

---

## The credential reality (what's verifiable, and how)
| Credential | Authoritative source | Tier |
|---|---|---|
| **LICSW** (clinical social worker) | MN Board of Social Work — portal, no API, bot-walled | 🟡 semi (human-in-loop) |
| **LMFT / LPCC / LADC** | MN Board of Behavioral Health & Therapy — one portal, no API | 🟡 semi |
| **RN / LPN / APRN** | MN Board of Nursing — free public lookup, no bot-wall (the cleanest) | 🟡 semi |
| **LAc** (acupuncture) | MN Board of Medical Practice (DocFinder) — verify the *state license* as proxy for NCCAOM | 🟡 semi |
| **RYT** (yoga) | Yoga Alliance public directory — "listed", not "certified"; no bulk API | 🟡 semi (onboarding only) |
| **LMT** (massage) | **None** — MN doesn't license massage. No registry. | 🔴 manual / self-claim |
| **Reiki** | **None** — MN Safe Harbor law exempts it. Private certs unverifiable. | 🔴 manual / self-claim |

"Semi" = a human opens the public lookup and confirms; nothing is queried programmatically in v1.

---

## Phase 1 — the MVP (admin-assisted, ~2–3 weeks / 10–15 dev-days, NO automation)
1. **Structured credential form** in the practitioner editor: per-credential `{ type (dropdown), licenseNumber, state, expiresAt?, optional doc upload → Blob }`. Stored under a **new reserved key `__credentialClaims`** (so a practitioner can't self-grant a badge — same `mergeFieldValues` guard that protects `__verified`/`__hold`).
2. **Admin Verification Hub** (extend `BadgeEditor` or a new `CredentialVerificationManager`): a "pending review" list; for each licensed credential a **"Open board lookup" deep-link** to the correct public MN portal (Nora clicks, reads, decides). For LMT/Reiki/RYT, replace with "no public verification — review the uploaded doc or accept self-reported."
3. **Grant via the existing `setVerificationBadges`** action — `licensed_professional` for state-licensed, `verified_credentials` for specialty. **Required notes field**, auto-logged.
4. **Audit trail** under a reserved key `__verificationAttempt` / history: `{ credential, status: pending|verified|notfound|lapsed, method: manual, verifiedBy, verifiedAt, notes }`. This satisfies the negligent-credentialing liability requirement (every grant logs *who / when / what was seen*).
5. **Honest, lawyer-approved badge copy** (public profile): *"Licensed Professional — verified by Healing Tides on [DATE]; license was active and in good standing on the verification date."* Unverified credentials are **hidden** in Phase 1 (not shown with a confusing "self-reported" label).
6. **One-time backfill**: parse existing practitioners' free-text `credentials` string into `__credentialClaims` (status=pending) so Nora has a worklist.

**No DB migration** — everything lives in reserved `fieldValues` keys, exactly like `__verified`/`__hold`. Promote to a real `CredentialVerification` table only if Phase 2 polling/expiry justifies it.

## Phase 2 / 3 — real automation (3–6+ months, ONLY if Nora commits)
Pick **one** path for the state-licensed types: **(A)** negotiate read-only/API access with the 3–5 priority MN boards (free, legal, slow — needs founder outreach); **(B)** integrate **one paid verification vendor** (~$75/check, vendor owns the scraping/ToS risk; still excludes yoga/reiki/massage); **(C)** legally-reviewed scrapers for 1–2 high-volume boards *only after* confirming ToS allows it. Then: per-board lookup modules + a Vercel-cron orchestrator over `pending` records, lapsed-credential handling (7-day grace + email, **never** silent badge removal — Christie signs off), and periodic re-verification. All gated behind a `VERIFY_CREDENTIALS_ENABLED` kill-switch.

---

## Greg's handoff
**Build first (Phase 1, no automation):** the structured form → `__credentialClaims`; the Admin Hub with board deep-links; the audit trail; the honest badge copy; the backfill. A flow test: *practitioner adds credential → Nora verifies → badge appears → audit entry written.*

**Decide with Nora before coding:** the shortlist of ~10 recognized credential types + which 3–5 boards are priority. (BUILD-TRACKER already flags this "license/board URL list" as **owed by Nora** — it's a *blocking* prerequisite; it shapes the taxonomy + form.)

**Do NOT build** scrapers, a cron, or any programmatic board query for the MVP — ToS/CFAA exposure that needs Christie first. Treat the Phase 2 pipeline as a design doc, not a task.

**Greg's parallel research task:** contact MN Social Work, Behavioral Health & Therapy, and Medical Practice to ask whether read-only API/data access exists for a third party, and document each board's ToS. This determines whether Phase 2 is path A, B, or C. (Nora/Christie lead the outreach; Greg documents.)

**PII guardrails (non-negotiable — db-integrity + legal):** store only name + license# needed for lookup; **never log license numbers**; uploaded docs → Blob with admin-only access, never shown to seekers; retain ~2 years after a badge is revoked, then soft-delete. Test with **synthetic** license numbers only (`MN1234567`), never real ones.

---

## Open decisions
| Decision | Owner | Recommendation |
|---|---|---|
| Which credentials to verify first? | Nora | MN-licensed clinical types (LICSW/LMFT/LPCC/LADC/LAc) — highest trust + liability; defer specialty certs |
| LMT (massage) verification? | Nora | Self-claim (MBLEx is a test not a license; city licenses too fragmented) |
| Reiki? | Nora | Self-claim + org name (Safe Harbor reflects MN policy) |
| RYT (yoga)? | Nora | One-time Yoga Alliance directory lookup at onboarding |
| Unverified creds: hide vs "self-reported" label? | Nora + Christie | **Hide** in Phase 1 (simpler, safer) |
| Exact public badge wording | Christie | Must avoid implying endorsement/guarantee/monitoring; "active on [DATE]" |
| Lapsed/disciplined license found later → ? | Nora + Christie | Flag for Nora initially; codify a written Verification Policy |
| Phase 2 path (if pursued) | Nora + Christie | Don't commit until Greg's board outreach returns answers |

## Top risks
- **Over-promising "automatic."** The #1 risk — no board API exists. Mitigation: frame as admin-assisted; honest badge copy.
- **Legal exposure from scraping** (ToS/CFAA). Mitigation: no scraping in MVP; Phase 2 needs Christie.
- **Negligent-credentialing liability** — a badge implies due diligence. Mitigation: the required audit trail + "active on [DATE]" language.
- **False negatives** — a valid, newly-issued license not yet in a board's DB reads as "not found." Mitigation: manual override + a kind "Nora will review within 48h," never a hard fail.
- **Scope creep** from the rich Phase 2 design. Mitigation: ship Phase 1 first; Phase 2 is gated on legal + board outcomes outside Greg's control.

## How it ties to the guided-matching system
The verification badge is a **trust signal that feeds the talk-guided / seeker-matching system** ([MATCHING-BRIEF-DRAFT.md](MATCHING-BRIEF-DRAFT.md)) — as a *ranking/filter input, not a hard gate*. A seeker can see "Healing Tides verified [LICSW] on [DATE]" as a trust boost and filter by "verified licensed professional." Because Phase 1 is admin-assisted and specialty wellness credentials (reiki/yoga/massage) have **no** verifiable authority, the matching layer must treat "verified" as a *bonus*, never a requirement — or it would silently bury the unlicensed-but-legitimate holistic practitioners the directory exists to include.
