// Pure "what needs you today" digest for the admin command center. Computed server-side from the
// already-fetched reads (no extra query) + a fixed `now`, so it's testable and the UI stays dumb.
// It turns the scattered admin counts into a single prioritized action list, people-first: a seeker
// who's waiting to be matched outranks housekeeping like nudges or drafts.

import { relativeShort } from "@/app/_lib/activity";
import type { AdminSeekerRow } from "./_data";

export type CommandLane = {
  key: string;
  label: string; // sentence case
  count: number;
  href: string;
  tone: "act" | "calm"; // "act" = someone's waiting (highlighted); "calm" = housekeeping
};

export type IntakePreview = {
  id: string;
  initial: string; // first initial of the seeker's name (privacy-light)
  detail: string; // "Saint Paul · soon · myself"
  ago: string; // relativeShort(createdAt, now)
  urgent: boolean; // urgency === "soon"
};

export type CommandCenter = {
  greeting: string; // "Good morning" / "Good afternoon" / "Good evening"
  totalActions: number; // action items across queues (excludes the informational "on hold")
  lanes: CommandLane[]; // only non-empty queues, priority order
  topIntakes: IntakePreview[]; // up to 3 highest-priority intakes waiting to be matched
};

export function greetingFor(now: Date): string {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function urgencyLabel(u: string | null): string | null {
  if (!u) return null;
  return u === "soon" ? "soon" : u === "this_month" ? "this month" : u === "open" ? "open timing" : u;
}

export function buildCommandCenter(
  input: {
    intakes: AdminSeekerRow[];
    invitesPending: number;
    dueReminders: number;
    newFeedback: number;
    drafts: number;
    needsReview: number;
    onHold: number;
  },
  now: Date,
): CommandCenter {
  // "NEW" = an intake nobody's started a shortlist for yet.
  const newIntakes = input.intakes.filter((i) => i.status === "NEW");

  // Most urgent first (urgency "soon"), then newest — so the person who needs care soonest is on top.
  const sorted = [...newIntakes].sort((a, b) => {
    const ua = a.urgency === "soon" ? 0 : 1;
    const ub = b.urgency === "soon" ? 0 : 1;
    if (ua !== ub) return ua - ub;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const topIntakes: IntakePreview[] = sorted.slice(0, 3).map((i) => ({
    id: i.id,
    initial: (i.name?.trim()?.[0] ?? "·").toUpperCase(),
    detail: [i.region, urgencyLabel(i.urgency), i.ageGroup].filter(Boolean).join(" · ") || "New intake",
    ago: relativeShort(i.createdAt, now),
    urgent: i.urgency === "soon",
  }));

  const laneDefs: CommandLane[] = [
    { key: "intakes", label: "New intakes to match", count: newIntakes.length, href: "/admin/seekers", tone: "act" },
    { key: "review", label: "Profiles to review", count: input.needsReview, href: "/admin/practitioners", tone: "act" },
    { key: "feedback", label: "Feedback to triage", count: input.newFeedback, href: "/admin/feedback", tone: "act" },
    { key: "invites", label: "Invites awaiting a claim", count: input.invitesPending, href: "/admin/practitioners", tone: "calm" },
    { key: "reminders", label: "Profiles to nudge", count: input.dueReminders, href: "/admin/practitioners", tone: "calm" },
    { key: "drafts", label: "Drafts not yet live", count: input.drafts, href: "/admin/practitioners", tone: "calm" },
    { key: "hold", label: "On hold", count: input.onHold, href: "/admin/practitioners", tone: "calm" },
  ];
  const lanes = laneDefs.filter((l) => l.count > 0);

  // "Things waiting on you" = actionable queues; "on hold" is a state to be aware of, not a to-do.
  const totalActions = lanes.filter((l) => l.key !== "hold").reduce((s, l) => s + l.count, 0);

  return { greeting: greetingFor(now), totalActions, lanes, topIntakes };
}
