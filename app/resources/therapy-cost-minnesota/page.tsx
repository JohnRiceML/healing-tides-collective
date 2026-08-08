import type { Metadata } from "next";
import Link from "next/link";

import { Card, Container, LinkButton } from "@/app/_components/ui";
import { SITE_URL } from "@/lib/site";

const PATH = "/resources/therapy-cost-minnesota";
const URL = `${SITE_URL}${PATH}`;
const TITLE = "Therapy costs in Minnesota: what to ask — Healing Tides";
const DESCRIPTION =
  "How to check therapy costs and insurance coverage in Minnesota: a practical guide to plan networks, Medical Assistance directories, self-pay fees, and questions to ask.";
const SOCIAL_IMAGE = `${SITE_URL}/opengraph-image`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    type: "article",
    images: [{ url: SOCIAL_IMAGE, width: 1200, height: 630, alt: "Healing Tides Collective" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
};

const planQuestions = [
  "Who manages my outpatient behavioral-health benefit — this plan or another company?",
  "Is the practitioner I am considering in-network for my exact plan today?",
  "What are my deductible, copay or coinsurance for an outpatient therapy visit, and how much of the deductible have I met?",
  "Is the cost different for telehealth and in-person visits?",
  "Do I have any out-of-network outpatient mental-health benefit?",
  "If I do, what is the allowed amount (the plan’s price limit) for the service code my therapist expects to bill?",
  "After my out-of-network deductible, what percentage of that allowed amount does the plan pay?",
  "How do I submit an out-of-network claim, and what is the filing deadline?",
  "Could I owe the difference between the therapist’s fee and the plan’s allowed amount?",
  "Is any approval, referral or other step required before the first appointment?",
  "What is the reference number for this call?",
];

const faqs = [
  {
    q: "How much does therapy cost in Minnesota?",
    a: "There is no single Minnesota price. If you use insurance, your amount depends on the practitioner’s fee, exact plan network, and how the plan applies its deductible, copay or coinsurance. For self-pay, ask for the first appointment and ongoing-session fees, expected frequency, and cancellation policy.",
  },
  {
    q: "Does insurance cover therapy in Minnesota?",
    a: "Many plans include outpatient mental-health benefits, but the practitioner network and your share of the cost vary by plan. The most reliable answer comes from your plan documents and member services, using the questions on this page.",
  },
  {
    q: "How do I find a therapist who accepts Minnesota Medical Assistance?",
    a: "If your coverage is fee-for-service, use the official Minnesota Health Care Programs provider directory. If you are enrolled through a health plan, use that plan’s directory and call member services to confirm the practitioner is currently in-network.",
  },
  {
    q: "What should I ask a therapist about self-pay costs?",
    a: "Ask about the first appointment, ongoing sessions, reduced-fee openings, supervised interns or pre-licensed clinicians, cancellation fees, expected session frequency, and whether the fee may change during the year.",
  },
];

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-teal underline decoration-teal/25 underline-offset-4 transition-colors hover:text-ocean focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15"
    >
      {children} ↗
    </a>
  );
}

export default function TherapyCostMinnesotaPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    description: DESCRIPTION,
    url: URL,
    dateModified: "2026-08-08",
    inLanguage: "en-US",
    about: [
      { "@type": "Thing", name: "Therapy costs" },
      { "@type": "AdministrativeArea", name: "Minnesota" },
    ],
  };

  return (
    <main id="main-content" className="min-h-screen bg-sand text-charcoal">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />

      <Container size="wide" className="pb-20 pt-8 md:pb-28 md:pt-12">
        <nav aria-label="Breadcrumb" className="meta text-ink-muted">
          <Link href="/" className="rounded transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15">
            Healing Tides
          </Link>
          <span aria-hidden className="px-2">/</span>
          <span>MN care guide</span>
        </nav>

        <header className="grid gap-10 pb-14 pt-12 md:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.55fr)] md:items-end md:pb-20 md:pt-16">
          <div className="max-w-3xl">
            <p className="meta text-teal">Paying for therapy in Minnesota</p>
            <h1 className="font-display mt-5 text-[clamp(42px,6.4vw,78px)] font-light leading-[0.98] tracking-[-0.035em]">
              What will therapy
              <span className="italic text-teal"> actually cost?</span>
            </h1>
            <p className="mt-7 max-w-2xl text-[17px] leading-[1.75] text-ink-soft md:text-[19px]">
              There isn&rsquo;t one Minnesota price. If you&rsquo;re using insurance, your amount
              depends on the practitioner&rsquo;s fee, your exact plan network, and how the plan
              applies its deductible, copay or coinsurance. If you&rsquo;re self-paying, focus on the
              fee, frequency and policies. Here is how to get a more specific estimate.
            </p>
          </div>
          <div className="rounded-[2rem] border border-rule/80 bg-seafoam/30 p-6 md:p-7">
            <p className="meta text-teal">The useful answer</p>
            <p className="font-display mt-4 text-[23px] leading-[1.25] tracking-[-0.01em]">
              Ask for the fee. Confirm the network. Write down the plan&rsquo;s answer and call reference.
            </p>
            <p className="mt-4 text-[13.5px] leading-[1.6] text-ink-muted">
              Official links checked August 8, 2026. Plan details can change.
            </p>
          </div>
        </header>

        <nav aria-label="On this page" className="flex flex-wrap gap-x-5 gap-y-2 border-y border-rule/70 py-4 text-[13px] font-medium text-teal">
          <span className="text-ink-muted">Jump to:</span>
          <a href="#start-heading" className="underline decoration-teal/25 underline-offset-4 hover:text-ocean">my coverage</a>
          <a href="#estimate-heading" className="underline decoration-teal/25 underline-offset-4 hover:text-ocean">cost estimate</a>
          <a href="#call-heading" className="underline decoration-teal/25 underline-offset-4 hover:text-ocean">call script</a>
          <a href="#official-heading" className="underline decoration-teal/25 underline-offset-4 hover:text-ocean">official MN links</a>
        </nav>

        <section aria-labelledby="start-heading" className="pt-12 md:pt-16">
          <div className="max-w-2xl">
            <p className="meta text-teal">Start with your situation</p>
            <h2 id="start-heading" className="font-display mt-4 text-[clamp(30px,4vw,44px)] leading-[1.08] tracking-[-0.025em]">
              Three common routes. Different first calls.
            </h2>
          </div>
          <div className="mt-9 grid gap-5 lg:grid-cols-3">
            <Card className="h-full">
              <p className="meta text-teal">01 · Employer or private plan</p>
              <h3 className="font-display mt-4 text-[24px] leading-tight">Call member services first.</h3>
              <p className="mt-4 text-[15px] leading-[1.7] text-ink-soft">
                Use the number on your card. Ask about outpatient behavioral health and your exact
                plan name—not only the insurance company. Networks can differ inside one company.
              </p>
            </Card>
            <Card className="h-full">
              <p className="meta text-teal">02 · Medical Assistance or MinnesotaCare</p>
              <h3 className="font-display mt-4 text-[24px] leading-tight">Find which system you&rsquo;re in.</h3>
              <p className="mt-4 text-[15px] leading-[1.7] text-ink-soft">
                Fee-for-service members can use the state&rsquo;s MHCP directory. Health-plan members
                should use their plan&rsquo;s directory and confirm the listing with member services.
              </p>
              <p className="mt-5 text-[14px] leading-[1.65] text-ink-soft">
                <ExternalLink href="https://mn.gov/dhs/health-care/find-health-providers/">
                  Minnesota DHS: find a provider
                </ExternalLink>
              </p>
            </Card>
            <Card className="h-full">
              <p className="meta text-teal">03 · Self-pay</p>
              <h3 className="font-display mt-4 text-[24px] leading-tight">Ask about the whole first month.</h3>
              <p className="mt-4 text-[15px] leading-[1.7] text-ink-soft">
                The first appointment may have a different fee. Ask about ongoing sessions,
                frequency, cancellation policy, reduced-fee openings and supervised clinicians.
              </p>
            </Card>
          </div>
          <p className="mt-6 text-[14px] leading-[1.65] text-ink-soft">
            Have Medicare or another type of coverage? Start with the member-services number on
            your card and use the same questions below. <Link href="/get-matched" className="font-medium text-teal underline decoration-teal/25 underline-offset-4 hover:text-ocean">Need help narrowing the care options?</Link>
          </p>
        </section>

        <section aria-labelledby="estimate-heading" className="mt-16 rounded-[2rem] border border-rule/80 bg-white/70 p-7 md:mt-24 md:p-10">
          <p className="meta text-teal">A transparent estimate</p>
          <h2 id="estimate-heading" className="font-display mt-4 text-[clamp(30px,4vw,44px)] leading-[1.08] tracking-[-0.025em]">
            Turn a session amount into a monthly number.
          </h2>
          <p className="mt-5 max-w-3xl text-[15.5px] leading-[1.75] text-ink-soft">
            Multiply the amount you expect to owe per session by the number of sessions you expect
            that month, then add any known first-visit or non-covered fees. The quoted amount still
            is not a guarantee of what a claim will cost.
          </p>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] bg-seafoam/30 p-6">
              <p className="meta text-teal">Hypothetical · insurance</p>
              <p className="mt-3 text-[15px] leading-[1.7] text-ink-soft">If the plan quotes a $35 member amount per session and you expect four sessions, the working monthly estimate is $140. Confirm whether the deductible or other plan rules change it.</p>
            </div>
            <div className="rounded-[1.5rem] bg-seafoam/30 p-6">
              <p className="meta text-teal">Hypothetical · self-pay</p>
              <p className="mt-3 text-[15px] leading-[1.7] text-ink-soft">If the quoted ongoing fee is $150 and you expect four sessions, the working monthly estimate is $600, before any different first-visit or missed-session fee.</p>
            </div>
          </div>
          <p className="mt-5 text-[12.5px] leading-[1.65] text-ink-muted">These figures demonstrate the calculation only. They are not Minnesota averages or quotes from Healing Tides practitioners.</p>
        </section>

        <section aria-labelledby="call-heading" className="mt-16 grid gap-9 md:mt-24 md:grid-cols-[0.72fr_1.28fr] md:gap-14">
          <div>
            <p className="meta text-teal">A call you can read from</p>
            <h2 id="call-heading" className="font-display mt-4 text-[clamp(30px,4vw,44px)] leading-[1.08] tracking-[-0.025em]">
              Ask for numbers, not reassurance.
            </h2>
            <p className="mt-5 text-[15.5px] leading-[1.75] text-ink-soft">
              &ldquo;You should be covered&rdquo; is not a price. These questions turn a vague benefit
              into something you can compare with a practitioner&rsquo;s fee.
            </p>
          </div>
          <Card as="section" className="bg-white/85">
            <ol>
              {planQuestions.map((question, index) => (
                <li key={question} className="grid grid-cols-[34px_1fr] gap-3 border-b border-rule/70 py-4 first:pt-0 last:border-0 last:pb-0">
                  <span className="meta pt-0.5 text-teal">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-[15px] leading-[1.65] text-charcoal">{question}</span>
                </li>
              ))}
            </ol>
          </Card>
        </section>

        <section aria-labelledby="network-heading" className="mt-16 border-y border-rule/70 py-14 md:mt-24 md:py-20">
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <p className="meta text-teal">The network check</p>
              <h2 id="network-heading" className="font-display mt-4 text-[clamp(30px,4vw,44px)] leading-[1.08] tracking-[-0.025em]">
                A directory listing is a lead, not a promise.
              </h2>
              <p className="mt-5 text-[15.5px] leading-[1.75] text-ink-soft">
                Confirm twice: ask the plan whether the practitioner is in-network for your exact
                plan, then ask the practitioner whether they still take that plan and are accepting
                new clients. Write down the date, the person you spoke with and the reference number.
              </p>
            </div>
            <div className="rounded-[2rem] bg-charcoal p-7 text-sand md:p-9">
              <p className="meta text-seafoam">Before you book</p>
              <ul className="mt-5 space-y-4 text-[15px] leading-[1.65] text-sand/85">
                <li>What is the fee for the first appointment?</li>
                <li>What is the fee for each appointment after that?</li>
                <li>How often do you usually begin?</li>
                <li>Are reduced-fee places open now, or only a waitlist?</li>
                <li>What is the late-cancellation or missed-appointment fee?</li>
              </ul>
            </div>
          </div>
        </section>

        <section aria-labelledby="official-heading" className="mt-16 md:mt-24">
          <div className="max-w-2xl">
            <p className="meta text-teal">Official Minnesota doors</p>
            <h2 id="official-heading" className="font-display mt-4 text-[clamp(30px,4vw,44px)] leading-[1.08] tracking-[-0.025em]">
              Go to the source for your route.
            </h2>
            <p className="mt-5 text-[15.5px] leading-[1.75] text-ink-soft">
              These are routing points, not endorsements. They are official starting points for
              marketplace comparisons, public-program directories and insurance complaints.
            </p>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-2">
            <Card>
              <p className="meta text-teal">Shopping for coverage</p>
              <h3 className="font-display mt-3 text-[22px]">MNsure plan comparison</h3>
              <p className="mt-3 text-[14.5px] leading-[1.65] text-ink-soft">If you are shopping for eligible individual or family marketplace coverage, compare deductibles, copays, networks and estimated costs. Plan features can change by year.</p>
              <p className="mt-5 text-[14px]"><ExternalLink href="https://www.mnsure.org/mnsure/shop-compare/compare/index.jsp">Compare Minnesota plans</ExternalLink></p>
            </Card>
            <Card>
              <p className="meta text-teal">Understanding network rules</p>
              <h3 className="font-display mt-3 text-[22px]">MNsure plan types</h3>
              <p className="mt-3 text-[14.5px] leading-[1.65] text-ink-soft">HMO, EPO, POS and PPO plans handle networks differently. Start here, then confirm the rule in your own plan documents.</p>
              <p className="mt-5 text-[14px]"><ExternalLink href="https://www.mnsure.org/shop-compare/about-plans/plan-types-costs/index.jsp">Read Minnesota plan types</ExternalLink></p>
            </Card>
            <Card>
              <p className="meta text-teal">Medical Assistance</p>
              <h3 className="font-display mt-3 text-[22px]">DHS provider routing</h3>
              <p className="mt-3 text-[14.5px] leading-[1.65] text-ink-soft">DHS explains when to use the MHCP fee-for-service directory and when your health plan&rsquo;s network controls the search.</p>
              <p className="mt-5 text-[14px]"><ExternalLink href="https://mn.gov/dhs/health-care/find-health-providers/">Find the right directory</ExternalLink></p>
            </Card>
            <Card>
              <p className="meta text-teal">A denial or network problem</p>
              <h3 className="font-display mt-3 text-[22px]">Find the right complaint route</h3>
              <p className="mt-3 text-[14.5px] leading-[1.65] text-ink-soft">Minnesota&rsquo;s general routing page separates HMO, other insurance and self-insured employer plans. Commerce also has a mental-health coverage and complaint starting point.</p>
              <div className="mt-5 flex flex-col items-start gap-2 text-[14px]">
                <ExternalLink href="https://www.health.state.mn.us/facilities/insurance/clearinghouse/complaints.html">Choose the right regulator</ExternalLink>
                <ExternalLink href="https://mn.gov/commerce/insurance/health/mental-health/">Commerce mental-health coverage help</ExternalLink>
              </div>
            </Card>
          </div>
        </section>

        <section aria-labelledby="faq-heading" className="mt-16 md:mt-24">
          <p className="meta text-teal">Clear answers</p>
          <h2 id="faq-heading" className="font-display mt-4 text-[clamp(30px,4vw,44px)] leading-[1.08] tracking-[-0.025em]">Therapy cost questions, answered plainly.</h2>
          <div className="mt-8 divide-y divide-rule/70 border-y border-rule/70">
            {faqs.map((item) => (
              <article key={item.q} className="grid gap-3 py-7 md:grid-cols-[0.8fr_1.2fr] md:gap-12 md:py-9">
                <h3 className="font-display text-[21px] leading-[1.25]">{item.q}</h3>
                <p className="text-[15px] leading-[1.75] text-ink-soft">{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 overflow-hidden rounded-[2.25rem] bg-seafoam/35 px-7 py-12 text-center md:mt-24 md:px-14 md:py-16">
          <p className="meta text-teal">When the list is still too much</p>
          <h2 className="font-display mx-auto mt-4 max-w-2xl text-[clamp(30px,4vw,46px)] leading-[1.08] tracking-[-0.025em]">Tell us what needs to fit.</h2>
          <p className="mx-auto mt-5 max-w-xl text-[15.5px] leading-[1.7] text-ink-soft">Share your location, budget, format and what you want support with. Healing Tides reads it and helps narrow the next step—without handing you another endless directory.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkButton href="/get-matched">Get matched</LinkButton>
            <LinkButton href="/practitioners" tone="secondary">Browse the collective</LinkButton>
          </div>
        </section>

        <p className="mx-auto mt-10 max-w-3xl text-center text-[12.5px] leading-[1.65] text-ink-muted">Prepared and maintained by Healing Tides Collective. Official links checked August 8, 2026. This guide is general information, not insurance, legal or medical advice. Your plan documents control your benefits; linked organizations are authoritative for their respective programs and routes. Healing Tides does not guarantee coverage, reimbursement, availability or cost.</p>
      </Container>
    </main>
  );
}
