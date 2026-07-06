// Server-side projection for a practitioner row about to cross the client boundary.
//
// The `fieldValues` JSON column mixes the practitioner's own profile answers with
// RESERVED `__`-prefixed keys written by admin/system code — `__adminNotes`,
// `__hold.internalNote`, `__holdHistory`, `__aiTriage`, `__credentialVerification`,
// `__importedLicense`, `__presenceScan*`, `__completenessReminder`, … Handing the raw
// row to a "use client" component serializes ALL of that into the RSC payload, readable
// in the practitioner's devtools. So: strip every reserved key server-side, and pass the
// few derived facts the UI legitimately needs (hold state, the practitioner-FACING hold
// message, the carried import link) as explicit fields instead.

import type { Practitioner } from "@/lib/generated/prisma/client";

import { holdMessage, readHold } from "@/app/_lib/moderation";
import { readImportUrl } from "@/app/_lib/import-url";

/** fieldValues with every reserved (`__`-prefixed) key removed — safe for the browser. */
export function stripReservedFieldValues(fieldValues: unknown): Record<string, unknown> {
  const fv = (fieldValues ?? {}) as Record<string, unknown>;
  return Object.fromEntries(Object.entries(fv).filter(([k]) => !k.startsWith("__")));
}

/**
 * What the profile editor receives: the practitioner row with reserved fieldValues keys
 * stripped, plus the derived facts it needs. Saving stays safe — `mergeFieldValues`
 * preserves reserved keys from the EXISTING row and ignores any the client sends, so a
 * round-trip through this projection can't wipe (or forge) admin state.
 */
export type PractitionerEditorView = Omit<Practitioner, "fieldValues"> & {
  /** The practitioner's own profile answers only — no `__` keys. */
  fieldValues: Record<string, unknown>;
  /** True when an admin hold is active (editing allowed; publishing paused). */
  held: boolean;
  /** The practitioner-facing hold message ("" when not held) — never the internal note. */
  holdMessage: string;
  /** The carried "import this profile" link from their invite (their own URL), if any. */
  importUrl: string | null;
};

/** Project a full Prisma row into the client-safe editor view. Server-side only. */
export function toPractitionerEditorView(p: Practitioner): PractitionerEditorView {
  const held = readHold(p.fieldValues) !== null;
  return {
    ...p,
    fieldValues: stripReservedFieldValues(p.fieldValues),
    held,
    holdMessage: held ? holdMessage(p.fieldValues) : "",
    importUrl: readImportUrl(p.fieldValues),
  };
}
