"use server";

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import { generateObject } from "ai";

import { getOrCreatePractitioner } from "@/lib/auth";
import { fieldLabel } from "@/app/_lib/profile-fields";
import { profileExtractSchema, type ProfileExtract } from "@/app/_lib/profile-extract-schema";

import { parseStructuredData, type NormalizedProfile } from "./_extract/parse-structured-data";
import { mapNormalized, type SourceContribution } from "./_extract/map-normalized";
import {
  describeSource,
  type ImportData,
  type ImportExtra,
  type ImportResponse,
  type ImportSourceSummary,
} from "./_extract/types";

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

/** When structured facts are known, fence the LLM to narrative so it can't contradict them. */
function seededAddendum(seed: NormalizedProfile): string {
  const facts = {
    name: seed.name,
    credentials: seed.credentials,
    title: seed.title,
    region: seed.location
      ? [seed.location.city, seed.location.region].filter(Boolean).join(", ") || undefined
      : undefined,
    education: seed.education,
    knowsAbout: seed.specialties,
  };
  return (
    "\n\nVERIFIED FACTS already extracted from this page's structured data (treat as GROUND TRUTH):\n" +
    JSON.stringify(facts) +
    "\n\nWhen verified facts are present:\n" +
    "- NEVER output a name, title, credential, location, or school that conflicts with them. If unsure, omit.\n" +
    "- Do NOT re-extract those fields — leave displayName, region, and background fields (title, credentials, education) EMPTY; they're already filled.\n" +
    "- DO focus on the NARRATIVE we can't get structurally: 'values' (what healing means to them, in their voice) and the rich fields about_you, client_expectations, ideal_client, populations, client_message. You may condense a long bio but add no new facts."
  );
}

/** One structured LLM call. `seed` (present when we parsed structured data) fences it to narrative. */
async function runAiExtraction(
  text: string,
  seed: NormalizedProfile | null,
): Promise<{ ok: true; data: ProfileExtract } | { ok: false; error: string }> {
  const input = (text ?? "").trim();
  if (input.length < 40) {
    return { ok: false, error: "There wasn't enough to work with — add a bit more, or fill the form in." };
  }
  try {
    const { object } = await generateObject({
      model: MODEL,
      schema: profileExtractSchema,
      system: seed ? SYSTEM + seededAddendum(seed) : SYSTEM,
      prompt: input.slice(0, 12000),
    });
    return { ok: true, data: object };
  } catch {
    return { ok: false, error: "Couldn't read that just now — you can fill the form in normally." };
  }
}

// ── URL fetch (SSRF-guarded) ──────────────────────────────────────────────────
// Fetching a user-supplied URL server-side is an SSRF vector — only ever reach
// PUBLIC http(s) hosts. We now return the raw HTML too (structured data lives in
// <script> tags that htmlToText deletes), and use a browser-like User-Agent (it
// materially improves coverage on Cloudflare-fronted sites; it's a no-op for PT).

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

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

function safeHost(rawUrl: string): string {
  try {
    return new URL(rawUrl.trim()).hostname.toLowerCase();
  } catch {
    return "";
  }
}

async function fetchPage(
  rawUrl: string,
): Promise<{ ok: true; html: string; text: string; host: string } | { ok: false; error: string }> {
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
  if (host.includes("linkedin.")) {
    return { ok: false, error: "LinkedIn blocks automated visits — paste your About section instead." };
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
      headers: { "user-agent": BROWSER_UA, accept: "text/html,application/xhtml+xml" },
    });
    if (!res.ok) {
      return { ok: false, error: "Couldn't open that page — try pasting the text instead." };
    }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("html") && !ct.includes("text")) {
      return { ok: false, error: "That link isn't a web page — try pasting the text instead." };
    }
    const html = (await res.text()).slice(0, 800_000);
    const text = htmlToText(html);
    return { ok: true, html, text, host };
  } catch {
    return { ok: false, error: "Couldn't reach that page — try pasting the text instead." };
  }
}

// ── merge helpers (all fill-if-empty: never clobber an earlier/better value) ──

const CORE_LABELS: Record<string, string> = {
  displayName: "Name",
  bio: "Bio",
  values: "What healing means to you",
  region: "Location",
  gender: "Gender",
  website: "Website",
};
const CORE_KEYS = ["displayName", "bio", "values", "region", "gender", "website"] as const;

function nonEmpty(v: unknown): boolean {
  if (v == null) return false;
  if (Array.isArray(v)) return v.length > 0;
  return String(v).trim() !== "";
}

/** Overlay the LLM's output onto a source's contribution (structured already won the facts). */
function mergeAiInto(contribution: SourceContribution, ai: ProfileExtract): void {
  const { data, contributed } = contribution;
  for (const key of CORE_KEYS) {
    const cur = (data as Record<string, unknown>)[key];
    const val = (ai as Record<string, unknown>)[key];
    if (!nonEmpty(cur) && typeof val === "string" && val.trim()) {
      (data as Record<string, unknown>)[key] = val.trim();
      contributed.push(CORE_LABELS[key]);
    }
  }
  if (ai.insuranceAccepted?.length && !nonEmpty(data.insuranceAccepted)) {
    data.insuranceAccepted = ai.insuranceAccepted;
    contributed.push("Insurance");
  }
  for (const [id, val] of Object.entries(ai.fields ?? {})) {
    const cur = (data.fields as Record<string, unknown>)[id];
    if (!nonEmpty(cur) && nonEmpty(val)) {
      (data.fields as Record<string, unknown>)[id] = val as string | string[];
      contributed.push(fieldLabel(id));
    }
  }
}

