import { type ReactNode } from "react";
import Link from "next/link";

import { Button, Field, Select, TextInput } from "@/app/_components/ui";
import { MODALITY_OPTIONS, SPECIALTY_OPTIONS } from "@/app/_lib/taxonomy";
import { AGE_GROUP_OPTIONS } from "@/app/_lib/profile-fields";

export type ActiveFilters = {
  specialty?: string;
  modality?: string;
  region?: string;
  ageGroups?: string;
  q?: string;
  acceptingNew?: boolean;
};

function Leaf({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M4 20C4 12 9 5 20 4c0 11-7 16-15 16-1 0-1-3-1-3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 16c2-3 5-6 9-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** A <Select> with the chevron our `appearance-none` selects otherwise lack. */
function Dropdown({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <svg
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
        className="pointer-events-none absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted"
      >
        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/**
 * Server-rendered filter bar (the mockup's card). A plain GET form navigates to
 * /practitioners with query params, so the page stays a Server Component with no
 * client JS. Selects/inputs default to the active params; the current sort rides
 * along in a hidden field so filtering doesn't reset it.
 *
 * Compact single-row layout: the note + accepting toggle (+ clear) share the top
 * line, then one row of fields with Apply inline as the last column — no separate
 * action row, so the card stays short on the y-axis.
 */
export function DirectoryFilters({
  active,
  regions,
  sort,
}: {
  active: ActiveFilters;
  regions: string[];
  sort: string;
}) {
  const { specialty = "", modality = "", region = "", ageGroups = "", q = "", acceptingNew = false } = active;
  const hasActive = Boolean(specialty || modality || region || ageGroups || q || acceptingNew);

  return (
    <form
      method="get"
      action="/practitioners"
      role="search"
      aria-label="Filter practitioners"
      className="rounded-3xl border border-rule/80 bg-white p-5 shadow-[0_1px_0_rgba(31,58,95,0.02),0_18px_40px_-34px_rgba(31,58,95,0.2)]"
    >
      {/* keep the active sort when applying filters */}
      {sort && sort !== "recommended" ? <input type="hidden" name="sort" value={sort} /> : null}

      {/* Top line: the note (left) + clear/accepting (right) — fills the empty space. */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="flex items-center gap-2 text-[13px] leading-[1.4] text-ink-muted">
          <Leaf className="h-4 w-4 shrink-0 text-sage" />
          Curated profiles. No endless directory scrolling.
        </p>
        <div className="flex items-center gap-4">
          {hasActive ? (
            <Link
              href="/practitioners"
              className="text-[13px] font-medium text-ink-soft underline-offset-4 transition-colors hover:text-charcoal hover:underline"
            >
              Clear filters
            </Link>
          ) : null}
          <label className="flex cursor-pointer items-center gap-2 text-[13.5px] text-charcoal">
            <input
              type="checkbox"
              name="accepting"
              defaultChecked={acceptingNew}
              className="h-4 w-4 shrink-0 rounded-[5px] border-rule text-charcoal accent-charcoal focus:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            />
            Accepting new clients
          </label>
        </div>
      </div>

      {/* One field row; Apply is the last column, baseline-aligned with the inputs. */}
      <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto] lg:items-end">
        <Field label="Search">
          <div className="relative">
            <TextInput
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Name, specialty, or location"
              aria-label="Search practitioners by name, specialty, or location"
              className="pr-11"
            />
            <SearchIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          </div>
        </Field>

        <Field label="Specialty">
          <Dropdown>
            <Select name="specialty" defaultValue={specialty} aria-label="Filter by specialty">
              <option value="">Any specialty</option>
              {SPECIALTY_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Dropdown>
        </Field>

        <Field label="Format">
          <Dropdown>
            <Select name="modality" defaultValue={modality} aria-label="Filter by format">
              <option value="">Any format</option>
              {MODALITY_OPTIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </Select>
          </Dropdown>
        </Field>

        <Field label="Location">
          <Dropdown>
            <Select name="region" defaultValue={region} aria-label="Filter by location">
              <option value="">Any location</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </Dropdown>
        </Field>

        <Field label="Ages served">
          <Dropdown>
            <Select name="ageGroups" defaultValue={ageGroups} aria-label="Filter by age group served">
              <option value="">Any age group</option>
              {AGE_GROUP_OPTIONS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </Select>
          </Dropdown>
        </Field>

        <Button type="submit" tone="primary" className="w-full sm:col-span-2 lg:col-span-1 lg:w-auto">
          Apply
        </Button>
      </div>
    </form>
  );
}
