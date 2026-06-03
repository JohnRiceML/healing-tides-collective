// Trust & Verification — the badge system (PRODUCT-SPEC.md §9).
//
// Badges communicate safety / training / expertise WITHOUT implying every
// practitioner has the same licensure — Healing Tides intentionally holds both
// licensed clinicians and wellness practitioners.
//
// IMPORTANT: verified badges are ADMIN-GRANTED, never self-claimed. This file is the
// presentation + taxonomy layer. "Founding Member" is the one badge derivable today
// (from join date — no DB change). The admin-verified badges (licensed_professional,
// verified_identity, verified_credentials, advanced_certification, insured,
// community_partner) land with the `verificationBadges` column in Push 2.

export type BadgeId =
  | "founding_member"
  | "licensed_professional"
  | "verified_credentials"
  | "advanced_certification"
  | "verified_identity"
  | "insured"
  | "community_partner";

export interface BadgeDef {
  id: BadgeId;
  label: string;
  icon: string;
  /** One calm sentence shown to clients (title/tooltip). */
  description: string;
  /** Tailwind tone (bg + text) — soft, on-brand, never loud. */
  tone: string;
  /** True ⇒ requires admin verification (Push 2); false ⇒ derivable today. */
  adminGranted: boolean;
}

export const BADGES: Record<BadgeId, BadgeDef> = {
  licensed_professional: {
    id: "licensed_professional",
    label: "Licensed Professional",
    icon: "✓",
    description: "An active professional license, verified by Healing Tides.",
    tone: "bg-sage/30 text-ocean",
    adminGranted: true,
  },
  verified_credentials: {
    id: "verified_credentials",
    label: "Verified Credentials",
    icon: "✓",
    description: "Certification or training reviewed by Healing Tides.",
    tone: "bg-seafoam/50 text-ocean",
    adminGranted: true,
  },
  advanced_certification: {
    id: "advanced_certification",
    label: "Advanced Certification",
    icon: "✓",
    description: "Specialized training verified by Healing Tides.",
    tone: "bg-seafoam/40 text-ocean",
    adminGranted: true,
  },
  verified_identity: {
    id: "verified_identity",
    label: "Verified Identity",
    icon: "✓",
    description: "Government-issued ID verified.",
    tone: "bg-sand-deep text-charcoal",
    adminGranted: true,
  },
  insured: {
    id: "insured",
    label: "Insured Practitioner",
    icon: "✓",
    description: "Professional liability insurance verified.",
    tone: "bg-sand-deep text-charcoal",
    adminGranted: true,
  },
  community_partner: {
    id: "community_partner",
    label: "Community Partner",
    icon: "🤝",
    description: "A partner organization or group practice.",
    tone: "bg-sand-deep text-charcoal",
    adminGranted: true,
  },
  founding_member: {
    id: "founding_member",
    label: "Founding Member",
    icon: "🌊",
    description: "An early member who helped shape the Collective.",
    tone: "bg-seafoam/60 text-ocean",
    adminGranted: false,
  },
};

/** Display order — verified-trust badges first, the community/founding badges last. */
export const BADGE_ORDER: BadgeId[] = [
  "licensed_professional",
  "verified_credentials",
  "advanced_certification",
  "verified_identity",
  "insured",
  "community_partner",
  "founding_member",
];

/** Members who joined before this are Founding Members (pre-launch, so everyone today). */
export const FOUNDING_CUTOFF = new Date("2026-09-01T00:00:00.000Z");

/** Badges derivable WITHOUT the admin-granted column — just Founding Member today. */
export function derivedBadges(createdAt: Date | string | null | undefined): BadgeId[] {
  if (!createdAt) return [];
  const t = new Date(createdAt).getTime();
  if (Number.isNaN(t)) return [];
  return t < FOUNDING_CUTOFF.getTime() ? ["founding_member"] : [];
}

/**
 * The full ordered badge list for a practitioner: admin-granted (Push 2) ∪ derived,
 * de-duped, in display order. Safe to call with `granted` omitted today.
 */
export function badgesFor(
  practitioner: { createdAt?: Date | string | null; verificationBadges?: string[] | null },
): BadgeDef[] {
  const set = new Set<string>([
    ...(practitioner.verificationBadges ?? []),
    ...derivedBadges(practitioner.createdAt),
  ]);
  return BADGE_ORDER.filter((id) => set.has(id)).map((id) => BADGES[id]);
}
