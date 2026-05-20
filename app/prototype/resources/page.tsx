import Link from "next/link";
import { Container, SectionHeader, Card, LinkButton, StatusPill } from "../_components/ui";
import { practitioners } from "../_data/mock";

const crisisLines = [
  {
    name: "988 Suicide & Crisis Lifeline",
    detail: "Call or text 988.",
    note: "24/7. Free. Confidential.",
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
          It&rsquo;s not about beating anxiety. It&rsquo;s about returning to your senses,
          one at a time, until the body remembers it is here.
        </p>
      </>
    ),
  },
  {
    title: "Journal prompts for the days that don't have a name",
    minutes: "10–15 min",
    summary: "For when something is happening inside you but you can't quite say what.",
    body: (
      <>
        <p>Pick one. Write for ten minutes. Don&rsquo;t edit.</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>What did I want today that I didn&rsquo;t ask for?</li>
          <li>What am I holding for someone else right now?</li>
          <li>If my body could speak, what would it say first?</li>
          <li>What would I tell a friend who was in my exact week?</li>
          <li>What small thing felt good today, even briefly?</li>
        </ul>
      </>
    ),
  },
  {
    title: "Body scan (the short version)",
    minutes: "10 min",
    summary: "Slow attention, head to toe. No fixing, no improving.",
    body: (
      <>
        <p>
          Lie down or sit comfortably. Close your eyes if that feels okay. Bring attention to
          the top of your head. Notice whatever is there — tightness, warmth, nothing — without
          trying to change it.
        </p>
        <p>
          Move slowly down: forehead, jaw, throat, shoulders, chest, belly, hips, legs, feet.
          Linger anywhere that asks for it. End with three slow breaths and notice if anything
          has softened.
        </p>
      </>
    ),
  },
  {
    title: "Sleep wind-down (the unglamorous version)",
    minutes: "20–30 min",
    summary: "Not a sleep hack. Just the boring things that actually work.",
    body: (
      <>
        <ul className="ml-5 list-disc space-y-2">
          <li>Same wake time every day, including weekends. The wake time sets sleep — not the other way around.</li>
          <li>Lights down 60 minutes before bed. Phone in another room if you can.</li>
          <li>Cool room. Cooler than feels right.</li>
          <li>If you&rsquo;re awake longer than 20 minutes, get up. Read something dull in low light. Return when sleepy.</li>
          <li>Caffeine has a 6-hour half-life. The afternoon coffee is still in your bloodstream at 9pm.</li>
        </ul>
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
          second arrow is the story we tell about it afterward — what it means about us, what
          we should have done, what we&rsquo;re going to do now.
        </p>
        <p>
          When you notice the second arrow firing, try this: name it. &ldquo;That&rsquo;s the
          story. The story is not the thing.&rdquo; Then come back to what is actually happening
          in this minute. The first arrow already landed. You don&rsquo;t have to keep shooting
          the next one yourself.
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
    name: "Asian Mental Health Collective",
    href: "https://www.asianmhc.org",
    description: "Directory and peer support specific to the Asian diaspora.",
  },
  {
    name: "National Queer & Trans Therapists of Color Network",
    href: "https://nqttcn.com",
    description: "A directory of QTBIPOC mental health practitioners. Mental health fund available.",
  },
  {
    name: "211",
    href: "tel:211",
    description: "Dial 211. Local help for housing, food, utilities, and mental health resources across the US.",
  },
  {
    name: "People's Organization of Community Acupuncture",
    href: "https://www.pocacoop.com",
    description: "Sliding-scale community acupuncture clinics. Often $15–$50 per session.",
  },
  {
    name: "Open Counseling",
    href: "https://blog.opencounseling.com/hotlines-us",
    description: "A maintained list of free, confidential mental health hotlines by state and concern.",
  },
];

export const metadata = { title: "Care, today — Healing Tides Collective" };

const featured = practitioners.filter((p) => p.status === "Approved" && p.acceptingReferrals);

