import Link from "next/link";
import { Container } from "@/app/prototype/_components/ui";

const tabs = [
  { href: "/prototype/provider/dashboard", label: "Profile" },
  { href: "/prototype/provider/dashboard/availability", label: "Availability" },
  { href: "/prototype/provider/dashboard/referrals", label: "Referral history" },
];

export default function ProviderDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="border-b border-rule/70 bg-sand">
        <Container size="wide">
          <div className="flex flex-wrap items-center justify-between gap-x-7 gap-y-3 py-4">
            <nav className="flex flex-wrap items-center gap-x-7 gap-y-2">
              <span className="meta text-ink-muted">Your practice</span>
              <span aria-hidden className="text-ink-muted/40">
                ·
              </span>
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
            <div className="flex items-center gap-4">
              <span className="meta text-ink-muted">
                Signed in as Dr. Elena Vasquez
              </span>
              <Link
                href="/prototype/provider"
                className="meta text-ink-soft hover:text-charcoal"
              >
                Sign out
              </Link>
            </div>
          </div>
        </Container>
      </div>
      {children}
    </>
  );
}
