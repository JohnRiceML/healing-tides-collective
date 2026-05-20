import Link from "next/link";
import { Container, SectionHeader } from "./_components/ui";

const sections = [
  {
    href: "/prototype/seeker",
    eyebrow: "01 / Seeker",
    title: "Seeker intake flow",
    body: "Multi-step flow for someone looking for care. Plain-language story, modality, preferences, consent, review.",
  },
  {
    href: "/prototype/practitioner/apply",
    eyebrow: "02 / Practitioner",
    title: "Practitioner application",
    body: "How a practitioner asks to join the collective. Warm, curated, not a public directory.",
  },
  {
    href: "/prototype/admin",
    eyebrow: "03 / Nora",
    title: "Admin dashboard",
    body: "The interior of the operation. Inbox, practitioner database, matching workspace, send-introductions.",
  },
  {
    href: "/prototype/provider",
    eyebrow: "04 / Provider",
    title: "Provider portal",
    body: "Where a practitioner edits availability, sees referral history, pauses or resumes referrals.",
  },
  {
    href: "/prototype/resources",
    eyebrow: "05 / Resources",
    title: "Care, today",
    body: "Public-facing dashboard: practitioner profiles, free practices, and outside resources for when matching isn't the right fit.",
  },
  {
    href: "/prototype/scope",
    eyebrow: "06 / Scope",
    title: "Phase 2 scope decisions",
    body: "What's in Phase 2 and what's deliberately later. A reference page Nora can return to.",
  },
];

export default function PrototypeHome() {
  return (
    <main className="py-16 md:py-24">
      <Container>
        <SectionHeader
          eyebrow="Phase 2 prototype"
          title={
            <>
              The interior of the
              <br />
              <span className="italic text-ocean">Healing Tides</span> operation.
            </>
          }
          body={
            <>
              A clickable walkthrough of every screen Nora and a practitioner would touch in
              Phase 2. Mock data throughout. The point of this is to feel the workflow before
              we build the real thing — not to design a brand.
            </>
          }
        />

        <ul className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2">
          {sections.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="group block h-full rounded-3xl border border-rule/80 bg-white p-7 transition-colors hover:border-charcoal/40 hover:bg-sand-deep/30 md:p-8"
              >
                <p className="meta text-ink-muted">{s.eyebrow}</p>
                <h2 className="font-display mt-4 text-[26px] leading-[1.15] text-charcoal md:text-[28px]">
                  {s.title}
                </h2>
                <p className="mt-4 text-[15px] leading-[1.6] text-ink-soft">{s.body}</p>
                <span className="meta mt-6 inline-flex items-center gap-2 text-charcoal/80 transition-colors group-hover:text-charcoal">
                  Open
                  <span aria-hidden className="text-base">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="meta mt-16 text-ink-muted">
          A note: every button is clickable but no data persists. Refreshing returns to the
          start of each flow.
        </p>
      </Container>
    </main>
  );
}
