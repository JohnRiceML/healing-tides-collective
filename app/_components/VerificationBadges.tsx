import { badgesFor } from "@/app/_lib/verification";

/**
 * A practitioner's trust badges (Founding Member today; admin-verified badges in
 * Push 2). Calm, on-brand pills — soft tones, gentle ✓, never a loud "verified"
 * stamp. The description rides along as a title/tooltip.
 */
export function VerificationBadges({
  practitioner,
  size = "default",
  className = "",
}: {
  practitioner: { createdAt?: Date | string | null; verificationBadges?: string[] | null };
  size?: "sm" | "default";
  className?: string;
}) {
  const badges = badgesFor(practitioner);
  if (badges.length === 0) return null;

  const pad = size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-[12.5px]";

  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`}>
      {badges.map((b) => (
        <li
          key={b.id}
          title={b.description}
          className={`inline-flex items-center gap-1.5 rounded-full font-medium leading-none ${pad} ${b.tone}`}
        >
          <span aria-hidden>{b.icon}</span>
          <span>{b.label}</span>
        </li>
      ))}
    </ul>
  );
}
