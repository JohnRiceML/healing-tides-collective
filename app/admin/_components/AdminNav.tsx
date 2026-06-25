"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/practitioners", label: "Practitioners" },
  { href: "/admin/seekers", label: "Seekers" },
  { href: "/admin/feedback", label: "Feedback" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="mt-5 flex flex-wrap gap-1.5" aria-label="Admin sections">
      {TABS.map((t) => {
        const active = path === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 text-[14px] transition-colors ${
              active ? "bg-charcoal text-white" : "border border-rule text-ink-soft hover:bg-sand/60"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
