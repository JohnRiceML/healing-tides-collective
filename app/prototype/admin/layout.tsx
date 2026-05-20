import Link from "next/link";
import { Container } from "@/app/prototype/_components/ui";

const tabs = [
  { href: "/prototype/admin", label: "Dashboard" },
  { href: "/prototype/admin/practitioners", label: "Practitioners" },
  { href: "/prototype/admin/match", label: "Matching workspace" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="border-b border-rule/70 bg-sand">
        <Container size="wide">
          <nav className="flex flex-wrap items-center gap-x-7 gap-y-2 py-4">
            <span className="meta text-ink-muted">Nora&apos;s desk</span>
            <span aria-hidden className="text-ink-muted/40">·</span>
            {tabs.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="meta text-ink-soft transition-colors hover:text-charcoal"
              >
                {t.label}
              </Link>
            ))}
          </nav>
        </Container>
      </div>
      {children}
    </>
  );
}
