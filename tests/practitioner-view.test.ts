import { describe, it, expect } from "vitest";

import {
  stripReservedFieldValues,
  toPractitionerEditorView,
} from "@/app/_lib/practitioner-view";
import { HOLD_KEY, HOLD_HISTORY_KEY } from "@/app/_lib/moderation";
import { IMPORT_URL_KEY } from "@/app/_lib/import-url";
import { aPractitioner } from "./helpers/factories";
import type { Practitioner } from "@/lib/generated/prisma/client";

// Every reserved key the admin/system side writes into fieldValues today. None of these
// may ever cross the client boundary via the editor projection.
const ADMIN_ONLY_FIELD_VALUES = {
  [HOLD_KEY]: { prev: "PUBLISHED", message: "We paused your profile.", internalNote: "legal escalation — do NOT share", by: "admin@healingtides.co", at: "2026-07-01T00:00:00.000Z" },
  [HOLD_HISTORY_KEY]: [{ action: "hold", by: "admin@healingtides.co", at: "2026-07-01T00:00:00.000Z" }],
  __adminNotes: [{ note: "private admin note", by: "admin@healingtides.co" }],
  __aiTriage: { risk: "medium" },
  __credentialVerification: { status: "pending" },
  __importedLicense: { number: "LMFT-12345" },
  __presenceScan: { checkedAt: "2026-07-01T00:00:00.000Z" },
  __presenceScanHistory: [{ checkedAt: "2026-07-01T00:00:00.000Z" }],
  __completenessReminder: { lastSentAt: "2026-07-01T00:00:00.000Z" },
  __verified: ["licensed_professional"],
};

const PROFILE_FIELD_VALUES = {
  title: "Licensed Therapist",
  about_you: "I work gently.",
  age_groups: ["adults"],
  cover_design: "waves",
};

describe("stripReservedFieldValues", () => {
  it("strips every reserved (`__`) key and preserves the practitioner's own answers", () => {
    const out = stripReservedFieldValues({ ...PROFILE_FIELD_VALUES, ...ADMIN_ONLY_FIELD_VALUES });
    expect(out).toEqual(PROFILE_FIELD_VALUES);
    for (const key of Object.keys(ADMIN_ONLY_FIELD_VALUES)) {
      expect(out).not.toHaveProperty(key);
    }
  });

  it("is calm about null / missing fieldValues", () => {
    expect(stripReservedFieldValues(null)).toEqual({});
    expect(stripReservedFieldValues(undefined)).toEqual({});
    expect(stripReservedFieldValues({})).toEqual({});
  });
});

describe("toPractitionerEditorView", () => {
  const row = (fieldValues: Record<string, unknown>) =>
    aPractitioner({ id: "p1", fieldValues }) as unknown as Practitioner;

  it("never leaks a reserved key into the serialized view", () => {
    const view = toPractitionerEditorView(
      row({ ...PROFILE_FIELD_VALUES, ...ADMIN_ONLY_FIELD_VALUES }),
    );
    // The whole view (what the RSC payload would serialize) must be free of internals.
    const serialized = JSON.stringify(view);
    expect(serialized).not.toContain("internalNote");
    expect(serialized).not.toContain("legal escalation");
    expect(serialized).not.toContain("private admin note");
    for (const key of Object.keys(ADMIN_ONLY_FIELD_VALUES)) {
      expect(view.fieldValues).not.toHaveProperty(key);
      expect(serialized).not.toContain(`"${key}"`);
    }
    // The practitioner's own answers still flow through untouched.
    expect(view.fieldValues).toEqual(PROFILE_FIELD_VALUES);
  });

  it("derives the hold facts (practitioner-facing message only)", () => {
    const view = toPractitionerEditorView(
      row({ ...PROFILE_FIELD_VALUES, ...ADMIN_ONLY_FIELD_VALUES }),
    );
    expect(view.held).toBe(true);
    expect(view.holdMessage).toBe("We paused your profile.");
  });

  it("is not held (empty message) without a hold record", () => {
    const view = toPractitionerEditorView(row(PROFILE_FIELD_VALUES));
    expect(view.held).toBe(false);
    expect(view.holdMessage).toBe("");
  });

  it("carries the invite import link as an explicit field", () => {
    const withUrl = toPractitionerEditorView(
      row({ ...PROFILE_FIELD_VALUES, [IMPORT_URL_KEY]: "https://example.com/me" }),
    );
    expect(withUrl.importUrl).toBe("https://example.com/me");
    expect(withUrl.fieldValues).not.toHaveProperty(IMPORT_URL_KEY);

    expect(toPractitionerEditorView(row(PROFILE_FIELD_VALUES)).importUrl).toBeNull();
  });
});
