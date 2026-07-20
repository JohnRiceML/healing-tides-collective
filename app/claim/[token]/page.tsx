import type { Metadata } from "next";
import Link from "next/link";

import { Button, Container } from "@/app/_components/ui";
import { getInviteByToken, inviteIsClaimable, readPrefill } from "@/lib/invites";
import { startClaim } from "../claim-actions";

// Tokenized, per-person — never index these.
export const metadata: Metadata = {
  title: "Claim your profile — Healing Tides Collective",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" className="min-h-screen bg-sand text-charcoal">
      <Container size="default" className="py-16 md:py-24">
        <div className="mx-auto max-w-xl">{children}</div>
      </Container>
    </main>
  );
}

export default async function ClaimPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ e?: string }>;
}) {
  const { token } = await params;
  const { e } = await searchParams;
  const invite = await getInviteByToken(token);

  if (!invite) {
    return (
      <Shell>
        <p className="meta text-teal">Healing Tides Collective</p>
        <h1 className="font-display mt-3 text-2xl text-charcoal">This link isn&rsquo;t valid</h1>
        <p className="mt-3 text-[15px] leading-[1.65] text-ink-soft">
          This claim link has expired or was mistyped. If you&rsquo;re a practitioner who&rsquo;d
          like to join, you can <Link href="/join" className="underline">start here</Link> — or reach
          out to <a href="mailto:nora@healingtides.co" className="underline">nora@healingtides.co</a>.
        </p>
      </Shell>
    );
  }

  if (!inviteIsClaimable(invite)) {
    return (
      <Shell>
        <p className="meta text-teal">Healing Tides Collective</p>
        <h1 className="font-display mt-3 text-2xl text-charcoal">This profile&rsquo;s already claimed</h1>
        <p className="mt-3 text-[15px] leading-[1.65] text-ink-soft">
          Looks like this one&rsquo;s been set up. <Link href="/sign-in" className="underline">Sign in</Link> to
          manage your profile, or email <a href="mailto:nora@healingtides.co" className="underline">nora@healingtides.co</a> if
          something looks off.
        </p>
      </Shell>
    );
  }

  const prefill = readPrefill(invite.prefill);
  const name = invite.displayName?.trim() || "there";

  return (
    <Shell>
      <p className="meta text-teal">A spot is saved for you</p>
      <h1 className="font-display mt-3 text-[clamp(26px,4vw,34px)] font-light leading-[1.1] tracking-[-0.02em] text-charcoal">
        Welcome, {name}.
      </h1>
      <p className="mt-4 text-[15.5px] leading-[1.65] text-ink-soft">
        Your place in the Healing Tides Collective is ready to claim. Create your account and
        we&rsquo;ll start your profile{prefill.region ? ` for ${prefill.region}` : ""} — pre-filled,
        so there&rsquo;s very little to type.
      </p>

      {e === "email_mismatch" ? (
        <p className="mt-5 rounded-xl border border-ocean/25 bg-ocean/5 px-4 py-3 text-[14px] leading-[1.55] text-charcoal">
          This invitation was sent to a specific email address. Please sign in with the email it
          was sent to, or email{" "}
          <a href="mailto:nora@healingtides.co" className="font-medium text-ocean underline-offset-2 hover:underline">nora@healingtides.co</a>{" "}
          and we&rsquo;ll update it.
        </p>
      ) : null}

      {(prefill.region || prefill.title) ? (
        <dl className="mt-6 rounded-2xl border border-rule/70 bg-white p-5 text-[14px]">
          {prefill.title ? (
            <div className="flex justify-between gap-4 py-1">
              <dt className="text-ink-muted">Title</dt>
              <dd className="text-charcoal">{prefill.title}</dd>
            </div>
          ) : null}
          {prefill.region ? (
            <div className="flex justify-between gap-4 py-1">
              <dt className="text-ink-muted">Location</dt>
              <dd className="text-charcoal">{prefill.region}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      <form action={startClaim} className="mt-7">
        <input type="hidden" name="token" value={token} />
        <Button type="submit">Claim my profile</Button>
      </form>
      <p className="mt-4 text-[13px] leading-[1.6] text-ink-muted">
        Already have an account? <Link href="/sign-in" className="underline">Sign in</Link>, then open this
        link again.
      </p>
    </Shell>
  );
}
