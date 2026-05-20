import {
  Card,
  Container,
  SectionHeader,
  StatusPill,
  TextInput,
} from "@/app/prototype/_components/ui";
import { practitioners } from "@/app/prototype/_data/mock";

const filters = [
  "All",
  "Therapy",
  "Acupuncture",
  "Reiki",
  "Movement",
  "Trauma-informed support",
];

function Tag({
  children,
  size = "md",
}: {
  children: React.ReactNode;
  size?: "sm" | "md";
}) {
  const cls =
    size === "sm"
      ? "px-2.5 py-0.5 text-[11px]"
      : "px-3 py-1 text-[12px]";
  return (
    <span
      className={`inline-flex items-center rounded-full bg-sand-deep ${cls} font-medium tracking-[0.02em] text-ink-soft`}
    >
      {children}
    </span>
  );
}

export default function PractitionersPage() {
  return (
    <main className="py-12 md:py-16">
      <Container size="wide">
        <SectionHeader
          eyebrow="Practitioner database"
          title={
            <>
              Everyone in the
              <span className="italic text-ocean"> collective</span>.
            </>
          }
          body="A small, curated roster. Each one was reviewed before they were added. Search and filter below to find who you need."
        />

        <div className="mt-12 flex flex-col gap-6">
          <div className="max-w-md">
            <TextInput
              type="search"
              placeholder="Search by name, modality, or specialty"
              aria-label="Search practitioners"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((f, i) => (
              <button
                key={f}
                type="button"
                className={`inline-flex items-center rounded-full border px-4 py-2 text-[13px] font-medium tracking-[0.01em] transition-colors ${
                  i === 0
                    ? "border-charcoal bg-charcoal text-sand"
                    : "border-rule bg-white text-ink-soft hover:border-charcoal/40 hover:text-charcoal"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {practitioners.map((p) => (
            <li key={p.id}>
              <Card as="article" className="flex h-full flex-col !p-7">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-[22px] leading-[1.2] text-charcoal">
                    {p.name}
                  </h2>
                  <StatusPill status={p.status} />
                </div>

                <p className="meta mt-2 text-ink-muted">{p.location}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {p.modalities.map((m) => (
                    <Tag key={m}>{m}</Tag>
                  ))}
                </div>

                <div className="mt-5">
                  <p className="meta text-ink-muted">Specialties</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.specialties.map((s) => (
                      <Tag key={s} size="sm">
                        {s}
                      </Tag>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="meta text-ink-muted">Availability</p>
                  <p className="mt-2 text-[14px] leading-[1.55] text-ink-soft">
                    {p.availability}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-rule/60 pt-5">
                  <span className="text-[13px] text-ink-muted">
                    {p.acceptingReferrals
                      ? "Accepting referrals"
                      : "Not currently referring"}
                  </span>
                  <a
                    href="#"
                    className="meta inline-flex items-center gap-2 text-charcoal/80 hover:text-charcoal"
                  >
                    View profile
                    <span aria-hidden className="text-base">
                      →
                    </span>
                  </a>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </main>
  );
}
