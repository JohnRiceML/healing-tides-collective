// Pure builders for transactional emails — no network, no env, fully unit-testable.
// Voice follows docs/design/STYLE-GUIDE.md: calm, warm, trauma-informed. No urgency, no
// countdowns, no marketing pressure. Every email is plain, human, and easy to ignore —
// "nothing happens until you choose to." User-supplied text is HTML-escaped in the markup.

import { URGENCY } from "@/lib/seeker-intake";

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
  email?: string | null;
  importUrl?: string | null;
  fromName?: string;
}): EmailContent {
  const first = (input.name ?? "").trim();
  const nameText = first || "there";
  const nameHtml = first ? escapeHtml(first) : "there";
  const from = (input.fromName ?? "").trim() || "Healing Tides Collective";
  const fromHtml = escapeHtml(from);
  const url = input.url;
  const urlHtml = escapeHtml(url);
  const emailAddr = (input.email ?? "").trim();
  const emailText = emailAddr ? `this email (${emailAddr})` : "the email this was sent to";
  const emailHtml = emailAddr ? `this email (<strong>${escapeHtml(emailAddr)}</strong>)` : "the email this was sent to";
  const hasImport = Boolean((input.importUrl ?? "").trim());

  const subject = "Your place on Healing Tides is ready when you are";

  const importLineText = hasImport
    ? `Already listed on Psychology Today? Once you're in, you can bring your details across ` +
      `in one tap — we've saved your link, so there's nothing to copy.`
    : "";

  const text = [
    `Hi ${nameText},`,
    ``,
    `We've saved you a spot on Healing Tides — a calm, trauma-informed directory that ` +
      `helps the right people find practitioners like you.`,
    ``,
    `How to claim your profile:`,
    `1. Open your private link: ${url}`,
    `2. Sign up (or sign in) with ${emailText} — that's how we know the spot is yours.`,
    `3. On your dashboard, choose "Finish claiming." Your profile is already started and waiting.`,
    ...(importLineText ? [``, importLineText] : []),
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
    `<p style="margin:0 0 8px;font-size:16px">How to claim your profile:</p>`,
    `<ol style="margin:0 0 24px;padding-left:20px;font-size:15px;color:#2f2f2f">`,
    `<li style="margin:0 0 8px">Open your private link (the button below).</li>`,
    `<li style="margin:0 0 8px">Sign up — or sign in — with ${emailHtml}. That's how we know the spot is yours.</li>`,
    `<li style="margin:0 0 8px">On your dashboard, choose &ldquo;Finish claiming.&rdquo; Your profile is already started and waiting.</li>`,
    `</ol>`,
    `<p style="margin:0 0 24px"><a href="${urlHtml}" style="display:inline-block;background:#5f8f8b;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:15px">Claim your profile</a></p>`,
    `<p style="margin:0 0 24px;font-size:13px;color:#6b6b6b">Or paste this link into your browser:<br><span style="word-break:break-all">${urlHtml}</span></p>`,
    ...(hasImport
      ? [`<p style="margin:0 0 24px;font-size:14px;color:#6b6b6b">Already listed on Psychology Today? Once you're in, you can bring your details across in one tap — we've saved your link, so there's nothing to copy.</p>`]
      : []),
    `<p style="margin:0 0 16px;font-size:14px;color:#6b6b6b">There's no rush, and nothing is published until you choose to. If this isn't for you, you can simply ignore this note.</p>`,
    `<p style="margin:24px 0 0;font-size:16px">Warmly,<br>${fromHtml}</p>`,
    `</div></div>`,
  ].join("");

  return { subject, html, text };
}

/**
 * The warm welcome a seeker gets after creating an account. No urgency, no marketing — just
 * "your space is here, the saved list is safe, reach out when you're ready." `dashboardUrl`
 * is their saved-list page; `savedCount` lets us acknowledge what they carried over (optional).
 */
