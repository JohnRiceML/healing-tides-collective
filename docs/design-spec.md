# Design Spec — Healing Tides Collective

**Status:** v0.1 draft (2026-04-26). Will iterate after first landing page render.

## Design principles
1. **Spacious over dense.** Generous whitespace is the brand. If a section feels tight, it's wrong.
2. **Calm confidence.** Type and motion should feel certain, never hurried.
3. **Warm tech.** Modern UI craft (subtle shadows, smooth radii, refined micro-interactions) without feeling clinical or SaaS-y.
4. **One next step.** Every screen has one obvious action. No directory walls.
5. **Photography or nothing.** If we can't get on-brand imagery, lean on type + color rather than stock.

## Color system

| Token | Hex | Usage |
|---|---|---|
| `--sand` | `#F7F5F2` | Primary background — soft, warm, default canvas |
| `--white` | `#FFFFFF` | Cards, elevated surfaces |
| `--charcoal` | `#2F2F2F` | Body text, primary headings |
| `--ocean` | `#1F3A5F` | Primary brand color — CTAs, key accents, logo |
| `--teal` | `#5F8F8B` | Secondary brand — section accents, links |
| `--sage` | `#A8BFA3` | Tertiary — illustrations, subtle highlights |
| `--seafoam` | `#D6EDE8` | Accent only — hover states, badges, gentle highlights |

**Rules**
- Never use pure black. `--charcoal` is the darkest text.
- Never use bright/saturated blues. The ocean is muted by design.
- Seafoam is a garnish — never a section background larger than a card.
- Min contrast ratio: 4.5:1 for body text.

## Typography

**Stack (proposed — to validate in landing page render):**
- **Display / headings:** a refined serif with warmth. Candidates: *Fraunces*, *Cormorant Garamond*, *GT Sectra*. Goal: feels grounded, editorial, slightly elevated.
- **Body / UI:** a humanist sans. Candidates: *Inter*, *General Sans*, *Söhne*. Goal: clean, legible, neutral.

**Scale (rem, mobile → desktop)**
| Use | Mobile | Desktop |
|---|---|---|
| Display | 2.5 / 3.0 | 4.5 / 5.5 |
| H1 | 2.0 | 3.0 |
| H2 | 1.5 | 2.0 |
| H3 | 1.25 | 1.5 |
| Body | 1.0 | 1.125 |
| Small | 0.875 | 0.875 |

**Line-height:** 1.15 for display, 1.25 for headings, 1.6 for body.
**Tracking:** -0.02em on display, default elsewhere.

**Display attitude:** confident. Per the founder's prAna reference (`assets/inspiration/02-prana-wellness-week.png`), hero headlines should feel **large and certain** — not timid. The brand is calm, not small. When a hero says "Find your fit." those three words can occupy the canvas.

## Spacing & layout
- **8pt grid.** All spacing is multiples of 4 (4, 8, 12, 16, 24, 32, 48, 64, 96, 128).
- **Container max-width:** 1200px. Inner content rarely exceeds 720px for prose.
- **Section padding:** 96px top/bottom desktop, 64px mobile.
- **Border radius:** 12px default, 20px for hero / large surfaces, 999px for pills.

## Motion
- **Durations:** 200ms (micro), 400ms (transitions), 800ms (page-level).
- **Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` — smooth, slightly springy.
- **Patterns:** fade + 8–12px translate up on scroll-in. Never bounce. Never carousels.
- **Library:** Framer Motion (consistent with rest of John's stack).

## Imagery direction
- **Yes:** natural light, soft focus, hands, water, plants, real practitioners (when sourced), texture macro shots, **mature plants as architecture (palms, fiddle leaf, monstera), warm wood floors, teak + linen, real bodies mid-practice (per founder's prAna reference), one intentional pop of brand color in an otherwise neutral frame.**
- **No:** stock wellness clichés (lavender on white sheets, women laughing with salad, lotus poses on cliff edges), **anything that reads as "spa marketing" rather than "studio in use."**
- **The 90/10 rule:** 90% of any photograph should be neutral (sand, white, wood, linen). 10% carries an intentional brand color note (pale teal cushion, sage plant, ocean towel). Reference image `04-spa-courtyard.png`.
- **Logo:** nature-based, sophisticated. Direction: a single abstracted tide curve or wave-as-circle mark. Avoid leaves, hands holding hearts, generic chakra symbols.

## Components (initial inventory for landing page)
- Nav (transparent → solid on scroll)
- Hero (full-bleed, single H1, single CTA — "Get Matched")
- Three-up persona reassurance row
- "How it works" — three steps, generous spacing
- Practitioner-side value prop section (split layout)
- Email capture / waitlist form
- Footer (minimal — logo, tagline, contact, socials)

## Voice cues for design
- Headlines should feel like an exhale, not a sales line.
- "Find your fit." > "Search 10,000+ practitioners."
- "Begin here." > "Sign up now."
- Use one or two words alone on a line when it earns weight.
