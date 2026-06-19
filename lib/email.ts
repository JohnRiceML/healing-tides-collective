// Transactional email via Resend's REST API (https://resend.com). Deliberately a thin
// fetch wrapper — same shape + contract as lib/serper.ts: it NEVER throws on a user-facing
// path, and it no-ops safely when unconfigured. Callers treat a non-ok result as "not sent"
// and fall back (e.g. the admin still gets a copyable claim link).
//
// Env: RESEND_API_KEY + EMAIL_FROM (a verified "Name <addr@your-domain>"). Set both in
// .env.local + Vercel; verify a sending domain at https://resend.com. With either unset the
// layer reports `not_configured` and sends nothing — the app keeps working.

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; reason: "not_configured" | "http_error" | "exception" };

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

/** True only when both the API key and a from-address are present. */
export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

/**
 * Send one transactional email. Best-effort and never throws: returns `not_configured`
 * when env is missing, `http_error` on a non-2xx Resend response, `exception` on a network
 * fault. A `{ ok: true, id }` is a confirmed hand-off to Resend (not proof of inbox delivery).
 */
export async function sendEmail(msg: EmailMessage): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return { ok: false, reason: "not_configured" };

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [msg.to],
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
        ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      console.error(`[email] HTTP ${res.status} sending "${msg.subject}"`);
      return { ok: false, reason: "http_error" };
    }
    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: typeof data.id === "string" ? data.id : "" };
  } catch (err) {
    // Log only the message string — never the raw error object (avoids any chance a log
    // aggregator inspects attached request context that could contain the auth header).
    console.error(`[email] error sending "${msg.subject}": ${err instanceof Error ? err.message : String(err)}`);
    return { ok: false, reason: "exception" };
  }
}
