import { ProfileCover } from "@/app/practitioners/_components/ProfileCover";

/**
 * The personal header of the brand center — this place is THEIRS. Their own watercolor
 * cover (their chosen design + colour) as a soft band, their photo (or a calm monogram)
 * overlapping it, their name + role, and one warm, growth-framed line about where their
 * brand is now. No score, no comparison — just a home base for tending their presence.
 */

function Avatar({ photoUrl, name }: { photoUrl: string; name: string }) {
  const initial = (name.trim()[0] ?? "·").toUpperCase();
  return photoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoUrl}
      alt=""
      className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-sm"
    />
  ) : (
    <div className="font-display flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-seafoam text-[34px] leading-none text-ocean shadow-sm">
      {initial}
    </div>
  );
}

export function BrandHero({
  firstName,
  fullName,
  role,
  region,
  photoUrl,
  design,
  color,
  seed,
  overall,
}: {
  firstName: string;
  fullName: string;
  role: string;
  region: string;
  photoUrl: string;
  design: string | null;
  color: string | null;
  seed: string;
  overall: string;
}) {
  const identity = [role, region].filter(Boolean).join(" · ");
  return (
    <div className="overflow-hidden rounded-3xl border border-rule/70 bg-white shadow-[0_1px_0_rgba(31,58,95,0.02),0_18px_40px_-32px_rgba(31,58,95,0.18)]">
      <div className="relative h-32 md:h-40">
        <ProfileCover seed={seed} design={design} color={color} className="absolute inset-0 h-full w-full" />
      </div>
      <div className="px-6 pb-7 md:px-8 md:pb-8">
        {/* Only the avatar overlaps the cover band; the name sits cleanly below it. relative z-10
            lifts it into the positioned layer so it sits ON the cover, not behind it (the cover
            band is `relative`, which would otherwise paint over this static content). */}
        <div className="relative z-10 -mt-12">
          <Avatar photoUrl={photoUrl} name={fullName} />
        </div>
        <div className="mt-4">
          <p className="meta text-ink-muted">Your brand center</p>
          <h1 className="font-display mt-1.5 text-[clamp(26px,4.5vw,40px)] font-light leading-[1.05] tracking-[-0.02em] text-charcoal">
            {firstName ? `${firstName}’s brand` : "Your brand"}
          </h1>
          {identity ? <p className="mt-1.5 text-[14px] text-ink-soft">{identity}</p> : null}
        </div>
        <p className="mt-5 max-w-2xl text-[15.5px] leading-[1.65] text-ink-soft">
          Your home base for growing how the right people find and remember you. {overall}
        </p>
      </div>
    </div>
  );
}
