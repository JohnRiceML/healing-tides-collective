import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container, LinkButton } from "@/app/_components/ui";
import { getCurrentDbUser } from "@/lib/auth";
import { getSavedForUser } from "@/lib/saved";

import { SaveSync } from "./SaveSync";
import { SavedList } from "./SavedList";

export const metadata: Metadata = {
  title: "Your saved practitioners — Healing Tides Collective",
};

export const dynamic = "force-dynamic";

/** One quiet link in the "resources" rail. */
function ResourceLink({ href, title, body, external }: { href: string; title: string; body: string; external?: boolean }) {
  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="block rounded-2xl border border-rule/70 bg-white px-5 py-4 transition hover:border-teal/40 hover:shadow-sm"
    >
      <p className="text-[15px] font-medium text-charcoal">{title}</p>
      <p className="mt-1 text-[13.5px] leading-[1.5] text-ink-soft">{body}</p>
    </Link>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");

  const saved = await getSavedForUser(user.id);

  return (
    <main id="main-content" className="min-h-screen bg-sand text-charcoal">
      <Container size="wide" className="py-12 md:py-16">
        {/* Merges the anonymous basket into the account + sends the welcome email, once. */}
        <SaveSync />

        <header className="max-w-2xl">
          <p className="meta text-teal">Your space</p>
          <h1 className="font-display mt-3 text-[clamp(26px,3.6vw,38px)] font-light leading-[1.08] tracking-[-0.02em] text-charcoal">
            Your saved practitioners
          </h1>
          <p className="mt-3 text-[15px] leading-[1.6] text-ink-soft">
            A calm place to hold the people who feel like a good fit. Open anyone&rsquo;s profile to reach out
            directly — there&rsquo;s no rush, and nothing here is shared with anyone.
          </p>
        </header>

        {/* ── Saved list ── */}
        <section className="mt-10">
          {saved.length > 0 ? (
            <SavedList initial={saved} />
          ) : (
            <div className="rounded-3xl border border-dashed border-rule bg-white/60 px-6 py-12 text-center">
              <p className="text-[16px] text-charcoal">You haven&rsquo;t saved anyone yet.</p>
              <p className="mx-auto mt-2 max-w-md text-[14px] leading-[1.6] text-ink-soft">
                As you explore, tap <span className="font-medium">Save</span> on anyone who feels right — they&rsquo;ll
                gather here so you can come back to them whenever you&rsquo;re ready.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <LinkButton href="/get-matched">Find practitioners</LinkButton>
                <Link
                  href="/practitioners"
                  className="inline-flex items-center rounded-full px-4 py-2 text-[14px] text-teal ring-1 ring-rule transition hover:ring-teal/40"
                >
                  Browse the directory
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* ── Resources ── */}
        <section className="mt-14 max-w-2xl">
          <h2 className="meta text-ink-muted">Helpful next steps</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ResourceLink
              href="/get-matched"
              title="Keep exploring"
              body="Talk it through with our guide and add a few more people who fit."
            />
            <ResourceLink
              href="/practitioners"
              title="Browse the directory"
              body="See everyone in our Minnesota network and filter by what matters."
            />
            <ResourceLink
              href="/crisis"
              title="In crisis? Get support now"
              body="If you need someone right now, call or text 988 — free, confidential, 24/7."
            />
            <ResourceLink
              href="/about"
              title="How Healing Tides works"
              body="What we are, how matching works, and what to expect when you reach out."
            />
          </div>
        </section>
      </Container>
    </main>
  );
}
