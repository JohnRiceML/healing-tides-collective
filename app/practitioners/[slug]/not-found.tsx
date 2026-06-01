import type { Metadata } from "next";
import Link from "next/link";

import { Container, LinkButton } from "@/app/_components/ui";

export const metadata: Metadata = {
  title: "Practitioner not found — Healing Tides Collective",
  description: "This practitioner profile isn't here.",
};

export default function PractitionerNotFound() {
  return (
    <main id="main-content" className="min-h-screen bg-sand text-charcoal">
      <Container size="narrow" className="py-24 md:py-32">
        <p className="meta text-ink-muted">Not found</p>
        <h1 className="font-display mt-4 text-[clamp(32px,5vw,48px)] leading-[1.05] tracking-[-0.02em] text-charcoal">
          This profile isn&rsquo;t here.
        </h1>
        <p className="mt-5 max-w-md text-[17px] leading-[1.7] text-ink-soft">
          The practitioner you were looking for may have moved on, or the link
          might be mistyped. Nothing to worry about — the full collective is a
          step away.
        </p>
        <div className="mt-10">
          <LinkButton href="/practitioners" tone="primary">
            browse practitioners
          </LinkButton>
        </div>
        <p className="mt-8 text-[14px] text-ink-muted">
          Or head{" "}
          <Link href="/" className="link-underline font-medium text-charcoal">
            home
          </Link>
          .
        </p>
      </Container>
    </main>
  );
}
