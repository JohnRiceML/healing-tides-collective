# UI System — how to build pages & components

> **The system to follow when creating any new page or component.** Pairs with the *visual* spec ([design-spec.md](../design-spec.md)) and the brand *voice* ([brand-guidelines.md](../brand-guidelines.md)). Owned by the style team (lead: `design-system-steward`). When this doc and the code disagree, **the code wins — fix this doc** (living-doc protocol in [AGENTS.md](../../AGENTS.md)).

**Last updated:** 2026-05-31.

## Sources of truth (reference, don't duplicate)
- **Tokens** → `app/globals.css` `@theme`: colors (`sand`, `sand-deep`, `white`, `charcoal`, `ink-soft`, `ink-muted`, `ocean`, `teal`, `sage`, `seafoam`, `rule`, `rule-strong`); fonts (`--font-display` = Fraunces, `--font-sans` = Inter); utilities (`.meta`, `.rule`, `.font-display`).
- **Visual spec** → `docs/design-spec.md`: 5 principles, type scale, 8pt grid, motion, the 90/10 imagery rule.
- **Voice** → `docs/brand-guidelines.md`: calm / grounded / certain; words we use & avoid.

## Non-negotiables
1. **Use tokens, never hardcode.** `text-charcoal` / `bg-sand` / `border-rule` / `font-display` — **not** `#2f2f2f`, `bg-[#f7f5f2]`, or `font-[family-name:var(--font-fraunces)]`. Need a new color/space? Add a token to `@theme` first (design-system-steward approves).
2. **Use the component library, don't hand-roll.** Buttons, cards, fields, containers, chips, pills already exist (below). Reuse them.
3. **Never pure black; never bright/saturated blue.** `charcoal` is the darkest; `ocean` is muted by design. `seafoam` is a garnish — never a section background.
4. **Spacious over dense.** Whitespace *is* the brand. 8pt grid (4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96). Section padding ≈ 96px desktop / 64px mobile.
5. **One next step per screen.** One obvious primary action. No directory walls.
6. **Calm, not hurried.** Motion is gentle (see below); copy is an exhale, not a sales line.

## Component library
A real library already exists at **`app/prototype/_components/ui.tsx`**: `SectionHeader`, `Card`, `Button`/`LinkButton` (tones: `primary` / `secondary` / `ghost` / `danger`), `Field` + `TextInput`/`TextArea`/`Select`, `ChoiceChip`, `StepDots`, `StatusPill`, `Container` (`narrow` 720 / `default` 960 / `wide` 1280), `DLRow`.

> ⚠️ **It's prototype-scoped today.** First task for `component-architect`: **promote it to a shared `app/_components/ui.tsx`** so every surface (incl. `/join`, `/practitioner`, the coming profile editor + directory + admin) imports the same components. Until then, follow these patterns — don't fork new button/input styles.

**Reach for a component before writing Tailwind.** A form → `Field` + `TextInput`. A CTA → `Button`/`LinkButton`. A surface → `Card`. A centered column → `Container`.

## Page shell (the standard new-page skeleton)
```tsx
import type { Metadata } from "next";
export const metadata: Metadata = { title: "… — Healing Tides Collective", description: "…" };

export default function Page() {
  return (
    <main id="main-content" className="min-h-screen bg-sand text-charcoal">
      <Container size="default" className="py-16 md:py-24">
        <SectionHeader eyebrow="…" title="…" body="…" />
        {/* content */}
      </Container>
    </main>
  );
}
```
- `id="main-content"` — the root layout's skip-link targets it.
- `bg-sand text-charcoal` is the base canvas.
- Wrap content in `Container`; pick `narrow` (prose/forms), `default`, or `wide`.
- Lead with a `SectionHeader` (eyebrow uses `.meta`; the h1 uses `font-display`).

## Voice in the UI (microcopy)
- **CTAs are lowercase verbs:** "get matched", "begin", "claim your profile" — not "Get Started" / "Sign Up Now".
- **Words we use:** care, fit, match, guide, begin, find, aligned, grounded. **practitioner** (not provider), **care** (not services / treatment / modalities).
- **Avoid:** holistic, journey, discover, empower / transform, modalities / synergy / optimize; *wellness* sparingly.
- **Litmus:** read it aloud — if it sounds like a yoga teacher selling **or** a doctor's intake form, rewrite.

## Responsive
- **Mobile-first.** Default = mobile; layer `md:` / `lg:` up.
- `Container` owns horizontal padding (`px-6 md:px-10`) — don't re-add it.
- Display type scales with `clamp()` (see `SectionHeader`).

## Accessibility (a11y-steward owns; everyone follows)
- **Contrast ≥ 4.5:1** for body text (charcoal-on-sand passes; `ink-muted` for small/secondary only).
- **Semantic HTML**, exactly one `<h1>` per page, logical heading order.
- **Focus-visible rings** on every interactive element (the library does this — keep it).
- **Labels** on every input (`Field`); `aria-pressed` / `aria-label` on custom controls (see `ChoiceChip`, `StepDots`).
- **`prefers-reduced-motion`** respected (globals.css kills animation; keep motion safe).
- **Trauma-informed:** calm, non-alarming. No aggressive reds, urgency timers, or shaming empty states. The reader sets the pace.

## Motion (motion-designer owns)
- **Easing** `cubic-bezier(0.22, 1, 0.36, 1)`. **Durations** 200ms micro / 400ms transition / 800ms page.
- **Pattern:** fade + 8–12px translate-up on scroll-in. **Never** bounce, spin, or carousels.
- **Library:** Framer Motion, always gated on `prefers-reduced-motion`.

## SEO / metadata
- Every page **exports `metadata`** (`title: "… — Healing Tides Collective"`, `description`).
- Public, indexable pages (practitioner profiles, journal): clean URL + **JSON-LD structured data** + sitemap entry (per-profile SEO is a stated selling point — see the practitioner brief).

## New-page checklist
- [ ] Page shell (`main#main-content`, `bg-sand`, `Container`, `SectionHeader`)
- [ ] `metadata` exported (title + description); JSON-LD if public/indexable
- [ ] Components from the library — no hand-rolled buttons/inputs
- [ ] Tokens only — no hardcoded hex/px; `font-display`, not arbitrary font values
- [ ] One clear primary action; voice checked (lowercase CTA, words-we-use)
- [ ] Responsive (mobile-first, `md:` up); a11y (contrast, focus, labels, one h1)
- [ ] Loading / empty / error states (calm, non-alarming)

## New-component checklist
- [ ] Lives in the shared library (not duplicated inline)
- [ ] Tokens only; matches existing radii / shadow / spacing language
- [ ] Keyboard + focus-visible; `aria` where custom; labelable
- [ ] Variants via a `tone`/`size` prop (see `Button`) — not copy-paste forks
- [ ] Composes with `Container` / `Card`; respects the 8pt grid
