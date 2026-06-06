import { ProfileCover } from "@/app/practitioners/_components/ProfileCover";
import { specialtyLabel, modalityLabel } from "@/app/_lib/taxonomy";
import { optionLabel } from "@/app/_lib/profile-fields";

/**
 * A compact preview of the practitioner's public card for the dashboard "Your public page"
 * panel — a horizontal mini-card: cover, then an avatar on the left with name / role ·
 * location / specialties / a few chips to the right, then skeleton lines. Driven by the
 * practitioner's real data.
 */
export function PublicPagePreview({
  name,
  credentials,
  role,
  region,
  specialties,
  modality,
  ageGroups,
  photoUrl,
  design,
  color,
  seed,
}: {
  name: string;
  credentials: string;
  role: string;
  region: string;
  specialties: string[];
  modality: string | null;
  ageGroups: string[];
  photoUrl: string;
  design: string | null;
  color: string | null;
  seed: string;
}) {
  const specText = specialties.slice(0, 3).map((id) => specialtyLabel(id)).join(", ");
  const fmt = modality ? modalityLabel(modality) : "";
  const chips = [fmt, ...ageGroups.map((id) => optionLabel("age_groups", id))].filter(Boolean).slice(0, 3);
  const initial = (name.trim()[0] ?? "·").toUpperCase();
  const heading = name.trim() ? `${name.trim()}${credentials ? `, ${credentials}` : ""}` : "Your name";

  return (
    <div className="overflow-hidden rounded-2xl border border-rule/80 bg-white shadow-[0_1px_0_rgba(31,58,95,0.02),0_14px_34px_-30px_rgba(31,58,95,0.25)]">
      <div className="relative h-20 w-full overflow-hidden">
        <ProfileCover seed={seed} design={design} color={color} className="h-full w-full" />
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-start gap-3">
          <div className="relative z-10 -mt-9 shrink-0">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" className="h-16 w-16 rounded-full border-4 border-white object-cover shadow-sm" />
            ) : (
              <span
                aria-hidden
                className="font-display flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-sand-deep text-[22px] text-teal shadow-sm"
              >
                {initial}
              </span>
            )}
          </div>

          <div className="min-w-0 pt-1.5">
            <p className="font-display text-[15px] leading-tight tracking-[-0.01em] text-charcoal">{heading}</p>
            {role || region ? (
              <p className="mt-0.5 text-[12px] leading-tight text-ink-muted">
                {[role, region].filter(Boolean).join(" · ")}
              </p>
            ) : null}
            {specText ? (
              <p className="mt-1 line-clamp-1 text-[12px] leading-tight text-ink-soft">{specText}</p>
            ) : null}
            {chips.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {chips.map((c) => (
                  <li key={c} className="rounded-full bg-seafoam/45 px-2 py-0.5 text-[10.5px] leading-none text-ocean">
                    {c}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
