import { notFound } from "next/navigation";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import { specialtyLabel } from "@/app/_lib/taxonomy";
import { FORMATS, AGE_GROUPS, URGENCY, STYLE_PREFS, intakeStatusLabel } from "@/lib/seeker-intake";
import { candidateRelevance, compareByRelevance, type SeekerSignals } from "@/lib/match-candidates";
import { AdminShell } from "../../_components/AdminShell";
import { getSeekerIntake, getCandidatePractitioners } from "../_data";
import { MatchingPanel, type CandidateVM } from "./MatchingPanel";

export const dynamic = "force-dynamic";

const labelOf = (opts: readonly { value: string; label: string }[], v: string | null) =>
  v ? (opts.find((o) => o.value === v)?.label ?? v) : null;

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p className="text-[13px] leading-[1.6] text-ink-soft">
      <span className="text-ink-muted">{label}:</span> {children}
    </p>
  );
}

export default async function SeekerWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) notFound();

  const { id } = await params;
  const intake = await getSeekerIntake(id);
  if (!intake) notFound();

  const rawCandidates = await getCandidatePractitioners();

  const seekerSignals: SeekerSignals = {
    specialties: intake.specialties,
    format: intake.format,
    region: intake.region,
    usesInsurance: intake.usesInsurance,
    insuranceName: intake.insuranceName,
    genderPreference: intake.genderPreference,
  };

  const candidates: CandidateVM[] = rawCandidates
    .map((c) => ({
      id: c.id,
      displayName: c.displayName,
      slug: c.slug,
      title: c.title,
      bio: c.bio,
      values: c.values,
      credentials: c.credentials,
      relevance: candidateRelevance(seekerSignals, c.signals),
    }))
    .sort(compareByRelevance);

  const focus = intake.specialties.map(specialtyLabel).filter(Boolean).join(" · ");
  const chips = [
    intake.lookingFor.length ? intake.lookingFor.join(", ") : null,
    intake.region,
    labelOf(FORMATS, intake.format),
    labelOf(AGE_GROUPS, intake.ageGroup),
    intake.stylePreference ? labelOf(STYLE_PREFS, intake.stylePreference) : null,
    intake.usesInsurance === true
      ? intake.insuranceName
        ? `insurance: ${intake.insuranceName}`
        : "wants insurance"
      : intake.usesInsurance === false
        ? "out-of-pocket ok"
        : null,
    intake.genderPreference ? `prefers ${intake.genderPreference}` : null,
    labelOf(URGENCY, intake.urgency),
  ].filter(Boolean) as string[];

  return (
    <AdminShell title={intake.name}>
      <Link href="/admin/seekers" className="mt-2 inline-block text-[13px] text-teal underline-offset-2 hover:underline">
        ← All seekers
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* LEFT — the intake, narrative first (what Nora reads before anything) */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-2xl border border-rule bg-white p-5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="rounded-full bg-seafoam/60 px-2.5 py-0.5 text-[12px] text-ocean">
                {intakeStatusLabel(intake.status)}
              </span>
              <span className="text-[12px] text-ink-muted">{intake.createdAt.toISOString().slice(0, 10)}</span>
              <a href={`mailto:${intake.email}`} className="text-[13px] text-teal underline-offset-2 hover:underline">
                {intake.email}
              </a>
            </div>

            <p className="mt-4 whitespace-pre-wrap text-[15px] leading-[1.7] text-charcoal">{intake.story}</p>

            {intake.priorTherapy ? (
              <div className="mt-4 rounded-xl bg-sand/50 p-3">
                <Fact label="Past experience">{intake.priorTherapy}</Fact>
              </div>
            ) : null}

            <div className="mt-4 flex flex-col gap-1.5">
              {focus ? <Fact label="Focus">{focus}</Fact> : null}
              {intake.budgetNote ? <Fact label="Budget">{intake.budgetNote}</Fact> : null}
              {intake.availability ? <Fact label="Free">{intake.availability}</Fact> : null}
            </div>

            {chips.length ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {chips.map((c, i) => (
                  <span key={i} className="rounded-full bg-sand px-2.5 py-0.5 text-[12px] text-ink-muted">
                    {c}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {/* Safety reminder — rule 6 of the matching principles, every case. */}
          <p className="mt-3 rounded-xl border border-clay/30 bg-clay/[0.06] p-3 text-[12px] leading-[1.6] text-ink-soft">
            <span className="font-medium text-clay">Before matching:</span> screen for immediate safety (SI/HI,
            self-harm, mania, substance). If present, this is a{" "}
            <Link href="/crisis" target="_blank" className="text-teal underline-offset-2 hover:underline">
              crisis-resources
            </Link>{" "}
            moment, not a referral.
          </p>
        </div>

        {/* RIGHT — status, shortlist, and candidates (interactive) */}
        <MatchingPanel
          intakeId={intake.id}
          status={intake.status}
          matches={intake.matches}
          candidates={candidates}
          seekerName={intake.name}
          seekerEmail={intake.email}
        />
      </div>
    </AdminShell>
  );
}
