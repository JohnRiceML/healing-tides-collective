"use client";

import { useState } from "react";

import { ChatOnboarding } from "./ChatOnboarding";
import { VoiceOnboarding } from "./_voice/VoiceOnboarding";

// The /get-matched entry: a calm text chat by default, with a one-tap switch to a spoken
// voice conversation. Both run the same agent (same method + tools); only the modality differs.
export function GetMatchedExperience() {
  const [mode, setMode] = useState<"text" | "voice">("text");
  return mode === "voice" ? (
    <VoiceOnboarding onSwitchToText={() => setMode("text")} />
  ) : (
    <ChatOnboarding onSwitchToVoice={() => setMode("voice")} />
  );
}