export function seekerWelcomeEmail(input: {
  name?: string | null;
  dashboardUrl: string;
  savedCount?: number;
}): EmailContent {
  const first = (input.name ?? "").trim();
  const nameText = first || "there";
  const nameHtml = first ? escapeHtml(first) : "there";
  const url = input.dashboardUrl;
  const urlHtml = escapeHtml(url);
  const n = Math.max(0, input.savedCount ?? 0);
  const savedText =
    n > 0
      ? `The ${n === 1 ? "practitioner" : `${n} practitioners`} you saved ${n === 1 ? "is" : "are"} waiting on your list — nothing's lost.`
      : "";

  const subject = "Your space on Healing Tides is ready";

  const text = [
    `Hi ${nameText},`,
    ``,
    `Welcome — your account is set up, and your saved practitioners now live in one calm place ` +
      `you can come back to anytime.`,
    ...(savedText ? [``, savedText] : []),
    ``,
    `Whenever you're ready, you can open a practitioner's profile to reach out directly, or ` +
      `keep adding people who feel like a good fit. There's no rush and no obligation — this is ` +
      `your space, at your pace.`,
    ``,
    `Your saved list: ${url}`,
    ``,
    `If you're ever in crisis, please call or text 988 (the Suicide & Crisis Lifeline, free and ` +
      `confidential, 24/7), or call 911 if you're in immediate danger.`,
    ``,
    `Warmly,`,
    `Healing Tides Collective`,
  ].join("\n");

  const html = [
    `<div style="background:#f7f5f2;padding:32px 16px;font-family:Georgia,'Times New Roman',serif">`,
    `<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px 28px;color:#2f2f2f;line-height:1.6">`,
    `<p style="margin:0 0 16px;font-size:16px">Hi ${nameHtml},</p>`,
    `<p style="margin:0 0 16px;font-size:16px">Welcome — your account is set up, and your saved practitioners now live in one calm place you can come back to anytime.</p>`,
    ...(savedText ? [`<p style="margin:0 0 16px;font-size:16px">${escapeHtml(savedText)}</p>`] : []),
    `<p style="margin:0 0 24px;font-size:16px">Whenever you're ready, you can open a practitioner's profile to reach out directly, or keep adding people who feel like a good fit. There's no rush and no obligation — this is your space, at your pace.</p>`,
    `<p style="margin:0 0 24px"><a href="${urlHtml}" style="display:inline-block;background:#5f8f8b;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:15px">Open your saved list</a></p>`,
    `<p style="margin:0 0 16px;font-size:13px;color:#6b6b6b">If you're ever in crisis, please call or text <strong>988</strong> (the Suicide &amp; Crisis Lifeline — free, confidential, 24/7), or call <strong>911</strong> if you're in immediate danger.</p>`,
    `<p style="margin:24px 0 0;font-size:16px">Warmly,<br>Healing Tides Collective</p>`,
    `</div></div>`,
  ].join("");

  return { subject, html, text };
}

/** How much of a seeker's story travels in the notification. Enough to gauge urgency, no more. */
const STORY_PREVIEW_MAX = 180;

/** The first non-empty line of the story, capped. Deliberately NOT the whole disclosure — a
 *  seeker's intake can hold the hardest thing they've told anyone, and an inbox is a far weaker
 *  container than the admin surface (signed-in, on request). The rest stays behind that gate. */
function storyOpening(story: string): string {
  const first = story.split(/\r?\n/).map((l) => l.trim()).find(Boolean) ?? "";
  return first.length > STORY_PREVIEW_MAX ? first.slice(0, STORY_PREVIEW_MAX).trimEnd() + "…" : first;
}

/**
 * The heads-up Nora gets the moment a seeker intake lands. Internal, not seeker-facing: it exists
 * so "a real person will read your summary" doesn't depend on remembering to open /admin/seekers.
 * Carries only triage signal — name, timing, region, the opening line — plus a direct link.
 */
export function seekerIntakeAdminEmail(input: {
  name: string;
  email: string;
  story: string;
  urgency?: string | null;
  region?: string | null;
  adminUrl: string;
}): EmailContent {
  const name = input.name.trim() || "Someone";
  const timing = URGENCY.find((u) => u.value === input.urgency)?.label ?? null;
  const region = (input.region ?? "").trim() || null;
  const opening = storyOpening(input.story);
  const url = input.adminUrl;

  const subject = `New seeker intake — ${name}${timing ? ` (${timing.toLowerCase()})` : ""}`;

  const facts: [string, string][] = [
    ["Name", name],
    ["Email", input.email],
    ...(timing ? ([["Timing", timing]] as [string, string][]) : []),
    ...(region ? ([["Region", region]] as [string, string][]) : []),
  ];

  const text = [
    `Someone just finished an intake on Healing Tides.`,
    ``,
    ...facts.map(([k, v]) => `${k}: ${v}`),
    ``,
    `How they opened:`,
    opening,
    ``,
    `Read the whole intake and start a shortlist:`,
    url,
    ``,
    `Only their opening line is here — the rest of what they shared stays on the site.`,
  ].join("\n");

  const html = [
    `<div style="background:#f7f5f2;padding:32px 16px;font-family:Georgia,'Times New Roman',serif">`,
    `<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px 28px;color:#2f2f2f;line-height:1.6">`,
    `<p style="margin:0 0 16px;font-size:16px">Someone just finished an intake on Healing Tides.</p>`,
    `<p style="margin:0 0 16px;font-size:15px">`,
    facts.map(([k, v]) => `${k}: <strong>${escapeHtml(v)}</strong>`).join("<br>"),
    `</p>`,
    `<p style="margin:0 0 8px;font-size:14px;color:#6b6b6b">How they opened:</p>`,
    `<p style="margin:0 0 24px;font-size:16px;border-left:3px solid #d9d3ca;padding-left:14px">${escapeHtml(opening)}</p>`,
    `<p style="margin:0 0 24px"><a href="${escapeHtml(url)}" style="display:inline-block;background:#5f8f8b;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:15px">Open this intake</a></p>`,
    `<p style="margin:0 0 16px;font-size:13px;color:#6b6b6b">Only their opening line is here — the rest of what they shared stays on the site.</p>`,
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
