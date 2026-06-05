"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Container } from "@/app/_components/ui";

/**
 * The app-wide footer. Calm + on-brand per docs/design/STYLE-GUIDE.md — sand ground,
 * hairline rules, font-display brand, "practitioner" not "provider", no hype.
 *
 * NOT rendered on pages that carry their own bespoke chrome: the landing ("/"), the
 * Journal, and the "Meet Nora" about page (same exclusions as SiteNav).
 */

const linkClass =
  "text-[15px] text-ink-soft transition-colors hover:text-charcoal rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15";

const EXPLORE = [
  { href: "/practitioners", label: "Find care" },
  { href: "/journal", label: "Journal" },
  { href: "/about", label: "About" },
];

const PRACTITIONERS = [
  { href: "/for-practitioners", label: "List your practice" },
  { href: "/sign-in", label: "Sign in" },
];

export function SiteFooter() {
  const pathname = usePathname();
  if (
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/journal" ||
    pathname.startsWith("/journal/")
  ) {
    return null;
  }

  return (
    <footer className="border-t border-rule/70 bg-sand">
      <Container size="wide" className="py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr] md:gap-16">
          {/* Brand */}
          <div className="max-w-xs">
            <Link
              href="/"
              className="font-display text-[20px] leading-none tracking-[-0.01em] text-charcoal transition-opacity hover:opacity-70"
            >
              Healing Tides
            </Link>
            <p className="mt-4 text-[14px] leading-[1.65] text-ink-soft">
              A modern front door to wellness — care matched thoughtfully, by a person, not an
              algorithm.
            </p>
          </div>

          {/* Explore */}
          <nav aria-label="Explore">
            <p className="meta text-ink-muted">Explore</p>
            <ul className="mt-4 space-y-2.5">
              {EXPLORE.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* For practitioners */}
          <nav aria-label="For practitioners">
            <p className="meta text-ink-muted">For practitioners</p>
            <ul className="mt-4 space-y-2.5">
              {PRACTITIONERS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="mailto:hello@healingtides.co" className={linkClass}>
                  hello@healingtides.co
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-rule/60 pt-6">
          <p className="meta text-ink-muted">© 2026 Healing Tides Collective</p>
          <p className="meta text-ink-muted">Care, matched. By a person.</p>
        </div>
      </Container>
    </footer>
  );
}
