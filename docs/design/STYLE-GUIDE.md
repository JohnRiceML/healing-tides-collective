# Design System & Style Guide — Healing Tides Collective

> **The canonical reference for how Healing Tides looks, sounds, and feels.** One front door for brand, voice, and the visual system. It documents the **system as shipped** — the tokens in [`app/globals.css`](../../app/globals.css) `@theme` and the components in [`app/_components/ui.tsx`](../../app/_components/ui.tsx) are the source of truth; **when this doc and the code disagree, the code wins — fix the doc** (living-doc protocol in [AGENTS.md](../../AGENTS.md)).
>
> **Companion docs:** [UI-SYSTEM.md](UI-SYSTEM.md) is the practical "how to build a page" checklist. This guide supersedes the older `design-spec.md` (v0.1 draft) and folds in `brand-guidelines.md`.
>
> **Owner:** the style team — `design-system-steward` (lead) + `component-architect` / `page-builder` / `a11y-steward` / `motion-designer`. **Last updated:** 2026-06-01.

---

## 0. How to read this

| You are… | Start at |
|---|---|
| Setting the vibe / writing copy | §1 Foundations, §2 Voice |
| Building a page or component | §3–§10, then the [UI-SYSTEM checklist](UI-SYSTEM.md) |
| Adding a color / token | §3 Tokens → §4 Color (add to `@theme` first) |
| Making sure it's accessible + kind | §11 Accessibility & trauma-informed |

---

## 1. Foundations

**What we are:** a guided "Get Matched" platform for finding clinical + holistic care. **Not a directory — a decision-making tool.** The modern front door to wellness. Founder: Nora L. Hollenkamp, MSW, LICSW.

**How it should feel:** *calm confidence · warm tech · spacious · trauma-informed.* A held breath, not a sales floor.

### The five principles
1. **Spacious over dense.** Whitespace *is* the brand. If a section feels tight, it's wrong. (8pt rhythm; ~96px desktop section padding.)
2. **Calm confidence.** Type and motion feel certain, never hurried. The brand is calm, not *small* — a hero headline can own the canvas.
3. **Warm tech.** Modern craft — soft shadows, smooth radii, a whisper of grain — without feeling clinical or SaaS-y.
4. **One next step.** Every screen has one obvious primary action. No directory walls, no choice overload.
5. **Photography or nothing.** On-brand imagery or lean on type + color — never generic stock.

These aren't decoration; they're tie-breakers. When two designs are plausible, pick the calmer, more spacious, more certain one.

---

## 2. Voice & tone

We sound **calm, grounded, and certain** — quietly reassuring, never hyped, clinical, or woo-woo.

| | We sound like | We don't sound like |
|---|---|---|
| **Tone** | Calm, grounded, certain | Hyped, clinical, woo-woo |
| **Pacing** | Spacious, deliberate | Punchy ad copy / dense paragraphs |
| **Vocabulary** | Plain, warm, specific | Jargon (*modalities, synergy, vibrations*) |
| **Emotion** | Quietly reassuring | Enthusiastic, salesy |

**Litmus test:** read it aloud. If it sounds like a yoga teacher *selling*, rewrite. If it sounds like a doctor's intake form, rewrite.

**Tone adapts; the flow does not.** One funnel serves all personas by leaning warm-and-clear:
- *Overwhelmed:* "We'll help you figure it out."
- *Practical:* "No guesswork. Just what works."
- *Curious:* "You don't have to figure this out alone."

