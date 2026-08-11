import type {Metadata} from "next";
import Link from "next/link";

import {Card, Container, LinkButton} from "@/app/_components/ui";
import {FirstCallWorksheet} from "./FirstCallWorksheet";
import {ALL_WORKSHEET_QUESTIONS} from "@/lib/first-call-worksheet";
import {CONTACT_EMAIL, CONTACT_MAILTO, SITE_URL} from "@/lib/site";

const PATH = "/resources/first-therapist-call-worksheet";
const URL = `${SITE_URL}${PATH}`;
const TITLE = "Questions to ask a therapist: a calm first-call worksheet";
const DESCRIPTION =
  "Choose useful questions for a therapist consultation, organize practical details, and reflect afterward—without an account, a fit score, or sharing your answers.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {canonical: URL},
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: URL,
    images: [{url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: "Healing Tides Collective"}],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${SITE_URL}/opengraph-image`],
  },
};

const licenseBoards = [
  {label: "Social work", href: "https://mn.gov/boards/social-work/public/verifyalicense.jsp"},
  {label: "LADC, LPC, and LPCC", href: "https://mn.gov/boards/behavioral-health/public-information/online-license.jsp"},
  {label: "Psychology", href: "https://mn.gov/boards/psychology/public/verifications/"},
  {label: "Marriage and family therapy", href: "https://mn.gov/boards/marriage-and-family/"},
  {label: "Find another Minnesota licensing board", href: "https://mn.gov/boards/"},
];

export default function FirstTherapistCallWorksheetPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    description: DESCRIPTION,
    url: URL,
    datePublished: "2026-08-11",
    dateModified: "2026-08-11",
    inLanguage: "en-US",
    publisher: {"@type": "Organization", name: "Healing Tides Collective", url: SITE_URL},
    about: [
      {"@type": "Thing", name: "Therapist consultation questions"},
      {"@type": "AdministrativeArea", name: "Minnesota"},
    ],
  };

  const allBefore = ALL_WORKSHEET_QUESTIONS.filter((question) => question.phase === "before");
  const allDuring = ALL_WORKSHEET_QUESTIONS.filter((question) => question.phase === "during");

  return (
    <main id="main-content" className="worksheet-page min-h-screen bg-sand text-charcoal">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(structuredData).replace(/</g, "\\u003c")}}
      />

      <Container size="wide" className="pb-20 pt-8 md:pb-28 md:pt-12">
        <nav aria-label="Breadcrumb" className="worksheet-print-hide meta text-muted-ink">
          <Link href="/" className="rounded transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15">
            Healing Tides
          </Link>
          <span aria-hidden className="px-2">/</span>
          <span>First-call worksheet</span>
        </nav>

        <header className="worksheet-print-hide grid gap-10 pb-14 pt-12 md:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] md:items-end md:pb-20 md:pt-16">
          <div className="max-w-3xl">
            <p className="meta text-teal">A calm first therapist call worksheet</p>
            <h1 className="font-display mt-5 text-[clamp(42px,6.4vw,78px)] font-light leading-[0.98] tracking-[-0.035em]">
              Questions to ask a therapist
              <span className="italic text-teal"> before your first call.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-[17px] leading-[1.75] text-ink-soft md:text-[19px]">
              You do not need a perfect question—or a long list. Choose what would make the
              conversation useful, keep the practical details together, and notice what remains
              unclear afterward. No score. No account. No need to tell your whole story.
            </p>
          </div>
          <Card className="bg-seafoam/30">
            <p className="meta text-teal">A gentler rule</p>
            <p className="font-display mt-4 text-[27px] leading-[1.18] tracking-[-0.02em]">
              Three questions are enough.
            </p>
            <p className="mt-4 text-[14px] leading-[1.65] text-ink-soft">
              This is a conversation aid—not a clinical intake, diagnosis, or therapist rating.
            </p>
          </Card>
        </header>

        <section aria-labelledby="before-heading" className="worksheet-print-hide border-y border-rule/70 py-12 md:py-16">
          <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
            <div>
              <p className="meta text-teal">Before you begin</p>
              <h2 id="before-heading" className="font-display mt-4 text-[clamp(30px,4vw,44px)] leading-[1.08] tracking-[-0.025em]">
                First, ask what kind of meeting it is.
              </h2>
            </div>
            <div className="space-y-5 text-[15.5px] leading-[1.75] text-ink-soft">
              <p>
                Practices use <em>consultation</em>, <em>intake</em>, and <em>first session</em>
                {" "}differently. A preliminary call may focus on fit and logistics; a first session may
                include consent, history, goals, or assessment. It may be free or have a fee.
              </p>
              <p>
                Ask what is scheduled, how long it is, and what it costs before sharing details you
                were not expecting to discuss. The label matters less than a clear answer.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-12 md:mt-16">
          <FirstCallWorksheet />
        </div>

        <section aria-labelledby="fit-heading" className="worksheet-print-hide mt-16 grid gap-10 md:mt-24 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
          <div>
            <p className="meta text-teal">After the call</p>
            <h2 id="fit-heading" className="font-display mt-4 text-[clamp(30px,4vw,44px)] leading-[1.08] tracking-[-0.025em]">
              Useful information can still feel uncertain.
            </h2>
          </div>
          <div className="space-y-5 text-[15.5px] leading-[1.75] text-ink-soft">
            <p>
              A short call cannot predict an entire therapeutic relationship. It can show whether
              you had room to ask, whether the answers were understandable, and whether the
              practical arrangement might work.
            </p>
            <p>
              You can schedule, think, ask one follow-up question, speak with someone else, or stop.
              “I am not sure yet” is a valid result—not a failed conversation.
            </p>
          </div>
        </section>

        <section aria-labelledby="license-heading" className="worksheet-print-hide mt-16 rounded-[2rem] border border-rule/80 bg-white/70 p-7 md:mt-24 md:p-10">
          <p className="meta text-teal">Minnesota credential check</p>
          <h2 id="license-heading" className="font-display mt-4 text-[clamp(28px,4vw,40px)] leading-[1.08] tracking-[-0.025em]">
            Start with these common Minnesota boards.
          </h2>
          <p className="mt-5 max-w-3xl text-[15px] leading-[1.7] text-ink-soft">
            This is not a complete list: different Minnesota health credentials are overseen by
            different boards. A board lookup is one verification step; it does not tell you whether
            a practitioner is the right fit or in network with your exact insurance plan.
          </p>
          <ul className="mt-7 grid gap-3 md:grid-cols-2">
            {licenseBoards.map((board) => (
              <li key={board.href}>
                <a
                  href={board.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-12 items-center justify-between rounded-2xl border border-rule bg-white px-5 py-3 text-[14px] font-medium text-charcoal transition-colors hover:border-charcoal/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15"
                >
                  <span>{board.label}</span><span aria-hidden className="text-teal">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="worksheet-print-hide mt-16 overflow-hidden rounded-[2.25rem] bg-charcoal px-7 py-12 text-sand md:mt-24 md:px-14 md:py-16">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="meta text-seafoam">When choosing still feels like too much</p>
              <h2 className="font-display mt-4 max-w-2xl text-[clamp(30px,4vw,46px)] leading-[1.08] tracking-[-0.025em]">
                Tell us what needs to fit.
              </h2>
              <p className="mt-5 max-w-xl text-[15.5px] leading-[1.7] text-sand/80">
                A real person reads what matters to you and helps narrow the Minnesota options.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <LinkButton href="/get-matched" tone="secondary">get matched</LinkButton>
              <Link href="/resources/therapy-cost-minnesota" className="inline-flex items-center rounded-full px-4 py-3 text-[14px] text-sand underline decoration-sand/30 underline-offset-4 hover:decoration-sand">
                understand therapy costs
              </Link>
              <Link href="/journal/finding-a-therapist-in-minneapolis-and-st-paul-why-is-it-so-difficult" className="inline-flex items-center rounded-full px-4 py-3 text-[14px] text-sand underline decoration-sand/30 underline-offset-4 hover:decoration-sand">
                still looking? read the Twin Cities guide
              </Link>
            </div>
          </div>
        </section>

        <details className="worksheet-print-hide mt-10 rounded-2xl border border-rule/80 bg-white/60 p-6">
          <summary className="cursor-pointer font-medium text-charcoal focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15">
            Read every worksheet question without using the tool
          </summary>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <QuestionList title="Before I book" questions={allBefore.map((question) => question.text)} />
            <QuestionList title="During the conversation" questions={allDuring.map((question) => question.text)} />
          </div>
        </details>

        <footer className="worksheet-print-hide mx-auto mt-10 max-w-3xl text-center text-[12.5px] leading-[1.65] text-muted-ink">
          <p>Published August 11, 2026 · Sources checked August 11, 2026</p>
          <p>
            Prepared by Healing Tides Collective. This worksheet is general educational information
            and does not diagnose, recommend a treatment, guarantee fit, or replace advice from a
            qualified professional.
          </p>
          <p className="mt-3">
            Practical preparation informed by the{" "}
            <a href="https://www.nimh.nih.gov/health/topics/psychotherapies" target="_blank" rel="noopener noreferrer" className="underline underline-offset-3 hover:text-charcoal">National Institute of Mental Health</a>
            {" "}and the{" "}
            <a href="https://www.apa.org/topics/psychotherapy/understanding" target="_blank" rel="noopener noreferrer" className="underline underline-offset-3 hover:text-charcoal">American Psychological Association</a>.
          </p>
          <p className="mt-3">
            Corrections or source questions?{" "}
            <a href={`${CONTACT_MAILTO}?subject=First-call%20worksheet%20correction`} className="underline underline-offset-3 hover:text-charcoal">
              {CONTACT_EMAIL}
            </a>
          </p>
        </footer>
      </Container>
    </main>
  );
}

function QuestionList({title, questions}: {title: string; questions: string[]}) {
  return (
    <section>
      <h3 className="meta text-teal">{title}</h3>
      <ul className="mt-4 space-y-3">
        {questions.map((question) => <li key={question} className="text-[14px] leading-[1.6] text-ink-soft">• {question}</li>)}
      </ul>
    </section>
  );
}
