import {
  Button,
  Card,
  Container,
  DLRow,
  SectionHeader,
} from "@/app/prototype/_components/ui";
import { getPractitioner } from "@/app/prototype/_data/mock";

export default function ProviderProfilePage() {
  const elena = getPractitioner("pr-001");

  if (!elena) {
    return (
      <main className="py-16">
        <Container>
          <p className="text-ink-muted">Practitioner not found.</p>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-12 md:py-16">
      <Container size="wide">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <SectionHeader
            eyebrow="Your profile"
            title={
              <>
                Dr. Elena
                <br />
                <span className="italic text-ocean">Vasquez</span>
              </>
            }
            body="How Nora sees you when she's making a referral. Keep it true to your practice."
          />
          <div className="inline-flex items-center gap-2 rounded-full border border-sage/40 bg-sage/15 px-4 py-2">
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-full bg-sage"
            />
            <span className="meta text-ocean">Accepting referrals</span>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-rule/70 pb-5">
              <div>
                <p className="meta text-ink-muted">Practice overview</p>
                <h2 className="font-display mt-2 text-[24px] leading-tight text-charcoal">
                  The basics
                </h2>
              </div>
              <Button tone="secondary">Edit</Button>
            </div>
            <dl className="mt-2">
              <DLRow label="Name">{elena.name}</DLRow>
              <DLRow label="Email">{elena.email}</DLRow>
              <DLRow label="Website">{elena.website ?? "—"}</DLRow>
              <DLRow label="Location">{elena.location}</DLRow>
              <DLRow label="Modalities">{elena.modalities.join(", ")}</DLRow>
              <DLRow label="Specialties">{elena.specialties.join(", ")}</DLRow>
              <DLRow label="Licenses">{elena.licenses.join(", ")}</DLRow>
              <DLRow label="Years of experience">{elena.yearsExperience}</DLRow>
            </dl>
          </Card>

          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-rule/70 pb-5">
              <div>
                <p className="meta text-ink-muted">In your own words</p>
                <h2 className="font-display mt-2 text-[24px] leading-tight text-charcoal">
                  How you describe the work
                </h2>
              </div>
              <Button tone="secondary">Edit</Button>
            </div>
            <dl className="mt-2">
              <DLRow label="Bio">{elena.bio}</DLRow>
              <DLRow label="Works best with">{elena.worksBestWith}</DLRow>
              <DLRow label="Not the right fit for">{elena.notARightFitFor}</DLRow>
              <DLRow label="Trauma-informed">{elena.traumaInformed}</DLRow>
              <DLRow label="Current availability">{elena.availability}</DLRow>
            </dl>
          </Card>
        </div>

        <p className="meta mt-10 text-ink-muted">
          Changes are reviewed by Nora before going live to the collective.
        </p>
      </Container>
    </main>
  );
}
