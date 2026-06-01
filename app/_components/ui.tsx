"use client";

import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode, type AnchorHTMLAttributes } from "react";

/* ---------- Section header ---------- */
export function SectionHeader({
  eyebrow,
  title,
  body,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      {eyebrow ? <p className="meta text-ink-muted">{eyebrow}</p> : null}
      <h1 className="font-display mt-4 text-[clamp(34px,5vw,52px)] leading-[1.05] tracking-[-0.02em] text-charcoal">
        {title}
      </h1>
      {body ? (
        <p className="mt-5 max-w-2xl text-[17px] leading-[1.65] text-ink-soft">{body}</p>
      ) : null}
    </div>
  );
}

/* ---------- Card surface ---------- */
export function Card({
  children,
  className = "",
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  return (
    <As
      className={`rounded-3xl border border-rule/80 bg-white p-7 shadow-[0_1px_0_rgba(31,58,95,0.02),0_18px_40px_-32px_rgba(31,58,95,0.18)] md:p-8 ${className}`}
    >
      {children}
    </As>
  );
}

/* ---------- Primary / secondary buttons ---------- */
type BtnTone = "primary" | "secondary" | "ghost" | "danger";
const toneClasses: Record<BtnTone, string> = {
  primary:
    "bg-charcoal text-sand hover:bg-charcoal/90 focus-visible:ring-charcoal/40",
  secondary:
    "border border-charcoal/20 bg-white text-charcoal hover:border-charcoal/40 hover:bg-sand-deep/50 focus-visible:ring-charcoal/20",
  ghost:
    "text-ink-soft hover:text-charcoal focus-visible:ring-charcoal/15",
  danger:
    "border border-ocean/30 bg-white text-ocean hover:bg-ocean/5 focus-visible:ring-ocean/30",
};

export function Button({
  children,
  tone = "primary",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: BtnTone }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] font-medium tracking-[0.01em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-sand disabled:cursor-not-allowed disabled:opacity-50 ${toneClasses[tone]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  href,
  tone = "primary",
  className = "",
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; tone?: BtnTone }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] font-medium tracking-[0.01em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-sand ${toneClasses[tone]} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}

/* ---------- Field group ---------- */
export function Field({
  label,
  hint,
  children,
  optional,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <span className="meta block text-ink-muted">
        {label}
        {optional ? <span className="ml-2 normal-case tracking-normal text-ink-muted/80">— optional</span> : null}
      </span>
      <div className="mt-3">{children}</div>
      {hint ? <p className="mt-2 text-[13px] leading-[1.5] text-ink-muted">{hint}</p> : null}
    </label>
  );
}

const baseInput =
  "w-full rounded-2xl border border-rule bg-white px-5 py-3.5 text-[15px] text-charcoal placeholder:text-ink-muted/70 focus:border-charcoal focus:outline-none focus:ring-2 focus:ring-charcoal/10 transition-colors";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${baseInput} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${baseInput} min-h-[140px] resize-y leading-[1.6] ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${baseInput} appearance-none pr-10 ${props.className ?? ""}`} />;
}

/* ---------- Chip / pill choices ---------- */
export function ChoiceChip({
  label,
  selected = false,
  onClick,
  description,
}: {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group flex w-full items-start gap-4 rounded-2xl border px-5 py-4 text-left transition-colors ${
        selected
          ? "border-charcoal bg-charcoal text-sand"
          : "border-rule bg-white text-charcoal hover:border-charcoal/40 hover:bg-sand-deep/40"
      }`}
    >
      <span
        aria-hidden
        className={`mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
          selected ? "border-sand bg-sand text-charcoal" : "border-rule-strong/40"
        }`}
      >
        {selected ? <span className="block h-1.5 w-1.5 rounded-full bg-charcoal" /> : null}
      </span>
      <span className="flex flex-col">
        <span className="text-[15px] font-medium leading-tight">{label}</span>
        {description ? (
          <span
            className={`mt-1 text-[13px] leading-[1.5] ${
              selected ? "text-sand/75" : "text-ink-muted"
            }`}
          >
            {description}
          </span>
        ) : null}
      </span>
    </button>
  );
}

/* ---------- Step indicator ---------- */
export function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-2" aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-[6px] rounded-full transition-all ${
            i === current
              ? "w-8 bg-charcoal"
              : i < current
                ? "w-2 bg-charcoal/50"
                : "w-2 bg-rule"
          }`}
        />
      ))}
    </div>
  );
}

/* ---------- Status pill ---------- */
const statusTones: Record<string, string> = {
  New: "bg-seafoam/60 text-ocean",
  Reviewed: "bg-sand-deep text-charcoal",
  "Shortlist in progress": "bg-sage/40 text-ocean",
  Introduced: "bg-ocean/10 text-ocean",
  Archived: "bg-rule/40 text-ink-muted",
  Approved: "bg-sage/30 text-ocean",
  Pending: "bg-sand-deep text-ink-soft",
  Paused: "bg-rule/40 text-ink-muted",
};

export function StatusPill({ status }: { status: string }) {
  const tone = statusTones[status] ?? "bg-sand-deep text-ink-soft";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium tracking-[0.04em] ${tone}`}
    >
      {status}
    </span>
  );
}

/* ---------- Layout helpers ---------- */
export function Container({
  children,
  size = "default",
  className = "",
}: {
  children: ReactNode;
  size?: "narrow" | "default" | "wide";
  className?: string;
}) {
  const max =
    size === "narrow" ? "max-w-[720px]" : size === "wide" ? "max-w-[1280px]" : "max-w-[960px]";
  return (
    <div className={`mx-auto w-full px-6 md:px-10 ${max} ${className}`}>{children}</div>
  );
}

/* ---------- Definition list rows ---------- */
export function DLRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 border-t border-rule/70 py-4 md:grid-cols-[200px_1fr] md:gap-6">
      <dt className="meta text-ink-muted">{label}</dt>
      <dd className="text-[15px] leading-[1.6] text-charcoal">{children}</dd>
    </div>
  );
}
