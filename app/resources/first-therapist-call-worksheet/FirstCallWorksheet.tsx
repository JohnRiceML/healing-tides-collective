"use client";

import {useEffect, useMemo, useRef, useState} from "react";

import {Button, ChoiceChip, StepDots} from "@/app/_components/ui";
import {
  AFTER_CALL_REFLECTIONS,
  MAX_WORKSHEET_FOCUSES,
  WORKSHEET_FOCUSES,
  buildWorksheetQuestions,
  type MeetingFormat,
  type MeetingKind,
  type PaymentKind,
  type WorksheetFocus,
  type WorksheetQuestion,
} from "@/lib/first-call-worksheet";

const meetingOptions: Array<{value: MeetingKind; label: string; description: string}> = [
  {value: "consultation", label: "A first call", description: "A brief conversation before deciding whether to book."},
  {value: "first-session", label: "A first session", description: "A fuller appointment that may include intake and consent."},
  {value: "unsure", label: "I’m not sure", description: "The worksheet will include a question to clarify it."},
];

const formatOptions: Array<{value: MeetingFormat; label: string}> = [
  {value: "online", label: "Online"},
  {value: "in-person", label: "In person"},
  {value: "unsure", label: "Unsure"},
];

const paymentOptions: Array<{value: PaymentKind; label: string}> = [
  {value: "insurance", label: "Insurance"},
  {value: "self-pay", label: "Self-pay"},
  {value: "unsure", label: "Unsure"},
];

