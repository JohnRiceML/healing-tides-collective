import Link from "next/link";
import {
  Button,
  Container,
  DLRow,
  LinkButton,
  StatusPill,
} from "@/app/prototype/_components/ui";
import { getSeeker } from "@/app/prototype/_data/mock";

export default async function SeekerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const seeker = getSeeker(id);

  if (!seeker) {
    return (
      <main className="py-20 md:py-28">
        <Container size="wide">
          <p className="meta text-ink-muted">Seeker not found</p>
          <h1 className="font-display mt-4 text-[34px] leading-[1.1] text-charcoal">
            We couldn&apos;t find that intake.
          </h1>
          <p className="mt-4 text-[15px] leading-[1.6] text-ink-soft">
            The link may be old or the intake may have been archived.
          </p>
          <div className="mt-8">
            <LinkButton href="/prototype/admin" tone="secondary">
              Back to dashboard
            </LinkButton>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-12 md:py-16">
      <Container size="wide">
        <Link
          href="/prototype/admin"
          className="meta inline-flex items-center gap-2 text-ink-muted hover:text-charcoal"
        >
          <span aria-hidden>←</span> Back to dashboard
        </Link>

        <header className="mt-8 border-b border-rule/70 pb-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="meta text-ink-muted">Seeker intake</p>
              <h1 className="font-display mt-3 text-[clamp(34px,4vw,46px)] leading-[1.05] tracking-[-0.01em] text-charcoal">
                {seeker.firstName}
                {seeker.pronouns ? (
                  <span className="ml-4 align-middle text-[16px] font-normal text-ink-muted">
                    {seeker.pronouns}
                  </span>
                ) : null}
              </h1>
              <p className="meta mt-3 text-ink-muted">
                Submitted {seeker.submittedAt}
              </p>
            </div>
            <StatusPill status={seeker.status} />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button tone="primary">Mark reviewed</Button>
            <LinkButton
              href={`/prototype/admin/match?seekerId=${seeker.id}`}
              tone="secondary"
            >
              Create shortlist
            </LinkButton>
            <Button tone="secondary">Request more info</Button>
            <Button tone="ghost">Archive</Button>
          </div>
        </header>

        {seeker.noraNotes ? (
          <div className="mt-10 rounded-3xl bg-seafoam/40 px-7 py-6">
            <p className="meta text-ocean">Your earlier note</p>
            <p className="font-display mt-3 text-[19px] leading-[1.55] italic text-charcoal">
              {seeker.noraNotes}
            </p>
          </div>
        ) : null}

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px]">
          <section>
            <p className="meta text-ink-muted">In their words</p>
            <blockquote className="font-display mt-5 border-l-2 border-ocean/40 pl-6 text-[clamp(20px,2vw,24px)] leading-[1.5] italic text-ocean">
              {seeker.story}
            </blockquote>

            <dl className="mt-12">
              <DLRow label="What they&apos;re looking for">
                <div className="flex flex-wrap gap-2">
                  {seeker.modalities.map((m) => (
                    <span
                      key={m}
                      className="inline-flex items-center rounded-full bg-sand-deep px-3 py-1 text-[12px] tracking-[0.02em] text-ink-soft"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </DLRow>
              <DLRow label="Location">{seeker.location}</DLRow>
              <DLRow label="Format">{seeker.format}</DLRow>
              <DLRow label="Budget">{seeker.budget}</DLRow>
              {seeker.genderPreference ? (
                <DLRow label="Practitioner preference">
                  {seeker.genderPreference}
                </DLRow>
              ) : null}
              <DLRow label="Availability">{seeker.availability}</DLRow>
              <DLRow label="Urgency">{seeker.urgency}</DLRow>
            </dl>
          </section>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-3xl border border-rule/70 bg-white p-6">
              <p className="meta text-ink-muted">Next step</p>
              <p className="font-display mt-3 text-[20px] leading-[1.3] text-charcoal">
                Build {seeker.firstName} a shortlist
              </p>
              <p className="mt-3 text-[14px] leading-[1.55] text-ink-soft">
                Open the matching workspace to cross-reference {seeker.firstName}&apos;s
                intake against your practitioner roster.
              </p>
              <LinkButton
                href={`/prototype/admin/match?seekerId=${seeker.id}`}
                tone="primary"
                className="mt-6 w-full"
              >
                Open matching workspace
              </LinkButton>
            </div>
          </aside>
        </div>
      </Container>
    </main>
  );
}
