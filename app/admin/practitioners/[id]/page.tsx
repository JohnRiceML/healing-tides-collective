import { notFound } from "next/navigation";
import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import { specialtyLabel, modalityLabel } from "@/app/_lib/taxonomy";
import { readTriage } from "@/app/_lib/triage";
import { readAdminNotes } from "@/app/_lib/admin-notes";

import { AdminShell } from "../../_components/AdminShell";
import { getAdminPractitionerDetail } from "../../_data";
import { PractitionerTriagePanel } from "./PractitionerTriagePanel";

export const dynamic = "force-dynamic";

const VIS_LABEL: Record<string, string> = {
  PUBLISHED: "Live",
  DRAFT: "Draft",
  NEEDS_REVIEW: "Needs review",
  HIDDEN: "Hidden",
};

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p className="text-[13.5px] leading-[1.7] text-ink-soft">
      <span className="text-ink-muted">{label}:</span> {children}
    </p>
  );
}

export default async function AdminPractitionerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) notFound();

  const { id } = await params;
  const p = await getAdminPractitionerDetail(id);
  if (!p) notFound();

  const triage = readTriage(p.fieldValues);
  const notes = readAdminNotes(p.fieldValues);
  const specialties = p.specialties.map(specialtyLabel);

  return (
    <AdminShell title={p.displayName ?? "Practitioner"}>
      <div className="mt-2">
        <Link href="/admin/practitioners" className="text-[13px] text-teal underline-offset-2 hover:underline">
          ← All practitioners
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
        {/* Profile summary — what we know */}
        <section className="rounded-2xl border border-rule/70 bg-white p-6">
          <p className="meta text-ink-muted">Profile</p>
          <h2 className="font-display mt-2 text-[22px] leading-tight text-charcoal">{p.displayName ?? "Unnamed"}</h2>
          {p.title || p.region ? (
            <p className="mt-1 text-[14px] text-ink-soft">{[p.title, p.region].filter(Boolean).join(" · ")}</p>
          ) : null}

          <div className="mt-4 space-y-1.5">
            <Fact label="Status">
              {VIS_LABEL[p.visibility] ?? p.visibility}
              {p.visibility === "PUBLISHED" && p.slug ? (
                <>
                  {" · "}
                  <Link href={`/practitioners/${p.slug}`} target="_blank" className="text-teal hover:underline">
                    view public page ↗
                  </Link>
                </>
              ) : null}
            </Fact>
            <Fact label="Completeness">{p.completeness}%</Fact>
            <Fact label="Accepting new clients">{p.acceptingNew ? "Yes" : "Not stated"}</Fact>
            {p.modality ? <Fact label="Format">{modalityLabel(p.modality)}</Fact> : null}
            {p.email ? <Fact label="Email">{p.email}</Fact> : null}
            {p.website ? (
              <Fact label="Website">
                <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-teal hover:underline">
                  {p.website}
                </a>
              </Fact>
            ) : null}
            {p.credentials.length ? <Fact label="Stated credentials">{p.credentials.join(", ")}</Fact> : null}
          </div>

          {specialties.length ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {specialties.map((s) => (
                <span key={s} className="rounded-full bg-seafoam/40 px-2.5 py-0.5 text-[12px] text-ocean">
                  {s}
                </span>
              ))}
            </div>
          ) : null}

          {p.bio ? <p className="mt-4 line-clamp-6 text-[13.5px] leading-[1.7] text-ink-soft">{p.bio}</p> : null}
        </section>

        {/* Triage + notes + outreach */}
        <PractitionerTriagePanel
          practitionerId={p.id}
          displayName={p.displayName}
          email={p.email}
          initialTriage={triage}
          initialNotes={notes}
        />
      </div>
    </AdminShell>
  );
}
