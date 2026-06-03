// Shared types for the profile importer — used by the server action
// (extract-actions.ts), the editor (ProfileEditor.tsx), and the status bar
// (ImportStatusBar.tsx). No runtime logic, so it's safe to import from client code.

import type { ProfileExtract } from "@/app/_lib/profile-extract-schema";

export type SourceKind = "psychologytoday" | "linkedin" | "website" | "paste";

/** The fill-ready payload: the LLM schema + structurally-derived extras the schema lacks. */
export type ImportData = ProfileExtract & {
  /** Matched taxonomy category ids (from knowsAbout / medicalSpecialty). */
  specialties?: string[];
  /** The practitioner's own website (resolved from structured data, not the directory page). */
  website?: string;
};

/** A verified fact we found but have no profile field for yet (license #, phone). Read-only. */
export interface ImportExtra {
  label: string; // "License"
  value: string; // "#25149 · Minnesota"
  source: string; // host
}

/** Per-source rollup — drives the status bar's source rows. */
export interface ImportSourceSummary {
  id: string; // the url, or "paste"
  host: string; // "psychologytoday.com" | "" for paste
  label: string; // "Psychology Today" | "your website" | "the text you pasted"
  kind: SourceKind;
  ok: boolean;
  usedStructured: boolean; // did we read real structured data (vs. only AI-on-text)?
  contributed: string[]; // human field labels this source filled
  note?: string; // calm failure reason
}

export interface ImportResult {
  data: ImportData;
  sources: ImportSourceSummary[];
  failedUrls: string[];
  extras: ImportExtra[];
  unmappedSpecialties: string[];
  /** A headshot we found (e.g. a Psychology Today photo) the editor can adopt into Blob. */
  suggestedPhotoUrl?: string;
}

export type ImportResponse =
  | { ok: true; result: ImportResult }
  | { ok: false; error: string; result?: ImportResult };

/** Friendly label + kind for a host (or paste). Pure — shared by server + client. */
export function describeSource(host: string): { kind: SourceKind; label: string } {
  const h = host.toLowerCase();
  if (!h || h === "paste") return { kind: "paste", label: "the text you pasted" };
  if (h.includes("psychologytoday")) return { kind: "psychologytoday", label: "Psychology Today" };
  if (h.includes("linkedin")) return { kind: "linkedin", label: "LinkedIn" };
  return { kind: "website", label: h.replace(/^www\./, "") };
}
