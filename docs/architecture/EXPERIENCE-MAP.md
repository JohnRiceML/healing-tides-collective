# Experience Map — the two-sided system

> How Healing Tides works for its **two audiences**. Decided 2026-05-31. Routing owned by `page-builder` + `design-system-steward`; data by the DB team. **Living doc** — update when the journeys/routes change. See also [PHASE-2-SYSTEMS.md](PHASE-2-SYSTEMS.md), the [practitioner brief](../briefs/practitioner-listing-mvp.md).

## Two audiences, opposite intents
- **Seekers (demand)** — *"help me find the right care."* Often anxious / exploratory, low commitment. Want **guidance + browsing**.
- **Practitioners (supply)** — *"help me be found / grow my practice."* Higher commitment, and the **revenue side** (promotion / tiers, later). Their experience must feel **premium**.

The intents are *opposite* (shopping vs. selling), so the entry is **two self-selected doors**, not a shared funnel. **The fork is at the landing, not at `/join`.**

```
                          ┌─ "find care"          → SEEKER path
   Landing (/) ── forks ──┤
                          └─ "for practitioners"  → PRACTITIONER path
```

## Seeker journey (the *nice* journey)
| Stage | Route | Account? | When |
|---|---|---|---|
| Land | `/` (seeker-primary landing) | no | now |
| Browse the directory | `/practitioners` | no | **MVP** |
| View a profile | `/practitioners/[slug]` (SEO, indexable) | no | **MVP** |
| Guided "get matched" → matches | *(matching brief)* | yes (+ PHI/consent) | **later** |

Seekers **browse anonymously** in the listing MVP. Accounts + the guided intake arrive with the **matching brief** — where HIPAA/PHI lives, deliberately deferred.

## Practitioner journey (the *premium* journey)
| Stage | Route | Account? | When |
|---|---|---|---|
| Pitch — "here's your profile, why join" | `/for-practitioners` | no | **MVP** (Nora's June pitch) |
| Sign up | `/join` *(practitioner only)* | creates account | **MVP** |
| Build / manage profile | `/practitioner` | yes (`role = PRACTITIONER`) | **MVP** |
| Appear in the directory | `/practitioners/[slug]` | — | **MVP** |
| Promotion / tiers / featured | *(dormant `tier`/`featured` hooks exist)* | yes | **later** (revenue) |

## Accounts: typed by role, never by guessing
- One Clerk identity; **`User.role` ∈ `SEEKER | PRACTITIONER | ADMIN`** decides the post-login home.
- MVP: only **practitioners** (and admin/Nora) have accounts. **Seekers are anonymous.**
- **`/join` is the practitioner door only** — seekers never "join," they "find care."
- Tailoring comes from **which door you chose + your role** — not from detecting/guessing.

## Route map (listing MVP)
| Route | Audience | Purpose | Status |
|---|---|---|---|
| `/` | seeker | Landing (find care; secondary "for practitioners" CTA) | live — *add the practitioner CTA* |
| `/practitioners` | seeker | Public directory — browse / filter / search | **to build** |
| `/practitioners/[slug]` | both | SEO profile page (indexable, JSON-LD) | **to build** |
| `/for-practitioners` | practitioner | Pitch / "claim your profile" | **to build** |
| `/join` | practitioner | Sign up (Clerk + Google) | ✅ built |
| `/practitioner` | practitioner | Profile dashboard / editor | ✅ stub built |
| `/prototype/admin*` | admin | Nora's command center | prototype |

## Deliberately later
- **Seeker accounts + guided matching** → the matching brief (PHI-gated).
- **Practitioner monetization** (promotion / tiers / featured) → the dormant `tier`/`featured` hooks are already in the schema.
