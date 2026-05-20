import { Container, SectionHeader } from "@/app/prototype/_components/ui";

const PHASE_2 = [
  {
    title: "Auth",
    why: "Nora and practitioners need accounts; required for the portal.",
  },
  {
    title: "Database",
    why: "Practitioner records, seeker intake submissions, shortlists.",
  },
  {
    title: "Admin dashboard",
    why: "The inside of the operation.",
  },
  {
    title: "Seeker intake",
    why: "The core front door.",
  },
  {
    title: "Practitioner application",
    why: "Keeps the collective curated.",
  },
  {
    title: "Practitioner database",
    why: "Nora's working memory.",
  },
  {
    title: "Manual matching workspace",
    why: "Nora's main tool. Stays human.",
  },
  {
    title: "Shortlist email flow",
    why: "The seeker's actual experience.",
  },
  {
    title: "Basic provider portal",
    why: "Practitioners edit availability, see referrals.",
  },
  {
    title: "Hosting & infrastructure",
    why: "Vercel, environment, basic observability.",
  },
];

const LATER = [
  {
    title: "Automated matching",
    why: "The manual workspace is the product right now. Automation comes after pattern is clear.",
  },
  {
    title: "Payments",
    why: "Not needed until volume justifies revenue infrastructure.",
  },
  {
    title: "Messaging between seekers and practitioners",
    why: "Email is fine in Phase 2. Real messaging needs HIPAA-grade thought.",
  },
  {
    title: "Calendar scheduling",
    why: "Outsource to whatever each practitioner uses today.",
  },
  {
    title: "Full practitioner accounts",
    why: "Phase 2 is just availability + history.",
  },
  {
    title: "Client accounts",
    why: "Most seekers don't want one. Forcing it adds friction.",
  },
  {
    title: "Analytics",
    why: "The metrics that matter aren't ready to be measured yet.",
  },
  {
    title: "HIPAA-grade secure messaging",
    why: "Only if/when messaging happens in-app.",
  },
  {
    title: "Insurance workflows",
    why: "Too early. Most matches are out-of-network anyway.",
  },
];

export default function ScopePage() {
  return (
    <main className="py-16 md:py-24">
      <Container size="wide">
        <SectionHeader
          eyebrow="Phase 2 scope"
          title={
            <>
              What Phase 2 is —
              <br />
              and what it <span className="italic text-ocean">deliberately isn&rsquo;t.</span>
            </>
          }
          body={
            <>
              The shape of Phase 2 is small on purpose. We&rsquo;re building
              the parts that make Nora&rsquo;s judgment scale, and leaving out
              the parts that would replace it. The list on the right is not a
              roadmap — it&rsquo;s a record of decisions we&rsquo;ve already
              made.
            </>
          }
        />

        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
          <section>
            <div className="flex items-center gap-3 border-b border-rule/70 pb-5">
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-full bg-ocean"
              />
              <p className="meta text-ocean">Phase 2 · Included</p>
            </div>
            <ul className="mt-6 space-y-7">
              {PHASE_2.map((item) => (
                <li key={item.title}>
                  <h3 className="font-display text-[22px] leading-tight text-charcoal">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-[1.65] text-ink-soft">
                    {item.why}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 border-b border-rule/40 pb-5">
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-full bg-rule"
              />
              <p className="meta text-ink-muted">Later phases · Not yet</p>
            </div>
            <ul className="mt-6 space-y-7">
              {LATER.map((item) => (
                <li key={item.title}>
                  <h3 className="font-display text-[20px] leading-tight text-ink-soft">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-[1.65] text-ink-muted">
                    {item.why}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-24 border-t border-rule/70 pt-12 text-center">
          <p className="font-display text-[clamp(20px,2.5vw,28px)] italic leading-[1.4] text-charcoal">
            The product principle: the app should support Nora&rsquo;s
            judgment, not replace it.
          </p>
        </div>
      </Container>
    </main>
  );
}
