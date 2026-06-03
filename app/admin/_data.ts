// Admin read layer — sees ALL practitioners (incl. drafts) + their email + counts.
// ADMIN-ONLY: only ever call this behind `requireAdmin()` (the /admin page gates it).
// Unlike lib/practitioners.ts (the public, PUBLISHED-only read layer), this is the
// privileged view, so it must never be imported by a public/unauthenticated surface.
import { db } from "@/lib/db";
import type { ProfileVisibility } from "@/lib/generated/prisma/client";
import { grantedBadgesFrom } from "@/app/_lib/verification";

export type AdminPractitionerRow = {
  id: string;
  displayName: string | null;
  slug: string | null;
  visibility: ProfileVisibility;
  completeness: number;
  viewCount: number;
  region: string | null;
  featured: boolean;
  updatedAt: Date;
  email: string | null;
  verificationBadges: string[];
};

export async function getAdminPractitioners(): Promise<AdminPractitionerRow[]> {
  const rows = await db.practitioner.findMany({
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      displayName: true,
      slug: true,
      visibility: true,
      completeness: true,
      viewCount: true,
      region: true,
      featured: true,
      updatedAt: true,
      fieldValues: true,
      user: { select: { email: true } },
    },
  });
  return rows.map(({ user, fieldValues, ...r }) => ({
    ...r,
    email: user?.email ?? null,
    verificationBadges: grantedBadgesFrom(fieldValues),
  }));
}

export type AdminStats = {
  total: number;
  published: number;
  draft: number;
  totalViews: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const [total, published, draft, views] = await Promise.all([
    db.practitioner.count(),
    db.practitioner.count({ where: { visibility: "PUBLISHED" } }),
    db.practitioner.count({ where: { visibility: "DRAFT" } }),
    db.practitioner.aggregate({ _sum: { viewCount: true } }),
  ]);
  return { total, published, draft, totalViews: views._sum.viewCount ?? 0 };
}
