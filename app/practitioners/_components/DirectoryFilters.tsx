import { Button, Field, LinkButton, Select, TextInput } from "@/app/_components/ui";
import { MODALITY_OPTIONS, SPECIALTY_OPTIONS } from "@/app/_lib/taxonomy";

export type ActiveFilters = {
  specialty?: string;
  modality?: string;
  q?: string;
  gender?: string;
  acceptingNew?: boolean;
};

/**
 * Server-rendered filter bar. A plain GET form navigates to /practitioners with
 * query params, so the page stays a Server Component with no client JS. The
 * selects/input default to the currently-active params; "Apply" submits, and a
 * reset link clears everything when any filter is set.
 */
export function DirectoryFilters({ active }: { active: ActiveFilters }) {
  const { specialty = "", modality = "", q = "", gender = "", acceptingNew = false } = active;
  const hasActive = Boolean(specialty || modality || q || gender || acceptingNew);

  return (
    <form
      method="get"
      action="/practitioners"
      role="search"
      aria-label="Filter practitioners"
      className="rounded-3xl border border-rule/80 bg-white/60 p-5 md:p-6"
    >
      <div className="grid gap-5 md:grid-cols-[1.4fr_1fr_1fr] md:gap-5">
        <Field label="Search">
          <TextInput
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Name, focus, or region"
            aria-label="Search practitioners by name, focus, or region"
          />
        </Field>

        <Field label="Specialty">
          <Select name="specialty" defaultValue={specialty} aria-label="Filter by specialty">
            <option value="">Any specialty</option>
            {SPECIALTY_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Format">
          <Select name="modality" defaultValue={modality} aria-label="Filter by format">
            <option value="">Any format</option>
            {MODALITY_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Gender">
          <TextInput
            type="text"
            name="gender"
            defaultValue={gender}
            placeholder="Any gender"
            aria-label="Filter by practitioner gender"
          />
        </Field>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-4">
        <label className="flex cursor-pointer items-center gap-3 text-[15px] text-charcoal">
          <input
            type="checkbox"
            name="accepting"
            defaultChecked={acceptingNew}
            className="h-[18px] w-[18px] shrink-0 rounded-[6px] border-rule text-charcoal accent-charcoal focus:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/20 focus-visible:ring-offset-2 focus-visible:ring-offset-sand"
          />
          Accepting new clients
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" tone="primary">
            apply
          </Button>
          {hasActive ? (
            <LinkButton href="/practitioners" tone="ghost">
              clear filters
            </LinkButton>
          ) : null}
        </div>
      </div>
    </form>
  );
}
