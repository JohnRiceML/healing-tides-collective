"use server";

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import { generateObject } from "ai";

import { getOrCreatePractitioner } from "@/lib/auth";
import { profileExtractSchema } from "@/app/_lib/profile-extract-schema";

// Vercel AI Gateway model id (plain "provider/model" string — no provider SDK).
// On Vercel it auths via OIDC; locally set AI_GATEWAY_API_KEY. Swappable.
const MODEL = "anthropic/claude-haiku-4.5";

const SYSTEM =
  "You turn text a wellness practitioner wrote about themselves (a website bio, a " +
  "Psychology Today blurb, a CV) into a structured profile DRAFT. Only include facts " +
  "EXPLICITLY present in the text. Omit anything not stated — never invent credentials, " +
  "licenses, years of experience, names, prices, insurance, or contact details. For the " +
  "narrative fields (bio, values, about_you, client_expectations, ideal_client), you may " +
  "lightly rephrase what's written into warm first-person, but stay faithful to the source. " +
  "Leave any field empty when you're unsure. The text may include website nav/footer noise — " +
  "ignore anything that isn't about this practitioner.";

/** The shared extraction core — one structured LLM call. */
async function runExtraction(text: string) {
  const input = (text ?? "").trim();
  if (input.length < 40) {
    return { ok: false as const, error: "There wasn't enough to work with — add a bit more, or fill the form in." };
  }
  try {
    const { object } = await generateObject({
      model: MODEL,
      schema: profileExtractSchema,
      system: SYSTEM,
      prompt: input.slice(0, 12000),
    });
    return { ok: true as const, data: object };
  } catch {
    return { ok: false as const, error: "Couldn't read that just now — you can fill the form in normally." };
  }
}

/**
 * Draft a profile from text the practitioner pastes. Pre-fills the editor for HUMAN
 * REVIEW — never writes to the DB and never publishes. Gated to the signed-in practitioner.
 */
export async function extractProfileFromText(text: string) {
  const result = await getOrCreatePractitioner();
  if (!result) return { ok: false as const, error: "You're not signed in." };
  return runExtraction(text);
}

// ── URL import ──────────────────────────────────────────────────────────────
// Fetching a user-supplied URL server-side is an SSRF vector — only ever reach
// PUBLIC http(s) hosts. (Residual: a public page that 3xx-redirects to an internal
// IP isn't re-checked here — acceptable for v2; the practitioner provides their own URL.)

function isPrivateIp(ip: string): boolean {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("0.") ||
    /^10\./.test(ip) ||
    /^192\.168\./.test(ip) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    /^169\.254\./.test(ip) || // link-local incl. cloud metadata
    /^(fc|fd|fe80)/i.test(ip) // IPv6 ULA / link-local
  );
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;|&rsquo;|&lsquo;/gi, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchPageText(
  rawUrl: string,
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  let url: URL;
  try {
    url = new URL((rawUrl ?? "").trim());
  } catch {
    return { ok: false, error: "That doesn't look like a valid web address." };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, error: "Use a website link that starts with https://." };
  }
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    return { ok: false, error: "That address isn't reachable." };
  }
  try {
    const addr = isIP(host) ? host : (await lookup(host)).address;
    if (isPrivateIp(addr)) return { ok: false, error: "That address isn't reachable." };
  } catch {
    return { ok: false, error: "Couldn't find that website." };
  }
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      headers: { "user-agent": "HealingTidesCollective/1.0 (+profile import)" },
    });
    if (!res.ok) {
      return { ok: false, error: "Couldn't open that page — try pasting the text instead." };
    }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("html") && !ct.includes("text")) {
      return { ok: false, error: "That link isn't a web page — try pasting the text instead." };
    }
    const html = (await res.text()).slice(0, 500_000);
    const text = htmlToText(html);
    if (text.length < 80) {
      return { ok: false, error: "Couldn't find readable text there — try pasting it instead." };
    }
    return { ok: true, text };
  } catch {
    return {
      ok: false,
      error: "Couldn't reach that page — some sites (Psychology Today, LinkedIn) block automated visits. Try pasting the text instead.",
    };
  }
}

/**
 * Draft a profile from the practitioner's own website/profile URL: fetch → strip to
 * text → the same extraction. SSRF-guarded, public-http(s) only. Review before save.
 */
export async function extractProfileFromUrl(rawUrl: string) {
  const result = await getOrCreatePractitioner();
  if (!result) return { ok: false as const, error: "You're not signed in." };
  const page = await fetchPageText(rawUrl);
  if (!page.ok) return { ok: false as const, error: page.error };
  return runExtraction(page.text);
}

/**
 * Draft a profile from MULTIPLE sources at once — a few links + pasted text, combined
 * into one extraction. The onboarding "drop your links, we'll do the work" path.
 * Returns which links couldn't be reached so the UI can nudge a paste.
 */
export async function extractProfileFromSources(input: { urls?: string[]; text?: string }) {
  const result = await getOrCreatePractitioner();
  if (!result) return { ok: false as const, error: "You're not signed in." };

  const urls = (input.urls ?? []).map((u) => u.trim()).filter(Boolean).slice(0, 4);
  const parts: string[] = [];
  const failed: string[] = [];
  for (const u of urls) {
    const page = await fetchPageText(u);
    if (page.ok) parts.push(page.text);
    else failed.push(u);
  }
  const pasted = (input.text ?? "").trim();
  if (pasted) parts.push(pasted);

  const combined = parts.join("\n\n— — —\n\n");
  if (combined.trim().length < 40) {
    return {
      ok: false as const,
      error: failed.length
        ? "Couldn't read those links — some sites (Psychology Today, LinkedIn) block automated visits. Try pasting the text instead."
        : "Add a link or paste some text and we'll draft from it.",
      failed,
    };
  }
  const ext = await runExtraction(combined);
  if (!ext.ok) return { ...ext, failed };
  return { ok: true as const, data: ext.data, failed };
}
