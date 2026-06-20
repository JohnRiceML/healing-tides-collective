// Live Resend integration check — sends a REAL email, so it's double-gated: it needs
// RESEND_API_KEY (the wiring) AND TEST_EMAIL_TO (an explicit recipient), so a normal
// integration run never sends. Run it deliberately:
//
//   TEST_EMAIL_TO=you@example.com node --env-file=.env.local \
//     ./node_modules/.bin/vitest run --config vitest.integration.config.ts \
//     tests/integration/email.live.test.ts
//
// If EMAIL_FROM isn't set, it auto-discovers a verified domain from your Resend account
// (the API key is read from env, never logged). Skips (green) when either gate is unset.

import { describe, it, expect } from "vitest";

import { sendEmail, emailConfigured } from "@/lib/email";
import { claimInviteEmail } from "@/lib/email-templates";

const to = process.env.TEST_EMAIL_TO;
const hasKey = Boolean(process.env.RESEND_API_KEY);

/** Use EMAIL_FROM if set; otherwise find a verified domain in the Resend account. */
async function resolveFrom(): Promise<string> {
  if (process.env.EMAIL_FROM) return process.env.EMAIL_FROM;
  const res = await fetch("https://api.resend.com/domains", {
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
  });
  const data = (await res.json()) as { data?: Array<{ name: string; status: string }> };
  const verified = (data.data ?? []).find((d) => d.status === "verified");
  if (!verified) throw new Error("No verified Resend domain — set EMAIL_FROM or verify a domain");
  return `Healing Tides Collective <hello@${verified.name}>`;
}

describe.skipIf(!hasKey || !to)("Resend live integration", () => {
  it(
    "hands a real claim-invite email off to Resend and gets an id back",
    async () => {
      process.env.EMAIL_FROM = await resolveFrom();
      expect(emailConfigured()).toBe(true);

      const content = claimInviteEmail({
        name: "John",
        url: "https://www.healingtides.co/claim/TEST-placeholder-not-a-real-invite",
      });
      const result = await sendEmail({ to: to!, ...content });

      // eslint-disable-next-line no-console
      console.log(`\n[email] from=${process.env.EMAIL_FROM} → ${to}: ${JSON.stringify(result)}\n`);

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.id.length).toBeGreaterThan(0);
    },
    20_000,
  );
});