export default function ResourcesPage() {
  return (
    <main className="py-16 md:py-24">
      <Container size="wide">
        <SectionHeader
          eyebrow="Care, today"
          title={
            <>
              While you&rsquo;re looking
              <br />
              <span className="italic text-ocean">for the right fit.</span>
            </>
          }
          body={
            <>
              The collective is a slow process — by design. Nora reads what you send, and
              writes back when she has something to say. While you wait, or if matching
              isn&rsquo;t what you need today, here&rsquo;s what we keep close: people, practices,
              and places we&rsquo;d send a friend.
            </>
          }
        />

        {/* Crisis */}
        <section className="mt-20">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-2xl text-charcoal md:text-[28px]">
              If you&rsquo;re in crisis right now
            </h2>
            <p className="meta text-ink-muted">24/7</p>
          </div>
          <p className="mt-3 max-w-2xl text-[15px] leading-[1.6] text-ink-soft">
            None of these will judge you for calling. If you&rsquo;re not sure whether
            it&rsquo;s &ldquo;serious enough,&rdquo; that question alone is reason enough.
          </p>

          <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {crisisLines.map((c) => (
              <li key={c.name}>
                <a
                  href={c.href}
                  className="group block h-full rounded-3xl border border-ocean/15 bg-seafoam/30 p-7 transition-colors hover:border-ocean/40 hover:bg-seafoam/50"
                >
                  <p className="meta text-ocean/80">Reach out</p>
                  <h3 className="font-display mt-3 text-[20px] leading-tight text-charcoal">
                    {c.name}
                  </h3>
                  <p className="mt-4 text-[16px] font-medium text-charcoal">{c.detail}</p>
                  <p className="mt-2 text-[13px] leading-[1.5] text-ink-soft">{c.note}</p>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Practitioner profiles */}
        <section className="mt-24">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl text-charcoal md:text-[28px]">
                Meet the collective
              </h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-[1.6] text-ink-soft">
                A handful of the practitioners we&rsquo;ve worked with directly. Reading their
                names here doesn&rsquo;t mean they&rsquo;re the right fit for you — that&rsquo;s
                what the intake is for. But it gives a sense of what kind of people we keep
                close.
              </p>
            </div>
            <Link
              href="/prototype/seeker"
              className="meta text-ocean underline-offset-4 hover:underline"
            >
              Ask for a match →
            </Link>
          </div>

          <ul className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <Card key={p.id} as="li" className="flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-[22px] leading-[1.15] text-charcoal">
                    {p.name}
                  </h3>
                  <StatusPill status="Accepting referrals" />
                </div>
                <p className="meta mt-3 text-ink-muted">
                  {p.modalities.join(" · ")}
                </p>
                <p className="mt-2 text-[13px] leading-[1.5] text-ink-muted">{p.location}</p>

                <p className="mt-5 text-[15px] leading-[1.6] text-ink-soft">{p.bio}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {p.specialties.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="inline-flex rounded-full bg-sand-deep px-3 py-1 text-[12px] text-ink-soft"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <p className="mt-6 text-[13px] leading-[1.5] text-ink-muted">
                  <span className="meta block text-ink-muted">Availability</span>
                  <span className="mt-1 block text-[14px] text-charcoal">{p.availability}</span>
                </p>

                <div className="mt-auto pt-6">
                  <LinkButton
                    href={`/prototype/seeker?modality=${encodeURIComponent(p.modalities[0])}`}
                    tone="secondary"
                    className="w-full"
                  >
                    Request an introduction
                  </LinkButton>
                </div>
              </Card>
            ))}
          </ul>
        </section>

        {/* Practices */}
        <section className="mt-24">
          <h2 className="font-display text-2xl text-charcoal md:text-[28px]">
            Practices you can try today
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-[1.6] text-ink-soft">
            Free. No login. Nothing to download. Take what fits, leave the rest. These are not
            a substitute for the right practitioner — but they&rsquo;re a reasonable first
            move on a hard afternoon.
          </p>

          <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            {practices.map((p) => (
              <li key={p.title}>
                <details className="group rounded-3xl border border-rule/80 bg-white p-7 transition-colors hover:border-charcoal/30 md:p-8 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-start justify-between gap-4 list-none">
                    <div>
                      <p className="meta text-ink-muted">{p.minutes}</p>
                      <h3 className="font-display mt-3 text-[20px] leading-tight text-charcoal">
                        {p.title}
                      </h3>
                      <p className="mt-3 text-[15px] leading-[1.6] text-ink-soft">{p.summary}</p>
                    </div>
                    <span
                      aria-hidden
                      className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-rule text-charcoal transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <div className="mt-6 space-y-4 border-t border-rule/70 pt-6 text-[15px] leading-[1.65] text-charcoal">
                    {p.body}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </section>

        {/* External resources */}
        <section className="mt-24">
          <h2 className="font-display text-2xl text-charcoal md:text-[28px]">
            Other places to look
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-[1.6] text-ink-soft">
            We don&rsquo;t believe one collective is enough for everyone. If we&rsquo;re not
            the right shape — wrong region, wrong budget, wrong modality — these are the
            places we&rsquo;d send a friend.
          </p>

          <ul className="mt-10 divide-y divide-rule/70 border-y border-rule/70">
            {externalResources.map((r) => (
              <li key={r.name} className="grid grid-cols-1 gap-2 py-6 md:grid-cols-[320px_1fr] md:gap-8">
                <a
                  href={r.href}
                  target={r.href.startsWith("http") ? "_blank" : undefined}
                  rel={r.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="font-display text-[18px] leading-tight text-charcoal underline-offset-4 hover:underline"
                >
                  {r.name}
                </a>
                <p className="text-[15px] leading-[1.6] text-ink-soft">{r.description}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Closing */}
        <section className="mt-24 rounded-3xl bg-sand-deep/60 p-10 text-center md:p-14">
          <p className="font-display text-[24px] italic leading-[1.3] text-ocean md:text-[28px]">
            &ldquo;The relationship is the medicine. <br />
            We&rsquo;re here to help you find the relationship.&rdquo;
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-5">
            <LinkButton href="/prototype/seeker">Ask for a match</LinkButton>
            <LinkButton href="/prototype" tone="secondary">
              Back to the prototype
            </LinkButton>
          </div>
        </section>
      </Container>
    </main>
  );
}