/** Cross-source fill-if-empty merge of one contribution into the running total. */
function fillInto(merged: ImportData, frag: ImportData): void {
  for (const key of [...CORE_KEYS, "specialties", "insuranceAccepted"] as const) {
    const cur = (merged as Record<string, unknown>)[key];
    const val = (frag as Record<string, unknown>)[key];
    if (!nonEmpty(cur) && nonEmpty(val)) (merged as Record<string, unknown>)[key] = val;
  }
  for (const [id, val] of Object.entries(frag.fields ?? {})) {
    const cur = (merged.fields as Record<string, unknown>)[id];
    if (!nonEmpty(cur) && nonEmpty(val)) (merged.fields as Record<string, unknown>)[id] = val as string | string[];
  }
}

function hasAnyData(d: ImportData): boolean {
  return (
    CORE_KEYS.some((k) => nonEmpty((d as Record<string, unknown>)[k])) ||
    nonEmpty(d.specialties) ||
    nonEmpty(d.insuranceAccepted) ||
    Object.values(d.fields ?? {}).some(nonEmpty)
  );
}

// ── public action: import from any mix of links + pasted text ────────────────

/**
 * Draft a profile from a few links + pasted text. For each link: fetch → parse the
 * page's structured data (JSON-LD) for verified facts → run the LLM on the page text
 * (fenced by those facts) for the narrative. Combine everything fill-if-empty. Never
 * saves or publishes — returns a draft + per-source provenance for human review.
 */
export async function extractProfileFromSources(input: {
  urls?: string[];
  text?: string;
}): Promise<ImportResponse> {
  const auth = await getOrCreatePractitioner();
  if (!auth) return { ok: false, error: "You're not signed in." };

  const urls = (input.urls ?? []).map((u) => u.trim()).filter(Boolean).slice(0, 4);
  const merged: ImportData = { fields: {} };
  const sources: ImportSourceSummary[] = [];
  const failedUrls: string[] = [];
  const extras: ImportExtra[] = [];
  const unmapped = new Set<string>();

  for (const url of urls) {
    const page = await fetchPage(url);
    const host = page.ok ? page.host : safeHost(url);
    const { kind, label } = describeSource(host);

    if (!page.ok) {
      sources.push({ id: url, host, label, kind, ok: false, usedStructured: false, contributed: [], note: page.error });
      failedUrls.push(url);
      continue;
    }

    const structured = parseStructuredData(page.html, host);
    const contribution: SourceContribution = structured
      ? mapNormalized(structured, host)
      : { data: { fields: {} }, contributed: [], extras: [], unmapped: [] };

    const ai = await runAiExtraction(page.text, structured);
    if (ai.ok) mergeAiInto(contribution, ai.data);

    // Importing your OWN site? Then that link IS your website (directories excluded).
    if (kind === "website" && !contribution.data.website) {
      contribution.data.website = `https://${host}`;
      if (!contribution.contributed.includes("Website")) contribution.contributed.push("Website");
    }

    fillInto(merged, contribution.data);
    extras.push(...contribution.extras);
    contribution.unmapped.forEach((u) => unmapped.add(u));
    sources.push({
      id: url,
      host,
      label,
      kind,
      ok: true,
      usedStructured: !!structured,
      contributed: contribution.contributed,
    });
  }

  const pasted = (input.text ?? "").trim();
  if (pasted) {
    const ai = await runAiExtraction(pasted, null);
    const contribution: SourceContribution = { data: { fields: {} }, contributed: [], extras: [], unmapped: [] };
    if (ai.ok) mergeAiInto(contribution, ai.data);
    fillInto(merged, contribution.data);
    sources.push({
      id: "paste",
      host: "",
      label: "the text you pasted",
      kind: "paste",
      ok: ai.ok,
      usedStructured: false,
      contributed: contribution.contributed,
      note: ai.ok ? undefined : ai.error,
    });
  }

  const result = {
    data: merged,
    sources,
    failedUrls,
    extras,
    unmappedSpecialties: [...unmapped],
  };

  if (!hasAnyData(merged)) {
    return {
      ok: false,
      error: failedUrls.length
        ? "Couldn't read those links — LinkedIn and some sites block automated visits. Paste your bio instead and we'll draft from it."
        : "Add a link or paste some text and we'll draft from it.",
      result: sources.length ? result : undefined,
    };
  }

  return { ok: true, result };
}

/** Draft from a single URL (thin wrapper over extractProfileFromSources). */
export async function extractProfileFromUrl(rawUrl: string): Promise<ImportResponse> {
  return extractProfileFromSources({ urls: [rawUrl] });
}

/** Draft from pasted text only (thin wrapper over extractProfileFromSources). */
export async function extractProfileFromText(text: string): Promise<ImportResponse> {
  return extractProfileFromSources({ text });
}
