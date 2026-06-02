# Care Taxonomy — Healing Tides Collective

**Source of truth: [`app/_lib/taxonomy.ts`](../../app/_lib/taxonomy.ts)** (`CATEGORIES`). From Nora's spec, 2026-06. This doc holds the rules + the client-side search keywords; the tree itself lives in code.

## Structure
Three levels: **Category → Subcategory → Topics** (search/SEO keywords).

| # | Category | Subcategories |
|---|---|---|
| 1 | **Emotional Wellbeing** | Anxiety & Stress · Depression & Emotional Health · Burnout & Overachievement |
| 2 | **Trauma & Recovery** | Trauma Healing · Nervous System Healing · Addiction & Recovery |
| 3 | **Relationships & Connection** | Dating & Relationships · Marriage & Partnerships · Family & Parenting · Divorce & Separation |
| 4 | **Grief & Life Transitions** | Grief & Loss · Major Life Changes |
| 5 | **Mind-Body Healing** | Somatic Healing · Yoga & Mindful Movement · Dance & Expressive Arts · Breathwork & Meditation |
| 6 | **Identity & Personal Growth** | Self-Discovery · Confidence & Self-Esteem · Spiritual Exploration |
| 7 | **Women's Wellness** | Hormonal Health · Motherhood |
| 8 | **Men's Wellness** | Men's Mental Health |
| 9 | **Physical Wellness** | Sleep & Restoration · Nutrition & Gut Health · Movement & Fitness |
| 10 | **Community & Belonging** | Support Groups · Community Healing |
| 11 | **Alternative & Integrative Healing** | Energy & Holistic Healing · Integrative Wellness |

## Rules
- **Practitioner "Areas of Focus":** pick a **minimum of 3, maximum of 8** Healing Tides **categories** (the 11 above). Subcategories are available within each for refinement. *(Min/max enforcement is a profile-editor TODO.)*
- **Directory filtering** is by category today (`SPECIALTY_OPTIONS` = the 11 categories).

## ⚠️ Open decisions
1. **Selection granularity** — category vs subcategory. Today practitioners pick **categories** (matches Nora's "3–8 categories"). If she wants **subcategory**-level selection, swap how `SPECIALTY_OPTIONS` is derived in `taxonomy.ts` (no schema change — `specialties` stays a `String[]` of ids).
2. **"Modality" naming clash.** Our DB `modality` enum is actually **session format** (Virtual / In-Person / Hybrid). Nora's spec uses **"Modalities & Approaches"** to mean clinical techniques (EMDR, somatic, reiki, breathwork…) — a *separate* field. When the profile expands, rename the format field and add a real "modalities/approaches" field (likely drawn from the subcategory/topic list).

## Client-side search keywords (SEO / "what people search")
Nora's research into what seekers actually type — seed terms for search + SEO landing content, mapped to categories. (Captured verbatim for later use.)

- **Anxiety & Stress:** anxiety symptoms, why am I anxious, panic attacks, burnout, nervous system regulation, how to stop overthinking, ADHD vs anxiety, somatic therapy, overwhelmed, exhausted, stuck, unmotivated, emotional exhaustion, work stress, compassion fatigue, caregiver burnout, how to set boundaries
- **Depression & Mood:** depression symptoms, signs of depression, why am I so tired all the time, high-functioning depression, depression vs burnout, seasonal depression, how to get motivated when depressed, depression treatment without medication, functional freeze, nervous system shutdown, somatic depression, depression and gut health
- **Trauma & PTSD:** PTSD symptoms, childhood trauma, fight/flight/freeze/fawn, complex PTSD (CPTSD), trauma bonding, EMDR therapy, somatic therapy, how trauma affects the brain/relationships, polyvagal theory, attachment trauma, generational trauma, trauma stored in the body, somatic healing exercises
- **Relationships & Family:** attachment styles (avoidant/anxious), "why do I attract avoidant partners", relationship anxiety, boundaries, red flags, emotional availability, healthy communication, narcissistic relationship, trauma bonding, situationship
- **Grief & Loss:** grief and the nervous system, somatic grief, non-death losses (divorce/identity/fertility/health), loss of a parent/spouse, pet loss, anticipatory grief, stages of grief, complicated grief, grief vs depression, "why am I still grieving years later", grief support groups
- **Body & Somatic Work:** how to release stress/trauma from the body, nervous system regulation exercises, breathing exercises, yoga for stress, somatic experiencing, polyvagal exercises, freeze/functional freeze, "how to get out of survival mode", body-based healing
- **Addiction & Recovery:** anxiety/depression and alcohol, "why do I drink when I'm stressed", self-medicating, recovery meetings near me, AA, SMART Recovery, relapse prevention, trauma-informed recovery, codependency, Al-Anon, relapse warning signs/recovery
- **Diagnostic Testing (intent):** adult ADHD, neurodivergent testing, depression/anxiety/ADHD/autism/PTSD/bipolar/BPD tests — *(note: a "is this me?" entry point; we surface practitioners, not diagnoses.)*
