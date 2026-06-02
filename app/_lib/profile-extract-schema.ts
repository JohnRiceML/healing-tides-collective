// Zod schema for AI profile extraction — DERIVED from PROFILE_SECTIONS so the form
// config stays the single source of truth (add a field there → it's extractable here).
//
// We extract only the text / textarea / tags fields (+ the core narrative columns).
// The `chips` fields (style, age groups, availability) are left for the practitioner
// to click — quick, and it avoids fuzzy label→id mapping / bad guesses. Every field
// is optional so the model OMITS rather than invents.
import { z } from "zod";

import { PROFILE_SECTIONS } from "./profile-fields";

function richFieldsShape() {
  const shape: Record<string, z.ZodType> = {};
  for (const section of PROFILE_SECTIONS) {
    for (const f of section.fields) {
      if (f.type === "tags") shape[f.id] = z.array(z.string()).optional();
      else if (f.type === "text" || f.type === "textarea") shape[f.id] = z.string().optional();
      // chips intentionally skipped — see header note
    }
  }
  return z.object(shape);
}

export const profileExtractSchema = z.object({
  // Core columns the extractor can fill:
  displayName: z.string().optional(),
  bio: z.string().optional(),
  values: z.string().optional(),
  region: z.string().optional(),
  gender: z.string().optional(),
  insuranceAccepted: z.array(z.string()).optional(),
  // Nora's rich fields (from the config):
  fields: richFieldsShape(),
});

export type ProfileExtract = z.infer<typeof profileExtractSchema>;
