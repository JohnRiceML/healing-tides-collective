// Trust & Safety — who is allowed into the public directory.
//
// Anyone can sign up and write a practitioner profile, but appearing in the directory is a
// real clinical claim carried under Nora's license — a stranger's profile can be found by
// someone in distress and recommended by the guide. So publishing is gated: a profile only
// goes PUBLISHED when the person either claimed an Invite we sent them, or an admin approved
// them by hand. Everyone else's publish lands in NEEDS_REVIEW (see publish-actions.ts).
//
// Migration-free, mirroring the __hold / __verified pattern: the approval lives under a
// reserved `__`-prefixed key inside the practitioner's `fieldValues`, which their own save
// can NEVER write (mergeFieldValues strips `__` keys), so it can't be forged from the client.

export const DIRECTORY_APPROVAL_KEY = "__directoryApproval";

export type DirectoryApproval = {
  by: string; // admin email, or "admin"
  at: string; // ISO timestamp
};

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Read the admin approval (or null) from a fieldValues blob. */
export function readDirectoryApproval(fieldValues: unknown): DirectoryApproval | null {
  const raw = (fieldValues as Record<string, unknown> | null | undefined)?.[DIRECTORY_APPROVAL_KEY];
  if (!isObj(raw)) return null;
  return {
    by: typeof raw.by === "string" ? raw.by : "",
    at: typeof raw.at === "string" ? raw.at : "",
  };
}

/** Next fieldValues with the approval recorded. Pure — preserves every other key. */
export function applyDirectoryApproval(
  existing: unknown,
  args: { by: string; at: string },
): Record<string, unknown> {
  const ex = isObj(existing) ? existing : {};
  const approval: DirectoryApproval = { by: args.by, at: args.at };
  return { ...ex, [DIRECTORY_APPROVAL_KEY]: approval };
}

/** Next fieldValues with the approval removed (an admin correcting a mis-click). Pure. */
export function removeDirectoryApproval(existing: unknown): Record<string, unknown> {
  const ex: Record<string, unknown> = isObj(existing) ? { ...existing } : {};
  delete ex[DIRECTORY_APPROVAL_KEY];
  return ex;
}
