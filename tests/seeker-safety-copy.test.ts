import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, it, expect } from "vitest";

// These lines are safety copy, not decoration: every seeker-facing entry point must carry the
// crisis line, and every AI conversation must say it's an AI before the person starts talking.
// The default suite runs in node (no DOM), so we pin the source rather than a render — enough to
// catch the regression that matters: someone quietly deleting the line.
const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const INTAKE = "app/get-matched/IntakeFlow.tsx";
const CHAT = "app/get-matched/ChatOnboarding.tsx";
const VOICE = "app/get-matched/_voice/VoiceOnboarding.tsx";

describe("seeker surfaces carry the crisis line", () => {
  it.each([INTAKE, CHAT, VOICE])("%s mentions 988 and is framed as not emergency care", (path) => {
    const src = read(path);
    expect(src).toContain("988");
    expect(src).toContain("Not emergency care");
  });

  it("the typed intake links out to /crisis", () => {
    expect(read(INTAKE)).toContain('href="/crisis"');
  });
});

describe("AI conversations disclose the AI before they start", () => {
  it.each([CHAT, VOICE])("%s says it's an AI guide, third-party processed, read by Nora", (path) => {
    const src = read(path);
    expect(src).toContain("talking with an AI guide");
    expect(src).toContain("third-party service");
    expect(src).toContain("Nora reads what gets sent to her");
  });
});
