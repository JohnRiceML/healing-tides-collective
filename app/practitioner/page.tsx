import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Card, Container, LinkButton } from "@/app/_components/ui";
import { getOrCreatePractitioner } from "@/lib/auth";
import { clerkEnabled } from "@/lib/clerk-enabled";
import { holdMessage, isOnHold } from "@/app/_lib/moderation";
import { badgesFor, grantedBadgesFrom } from "@/app/_lib/verification";
import { missingFieldsByImpact } from "@/lib/completeness";
import { VerificationBadges } from "@/app/_components/VerificationBadges";

export const metadata: Metadata = {
  title: "Your profile — Healing Tides Collective",
};

// Auth-gated + reads the DB per request.
export const dynamic = "force-dynamic";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" className="min-h-screen bg-sand text-charcoal">
      <Container size="default" className="py-14 md:py-20">
        {children}
      </Container>
    </main>
  );
}

type Status = "held" | "live" | "draft";
const STATUS_META: Record<Status, { label: string; dot: string; pill: string }> = {
  live: { label: "Live", dot: "bg-teal", pill: "bg-teal/15 text-teal" },
  held: { label: "On hold", dot: "bg-ocean", pill: "bg-ocean/10 text-ocean" },
  draft: { label: "Draft", dot: "bg-rule-strong/40", pill: "bg-charcoal/5 text-ink-muted" },
};

function StatusPill({ status }: { status: Status }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium ${m.pill}`}>
      <span aria-hidden className={`h-2 w-2 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

export default async function PractitionerHome() {
  if (!clerkEnabled) {
    return (
      <Shell>
        <p className="text-ink-soft">
          Auth isn&rsquo;t configured yet. Add Clerk keys to{" "}
          <code className="rounded bg-charcoal/5 px-1">.env.local</code>.
        </p>
      </Shell>
    );
  }

  const result = await getOrCreatePractitioner();
  if (!result) {
    return (
      <Shell>
        <p className="text-ink-soft">
          You&rsquo;re not signed in.{" "}
          <Link href="/join" className="underline">
            Join or sign in
          </Link>
          .
        </p>
      </Shell>
    );
  }

  const p = result.practitioner;
  // First-time practitioners go straight into the wizard rather than an empty dashboard.
  if (p.completeness === 0 && !p.displayName) redirect("/practitioner/edit");

  const held = isOnHold(p);
  const status: Status = held ? "held" : p.visibility === "PUBLISHED" ? "live" : "draft";
  const firstName = (p.displayName ?? "").trim().split(/\s+/)[0] || "there";
  const memberSince = new Date(p.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const completeness = p.completeness;
  const missing = missingFieldsByImpact(p as unknown as Record<string, unknown>);
  const badges = badgesFor({ createdAt: p.createdAt, verificationBadges: grantedBadgesFrom(p.fieldValues) });
  const editCta = completeness >= 100 ? "Edit your profile" : "Finish your profile";

  return (
    <Shell>
      {/* Greeting + status */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="meta text-ink-muted">Your profile</p>
          <h1 className="font-display mt-3 text-[clamp(28px,5vw,40px)] font-light leading-[1.05] tracking-[-0.02em] text-charcoal">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 text-[14px] text-ink-soft">Member since {memberSince}</p>
        </div>
        <StatusPill status={status} />
      </header>

      {/* On-hold banner */}
      {held ? (
        <div className="mt-7 rounded-3xl border border-ocean/15 bg-ocean/[0.04] p-6">
          <p className="font-display text-[18px] leading-tight text-charcoal">Your profile is on hold</p>
          <p className="mt-2 text-[15px] leading-[1.6] text-ink-soft">{holdMessage(p.fieldValues)}</p>
          <p className="mt-2 text-[14px] leading-[1.6] text-ink-muted">
            It isn&rsquo;t public right now and publishing is paused — but nothing is lost, and you can
            still edit it. Questions? Email{" "}
            <a href="mailto:hello@healingtides.co" className="link-underline font-medium text-charcoal">
              hello@healingtides.co
            </a>
            .
          </p>
        </div>
      ) : null}

      {/* Cards */}
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        {/* Match strength */}
        <Card>
          <p className="meta text-ink-muted">Match strength</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-[34px] leading-none text-charcoal">{completeness}%</span>
            <span className="text-[14px] text-ink-muted">complete</span>
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-rule/60">
            <div
              className="h-full rounded-full bg-teal transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ width: `${completeness}%` }}
            />
          </div>
          <p className="mt-4 text-[14px] leading-[1.6] text-ink-soft">
            {completeness >= 80
              ? "Strong — people searching for someone like you see a full picture."
              : missing.length > 0
                ? `The more complete your profile, the better we match you. Add ${missing.slice(0, 2).join(" and ")} next.`
                : "Keep going — a fuller profile gets matched to more of the right people."}
          </p>
          <LinkButton href="/practitioner/edit" tone="secondary" className="mt-5">
            {editCta} →
          </LinkButton>
        </Card>

        {/* Profile views */}
        <Card>
          <p className="meta text-ink-muted">Profile views</p>
          <div className="mt-3 font-display text-[34px] leading-none text-charcoal">{p.viewCount}</div>
          <p className="mt-4 text-[14px] leading-[1.6] text-ink-soft">
            {p.viewCount === 0
              ? status === "live"
                ? "No views yet — they’ll show up here as people find you."
                : "Publish your profile to start being found."
              : `${p.viewCount === 1 ? "person has" : "people have"} viewed your profile so far.`}
          </p>
        </Card>

        {/* Public page (live) or draft nudge */}
        {status === "live" && p.slug ? (
          <Card>
            <p className="meta text-ink-muted">Your public page</p>
            <p className="mt-3 text-[15px] leading-[1.6] text-ink-soft">
              You&rsquo;re live and findable in the collective.
            </p>
            <LinkButton
              href={`/practitioners/${p.slug}`}
              target="_blank"
              rel="noreferrer"
              tone="secondary"
              className="mt-4"
            >
              View your public page →
            </LinkButton>
          </Card>
        ) : !held ? (
          <Card>
            <p className="meta text-ink-muted">Not published yet</p>
            <p className="mt-3 text-[15px] leading-[1.6] text-ink-soft">
              Your profile is a draft, visible only to you. Review and publish when you&rsquo;re ready.
            </p>
            <LinkButton href="/practitioner/edit" tone="secondary" className="mt-4">
              Review &amp; publish →
            </LinkButton>
          </Card>
        ) : null}

        {/* Badges */}
        {badges.length > 0 ? (
          <Card>
            <p className="meta text-ink-muted">Your standing</p>
            <div className="mt-4">
              <VerificationBadges
                practitioner={{ createdAt: p.createdAt, verificationBadges: grantedBadgesFrom(p.fieldValues) }}
              />
            </div>
            <p className="mt-4 text-[13px] leading-[1.55] text-ink-muted">
              Verified trust badges are granted by the Healing Tides team.
            </p>
          </Card>
        ) : null}
      </div>

      {/* Primary action */}
      <div className="mt-8">
        <LinkButton href="/practitioner/edit" tone="primary">
          {editCta} →
        </LinkButton>
      </div>
    </Shell>
  );
}
