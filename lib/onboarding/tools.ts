// AI SDK tool set for the TEXT chat (app/api/get-matched/chat/route.ts). Thin wrappers over
// the shared implementations in tool-logic.ts — that module is the single source of truth,
// shared with the VOICE agent's realtime tool endpoint.

import { tool } from "ai";

import {
  TOOL_SCHEMAS,
  TOOL_DESCRIPTIONS,
  runSearchPractitioners,
  runGetPractitioner,
  runReflectPriorities,
  runShowCrisisResources,
  runSaveIntake,
} from "./tool-logic";

export const onboardingTools = {
  search_practitioners: tool({
    description: TOOL_DESCRIPTIONS.search_practitioners,
    inputSchema: TOOL_SCHEMAS.search_practitioners,
    execute: runSearchPractitioners,
  }),
  get_practitioner: tool({
    description: TOOL_DESCRIPTIONS.get_practitioner,
    inputSchema: TOOL_SCHEMAS.get_practitioner,
    execute: runGetPractitioner,
  }),
  reflect_priorities: tool({
    description: TOOL_DESCRIPTIONS.reflect_priorities,
    inputSchema: TOOL_SCHEMAS.reflect_priorities,
    execute: runReflectPriorities,
  }),
  show_crisis_resources: tool({
    description: TOOL_DESCRIPTIONS.show_crisis_resources,
    inputSchema: TOOL_SCHEMAS.show_crisis_resources,
    execute: runShowCrisisResources,
  }),
  save_intake: tool({
    description: TOOL_DESCRIPTIONS.save_intake,
    inputSchema: TOOL_SCHEMAS.save_intake,
    execute: (args) => runSaveIntake(args, "chat"),
  }),
};

export type OnboardingTools = typeof onboardingTools;
