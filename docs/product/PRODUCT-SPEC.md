# Product Spec — from Nora (2026-06)

> Nora's full product vision, captured from her responses to the Phase-2 inputs ask. This is the **canonical spec** for the upcoming builds. Taxonomy lives separately in [taxonomy.md](taxonomy.md) + `app/_lib/taxonomy.ts`. Status of each piece is tracked in [../BUILD-TRACKER.md](../BUILD-TRACKER.md).
>
> Scale note: this spans the rest of the **practitioner** side *and* the whole **seeker / matching** side (previously the deferred brief) + an admin founder dashboard + a verification system + membership tiers. It is **many builds**, not one — see the roadmap at the bottom.

---

## 1. Practitioner profile fields — "Join the Healing Tides Collective"
A much richer profile than today's (display name / bio / region / format / specialties / insurance / gender / values). Sectioned, warm intro per section. Several fields need **file upload** (photo, video, license/cert docs) → Vercel Blob.

**🌿 Your Story** — Photo · Video introduction (optional) · "Tell us about yourself" (what led you to this work) · "Why Healing Tides?"
**🌿 Background & Training** — Professional title · Credentials & licensure (+ upload) · Years of experience · Education & training (+ upload) · Gender identity (optional) · Languages spoken
**🌿 Approach to Healing** — "What does healing mean to you?" (the existing values prompt) · "What can clients expect?" · Therapeutic/practitioner style (warm, direct, collaborative, structured, intuitive, strengths-based, trauma-informed, playful…) · Modalities & approaches (techniques — *separate from session format*, see taxonomy.md)
**🌿 Who You Support** — Areas of focus (**3–8 categories**, see taxonomy) · Populations served · Age groups (Children / Adolescents / Adults / Older Adults / Couples / Families / Groups) · "Who is most likely to thrive working with you?"
**🌿 How We Connect Clients With You** — Session format (Virtual / In-Person / Hybrid) · Typical availability (weekday mornings/afternoons, evenings, weekends) · Current availability (**Accepting new clients / Limited openings / Waitlist**) · Earliest start date
**🌿 Investment & Logistics** — Session cost · Sliding scale availability · Insurance accepted · Booking link · Website · Social media (optional)
**🌿 Final Reflection** — "What would you like potential clients to know about you before reaching out?"

---

## 2. Membership & pricing (3 tiers)
Drives the dormant `Practitioner.tier` / `featured` hooks + access gating (Stripe).

| Tier | Price | Headline | Key gates (beyond Intro) |
|---|---|---|---|
| **Intro** | **$10/mo** | Establish a presence | Profile listing · photo + bio · **up to 3** specialties · contact/website link · category-search inclusion · direct inquiries |
| **Premium** | **$25/mo** | Greater visibility | **Featured placement** · expanded profile (video, more photos) · **unlimited** specialties · testimonials · availability indicator · direct scheduling link · priority referrals · monthly performance insights |
| **Collective Practice** | **$100/mo** | Group practices / centers | **Up to 10 practitioner profiles** · dedicated practice page · logo/branding · partner-org featured placement · team directory · referral submission · priority referrals · quarterly spotlight |

Implication: Intro caps specialties at 3 (vs the 3–8 default); Premium unlocks featured + video + scheduling; Collective adds an **Organization** entity owning multiple practitioners.

---

## 3. Client (seeker) journey — *the matching side*
Nora's ideal arc: **Share → Feel Seen → Choose a Path → Connect.** Warm, no-pressure, reader sets the pace (trauma-informed by design).

1. **Entry:** "Let's find a good match for you." Reassuring intro — you can browse yourself *or* let us help; you don't have to choose now.
2. **Guided intake (free-text):** "What brought you here today?" — open, gentle prompt; supports seeking for **someone else** (child/partner/parent). Example seeds: "I'm feeling overwhelmed and anxious", "navigating a breakup", "reconnect with my body", "in recovery", "grieving a loss", "looking for community".
3. **Feel seen (reflection):** before showing anyone, the platform **summarizes back** what they said ("It sounds like you're carrying a lot… support with anxiety and overwhelm… someone who helps reconnect with the nervous system"). Then asks "What feels important in a practitioner?" and reflects again.
4. **Choose a path** (no wrong choice):
   - **Browse the Collective** — suggested categories highlighted + full directory; filter by specialty/modality/availability; save favorites; request intro; schedule consult.
   - **Personalized recommendations** — **3 curated** practitioners/modalities, each with a "**why we selected them**" note (first name only initially, for warmth). Example trio: Nora (somatic / anxiety & perfectionism / warm, collaborative), Sarah (trauma-informed yoga / nervous-system / gentle movement), Miguel (recovery / addiction & transitions / strengths-based).
5. **Connect:**
   - **Request an Introduction** (→ create free account) or **Schedule a Consultation**.
   - **Intro flow:** Healing Tides emails **practitioner** ("We'd like to introduce you to Emily…") + **client** ("We've reached out to Sarah… expect a reply in 1–2 business days…"). Practitioner replies **"I'd love to connect"** or **"I may not be the best fit"** (with a gentle re-routing message). Practitioner can send an **auto-message** (template provided) or write their own.

### Client account / dashboard ("My Journey")
Free account unlocks: personal intros, save favorites (practitioners + modalities), track recommendations/matches, see who you've connected with, response notifications, revisit/update preferences, resources/events, "pick up where you left off."
Dashboard sections: **My Journey** (home — "I'm looking for support with…") · **My Matches** (recommendations, intro requests, saved practitioners + modalities, past recommendations) · **My Healing Team** (chosen providers) · **Resources for the Journey** (education; link to blog; recommended by interest) · **Reflections** (a journal/notes section for before/after sessions).

---

