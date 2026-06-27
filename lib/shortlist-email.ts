// Composes the shortlist email a seeker receives — the delivery step that closes the matching
// loop. Pure + client-safe (only imports the SITE_URL const), so the workspace can build a
// prefilled mailto on the client AND the server action can hand the html/text to Resend. Voice:
// warm, "speak in reasons," "these are suggestions, a person isn't replaced" (the matching principles).

import { SITE_URL } from "@/lib/site";

export type ShortlistPick = { displayName: string | null; slug: string | null; reason: string | null };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function composeShortlistEmail(input: {
  seekerName: string;
  seekerEmail: string;
  picks: ShortlistPick[];
}): { subject: string; text: string; html: string; mailto: string } {
  const name = input.seekerName?.trim() || "there";
  const picks = input.picks.filter((p) => p.displayName && p.slug);
  const subject = "A few practitioners I thought of for you — Healing Tides";

  const intro =
    `Hi ${name},\n\n` +
    `Thank you for sharing what's bringing you here — I read it with care. Here are a few practitioners ` +
    `I think could be a good fit, each with a note on why:`;
  const close =
    `These are suggestions, not a final answer — reach out to whoever feels right, and feel free to mention ` +
    `Healing Tides sent you. If none of them resonate, just reply to this email and I'll keep looking.\n\n` +
    `Warmly,\nNora\nHealing Tides Collective`;

  const textPicks = picks.map((p, i) => {
    const url = `${SITE_URL}/practitioners/${p.slug}`;
    const why = p.reason?.trim() ? `\n   Why I thought of them: ${p.reason.trim()}` : "";
    return `${i + 1}. ${p.displayName}${why}\n   ${url}`;
  });
  const text = `${intro}\n\n${textPicks.join("\n\n")}\n\n${close}`;

  const htmlPicks = picks
    .map((p, i) => {
      const url = `${SITE_URL}/practitioners/${p.slug}`;
      const why = p.reason?.trim() ? `<br/><em>Why I thought of them:</em> ${esc(p.reason.trim())}` : "";
      return `<p style="margin:0 0 14px"><strong>${i + 1}. ${esc(p.displayName as string)}</strong>${why}<br/><a href="${url}">${url}</a></p>`;
    })
    .join("");
  const html =
    `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#2f2f2f">` +
    `<p>${esc(intro).replace(/\n\n/g, "</p><p>")}</p>${htmlPicks}` +
    `<p>${esc(close).replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br/>")}</p></div>`;

  const mailto = `mailto:${encodeURIComponent(input.seekerEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  return { subject, text, html, mailto };
}
