// Pure, client-safe helpers for site feedback — the option lists, validation, and label/status
// helpers shared by the widget (client), the submit action (server), and the admin queue.
// No DB import here, so the widget can use it in the browser bundle.

export const FEEDBACK_KINDS = [
  { value: "BUG", label: "Something's broken" },
  { value: "IDEA", label: "An idea" },
  { value: "PRAISE", label: "Something I love" },
  { value: "OTHER", label: "Other" },
] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number]["value"];

export const FEEDBACK_STATUSES = [
  { value: "NEW", label: "New", open: true },
  { value: "TRIAGED", label: "Triaged", open: true },
  { value: "PLANNED", label: "Planned", open: true },
  { value: "FIXED", label: "Fixed", open: false },
  { value: "WONT_FIX", label: "Won't fix", open: false },
] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number]["value"];

export const MAX_FEEDBACK_MESSAGE = 2000;

const KIND_SET = new Set<string>(FEEDBACK_KINDS.map((k) => k.value));
const STATUS_SET = new Set<string>(FEEDBACK_STATUSES.map((s) => s.value));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FeedbackInput = { message: string; kind?: string; email?: string; path?: string; screenshotUrl?: string };
export type CleanFeedback = {
  message: string;
  kind: FeedbackKind;
  email: string | null;
  path: string | null;
  screenshotUrl: string | null;
};

/** Validate + normalize a submission. Pure — the action persists the returned value. */
export function validateFeedback(
  input: FeedbackInput,
): { ok: true; value: CleanFeedback } | { ok: false; error: string } {
  const message = (input.message ?? "").trim();
  if (message.length < 3) return { ok: false, error: "Please add a few words so we know what you mean." };
  if (message.length > MAX_FEEDBACK_MESSAGE)
    return { ok: false, error: "That's a bit long — please keep it under 2,000 characters." };

  const kindRaw = (input.kind ?? "OTHER").toUpperCase();
  const kind = (KIND_SET.has(kindRaw) ? kindRaw : "OTHER") as FeedbackKind;

  const emailRaw = (input.email ?? "").trim();
  if (emailRaw && !EMAIL_RE.test(emailRaw)) return { ok: false, error: "That email doesn't look right — or leave it blank." };
  const email = emailRaw ? emailRaw.toLowerCase() : null;

  const pathRaw = (input.path ?? "").trim();
  const path = pathRaw ? pathRaw.slice(0, 300) : null;

  // Screenshot URL is set by our own upload action (a Vercel Blob https URL); keep only https.
  const shotRaw = (input.screenshotUrl ?? "").trim();
  let screenshotUrl: string | null = null;
  if (shotRaw) {
    try {
      if (new URL(shotRaw).protocol === "https:") screenshotUrl = shotRaw;
    } catch {
      /* a bad URL just means no screenshot — never block the submission */
    }
  }

  return { ok: true, value: { message, kind, email, path, screenshotUrl } };
}

/** Friendly label for the captured sender role. */
export function roleLabel(role: string | null | undefined): string {
  switch (role) {
    case "PRACTITIONER":
      return "Practitioner";
    case "SEEKER":
      return "Seeker";
    case "ADMIN":
      return "Admin";
    case "SIGNED_IN":
      return "Signed in";
    default:
      return "Visitor";
  }
}

export function isValidStatus(status: string): boolean {
  return STATUS_SET.has(status);
}
export function feedbackStatusLabel(status: string): string {
  return FEEDBACK_STATUSES.find((s) => s.value === status)?.label ?? status;
}
export function isOpenStatus(status: string): boolean {
  return FEEDBACK_STATUSES.find((s) => s.value === status)?.open ?? true;
}
export function kindLabel(kind: string): string {
  return FEEDBACK_KINDS.find((k) => k.value === kind)?.label ?? kind;
}
