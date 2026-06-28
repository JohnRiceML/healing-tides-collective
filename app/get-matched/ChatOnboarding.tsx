"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import type { OnboardingUIMessage } from "@/app/api/get-matched/chat/route";
import type { PractitionerHit } from "@/lib/onboarding/types";
import { PriorityChart } from "./_chat/PriorityChart";
import { CrisisCard } from "./_chat/CrisisCard";
import { useSurfaced } from "./_discovery/SurfacedContext";

const STARTERS = [
  "I'm not sure where to start",
  "I think I want therapy",
  "I've tried therapy before",
  "Something for my teen",
];

function ThinkingPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] text-ink-muted ring-1 ring-rule">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal" /> {label}
    </span>
  );
}

function TypingDots() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-3.5 py-3 ring-1 ring-rule">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}

/** Inline acknowledgment when the agent surfaces practitioners — the cards live in the rail. */
function SurfacedNote({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-seafoam/40 px-3 py-1 text-[12px] text-ocean">
      <span aria-hidden>✦</span> Added {names.join(" · ")} to your people <span className="lg:inline hidden">→</span>
    </span>
  );
}

/** Render the rich parts an assistant turn can contain (text + tool results). */
function AssistantParts({ message }: { message: OnboardingUIMessage }) {
  return (
    <>
      {message.parts.map((part, i) => {
        switch (part.type) {
          case "text":
            return part.text ? (
              <div
                key={i}
                className="w-fit max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5 text-[14px] leading-[1.6] text-charcoal ring-1 ring-rule"
              >
                {part.text}
              </div>
            ) : null;

          case "tool-search_practitioners":
            if (part.state === "output-available") {
              return <SurfacedNote key={i} names={part.output.practitioners.map((p) => p.displayName)} />;
            }
            return <ThinkingPill key={i} label="Looking for practitioners…" />;

          case "tool-get_practitioner":
            if (part.state === "output-available" && "practitioner" in part.output) {
              return <SurfacedNote key={i} names={[part.output.practitioner.displayName]} />;
            }
            return null;

          case "tool-reflect_priorities":
            if (part.state === "output-available") {
              return (
                <div key={i} className="max-w-[92%]">
                  <PriorityChart data={part.output} />
                </div>
              );
            }
            return <ThinkingPill key={i} label="Reflecting back what I'm hearing…" />;

          case "tool-show_crisis_resources":
            if (part.state === "output-available") {
              return (
                <div key={i} className="max-w-[92%]">
                  <CrisisCard data={part.output} />
                </div>
              );
            }
            return null;

          case "tool-save_intake":
            if (part.state === "output-available") {
              return part.output.ok ? (
                <div
                  key={i}
                  className="max-w-[92%] rounded-2xl border border-teal/30 bg-seafoam/20 px-4 py-3 text-[14px] leading-[1.6] text-ocean"
                >
                  <span className="font-medium">We have it from here, {part.output.name}.</span> A real person will read
                  what you shared and send back a small, considered shortlist — usually within a few days.
                </div>
              ) : (
                <p key={i} className="text-[12px] text-clay">
                  {part.output.error}
                </p>
              );
            }
            return <ThinkingPill key={i} label="Saving your note for our team…" />;

          default:
            return null;
        }
      })}
    </>
  );
}

export function ChatOnboarding({ onSwitchToVoice }: { onSwitchToVoice?: () => void }) {
  const { messages, sendMessage, status, error } = useChat<OnboardingUIMessage>({
    transport: new DefaultChatTransport({ api: "/api/get-matched/chat" }),
  });
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addMany } = useSurfaced();
  const busy = status === "submitted" || status === "streaming";

  // Scroll the MESSAGE CONTAINER only (not the window) — scrollIntoView would bubble up and
  // yank the whole page, hiding the greeting above the fold on mount.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  // Lift practitioners the agent surfaces out of the chat stream into the right-hand rail.
  useEffect(() => {
    const hits: PractitionerHit[] = [];
    for (const m of messages) {
      if (m.role !== "assistant") continue;
      for (const part of m.parts) {
        if (part.type === "tool-search_practitioners" && part.state === "output-available") {
          hits.push(...part.output.practitioners);
        } else if (part.type === "tool-get_practitioner" && part.state === "output-available" && "practitioner" in part.output) {
          hits.push(part.output.practitioner);
        }
      }
    }
    if (hits.length) addMany(hits);
  }, [messages, addMany]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    sendMessage({ text: t });
    setInput("");
  };

  const lastIsUser = messages.length > 0 && messages[messages.length - 1].role === "user";

  return (
    <div className="mx-auto flex h-[78vh] max-h-[820px] w-full max-w-2xl flex-col px-4">
      <header className="flex items-center justify-between border-b border-rule/60 py-4">
        <div>
          <p className="font-display text-[18px] font-light text-charcoal">Find your fit</p>
          <p className="text-[12px] text-ink-muted">A calm conversation — a real person reads every word.</p>
        </div>
        <div className="flex items-center gap-3">
          {onSwitchToVoice ? (
            <button onClick={onSwitchToVoice} className="text-[12px] text-teal underline-offset-2 hover:underline">
              🎙 Talk instead
            </button>
          ) : null}
          <Link href="/get-matched/form" className="text-[12px] text-ink-muted underline-offset-2 hover:underline">
            Prefer a form?
          </Link>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto py-6">
        {/* Warm opening — not a model message; the agent replies after the first user turn. */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-fit max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5 text-[14px] leading-[1.6] text-charcoal ring-1 ring-rule"
        >
          Hi — I&rsquo;m glad you&rsquo;re here. There&rsquo;s no form to fill out and no rush. Whatever&rsquo;s bringing
          you to look for support, you can tell me in your own words — even just a sentence. Where are you starting from?
        </motion.div>

        {messages.length === 0 ? (
          <div className="flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-rule bg-white px-3 py-1.5 text-[13px] text-ink-soft transition hover:border-teal/40 hover:text-charcoal"
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}

        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={m.role === "user" ? "flex flex-col items-end gap-2" : "flex flex-col items-start gap-2"}
          >
            {m.role === "user" ? (
              <div className="w-fit max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-teal px-3.5 py-2.5 text-[14px] leading-[1.6] text-white">
                {m.parts.map((p, i) => (p.type === "text" ? <span key={i}>{p.text}</span> : null))}
              </div>
            ) : (
              <AssistantParts message={m} />
            )}
          </motion.div>
        ))}

        {status === "submitted" && lastIsUser ? <TypingDots /> : null}
        {error ? (
          <p className="text-[13px] text-clay">Something went wrong on our end. You can keep typing, or use the form.</p>
        ) : null}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-rule/60 bg-sand pt-3"
      >
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Tell me a little about what's bringing you here…"
            aria-label="Your message"
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-rule bg-white px-3.5 py-3 text-[14px] text-charcoal placeholder:text-ink-muted focus:border-teal focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="h-[44px] shrink-0 rounded-2xl bg-ocean px-4 text-[14px] text-white transition hover:bg-ocean/90 disabled:opacity-40"
          >
            Send
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-ink-muted">
          Not emergency care. If you&rsquo;re in crisis, call or text 988. A person reviews everything you share.
        </p>
      </form>
    </div>
  );
}