export function FirstCallWorksheet() {
  const [step, setStep] = useState(0);
  const [focuses, setFocuses] = useState<WorksheetFocus[]>([]);
  const [meeting, setMeeting] = useState<MeetingKind>();
  const [format, setFormat] = useState<MeetingFormat>();
  const [payment, setPayment] = useState<PaymentKind>();
  const [notice, setNotice] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [chosenQuestionIds, setChosenQuestionIds] = useState<string[]>([]);
  const headings = useRef<Array<HTMLHeadingElement | null>>([]);
  const firstRender = useRef(true);

  const questions = useMemo(
    () => buildWorksheetQuestions(focuses, {meeting, format, payment}),
    [focuses, meeting, format, payment],
  );

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headings.current[step]?.focus();
  }, [step]);

  function toggleFocus(id: WorksheetFocus) {
    setNotice("");
    setFocuses((current) => {
      if (current.includes(id)) return current.filter((focus) => focus !== id);
      if (current.length >= MAX_WORKSHEET_FOCUSES) {
        setNotice("Four is plenty. Remove one choice before adding another.");
        return current;
      }
      return [...current, id];
    });
  }

  function goTo(next: number) {
    setNotice("");
    setCopyStatus("");
    setConfirmReset(false);
    if (next < 2) setChosenQuestionIds([]);
    setStep(next);
  }

  function toggleQuestion(id: string) {
    setCopyStatus("");
    setChosenQuestionIds((current) => {
      if (current.includes(id)) return current.filter((questionId) => questionId !== id);
      if (current.length >= 3) {
        setCopyStatus("Three is enough. Remove one question before choosing another.");
        return current;
      }
      return [...current, id];
    });
  }

  function clearAnswers() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setFocuses([]);
    setMeeting(undefined);
    setFormat(undefined);
    setPayment(undefined);
    setConfirmReset(false);
    setChosenQuestionIds([]);
    setCopyStatus("");
    setStep(0);
  }

  async function copyQuestions() {
    const questionsToCopy = chosenQuestionIds.length > 0
      ? questions.filter((question) => chosenQuestionIds.includes(question.id))
      : questions;
    const before = questionsToCopy.filter((question) => question.phase === "before");
    const during = questionsToCopy.filter((question) => question.phase === "during");
    const text = [
      "My first therapist call",
      "",
      "Before I book",
      ...before.map((question) => `• ${question.text}`),
      "",
      "During the conversation",
      ...during.map((question) => `• ${question.text}`),
      "",
      "After the call",
      ...AFTER_CALL_REFLECTIONS.map((reflection) => `• ${reflection}`),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Questions copied. You can paste them into a private note or document.");
    } catch {
      setCopyStatus("Copy did not work in this browser. Print or save the worksheet instead.");
    }
  }

  const before = questions.filter((question) => question.phase === "before");
  const during = questions.filter((question) => question.phase === "during");

  return (
    <section aria-labelledby="worksheet-heading" className="worksheet-print-root rounded-[2rem] border border-rule/80 bg-white p-6 shadow-[0_1px_0_rgba(31,58,95,0.02),0_24px_60px_-40px_rgba(31,58,95,0.25)] md:p-10">
      <div className="worksheet-print-hide flex flex-wrap items-center justify-between gap-4 border-b border-rule/70 pb-6">
        <div>
          <p className="meta text-teal">Your private call card</p>
          <p className="mt-2 text-[14px] leading-[1.6] text-ink-soft">
            Step {step + 1} of 3 · This page does not submit or save your choices.
          </p>
        </div>
        <StepDots total={3} current={step} />
      </div>

      {step === 0 ? (
        <div className="pt-8">
          <h2
            id="worksheet-heading"
            ref={(node) => { headings.current[0] = node; }}
            tabIndex={-1}
            className="font-display text-[clamp(28px,4vw,42px)] leading-[1.08] tracking-[-0.025em] outline-none"
          >
            What would make this call useful?
          </h2>
          <p className="mt-4 max-w-2xl text-[15.5px] leading-[1.7] text-ink-soft">
            Choose up to four. You can also skip this step—the core questions still work.
          </p>
          <fieldset className="mt-8">
            <legend className="sr-only">Topics for the call</legend>
            <div className="grid gap-3 md:grid-cols-2">
              {WORKSHEET_FOCUSES.map((focus) => (
                <ChoiceChip
                  key={focus.id}
                  label={focus.label}
                  description={focus.description}
                  selected={focuses.includes(focus.id)}
                  onClick={() => toggleFocus(focus.id)}
                />
              ))}
            </div>
          </fieldset>
          <div className="mt-5 min-h-6 text-[13px] text-muted-ink" aria-live="polite">
            {notice || `${focuses.length} of ${MAX_WORKSHEET_FOCUSES} selected`}
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button onClick={() => goTo(1)}>continue</Button>
            <Button tone="ghost" onClick={() => goTo(1)}>skip this step</Button>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="pt-8">
          <h2
            id="worksheet-heading"
            ref={(node) => { headings.current[1] = node; }}
            tabIndex={-1}
            className="font-display text-[clamp(28px,4vw,42px)] leading-[1.08] tracking-[-0.025em] outline-none"
          >
            Add only the context you know.
          </h2>
          <p className="mt-4 max-w-2xl text-[15.5px] leading-[1.7] text-ink-soft">
            Every choice is optional. “Unsure” is a complete answer.
          </p>

          <div className="mt-8 space-y-9">
            <fieldset>
              <legend className="meta text-muted-ink">What kind of meeting is it?</legend>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {meetingOptions.map((option) => (
                  <ChoiceChip
                    key={option.value}
                    label={option.label}
                    description={option.description}
                    selected={meeting === option.value}
                    onClick={() => setMeeting(option.value)}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="meta text-muted-ink">Where might you meet?</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {formatOptions.map((option) => (
                  <ChoiceChip key={option.value} label={option.label} selected={format === option.value} onClick={() => setFormat(option.value)} />
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="meta text-muted-ink">How might you pay?</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {paymentOptions.map((option) => (
                  <ChoiceChip key={option.value} label={option.label} selected={payment === option.value} onClick={() => setPayment(option.value)} />
                ))}
              </div>
            </fieldset>
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button onClick={() => goTo(2)}>build my call card</Button>
            <Button tone="ghost" onClick={() => goTo(0)}>back</Button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="pt-8">
          <div className="hidden print:block">
            <p className="meta text-teal">Healing Tides Collective</p>
            <h2 className="font-display mt-3 text-[34px] leading-tight">My first therapist call</h2>
            <p className="mt-2 text-[13px] text-ink-soft">A private worksheet prepared on healingtides.co</p>
          </div>
          <div className="worksheet-print-hide">
            <p className="meta text-teal">Three questions are enough</p>
            <h2
              id="worksheet-heading"
              ref={(node) => { headings.current[2] = node; }}
              tabIndex={-1}
              className="font-display mt-3 text-[clamp(30px,4.5vw,48px)] leading-[1.04] tracking-[-0.03em] outline-none"
            >
              Your call card.
            </h2>
            <p className="mt-4 max-w-2xl text-[15.5px] leading-[1.7] text-ink-soft">
              Choose up to three for the conversation. If you leave them unmarked, printing includes the full list.
            </p>
            <p className="mt-3 text-[13px] text-muted-ink" aria-live="polite">
              {chosenQuestionIds.length} of 3 questions chosen
            </p>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-12">
            <WorksheetGroup title="Before I book" questions={before} chosenIds={chosenQuestionIds} onToggle={toggleQuestion} />
            <WorksheetGroup title="During the conversation" questions={during} chosenIds={chosenQuestionIds} onToggle={toggleQuestion} />
          </div>

          <div className="worksheet-print-group mt-10 border-t border-rule pt-8">
            <p className="meta text-teal">After the call</p>
            <h3 className="font-display mt-3 text-[25px] leading-tight">Notice, without scoring.</h3>
            <ul className="mt-5 grid gap-3 md:grid-cols-2">
              {AFTER_CALL_REFLECTIONS.map((reflection) => (
                <li key={reflection} className="flex gap-3 text-[14.5px] leading-[1.6] text-ink-soft">
                  <span aria-hidden className="mt-0.5 h-5 w-5 shrink-0 rounded border border-rule-strong/40" />
                  {reflection}
                </li>
              ))}
            </ul>
            <div className="mt-7 space-y-4" aria-label="Printed note lines">
              <p className="meta text-muted-ink">What still feels unclear?</p>
              <div className="h-px bg-rule" />
              <div className="h-px bg-rule" />
            </div>
          </div>

          <div className="worksheet-print-hide mt-10 flex flex-wrap gap-3 border-t border-rule pt-7">
            <Button onClick={() => window.print()}>print or save as PDF</Button>
            <Button tone="secondary" onClick={copyQuestions}>copy questions</Button>
            <Button tone="ghost" onClick={() => goTo(1)}>edit my choices</Button>
            <Button tone="ghost" onClick={clearAnswers}>{confirmReset ? "yes, clear and start over" : "start over"}</Button>
          </div>
          <p className="worksheet-print-hide mt-4 min-h-5 text-[13px] leading-[1.5] text-muted-ink" aria-live="polite">
            {copyStatus}
          </p>
        </div>
      ) : null}
    </section>
  );
}

function WorksheetGroup({
  title,
  questions,
  chosenIds,
  onToggle,
}: {
  title: string;
  questions: WorksheetQuestion[];
  chosenIds: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <section className="worksheet-print-group" aria-label={title}>
      <p className="meta text-teal">{title}</p>
      <ol className="mt-4 divide-y divide-rule/70 border-y border-rule/70">
        {questions.map((question, index) => (
          <li
            key={question.id}
            className={chosenIds.length > 0 && !chosenIds.includes(question.id) ? "print:hidden" : ""}
          >
            <button
              type="button"
              aria-pressed={chosenIds.includes(question.id)}
              onClick={() => onToggle(question.id)}
              className="worksheet-print-question group grid w-full grid-cols-[32px_1fr_auto] gap-3 py-4 text-left focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/15"
            >
              <span className="meta pt-0.5 text-muted-ink">{String(index + 1).padStart(2, "0")}</span>
              <span className="text-[15px] leading-[1.65] text-charcoal">{question.text}</span>
              <span
                aria-hidden
                className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] transition-colors ${
                  chosenIds.includes(question.id)
                    ? "border-charcoal bg-charcoal text-sand"
                    : "border-rule-strong/35 text-transparent group-hover:border-charcoal/60"
                }`}
              >
                ✓
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
