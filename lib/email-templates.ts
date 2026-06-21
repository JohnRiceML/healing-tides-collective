// Pure builders for transactional emails — no network, no env, fully unit-testable.
// Voice follows docs/design/STYLE-GUIDE.md: calm, warm, trauma-informed. No urgency, no
// countdowns, no marketing pressure. Every email is plain, human, and easy to ignore —
// "nothing happens until you choose to." User-supplied text is HTML-escaped in the markup.

export type EmailContent = { subject: string; html: string; text: string };

/** Escape the five HTML-significant characters so a name can't inject markup. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * The "claim your profile" invite sent to a waitlist practitioner. `name` is optional
 * (warm generic fallback), `url` is the tokenized claim link. The copy never pressures —
 * it's an open door, not a deadline.
 */
export function claimInviteEmail(input: {
  name?: string | null;
  url: string;
  fromName?: string;
}): EmailContent {
  const first = (input.name ?? "").trim();
  const nameText = first || "there";
  const nameHtml = first ? escapeHtml(first) : "there";
  const from = (input.fromName ?? "").trim() || "Healing Tides Collective";
  const fromHtml = escapeHtml(from);
  const url = input.url;
  const urlHtml = escapeHtml(url);

  const subject = "Your place on Healing Tides is ready when you are";

  const text = [
    `Hi ${nameText},`,
    ``,
    `We've saved you a spot on Healing Tides — a calm, trauma-informed directory that ` +
      `helps the right people find practitioners like you.`,
    ``,
    `Your profile is started and waiting. When you're ready, you can claim it, add your ` +
      `own words, and decide exactly what to share:`,
    ``,
    url,
    ``,
    `There's no rush, and nothing is published until you choose to. If this isn't for ` +
      `you, you can simply ignore this note.`,
    ``,
    `Warmly,`,
    from,
  ].join("\n");

  const html = [
    `<div style="background:#f7f5f2;padding:32px 16px;font-family:Georgia,'Times New Roman',serif">`,
    `<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px 28px;color:#2f2f2f;line-height:1.6">`,
    `<p style="margin:0 0 16px;font-size:16px">Hi ${nameHtml},</p>`,
    `<p style="margin:0 0 16px;font-size:16px">We've saved you a spot on Healing Tides — a calm, trauma-informed directory that helps the right people find practitioners like you.</p>`,
    `<p style="margin:0 0 24px;font-size:16px">Your profile is started and waiting. When you're ready, you can claim it, add your own words, and decide exactly what to share.</p>`,
    `<p style="margin:0 0 24px"><a href="${urlHtml}" style="display:inline-block;background:#5f8f8b;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:15px">Claim your profile</a></p>`,
    `<p style="margin:0 0 24px;font-size:13px;color:#6b6b6b">Or paste this link into your browser:<br><span style="word-break:break-all">${urlHtml}</span></p>`,
    `<p style="margin:0 0 16px;font-size:14px;color:#6b6b6b">There's no rush, and nothing is published until you choose to. If this isn't for you, you can simply ignore this note.</p>`,
    `<p style="margin:24px 0 0;font-size:16px">Warmly,<br>${fromHtml}</p>`,
    `</div></div>`,
  ].join("");

  return { subject, html, text };
}

/**
 * The gentle "your profile is X% — finish when you're ready" nudge. Calm, no pressure: a lovely
 * start, no rush, nothing published until they choose to. `editUrl` is where they go to finish.
 */
export function completenessReminderEmail(input: {
  name?: string | null;
  completeness: number;
  editUrl: string;
}): EmailContent {
  const first = (input.name ?? "").trim();
  const nameText = first || "there";
  const nameHtml = first ? escapeHtml(first) : "there";
  const pct = Math.max(0, Math.min(100, Math.round(input.completeness)));
  const url = input.editUrl;
  const urlHtml = escapeHtml(url);

  const subject = "Your Healing Tides profile, whenever you're ready";

  const text = [
    `Hi ${nameText},`,
    ``,
    `Your profile is about ${pct}% filled in — a lovely start. Whenever you have a few quiet ` +
      `minutes, you can finish it and let the people looking for someone like you find you:`,
    ``,
    url,
    ``,
    `There's no rush, and nothing is published until you choose to. If now isn't the time, just ` +
      `set this aside.`,
    ``,
    `Warmly,`,
    `Healing Tides Collective`,
  ].join("\n");

  const html = [
    `<div style="background:#f7f5f2;padding:32px 16px;font-family:Georgia,'Times New Roman',serif">`,
    `<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px 28px;color:#2f2f2f;line-height:1.6">`,
    `<p style="margin:0 0 16px;font-size:16px">Hi ${nameHtml},</p>`,
    `<p style="margin:0 0 16px;font-size:16px">Your profile is about <strong>${pct}%</strong> filled in — a lovely start. Whenever you have a few quiet minutes, you can finish it and let the people looking for someone like you find you.</p>`,
    `<p style="margin:0 0 24px"><a href="${urlHtml}" style="display:inline-block;background:#5f8f8b;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:15px">Finish my profile</a></p>`,
    `<p style="margin:0 0 16px;font-size:14px;color:#6b6b6b">There's no rush, and nothing is published until you choose to. If now isn't the time, just set this aside.</p>`,
    `<p style="margin:24px 0 0;font-size:16px">Warmly,<br>Healing Tides Collective</p>`,
    `</div></div>`,
  ].join("");

  return { subject, html, text };
}
