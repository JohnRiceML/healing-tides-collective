import { notFound } from "next/navigation";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import { specialtyLabel } from "@/app/_lib/taxonomy";
import { FORMATS, AGE_GROUPS, URGENCY, STYLE_PREFS, intakeStatusLabel } from "@/lib/seeker-intake";
import { getSeekerIntakes, type AdminSeekerRow } from "../_data";
import { AdminShell } from "../_components/AdminShell";

export const dynamic = "force-dynamic";

const STATUS_CHIP: Record<string, string> = {
  NEW: "bg-seafoam/60 text-ocean",
  REVIEWING: "bg-sage/30 text-ocean",
  MATCHED: "bg-teal/15 text-teal",
  CLOSED: "bg-rule/40 text-ink-muted",
};

const labelOf = (opts: readonly { value: string; label: string }[], v: string | null) =>
  v ? (opts.find((o) => o.value === v)?.label ?? v) : null;

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p className="mt-1 text-[13px] text-ink-soft">
      <span className="text-ink-muted">{label}:</span> {children}
    </p>
  );
}

function IntakeCard({ s }: { s: AdminSeekerRow }) {
  const focus = s.specialties.map(specialtyLabel).filter(Boolean).join(" · ");
  const chips = [
    s.region,
    labelOf(FORMATS, s.format),
    labelOf(AGE_GROUPS, s.ageGroup),
    s.stylePreference ? labelOf(STYLE_PREFS, s.stylePreference) : null,
    s.usesInsurance === true
      ? s.insuranceName
        ? `insurance: ${s.insuranceName}`
        : "wants insurance"
      : s.usesInsurance === false
        ? "out-of-pocket ok"
        : null,
    labelOf(URGENCY, s.urgency),
  ].filter(Boolean);

  return (
    <li className="rounded-2xl border border-rule/70 bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/admin/seekers/${s.id}`} className="font-medium text-charcoal underline-offset-2 hover:underline">
          {s.name}
        </Link>
        <span className={`rounded-full px-2.5 py-0.5 text-[12px] ${STATUS_CHIP[s.status] ?? "bg-charcoal/5 text-ink-muted"}`}>
          {intakeStatusLabel(s.status)}
        </span>
        <span className="text-[12px] text-ink-muted">{s.createdAt.toISOString().slice(0, 10)}</span>
        {s.matchCount > 0 ? <span className="text-[12px] text-teal">{s.matchCount} shortlisted</span> : null}
        <Link
          href={`/admin/seekers/${s.id}`}
          className="ml-auto rounded-full bg-teal px-3 py-1 text-[12px] text-white hover:bg-teal/90"
        >
          Open workspace →
        </Link>
      </div>

      <a href={`mailto:${s.email}`} className="mt-1 inline-block text-[13px] text-teal underline-offset-2 hover:underline">
        {s.email}
      </a>

      {s.lookingFor.length ? <Fact label="Looking for">{s.lookingFor.join(", ")}</Fact> : null}
      {focus ? <Fact label="Focus">{focus}</Fact> : null}

      <p className="mt-3 whitespace-pre-wrap text-[14px] leading-[1.6] text-charcoal">{s.story}</p>

      {s.priorTherapy ? <Fact label="Past experience">{s.priorTherapy}</Fact> : null}
      {s.budgetNote ? <Fact label="Budget">{s.budgetNote}</Fact> : null}
      {s.genderPreference ? <Fact label="Gender pref">{s.genderPreference}</Fact> : null}
      {s.availability ? <Fact label="Free">{s.availability}</Fact> : null}

      {chips.length ? (
        <p className="mt-3 flex flex-wrap gap-2 text-[12px] text-ink-muted">
          {chips.map((c, i) => (
            <span key={i} className="rounded-full bg-sand px-2.5 py-0.5">
              {c}
            </span>
          ))}
        </p>
      ) : null}
    </li>
  );
}

export default async function AdminSeekersPage() {
  const admin = await requireAdmin();
  if (!admin) notFound();

  const intakes = await getSeekerIntakes();

  return (
    <AdminShell title="Seekers">
      <p className="mt-4 max-w-prose text-[15px] leading-[1.7] text-ink-soft">
        Every &ldquo;Get matched&rdquo; submission lands here for you to read first. Open one to enter the matching{" "}
        <span className="text-charcoal">workspace</span> — read their story, see candidate practitioners ordered by the
        needs they meet, and hand-build a shortlist with a note on each. (Sending it by email is the next build.)
      </p>

      {intakes.length === 0 ? (
        <p className="mt-8 text-[15px] text-ink-soft">
          No intakes yet — they&rsquo;ll appear here as people use &ldquo;Get matched&rdquo; on the site.
        </p>
      ) : (
        <>
          <p className="mt-6 text-[13px] text-ink-muted">
            {intakes.length} intake{intakes.length === 1 ? "" : "s"}
          </p>
          <ul className="mt-3 flex flex-col gap-3">
            {intakes.map((s) => (
              <IntakeCard key={s.id} s={s} />
            ))}
          </ul>
        </>
      )}
    </AdminShell>
  );
}