## 4. Search, filters & matching — importance tiers
- **Highest:** Specialty/category · Availability · Virtual vs In-Person · Insurance/Cost · Age group served
- **Medium:** Modality · Credentials · Trauma-informed approach · Location
- **Personalized:** Gender preference · Language · Cultural identity · Spirituality · LGBTQ+ affirming

## 5. Contact & booking flow
- **Intro tier / no-account clients:** practitioner lists **email or website** (not phone). Visible to non-account clients.
- **Premium / account clients:** booking link (Calendly, SimplePractice…) · in-platform contact form · "Request an introduction through Healing Tides."

## 6. Trust & verification — tiered badges
Not binary "licensed/not." Badges communicate **safety / training / expertise / trustworthiness** without implying all practitioners share the same training.
- **Verification levels (badges):** ✔ Verified Identity (gov ID) · ✔ Verified Credentials (cert/training reviewed) · ✔ Licensed Professional (active license verified) · ✔ Advanced Certification · ✔ Insured Practitioner · 🌊 Founding Member · 🤝 Community Partner.
- **Client-facing display:** name + credentials + a few badges (e.g. "✔ Licensed Professional · ✔ Verified · 🌊 Founding Member").
- **Credential catalog** (for verification + the practitioner's "Professional title"): grouped — Licensed Mental Health (LICSW, LGSW, LPCC, LPC, LMFT, LP, MD/DO psychiatrist, PMHNP, LADC…), Medical & Integrative (MD, DO, NP, PA, ND, DC, LAc…), Nutrition & Wellness (RD/RDN, CNS, health/wellness coach…), Movement & Mind-Body (RYT-200/500, C-IAYT, DMT, somatic, breathwork…), Recovery & Addiction (LADC, recovery coach, peer specialist, doula…), Holistic & Alternative (Reiki, craniosacral, sound healing, energy, Ayurveda, herbalist, massage…). Each with verification inputs (license #, state, expiration, upload / cert + training org + years).
- **Soft "fit" factors** (for matching): client preferences ("What kind of support feels right?", "What kind of person do you feel comfortable opening up to?", personality style, desired outcome, preferred approach, stage of healing, energy preference, community vs individual, openness to holistic) + practitioner preferences ("I do my best work with…": high achievers, young adults, parents, men, women, healthcare workers, recovery populations, trauma survivors, spiritual seekers).

## 7. Geography & availability
Search by **City / State / Country / Virtual-only**. Practitioner availability states: **Accepting new clients / Waitlist available / Not currently accepting**. Founder's north-star question: *"If someone lands here struggling, what should happen in their first five minutes?"* → the guided intake + "feel seen" reflection is the answer.

---

## 8. Admin — Founder Dashboard
Replaces the current read-only `/admin` list. **Top: "This Week's Priorities"** (Community: N awaiting matches · Collective: N new applications · Partnerships: follow-ups · Events · Growth). Then:
1. **Community Pulse** — what people seek + where support is needed (new requests, seekers, returning/active users; what people are looking for by category; emerging needs / trending searches / gaps; insights: avg time to match, successful referrals, most-viewed practitioners).
2. **Connections** — the matching pipeline: New Requests (name/date/seeking/preferences/status) · Match Queue · Introduction Requests (sent/accepted/declined/pending) · Consultations (scheduled/completed/converted) · Follow-Up Needed.
3. **Collective Members** — practitioner directory + filters · **Pending Applications** (credential/licensure review, profile completion) · Membership management (Intro/Premium/Group) · practitioner performance · spotlight rotation · support (onboarding, renewals).
4. **Events & Gatherings** — public + practitioner events; RSVPs/attendance/revenue/feedback; community partnerships; resource library.
5. **Growth & Insights** — MRR, new/renewals, membership breakdown.
6. **Growth Metrics** — practitioners (total/new/retention) + individuals (new/active/successful matches).
7. **Category Insights** — which categories are growing.
8. **Geographic Insights** — where support is needed (Minneapolis, St. Paul, suburbs, Greater MN) + gaps.
9. **Success Indicators** (beyond revenue) — People Connected to Care · Warm Introductions Made · Practitioners Supported · Consultation-to-Match Rate · Community Events Hosted.

---

## What this implies for the data model (synthesis)
New/expanded entities beyond today's `User` + `Practitioner` + `ProfileView`:
- **Practitioner**: many new fields (title, credentials[], years, education, languages[], video, "what clients can expect", style[], populations[], age groups[], availability state, earliest start, session cost, sliding scale, booking link, socials, final reflection). Areas-of-focus already wired.
- **Organization** (group practice, ≤10 practitioners) + membership **tier** (Intro/Premium/Collective) + **verification** records/badges.
- **Seeker** (account) + **IntakeRequest** (free-text + reflections + preferences) + **Recommendation** (curated trio + "why") + **Introduction** (practitioner/client states + messages) + **Consultation** + saved favorites + **Reflections** (journal).
- **Event** + **Partnership** + **Resource**.
- Instrumentation for the admin metrics (views, intros, matches, MRR).

## Roadmap (recommended sequence)
1. ✅ **Taxonomy** — wired (`app/_lib/taxonomy.ts`).
2. **Practitioner profile fields** — expand the schema + editor to §1 (incl. photo/video/doc upload → Blob). Highest near-term value; it's the listing we already ship.
3. **Membership tiers + Stripe** — §2; lights up `tier`/`featured` gating.
4. **Verification badges** — §6; trust on profiles.
5. **Admin founder dashboard** — §8; replaces the read-only list (needs the metrics + pipeline).
6. **Seeker side / matching** — §3–§5 (intake → feel-seen → browse/curate → introduction → client dashboard). The biggest build; gated on the **PHI/HIPAA** decision (free-text intake about health = sensitive). Its own brief.
