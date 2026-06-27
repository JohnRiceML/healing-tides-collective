// Read layer for the Phase-2 matching workspace. ADMIN-ONLY — only ever called behind the
// requireAdmin() gate on app/admin/seekers/[id]/page.tsx. Resilient: every read degrades to
// null / [] if the M2 tables aren't migrated yet, so the admin never 500s.
import { db } from "@/lib/db";
import type { CandidateSignals } from "@/lib/match-candidates";

const str = (fv: unknown, key: string): string | null => {
  const v = (fv as Record<string, unknown> | null | undefined)?.[key];
  if (typeof v === "string" && v.trim()) return v.trim();
  if (Array.isArray(v) && typeof v[0] === "string" && v[0].trim()) return v[0].trim();
  return null;
};
const strs = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "").map((s) => s.trim()) : [];

// ── The intake under review (left side of the workspace) ─────────────────────
export type WorkspaceMatch = {
  practitionerId: string;
  displayName: string | null;
  slug: string | null;
  status: string;
  reason: string | null;
};

export type WorkspaceIntake = {
  id: string;
  name: string;
  email: string;
  story: string;
  priorTherapy: string | null;
  stylePreference: string | null;
  lookingFor: string[];
  specialties: string[];
  region: string | null;
  format: string | null;
  ageGroup: string | null;
  genderPreference: string | null;
  usesInsurance: boolean | null;
  insuranceName: string | null;
  budgetNote: string | null;
  availability: string | null;
  urgency: string | null;
  status: string;
  adminNote: string | null;
  createdAt: Date;
  matches: WorkspaceMatch[]; // current shortlist (any status)
};

export async function getSeekerIntake(id: string): Promise<WorkspaceIntake | null> {
  try {
    const row = await db.seekerIntake.findUnique({
      where: { id },
      include: {
        matches: {
          orderBy: { createdAt: "asc" },
          include: { practitioner: { select: { id: true, displayName: true, slug: true } } },
        },
      },
    });
    if (!row) return null;
    const { matches, ...r } = row;
    return {
      ...r,
      matches: matches.map((m) => ({
        practitionerId: m.practitionerId,
        displayName: m.practitioner?.displayName ?? null,
        slug: m.practitioner?.slug ?? null,
        status: m.status,
        reason: m.reason,
      })),
    };
  } catch {
    return null;
  }
}

// ── Candidate practitioners (right side) ─────────────────────────────────────
// Published practitioners with the matchable signals (for candidateRelevance) PLUS the
// readable prose Nora weighs by eye (bio / credentials / values). The prose is where
// modality/experience/style live until those become structured fields (ADR 0001).
export type WorkspaceCandidate = {
  id: string;
  displayName: string;
  slug: string;
  title: string | null;
  bio: string | null;
  values: string | null;
  credentials: string[];
  signals: CandidateSignals;
};

export async function getCandidatePractitioners(): Promise<WorkspaceCandidate[]> {
  try {
    const rows = await db.practitioner.findMany({
      where: { visibility: "PUBLISHED", slug: { not: null }, displayName: { not: null } },
      orderBy: [{ featured: "desc" }, { completeness: "desc" }, { displayName: "asc" }],
      take: 200,
      select: {
        id: true,
        displayName: true,
        slug: true,
        bio: true,
        values: true,
        specialties: true,
        modality: true,
        region: true,
        insuranceAccepted: true,
        gender: true,
        fieldValues: true,
      },
    });
    return rows.map(({ fieldValues, ...r }) => ({
      id: r.id,
      displayName: r.displayName as string,
      slug: r.slug as string,
      title: str(fieldValues, "title"),
      bio: r.bio,
      values: r.values,
      credentials: strs((fieldValues as Record<string, unknown> | null)?.credentials),
      signals: {
        specialties: r.specialties,
        modality: r.modality,
        region: r.region,
        insuranceAccepted: r.insuranceAccepted,
        gender: r.gender,
        acceptingNew: str(fieldValues, "availability_state") === "accepting",
      },
    }));
  } catch {
    return [];
  }
}
