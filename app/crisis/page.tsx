import type { Metadata } from "next";

import { Container, LinkButton } from "@/app/_components/ui";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "If you need support now — Healing Tides Collective",
  description:
    "Immediate support lines and grounding practices. If you're in crisis, call or text 988. Healing Tides helps you find ongoing care — it is not emergency care.",
  alternates: { canonical: `${SITE_URL}/crisis` },
  openGraph: { url: `${SITE_URL}/crisis` },
};

// Verified, national 24/7 lines. 988 and 211 route the caller to their nearest
// Minnesota center automatically, so no local numbers are hard-coded here. Nora can
// add specific MN county crisis-team lines when she has the canonical list.
const crisisLines = [
  {
    name: "988 Suicide & Crisis Lifeline",
    detail: "Call or text 988.",
    note: "24/7, free, confidential. Routes you to the nearest Minnesota center.",
    href: "tel:988",
  },
  {
    name: "Crisis Text Line",
    detail: "Text HOME to 741741.",
    note: "If a phone call is too much. Texts only.",
    href: "sms:741741?body=HOME",
  },
  {
    name: "SAMHSA Helpline",
    detail: "Call 1-800-662-4357.",
    note: "Treatment referrals for mental health and substance use.",
    href: "tel:18006624357",
  },
  {
    name: "211",
    detail: "Dial 211.",
    note: "Local help for housing, food, utilities, and mental health across Minnesota.",
    href: "tel:211",
  },
];

const practices = [
  {
    title: "Box breathing",
    minutes: "3–5 min",
    summary: "When your chest is tight and your mind is moving faster than you can follow.",
    body: (
      <>
        <p>
          Inhale slowly through your nose for 4 counts. Hold for 4. Exhale through your mouth
          for 4. Hold for 4. That&rsquo;s one round.
        </p>
        <p>
          Do four rounds. Then notice — without grading it — what shifted. Sometimes the answer
          is &ldquo;not much.&rdquo; That&rsquo;s still information.
        </p>
      </>
    ),
  },
  {
    title: "5–4–3–2–1 grounding",
    minutes: "2 min",
    summary: "When you feel pulled out of the room and into your head.",
    body: (
      <>
        <p>
          Look around. Name five things you can see. Four things you can touch. Three things
          you can hear. Two things you can smell. One thing you can taste.
        </p>
        <p>
          It&rsquo;s not about beating anxiety. It&rsquo;s about returning to your senses, one at
          a time, until the body remembers it is here.
        </p>
      </>
    ),
  },
  {
    title: "The second-arrow practice",
    minutes: "5 min",
    summary: "For the suffering that comes after the suffering.",
    body: (
      <>
        <p>
          A Buddhist idea: when something painful happens, that&rsquo;s the first arrow. The
          second arrow is the story we tell about it afterward — what it means about us, what we
          should have done.
        </p>
        <p>
          When you notice the second arrow firing, name it: &ldquo;That&rsquo;s the story. The
          story is not the thing.&rdquo; Then come back to what is actually happening in this
          minute. You don&rsquo;t have to keep shooting the next arrow yourself.
        </p>
      </>
    ),
  },
];

const externalResources = [
  {
    name: "Open Path Collective",
    href: "https://openpathcollective.org",
    description: "Therapists offering sliding-scale rates of $40–$80/session. One-time membership.",
  },
  {
    name: "Inclusive Therapists",
    href: "https://www.inclusivetherapists.com",
    description: "Therapists committed to social justice. BIPOC, LGBTQ+, and disability-affirming care.",
  },
  {
    name: "Therapy for Black Girls",
    href: "https://therapyforblackgirls.com",
    description: "A directory and community for Black women and girls. Founded by Dr. Joy Harden Bradford.",
  },
  {
    name: "Latinx Therapy",
    href: "https://latinxtherapy.com",
    description: "Spanish- and English-speaking therapists. Resources also available without sign-up.",
  },
  {
    name: "National Queer & Trans Therapists of Color Network",
    href: "https://nqttcn.com",
    description: "A directory of QTBIPOC mental health practitioners. Mental health fund available.",
  },
  {
    name: "Open Counseling",
    href: "https://blog.opencounseling.com/hotlines-us",
    description: "A maintained list of free, confidential mental health hotlines by state and concern.",
  },
];

