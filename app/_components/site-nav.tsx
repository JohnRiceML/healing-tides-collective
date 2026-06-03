"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";

import { clerkAppearance } from "./clerk-appearance";

/**
 * The app-wide navigation. Audience-aware:
 *  - anyone (public): brand + Find care / Journal / About
 *  - looking for help: "Find care" → the practitioner directory
 *  - practitioners signed in: "Your profile" → the editor + account menu
 *  - signed out: "Sign in" + "List your practice"
 *
 * NOT rendered on the landing ("/") — that page is a full-screen scroll experience
 * with its own chrome, and a nav in its flow would break its pinning math.
 */

const LINKS = [
  { href: "/practitioners", label: "Find care" },
  { href: "/journal", label: "Journal" },
  { href: "/about", label: "About" },
];

export function SiteNav({ clerkEnabled }: { clerkEnabled: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Pages that carry their own bespoke chrome keep it: the landing, the Journal,
  // and the "Meet Nora" about page.
  const hidden =
    pathname === "/" ||
    pathname === "/about" ||
    pathname === "/journal" ||
    pathname.startsWith("/journal/");
  if (hidden) return null;

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-rule/70 bg-sand/90 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-[1280px] items-center gap-6 px-6 md:px-10">
        <Link
          href="/"
          className="font-display text-[18px] leading-none tracking-[-0.01em] text-charcoal transition-opacity hover:opacity-70"
          onClick={() => setOpen(false)}
        >
          Healing Tides
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-3 py-2 text-[14px] transition-colors ${
                isActive(l.href) ? "text-charcoal" : "text-ink-soft hover:text-charcoal"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth area */}
        <div className="ml-auto hidden items-center gap-3 md:flex">
          {clerkEnabled ? <NavAccount /> : null}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="site-nav-mobile"
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full text-charcoal transition-colors hover:bg-sand-deep/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15 md:hidden"
        >
          <span aria-hidden className="text-[20px] leading-none">{open ? "×" : "≡"}</span>
        </button>
      </nav>

      {/* Mobile panel */}
      {open ? (
        <div id="site-nav-mobile" className="border-t border-rule/60 bg-sand md:hidden">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-1 px-4 py-3">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-2xl px-4 py-3 text-[15px] transition-colors ${
                  isActive(l.href)
                    ? "bg-seafoam/30 text-charcoal"
                    : "text-ink-soft hover:bg-sand-deep/50 hover:text-charcoal"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {clerkEnabled ? (
              <div className="mt-1 border-t border-rule/60 pt-2">
                <NavAccount mobile onNavigate={() => setOpen(false)} />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}

/** Auth-aware right side. Only mounted when Clerk is enabled (so the hook is inside ClerkProvider). */
function NavAccount({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    // Reserve space so the bar doesn't jump as auth resolves.
    return <span aria-hidden className={mobile ? "block h-10" : "block h-8 w-8"} />;
  }

  if (isSignedIn) {
    if (mobile) {
      return (
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Link href="/practitioner" onClick={onNavigate} className="text-[15px] font-medium text-charcoal">
            Your profile
          </Link>
          <UserButton appearance={clerkAppearance} />
        </div>
      );
    }
    return (
      <>
        <Link
          href="/practitioner"
          className="rounded-full px-3 py-2 text-[14px] font-medium text-charcoal transition-colors hover:bg-sand-deep/50"
        >
          Your profile
        </Link>
        <UserButton appearance={clerkAppearance} />
      </>
    );
  }

  // Signed out
  if (mobile) {
    return (
      <div className="flex flex-col gap-2 px-1 pt-1">
        <Link href="/sign-in" onClick={onNavigate} className="rounded-2xl px-4 py-3 text-[15px] text-ink-soft hover:text-charcoal">
          Sign in
        </Link>
        <Link
          href="/join"
          onClick={onNavigate}
          className="rounded-full bg-charcoal px-5 py-3 text-center text-[15px] font-medium text-sand hover:bg-charcoal/90"
        >
          List your practice
        </Link>
      </div>
    );
  }
  return (
    <>
      <Link href="/sign-in" className="text-[14px] text-ink-soft transition-colors hover:text-charcoal">
        Sign in
      </Link>
      <Link
        href="/join"
        className="rounded-full bg-charcoal px-5 py-2.5 text-[14px] font-medium text-sand transition-colors hover:bg-charcoal/90"
      >
        List your practice
      </Link>
    </>
  );
}
