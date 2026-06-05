"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name A–Z" },
];

/**
 * The directory sort control. Navigates on change, preserving the active filters —
 * "recommended" (the default) is kept OUT of the URL so a plain /practitioners stays
 * canonical. Tiny island of client JS; the rest of the page is server-rendered.
 */
export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = new URLSearchParams(params.toString());
    const v = e.target.value;
    if (v && v !== "recommended") next.set("sort", v);
    else next.delete("sort");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <label className="inline-flex items-center gap-2 text-[13px] text-ink-muted">
      <span className="shrink-0">Sort</span>
      <span className="relative">
        <select
          value={value}
          onChange={onChange}
          aria-label="Sort practitioners"
          className="appearance-none rounded-full border border-rule bg-white py-1.5 pl-4 pr-9 text-[13px] font-medium text-charcoal transition-colors hover:border-charcoal/30 focus:border-charcoal focus:outline-none focus:ring-2 focus:ring-charcoal/10"
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
          className="pointer-events-none absolute right-3.5 top-1/2 h-3 w-3 -translate-y-1/2 text-ink-muted"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </label>
  );
}