export default function CrisisPage() {
  return (
    <main id="main-content" className="min-h-screen bg-sand text-charcoal">
      <Container size="wide" className="py-14 md:py-20">
        <header className="max-w-2xl">
          <p className="meta text-teal">Care, today</p>
          <h1 className="font-display mt-3 text-[clamp(30px,4vw,42px)] font-light leading-[1.05] tracking-[-0.02em] text-charcoal">
            If you need support right now.
          </h1>
          <p className="mt-4 text-[15.5px] leading-[1.65] text-ink-soft">
            None of these will judge you for reaching out. If you&rsquo;re not sure whether
            it&rsquo;s &ldquo;serious enough,&rdquo; that question alone is reason enough.
          </p>
        </header>

        {/* Not-emergency disclaimer — calm, but unambiguous. */}
        <div className="mt-8 rounded-2xl border border-ocean/20 bg-seafoam/30 p-5 md:p-6">
          <p className="text-[14.5px] leading-[1.6] text-charcoal">
            <span className="font-medium">This is not emergency care.</span> If you&rsquo;re in
            immediate danger or thinking about harming yourself, call{" "}
            <a href="tel:911" className="font-medium text-ocean underline-offset-2 hover:underline">911</a>{" "}
            or go to your nearest emergency room. Healing Tides helps you find ongoing care — we
            don&rsquo;t provide therapy, diagnosis, or emergency services.
          </p>
        </div>

        {/* Crisis lines */}
        <section className="mt-12">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-2xl text-charcoal md:text-[26px]">Reach a person, 24/7</h2>
            <p className="meta text-ink-muted">24/7</p>
          </div>
          <ul className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {crisisLines.map((c) => (
              <li key={c.name}>
                <a
                  href={c.href}
                  className="group block h-full rounded-3xl border border-ocean/15 bg-white p-6 transition-colors hover:border-ocean/40 hover:bg-seafoam/20"
                >
                  <p className="meta text-ocean/80">Reach out</p>
                  <h3 className="font-display mt-3 text-[19px] leading-tight text-charcoal">{c.name}</h3>
                  <p className="mt-3 text-[16px] font-medium text-charcoal">{c.detail}</p>
                  <p className="mt-2 text-[13px] leading-[1.5] text-ink-soft">{c.note}</p>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Grounding practices */}
        <section className="mt-16">
          <h2 className="font-display text-2xl text-charcoal md:text-[26px]">Practices you can try today</h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-[1.6] text-ink-soft">
            Free. No login. Nothing to download. Take what fits, leave the rest. Not a substitute
            for the right practitioner — but a reasonable first move on a hard afternoon.
          </p>
          <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {practices.map((p) => (
              <li key={p.title}>
                <details className="group rounded-3xl border border-rule/80 bg-white p-6 transition-colors hover:border-charcoal/30 md:p-7 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                    <div>
                      <p className="meta text-ink-muted">{p.minutes}</p>
                      <h3 className="font-display mt-2 text-[19px] leading-tight text-charcoal">{p.title}</h3>
                      <p className="mt-2 text-[14.5px] leading-[1.6] text-ink-soft">{p.summary}</p>
                    </div>
                    <span
                      aria-hidden
                      className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rule text-charcoal transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <div className="mt-5 space-y-4 border-t border-rule/70 pt-5 text-[15px] leading-[1.65] text-charcoal">
                    {p.body}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </section>

        {/* Other places to look */}
        <section className="mt-16">
          <h2 className="font-display text-2xl text-charcoal md:text-[26px]">Other places to look</h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-[1.6] text-ink-soft">
            We don&rsquo;t believe one collective is enough for everyone. If we&rsquo;re not the
            right shape — wrong region, wrong budget, wrong modality — these are the places
            we&rsquo;d send a friend.
          </p>
          <ul className="mt-8 divide-y divide-rule/70 border-y border-rule/70">
            {externalResources.map((r) => (
              <li key={r.name} className="grid grid-cols-1 gap-2 py-5 md:grid-cols-[320px_1fr] md:gap-8">
                <a
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-[17px] leading-tight text-charcoal underline-offset-4 hover:underline"
                >
                  {r.name}
                </a>
                <p className="text-[14.5px] leading-[1.6] text-ink-soft">{r.description}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Path back into care */}
        <section className="mt-16 rounded-3xl bg-sand-deep/60 p-8 text-center md:p-12">
          <p className="font-display text-[21px] italic leading-[1.35] text-ocean md:text-[24px]">
            &ldquo;The relationship is the medicine.
            <br />
            We&rsquo;re here to help you find the relationship.&rdquo;
          </p>
          <div className="mt-8">
            <LinkButton href="/practitioners">Browse the collective</LinkButton>
          </div>
        </section>
      </Container>
    </main>
  );
}
