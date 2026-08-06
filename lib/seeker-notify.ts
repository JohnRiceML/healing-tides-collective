// Tells a person that a seeker is waiting. The site promises, in three places, that "a real
// person will read your summary" — before this, that promise depended entirely on someone
// remembering to open /admin/seekers, so a person in distress could sit in silence for a week
// with nothing anywhere showing it. Every write path that creates a seekerIntake calls this
// right after the row lands (app/get-matched/actions.ts × 2, lib/onboarding/tool-logic.ts).
//
// Contract, in priority order:
//   1. It NEVER throws. The intake is already stored; a notification problem must not turn a
//      successful submission into an error message for someone who just told us something hard.
//   2. It never goes silent. Missing config, empty allowlist, Resend outage — each is logged.
//   3. It never logs the story, the name, or the email. Only the intake id, which is a lookup
//      key into the admin surface, not a disclosure.

import { sendEmail, emailConfigured } from "@/lib/email";
import { adminEmailAllowlist } from "@/lib/auth";
import { seekerIntakeAdminEmail } from "@/lib/email-templates";
import { SITE_URL } from "@/lib/site";

export type IntakeNotice = {
  id: string;
  name: string;
  email: string;
  story: string;
  urgency?: string | null;
  region?: string | null;
};

/** Email the admins that a new intake landed. Best-effort and silent to the caller — always
 *  `await` it (an un-awaited promise is killed when the serverless function returns). */
export async function notifyAdminOfIntake(intake: IntakeNotice): Promise<void> {
  try {
    if (!emailConfigured()) {
      console.warn(`[seeker-notify] intake ${intake.id} saved, but email isn't configured — nobody was told.`);
      return;
    }
    const recipients = adminEmailAllowlist();
    if (recipients.length === 0) {
      console.warn(`[seeker-notify] intake ${intake.id} saved, but ADMIN_EMAILS is empty — nobody was told.`);
      return;
    }

    const content = seekerIntakeAdminEmail({
      name: intake.name,
      email: intake.email,
      story: intake.story,
      urgency: intake.urgency ?? null,
      region: intake.region ?? null,
      adminUrl: `${SITE_URL}/admin/seekers/${intake.id}`,
    });

    // reply-to is the seeker, so a reply from the inbox goes straight back to them.
    const results = await Promise.all(
      recipients.map((to) => sendEmail({ to, ...content, replyTo: intake.email })),
    );
    results.forEach((res, i) => {
      if (!res.ok) {
        // Positional, not the address — the log says which send failed without listing mailboxes.
        console.error(`[seeker-notify] intake ${intake.id}: notification ${i + 1}/${results.length} failed (${res.reason}).`);
      }
    });
  } catch (err) {
    // sendEmail resolves rather than throws, so landing here means something upstream broke
    // (env read, template). Log the message only — never the intake fields — and swallow it.
    console.error(
      `[seeker-notify] intake ${intake.id}: could not notify — ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
