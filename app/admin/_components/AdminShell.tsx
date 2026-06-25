import type { ReactNode } from "react";

import { Container } from "@/app/_components/ui";
import { AdminNav } from "./AdminNav";

/** The admin chrome — page background, eyebrow, tab nav, and the page title. Rendered by each
 *  admin page AFTER its requireAdmin() gate, so the shell never appears for a non-admin. */
export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main id="main-content" className="min-h-screen bg-sand text-charcoal">
      <Container size="wide" className="py-14 md:py-20">
        <p className="meta text-ink-muted">Admin</p>
        <AdminNav />
        <h1 className="font-display mt-6 text-[clamp(28px,5vw,44px)] font-light tracking-[-0.02em]">{title}</h1>
        {children}
      </Container>
    </main>
  );
}
