import { PROFILE_SECTIONS } from "@/app/_lib/profile-fields";

/**
 * Narrative fields eligible for the optional writing assist. Deriving this list from
 * the editor config keeps structured facts (text, tags, and chips) out of the model.
 *
 * This lives outside the Server Action module because `"use server"` files may only
 * expose async functions at runtime.
 */
export const NARRATIVE_FIELD_IDS: readonly string[] = PROFILE_SECTIONS.flatMap((section) =>
  section.fields.filter((field) => field.type === "textarea").map((field) => field.id),
);

/** Column-backed narrative fields that are not represented in `PROFILE_SECTIONS`. */
export const COLUMN_NARRATIVE_FIELDS: Record<string, { label: string; hint?: string }> = {
  values: {
    label: "What healing means to me",
    hint: "The heart of your profile. Plain, warm, in your own voice.",
  },
  bio: {
    label: "Short bio",
    hint: "A couple of sentences about you and your practice.",
  },
};
