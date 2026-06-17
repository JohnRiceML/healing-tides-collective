// The one DB read behind the "Your presence" surface: a practitioner's own profile-view
// timestamps over the recent window. Bucketing/maths live in lib/presence (pure, tested).

import { db } from "@/lib/db";

export async function getWeeklyViewDates(practitionerId: string, weeks = 6): Promise<Date[]> {
  const since = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000);
  const rows = await db.profileView.findMany({
    where: { practitionerId, viewedAt: { gte: since } },
    select: { viewedAt: true },
    orderBy: { viewedAt: "asc" },
  });
  return rows.map((r) => r.viewedAt);
}
