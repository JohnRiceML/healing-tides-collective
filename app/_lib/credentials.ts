// MN credential taxonomy + public board lookups (from Nora's "Credentials_Cert", 2026-06-17)
// + the admin verification audit shape. Pure + CLIENT-SAFE (no db import) so the admin
// verification UI can use the matcher directly.
//
// Scope: MINNESOTA ONLY (v1). These are the public license-lookup PORTALS — there is no
// board API, so verification is admin-ASSISTED: a human opens the lookup and confirms, and
// we record who/when/what-was-seen. (See docs/product/CREDENTIAL-VALIDATION-FOR-GREG.md.)

export type CredentialBoard = {
  board: string;
  lookupUrl: string;
  /** Credential codes this board licenses, with a human label. */
  credentials: { code: string; label: string }[];
};

export const MN_BOARDS: CredentialBoard[] = [
  {
    board: "MN Board of Behavioral Health & Therapy",
    lookupUrl: "https://bht.hlb.state.mn.us/#/onlineEntitySearch",
    credentials: [
      { code: "LADC", label: "Licensed Alcohol & Drug Counselor" },
      { code: "LPCC", label: "Licensed Professional Clinical Counselor" },
      { code: "LPC", label: "Licensed Professional Counselor" },
    ],
  },
  {
    board: "MN Board of Social Work",
    lookupUrl: "https://soc.hlb.state.mn.us/#/services/onlineLicenseSearch",
    credentials: [
      { code: "LICSW", label: "Licensed Independent Clinical Social Worker" },
      { code: "LGSW", label: "Licensed Graduate Social Worker" },
      { code: "LISW", label: "Licensed Independent Social Worker" },
      { code: "LSW", label: "Licensed Social Worker" },
    ],
  },
  {
    board: "MN Board of Marriage & Family Therapy",
    lookupUrl: "https://mft.hlb.state.mn.us/#/services/onlineLicenseSearch",
    credentials: [{ code: "LMFT", label: "Licensed Marriage & Family Therapist" }],
  },
  {
    board: "MN Board of Psychology",
    lookupUrl: "https://mn.gov/boards/psychology/public/verifications/",
    credentials: [{ code: "LP", label: "Licensed Psychologist" }],
  },
  {
    board: "MN Board of Medical Practice",
    lookupUrl: "https://bmp.hlb.state.mn.us/#/onlineEntitySearch",
    credentials: [
      { code: "LAC", label: "Licensed Acupuncturist" },
      { code: "ND", label: "Naturopathic Doctor" },
      { code: "PA", label: "Physician Assistant" },
    ],
  },
  {
    board: "MN Board of Dietetics & Nutrition Practice",
    lookupUrl: "https://dnp.hlb.state.mn.us/#/onlineEntitySearch",
    credentials: [
      { code: "RD", label: "Registered Dietitian" },
      { code: "LN", label: "Licensed Nutritionist" },
    ],
  },
];

const CODE_INDEX: Record<string, { board: string; lookupUrl: string; label: string }> = {};
for (const b of MN_BOARDS) {
  for (const c of b.credentials) CODE_INDEX[c.code] = { board: b.board, lookupUrl: b.lookupUrl, label: c.label };
}

export type CredentialMatch = {
  board: string;
  lookupUrl: string;
  /** Stated codes (uppercased) this board covers. */
  codes: string[];
};

/** Tokenize stated credentials into uppercased alpha tokens (splits on commas/spaces/punct). */
function tokens(stated: string[] | string | null | undefined): string[] {
  const raw = Array.isArray(stated) ? stated.join(",") : typeof stated === "string" ? stated : "";
  return raw.toUpperCase().split(/[^A-Z]+/).filter(Boolean);
}

/**
 * Given a practitioner's stated credentials, return the distinct MN boards to check — each
 * with its public lookup URL + which stated codes it covers. Matches WHOLE tokens only, so
 * "LP" matches the credential, never a substring of a word.
 */
export function boardsForCredentials(stated: string[] | string | null | undefined): CredentialMatch[] {
  const byBoard = new Map<string, CredentialMatch>();
  for (const tok of new Set(tokens(stated))) {
    const hit = CODE_INDEX[tok];
    if (!hit) continue;
    const m = byBoard.get(hit.board) ?? { board: hit.board, lookupUrl: hit.lookupUrl, codes: [] };
    m.codes.push(tok);
    byBoard.set(hit.board, m);
  }
  return [...byBoard.values()];
}

// ── Verification audit (reserved fieldValues key) ────────────────────────────
// Distinct from the badge key (__verified): this is the due-diligence RECORD of a check.
export const VERIFICATION_KEY = "__credentialVerification";

export type VerificationStatus = "verified" | "not_found" | "pending";

export type VerificationAttempt = {
  status: VerificationStatus;
  by: string; // admin email (or "admin")
  at: string; // ISO timestamp
  notes: string; // required — what was seen on the board (the due-diligence record)
  credentials: string[]; // the stated credentials at the time of the check
};

/** Read the latest credential-verification attempt off a practitioner's fieldValues. */
export function readVerification(fieldValues: unknown): VerificationAttempt | null {
  const v = (fieldValues as Record<string, unknown> | null | undefined)?.[VERIFICATION_KEY];
  if (!v || typeof v !== "object") return null;
  const a = v as Record<string, unknown>;
  const status = a.status;
  if (status !== "verified" && status !== "not_found" && status !== "pending") return null;
  return {
    status,
    by: typeof a.by === "string" ? a.by : "admin",
    at: typeof a.at === "string" ? a.at : "",
    notes: typeof a.notes === "string" ? a.notes : "",
    credentials: Array.isArray(a.credentials) ? a.credentials.filter((c): c is string => typeof c === "string") : [],
  };
}

// ── Imported license (reserved fieldValues key) ──────────────────────────────
// What a directory import (e.g. Psychology Today's hasCertification) reported: license
// number / issuing state / expiry. UNVERIFIED — a head-start for the admin's manual board
// check, never a verification itself (that's `__credentialVerification`). Written server-side
// by the importer, so — like other `__` keys — the practitioner can't forge or wipe it and it
// survives their later saves (see `mergeFieldValues`).
export const IMPORTED_LICENSE_KEY = "__importedLicense";

export type ImportedLicense = {
  number?: string;
  state?: string;
  expires?: string;
  /** Host the license was imported from, e.g. "www.psychologytoday.com". */
  source?: string;
  /** ISO timestamp of the import. */
  at?: string;
};

/** Read an imported (unverified) license off a practitioner's fieldValues. Null if none/empty. */
export function readImportedLicense(fieldValues: unknown): ImportedLicense | null {
  const v = (fieldValues as Record<string, unknown> | null | undefined)?.[IMPORTED_LICENSE_KEY];
  if (!v || typeof v !== "object") return null;
  const a = v as Record<string, unknown>;
  const str = (x: unknown): string | undefined => (typeof x === "string" && x.trim() ? x.trim() : undefined);
  const lic: ImportedLicense = {
    number: str(a.number),
    state: str(a.state),
    expires: str(a.expires),
    source: str(a.source),
    at: str(a.at),
  };
  // Only meaningful if we actually have a number or state to act on.
  return lic.number || lic.state ? lic : null;
}
