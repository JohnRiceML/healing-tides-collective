"use client";

import { useState } from "react";

import { ChatOnboarding } from "./ChatOnboarding";
import { VoiceOnboarding } from "./_voice/VoiceOnboarding";
import { ConsideringProvider } from "./_considering/ConsideringContext";
import { SurfacedProvider } from "./_discovery/SurfacedContext";
import { DiscoveryRail, RailDrawer } from "./_discovery/DiscoveryRail";

// /get-matched as a calm two-pane workspace: the conversation (voice by default, or text) on the
// left, and a right-hand rail where the agent's surfaced practitioners appear as cards + the seeker
// collects a small "basket" of good choices. On mobile the rail collapses into a bottom drawer.
export function GetMatchedExperience() {
  const [mode, setMode] = useState<"text" | "voice">("voice");
  return (
    <ConsideringProvider>
      <SurfacedProvider>
        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            {mode === "voice" ? (
              <VoiceOnboarding onSwitchToText={() => setMode("text")} />
            ) : (
              <ChatOnboarding onSwitchToVoice={() => setMode("voice")} />
            )}
          </div>
          <aside className="hidden h-[78vh] max-h-[820px] border-l border-rule/60 lg:block">
            <DiscoveryRail />
          </aside>
        </div>
        <RailDrawer />
      </SurfacedProvider>
    </ConsideringProvider>
  );
}
