"use client";

import { useState } from "react";

import { ChatOnboarding } from "./ChatOnboarding";
import { VoiceOnboarding } from "./_voice/VoiceOnboarding";
import { ConsideringProvider } from "./_considering/ConsideringContext";
import { ConsideringPanel } from "./_considering/ConsideringPanel";

// The /get-matched entry: a calm text chat by default, with a one-tap switch to a spoken voice
// conversation. Both run the same agent (same method + tools). The ConsideringProvider holds the
// seeker's saved shortlist (anonymous, client-side) shared across both modalities + persists across
// the toggle; ConsideringPanel is the floating list + staged "reach out / warm intro" CTA.
export function GetMatchedExperience() {
  const [mode, setMode] = useState<"text" | "voice">("text");
  return (
    <ConsideringProvider>
      {mode === "voice" ? (
        <VoiceOnboarding onSwitchToText={() => setMode("text")} />
      ) : (
        <ChatOnboarding onSwitchToVoice={() => setMode("voice")} />
      )}
      <ConsideringPanel />
    </ConsideringProvider>
  );
}
