import Link from "next/link";
import {
  Card,
  Container,
  SectionHeader,
  StatusPill,
} from "@/app/prototype/_components/ui";
import {
  inProgressSeekers,
  newPractitionerApplications,
  newSeekerRequests,
  recentIntroductions,
} from "@/app/prototype/_data/mock";

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-sand-deep px-3 py-1 text-[11px] font-medium tracking-[0.04em] text-ink-soft">
      {children}
    </span>
  );
}

function SectionTitle({
  eyebrow,
  title,
  count,
}: {
  eyebrow: string;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-rule/60 pb-4">
      <div>
        <p className="meta text-ink-muted">{eyebrow}</p>
        <h2 className="font-display mt-2 text-[26px] leading-[1.1] text-charcoal md:text-[28px]">
          {title}
        </h2>
      </div>
      {typeof count === "number" ? (
        <span className="meta text-ink-muted">
          {count} {count === 1 ? "item" : "items"}
        </span>
      ) : null}
    </div>
  );
}

const followUps = [
  {
    id: "f-1",
    body: "Check in with David (acupuncture intro — 5 days, no reply yet).",
  },
  {
    id: "f-2",
    body: "Confirm Marcus Chen still has weekday morning openings for next week.",
  },
  {
    id: "f-3",
    body: "Write back to Theo Adeyemi — application has been pending for two days.",
  },
];

export default function AdminDashboardPage() {
  const todayCount =
    newSeekerRequests.length +
    newPractitionerApplications.length +
    inProgressSeekers.length;

  return (
    <main className="py-12 md:py-16">
      <Container size="wide">
        <SectionHeader
          eyebrow="Tuesday morning"
          title={
            <>
              Good morning,
              <span className="italic text-ocean"> Nora</span>.
            </>
          }
          body={
            <>
              {todayCount} things waiting on you today.{" "}
              {newSeekerRequests.length} new request
              {newSeekerRequests.length === 1 ? "" : "s"},{" "}
              {inProgressSeekers.length} in progress, and{" "}
              {newPractitionerApplications.length} practitioner application
              {newPractitionerApplications.length === 1 ? "" : "s"} to review.
            </>
          }
        />

        <div className="mt-14 grid grid-cols-1 gap-14">
          {/* New seeker requests */}
          <section>
            <SectionTitle
              eyebrow="01 / Inbox"
              title="New seeker requests"
              count={newSeekerRequests.length}
            />
            <ul className="mt-6 grid grid-cols-1 gap-4">
              {newSeekerRequests.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/prototype/admin/seeker/${s.id}`}
                    className="group block rounded-3xl border border-rule/80 bg-white p-6 transition-colors hover:border-charcoal/30 hover:bg-sand-deep/30 md:p-7"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-display text-[22px] leading-tight text-charcoal">
                          {s.firstName.charAt(0)}.
                          {s.pronouns ? (
                            <span className="ml-3 text-[14px] font-normal text-ink-muted">
                              {s.pronouns}
                            </span>
                          ) : null}
                        </p>
                        <p className="meta mt-2 text-ink-muted">
                          Submitted {s.submittedAt}
                        </p>
                      </div>
                      <StatusPill status={s.status} />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {s.modalities.map((m) => (
                        <Tag key={m}>{m}</Tag>
                      ))}
                    </div>

                    <p className="mt-5 line-clamp-2 text-[15px] leading-[1.6] text-ink-soft">
                      {s.story}
                    </p>

                    <span className="meta mt-5 inline-flex items-center gap-2 text-charcoal/80 transition-colors group-hover:text-charcoal">
                      Open intake
                      <span aria-hidden className="text-base">
                        →
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* New practitioner applications */}
          <section>
            <SectionTitle
              eyebrow="02 / Applications"
              title="New practitioner applications"
              count={newPractitionerApplications.length}
            />
            <ul className="mt-6 grid grid-cols-1 gap-4">
              {newPractitionerApplications.map((p) => (
                <li key={p.id}>
                  <Card className="!p-6 md:!p-7">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-display text-[22px] leading-tight text-charcoal">
                          {p.name}
                        </p>
                        <p className="mt-2 text-[14px] text-ink-soft">
                          {p.location}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {p.modalities.map((m) => (
                            <Tag key={m}>{m}</Tag>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <StatusPill status={p.status} />
                        <Link
                          href="/prototype/admin/practitioners"
                          className="meta inline-flex items-center gap-2 text-charcoal/80 hover:text-charcoal"
                        >
                          Review
                          <span aria-hidden className="text-base">
                            →
                          </span>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
              {newPractitionerApplications.length === 0 ? (
                <li className="text-[14px] text-ink-muted">
                  Nothing new this week.
                </li>
              ) : null}
            </ul>
          </section>

          {/* Matches in progress */}
          <section>
            <SectionTitle
              eyebrow="03 / In motion"
              title="Matches in progress"
              count={inProgressSeekers.length}
            />
            <ul className="mt-6 grid grid-cols-1 gap-4">
              {inProgressSeekers.map((s) => (
                <li key={s.id}>
                  <Card className="!p-6 md:!p-7">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="font-display text-[22px] leading-tight text-charcoal">
                            {s.firstName.charAt(0)}.
                          </p>
                          {s.pronouns ? (
                            <span className="text-[14px] text-ink-muted">
                              {s.pronouns}
                            </span>
                          ) : null}
                          <StatusPill status={s.status} />
                        </div>
                        <p className="meta mt-2 text-ink-muted">
                          Submitted {s.submittedAt} · {s.location}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {s.modalities.map((m) => (
                            <Tag key={m}>{m}</Tag>
                          ))}
                        </div>
                      </div>
                      <Link
                        href={`/prototype/admin/match?seekerId=${s.id}`}
                        className="meta inline-flex shrink-0 items-center gap-2 self-center text-charcoal/80 hover:text-charcoal"
                      >
                        Continue match
                        <span aria-hidden className="text-base">
                          →
                        </span>
                      </Link>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          </section>

          {/* Recent introductions */}
          <section>
            <SectionTitle
              eyebrow="04 / Sent"
              title="Recent introductions"
              count={recentIntroductions.length}
            />
            <ul className="mt-6 grid grid-cols-1 gap-3">
              {recentIntroductions.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rule/70 bg-white px-6 py-4"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-display text-[18px] text-charcoal">
                      {s.firstName.charAt(0)}.
                    </p>
                    {s.pronouns ? (
                      <span className="text-[13px] text-ink-muted">
                        {s.pronouns}
                      </span>
                    ) : null}
                    <span className="text-[13px] text-ink-muted">·</span>
                    <span className="text-[13px] text-ink-soft">
                      {s.modalities.join(", ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] text-ink-muted">
                      Sent {s.submittedAt}
                    </span>
                    <StatusPill status={s.status} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Follow-ups */}
          <section>
            <SectionTitle eyebrow="05 / Touch base" title="Follow-ups needed" />
            <ul className="mt-6 grid grid-cols-1 gap-3">
              {followUps.map((f) => (
                <li
                  key={f.id}
                  className="flex items-start gap-4 rounded-2xl border border-rule/70 bg-white px-6 py-5"
                >
                  <span
                    aria-hidden
                    className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-ocean"
                  />
                  <p className="text-[15px] leading-[1.6] text-charcoal">
                    {f.body}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Container>
    </main>
  );
}
