import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Phase 2 Prototype — Healing Tides Collective",
  description:
    "Clickable prototype for the Phase 2 product: seeker intake, practitioner application, Nora's admin dashboard, and provider portal.",
  robots: { index: false, follow: false },
};

export default function PrototypeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-sand text-charcoal">
      <header className="border-b border-rule/70 bg-sand/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-5 md:px-10">
          <Link
            href="/prototype"
            className="font-display text-[19px] leading-none tracking-tight text-charcoal"
          >
            Healing Tides
            <span className="ml-2 align-middle text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              Prototype
            </span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            <Link href="/prototype/seeker" className="meta text-ink-soft hover:text-charcoal">
              Seeker
            </Link>
            <Link
              href="/prototype/practitioner/apply"
              className="meta text-ink-soft hover:text-charcoal"
            >
              Practitioner
            </Link>
            <Link href="/prototype/admin" className="meta text-ink-soft hover:text-charcoal">
              Admin
            </Link>
            <Link href="/prototype/provider" className="meta text-ink-soft hover:text-charcoal">
              Portal
            </Link>
            <Link href="/prototype/scope" className="meta text-ink-soft hover:text-charcoal">
              Scope
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