### Words
- **We use:** care · fit · match · guide · begin · find · the right · aligned · considered · grounded. **Practitioner** (not *provider*). **Care** (not *services / treatment / modalities*). **Begin** (not *get started*).
- **We avoid:** *holistic* (describe the thing) · *journey* · *discover* (→ find/meet) · *empower / unleash / transform* (salesy) · *modalities / synergy / optimize* (jargon) · *wellness* (sparingly — it's the category, not our promise).

### Microcopy rules
- **CTAs are lowercase verbs** — "get matched", "begin", "claim your profile" — never "Get Started" / "Sign Up Now".
- **Headlines are an exhale, not a sales line.** "Find your fit." > "Search 10,000+ practitioners." Let one or two words own a line when it earns weight.
- **Empty/error states reassure, never shame** (see §11).

---

## 3. Design tokens — the model

We use a **tiered token model** (the design-systems standard — name for *why*, not *what*):

1. **Primitives** — the raw brand values, defined once in `app/globals.css` `@theme` (`--color-sand`, `--font-display`, …). Named by appearance.
2. **Semantic roles** — what each primitive is *for* (canvas, body text, primary action, accent, hairline). Today these roles live in **this guide** and in the component library's choices; §4–§7 give every primitive its role. *(If we ever add dark mode or re-skin, formalize these as semantic aliases in `@theme` — e.g. `--color-canvas: var(--color-sand)` — so components bind to roles, not hexes.)*
3. **Component tokens** — how a component uses a role, encoded in [`ui.tsx`](../../app/_components/ui.tsx) (e.g. a primary `Button` = `bg-charcoal text-sand`).

**The one rule that keeps this alive:** **use tokens, never hardcode.** `text-charcoal` / `bg-sand` / `border-rule` / `font-display` — **not** `#2f2f2f`, `bg-[#f7f5f2]`, or `font-[family-name:…]`. Need a value that doesn't exist? **Add a token to `@theme` first**, then use it. Tailwind v4 exposes every `@theme` color as `bg-*` / `text-*` / `border-*` automatically.

---

## 4. Color

A warm, low-contrast, sand-and-ink palette with muted blue-greens. The whole system is built to feel **calm** — which is also trauma-informed (cool, soft hues settle the nervous system).

| Token | Hex | Role — when to use |
|---|---|---|
| `sand` | `#F7F5F2` | **Canvas.** The default page background (`bg-sand`). Also the text color *on* charcoal. |
| `sand-deep` | `#EFEAE1` | **Sunken/subtle surface.** Hover fills, placeholder tiles, initial-circle avatars. |
| `white` | `#FFFFFF` | **Elevated surface.** Cards, inputs — anything that lifts off the canvas. |
| `charcoal` | `#2F2F2F` | **Primary ink + primary action.** Body text, headings, and the primary button / selected states. The workhorse. |
| `ink-soft` | `#4A4A4A` | **Secondary text.** Longer body copy, supporting paragraphs. |
| `ink-muted` | `#8A8580` | **Tertiary text.** Labels (`.meta`), hints, captions, timestamps. *Small / secondary text only* (see contrast note). |
| `ocean` | `#1F3A5F` | **Brand accent + the "alert" color.** The logo/identity blue, links, `::selection`, and — muted, never red — the `danger` button + alert states. |
| `teal` | `#5F8F8B` | **Secondary accent.** Eyebrows, the "Featured" tag, gentle links/section accents. The brand's warmth note. |
| `sage` | `#A8BFA3` | **Tertiary garnish.** Subtle highlights, status tints, illustration. |
| `seafoam` | `#D6EDE8` | **Lightest garnish.** Badges, hover, gentle highlight washes (e.g. the "what healing means to me" card at `/30`). **Never a section background larger than a card.** |
| `rule` | `#D9D4CA` | **Hairline.** Borders, dividers (`border-rule`, the `.rule` utility). |
| `rule-strong` | `#2F2F2F` | Strong hairline (= charcoal) for the rare emphasis divider. |

### Color rules (non-negotiable)
- **Never pure black.** `charcoal` is the darkest ink.
- **Never bright/saturated blue.** `ocean` is muted *by design*; that mutedness is the brand.
- **No alarming red.** We don't ship red. **`ocean` stands in for danger/alerts** (muted, calm) — a deliberate trauma-informed choice. (See the `danger` Button tone, and the `safeWebsite`-style "calm error" copy.)
- **`seafoam` / `sage` / `teal` are garnish** — one quiet note in a neutral frame, never the loud lead.
- **One accent per surface.** Don't stack teal + ocean + seafoam on the same component.

> ⚠️ **Reconciliation note:** the older `design-spec.md` called `ocean` the "primary brand color — CTAs." In the shipped system the **primary action color is `charcoal`** (every primary button is `bg-charcoal`); `ocean` is the brand/identity accent + the muted alert color. This guide reflects what shipped.

### Contrast (WCAG)
- `charcoal` on `sand` and `white` → passes AA for body text (≈ 11–12:1). Always safe.
- `ink-soft` on `sand` → fine for body.
- `ink-muted` on `sand` → **small/secondary text only** (it doesn't clear 4.5:1 at body size — never use it for primary reading copy).
- Accent text (`teal`, `ocean`) on `sand`/`white` → fine for labels/links; verify ≥ 4.5:1 if used at small sizes.

---

## 5. Typography

Two families, set in [`app/layout.tsx`](../../app/layout.tsx) via `next/font` and exposed as tokens:

- **Display / headings — Fraunces** (`font-display`). A warm, editorial serif. Grounded, slightly elevated, *certain*.
- **Body / UI — Inter** (`font-sans`, the default). Clean, humanist, neutral.

### Scale (as shipped — fluid `clamp()`)
| Use | Implementation | Notes |
|---|---|---|
| **Display / hero** | `font-display text-[clamp(32px,6vw,58px)]`, `leading-[1.06]`, `tracking-[-0.02em]` | Large + certain. Two words can own a line. |
| **Section title (`SectionHeader` h1)** | `font-display text-[clamp(34px,5vw,52px)]`, `leading-[1.05]` | One `<h1>` per page. |
| **Sub-head / h2** | `font-display` ~`clamp(24px,3vw,32px)` | |
| **Body** | `text-[15px]`–`text-[17px]`, `leading-[1.6]`–`[1.65]`, `text-ink-soft` | 15px UI, 16–17px reading. |
| **Small / hint** | `text-[13px]`–`text-[14px]`, `text-ink-muted` | |
| **Eyebrow / label** | `.meta` — 11px, `500`, `letter-spacing 0.18em`, uppercase, `text-ink-muted` | The signature small label. |

**Rules:** display gets `-0.02em` tracking and tight leading (1.05–1.15); body is loose (1.6) for calm reading. `h1–h4` use `text-wrap: balance` (set globally) to avoid orphans. Display attitude is **confident** — never timid.

---

## 6. Spacing, layout & grid

- **8pt grid.** Every spacing value is a multiple of 4: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`. Whitespace is the brand — when in doubt, add more.
- **Section padding:** ≈ `py-24` (96px) desktop / `py-16` (64px) mobile.
- **`Container`** owns horizontal layout + gutters (`px-6 md:px-10`) — don't re-add padding. Three widths:
  - `narrow` → `max-w-[720px]` (prose, forms, sign-in)
  - `default` → `max-w-[960px]` (most pages)
  - `wide` → `max-w-[1280px]` (directory grids, the landing, admin)
- **Mobile-first.** Default = mobile; layer `md:` / `lg:` up.

---

## 7. Radius, elevation & texture

**Radius** (smooth, never sharp): `rounded-2xl` (16px) for inputs / chips, `rounded-3xl` (24px) for cards, `rounded-full` for buttons + pills.

**Elevation** is whisper-soft and **ocean-tinted, not gray** — the warm-tech signature:
- Cards: `border border-rule/80` + a two-layer shadow `0 1px 0 rgba(31,58,95,.02), 0 18px 40px -32px rgba(31,58,95,.18)`. Lift, not pop.
- Most separation is a **hairline** (`border-rule`), not a shadow.

**Texture — the film grain.** A fixed, `pointer-events-none`, `soft-light` SVG-noise overlay at `opacity: 0.012` (`html::after` in globals.css) sits over everything. It breaks digital flatness at near-zero cost and is a core part of "warm tech" — keep it. Supporting textures: `.warm-tile` / `.paper-grain` (gradient stand-ins for photography).

**Imagery — the 90/10 rule.** 90% of any photo is neutral (sand, white, wood, linen); 10% carries one intentional brand-color note (a pale teal cushion, a sage plant). **Yes:** natural light, soft focus, hands, water, plants, *a studio in use*. **No:** spa-marketing clichés (lavender on white sheets, lotus-on-a-cliff). When real imagery isn't available, use type + color or an initial-circle placeholder (`bg-sand-deep`, `font-display` initial) — never stock. **Logo:** an abstracted tide/wave mark; avoid leaves, hands-holding-hearts, chakra symbols.

---

## 8. Motion

Gentle, certain, never attention-seeking. Owned by `motion-designer`; **Framer Motion**, always gated on `prefers-reduced-motion` (globals.css already neutralizes animation when it's set).

- **Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` — smooth, barely springy.
- **Durations:** `200ms` micro · `400ms` transition · `800ms` page-level.
- **Pattern:** fade + an 8–12px translate-up on scroll-in. The animated `.link-underline` (220ms wipe). **Never** bounce, spin, parallax-heavy, or carousels.

---

## 9. Components

The shipped library lives in **[`app/_components/ui.tsx`](../../app/_components/ui.tsx)** — **reach for a component before writing Tailwind.** Each below: what it's for, its variants, and the a11y it bakes in.

| Component | Purpose | Variants / key props | Built-in a11y |
|---|---|---|---|
| **`Container`** | Centered column + gutters | `size`: `narrow` / `default` / `wide` | — |
| **`SectionHeader`** | Page/section intro | `eyebrow` (`.meta`), `title` (h1, `font-display`), `body`, `align` | Renders the single `<h1>` |
| **`Card`** | Elevated surface | polymorphic `as` (`div`/`section`/`article`/`li`) | — |
| **`Button`** / **`LinkButton`** | Actions | `tone`: **`primary`** (charcoal) · **`secondary`** (bordered) · **`ghost`** (text) · **`danger`** (ocean, *not red*) | `focus-visible` ring; `disabled` styles |
| **`Field`** | Labeled form group | `label`, `hint`, `optional` | `<label>` wraps the control |
| **`TextInput`** / **`TextArea`** / **`Select`** | Inputs | share `baseInput` (rounded-2xl, `focus:ring-charcoal/10`) | Focus ring; pair with `Field` |
| **`ChoiceChip`** | Single-select option card | `selected`, `label`, `description` | `aria-pressed`; keyboard-native button |
| **`StatusPill`** | Status badge | maps status → calm tint (seafoam/sage/sand-deep) | Text label, not color-only |
| **`StepDots`** | Progress indicator | `total`, `current` | `aria-label="Step X of N"` |
| **`DLRow`** | Definition-list row | `label` (`.meta`) + value | Semantic `<dt>`/`<dd>` |

**Usage guidance**
- **Primary action = `Button` (primary).** One per screen. The `secondary`/`ghost` tones are for the quieter alternatives ("Take it down", "View →").
- **Need a "destructive" affordance?** Use `tone="danger"` — it's **ocean, never red**. Pair with calm copy ("Take it down — nothing is permanent").
- **Status / visibility** → `StatusPill` (and it must carry a text label, never communicate by color alone).
- **Forms** → always `Field` + an input; never a bare `<input>`. Hints go in `Field`'s `hint`, not placeholder text.
- **Don't fork styles.** New variant → add a `tone`/`size` prop to the existing component (see `Button`'s `tone`), don't copy-paste a new button.

---

## 10. Patterns

**Page shell** (the standard skeleton — full version in [UI-SYSTEM.md](UI-SYSTEM.md)):
```tsx
<main id="main-content" className="min-h-screen bg-sand text-charcoal">
  <Container size="default" className="py-16 md:py-24">
    <SectionHeader eyebrow="…" title="…" body="…" />
    {/* content */}
  </Container>
</main>
```
- `id="main-content"` is the skip-link target; `bg-sand text-charcoal` is the base canvas; lead with a `SectionHeader`.

**Empty states** — warm, not shaming. *"The collective is just getting started — new practitioners are being welcomed in. Check back soon."* Offer a way forward (a "clear filters" link), never a dead end.

**Error states** — calm, specific, blameless. Muted `text-ocean`, `role="alert"`, no red, no urgency. *"Add at least your name and a short bio before publishing."* — tells the user what to do, doesn't scold.

**Forms** — one clear primary action; labels above inputs; optional fields marked; inline, non-alarming validation; the reader sets the pace (no timers, no forced steps).

---

## 11. Accessibility & trauma-informed design

Accessibility and kindness are the **same discipline** here, and a first-class requirement — owned by `a11y-steward`, followed by everyone.

### Baseline (WCAG)
- **Contrast ≥ 4.5:1** for body text (`charcoal` passes; `ink-muted` is small/secondary only).
- **Semantic HTML**, exactly **one `<h1>`** per page, logical heading order, landmark `<main id="main-content">`.
- **Focus-visible rings** on every interactive element (the library does this — keep it).
- **Labels** on every input (`Field`); `aria-pressed` / `aria-label` on custom controls (`ChoiceChip`, `StepDots`).
- **`prefers-reduced-motion`** respected globally — keep new motion safe.

### Trauma-informed principles
The product helps people seek care, often while overwhelmed. Design for **safety, predictability, and control** (per trauma-informed design research):
1. **Calm, never alarming.** No aggressive reds, urgency timers, shaming language, or sudden motion. Cool, soft hues by default (the palette already does this).
2. **The reader sets the pace.** No forced flows, no countdowns, no auto-advancing carousels. One clear next step, always skippable/reversible.
3. **No-shame exits & reversibility.** Actions are undoable and framed gently ("Take it down any time — nothing is permanent"). Never trap or guilt the user.
4. **Predictable & consistent.** Same patterns, same words, same places. Predictability regulates the nervous system.
5. **Plain, human, non-clinical language.** Warm and specific (see §2). Avoid jargon and intake-form coldness.
6. **In control.** The user decides what to share and when; sensitive states (publish, visibility) are explicit and reversible.

---

## 12. Governance — keeping this alive

The #1 way a design system rots is **drift from code**. We prevent it by making code the source of truth and binding the docs to it:

- **Single source of truth.** Tokens live in `app/globals.css` `@theme`; components in `app/_components/ui.tsx`. This guide *documents* them — it never re-defines values. **Code wins; fix the doc.**
- **Add-a-token / add-a-component flow:** new color/space → add to `@theme` first (`design-system-steward` approves) → use the token. New component → it goes in the shared library with a `tone`/`size` prop, never a duplicated inline fork. The [UI-SYSTEM checklists](UI-SYSTEM.md#new-page-checklist) gate every page + component.
- **Same-change doc updates.** Move a token/component → update this guide + [SYSTEM.md](../SYSTEM.md) in the same PR (the living-doc protocol).
- **Periodic drift check.** When touching the design system, scan this guide against `globals.css` + `ui.tsx` and fix any stale value/screenshot/name.
- **Ownership:** `design-system-steward` (tokens, this guide, brand feel) · `component-architect` (the library) · `page-builder` (routes) · `a11y-steward` (§11) · `motion-designer` (§8).

---

## Quick reference

- **Feel:** calm confidence · warm tech · spacious · trauma-informed.
- **Canvas** `sand` · **ink/action** `charcoal` · **secondary text** `ink-soft` · **labels** `ink-muted` · **accent/alert** `ocean` (never red) · **warmth** `teal` · **garnish** `sage`/`seafoam` · **hairline** `rule`.
- **Type:** Fraunces display (`-0.02em`, tight leading) + Inter body (`1.6`). `.meta` = the 11px uppercase label.
- **Shape:** `rounded-2xl` inputs · `rounded-3xl` cards · `rounded-full` buttons. Hairlines over shadows; ocean-tinted soft shadow when you must lift.
- **Motion:** `cubic-bezier(0.22,1,0.36,1)`, 200/400/800ms, fade + translate-up, reduced-motion always.
- **Non-negotiables:** tokens never hex · reuse the library · one primary action · never black / never bright blue / never red · spacious over dense · the reader sets the pace.

---

### Sources (best-practice research, 2026-06)
Structure, foundations→components→patterns, component anatomy + when-to-use, and "docs rot without code-coupling": [Magic Patterns](https://www.magicpatterns.com/blog/design-system-documentation) · [UXPin](https://www.uxpin.com/studio/blog/7-best-practices-for-design-system-documentation/) · [LogRocket](https://blog.logrocket.com/ux-design/design-system-documentation/). The three-tier token model (primitive → semantic → component; name for *why*) + the [W3C Design Tokens Format](https://design-tokens.github.io/community-group/format/): [Contentful](https://www.contentful.com/blog/design-token-system/) · [design.dev](https://design.dev/guides/design-systems/). Trauma-informed principles (safety, predictability, no-shame exits, control, calming palette): [Bunnyfoot](https://www.bunnyfoot.com/2025/01/how-trauma-informed-design-can-improve-user-experiences-for-all-audiences/) · [UX Content Collective](https://uxcontent.com/a-guide-to-trauma-informed-content-design/) · [UX Magazine](https://uxmag.com/articles/trauma-informed-design-understanding-trauma-and-healing).
