"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  MotionConfig,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { photos, type PhotoKey } from "@/app/_lib/images";

type Chapter = {
  index: string;
  label: string;
  photoKey: PhotoKey;
  align: "left" | "right" | "center";
  tone: "light" | "dark";
};

const chapters: Chapter[] = [
  { index: "01", label: "Mission", photoKey: "threshold", align: "left", tone: "dark" },
  { index: "02", label: "Modalities", photoKey: "studio", align: "left", tone: "dark" },
  { index: "03", label: "How", photoKey: "practice", align: "right", tone: "dark" },
  { index: "04", label: "Practitioners", photoKey: "acupuncture", align: "left", tone: "dark" },
  { index: "05", label: "Questions", photoKey: "teaPour", align: "right", tone: "dark" },
  { index: "06", label: "Begin", photoKey: "sunsetGather", align: "center", tone: "dark" },
];

const modalityCards = [
  {
    name: "Therapy",
    line: "Licensed clinicians who answer the phone before the pitch.",
  },
  {
    name: "Acupuncture",
    line: "Practitioners with a real clinical record, not a weekend course.",
  },
  {
    name: "Reiki",
    line: "Energy work held with care and clear consent. No mystique theatre.",
  },
  {
    name: "Movement",
    line: "Teachers who work with adult bodies. Yoga, somatics, breath.",
  },
  {
    name: "Trauma-informed",
    line: "Across modalities. Pace set by you, never by the practitioner.",
  },
];

const steps = [
  {
    n: "01",
    title: "Tell us where you are.",
    body: "Two paragraphs is plenty. Plain language. We do not send you a form.",
  },
  {
    n: "02",
    title: "Read the shortlist.",
    body: "Three to five practitioners chosen by a person. Each named with a reason.",
  },
  {
    n: "03",
    title: "Begin.",
    body: "Reply to the practitioner directly. The relationship is yours from the first message.",
  },
];

const faqs = [
  {
    q: "Is this a directory?",
    a: "No. A directory hands you a list and walks away. We hand you a shortlist with the reasoning, written by a person.",
  },
  {
    q: "How are practitioners vetted?",
    a: "License where applicable, training where it matters, working relationship where neither is enough. We turn away more than we accept.",
  },
  {
    q: "Clinical or holistic?",
    a: "Both. Side by side. Without a hierarchy. A licensed therapist and a craniosacral practitioner can both be the right answer.",
  },
  {
    q: "What about my privacy?",
    a: "Your story is yours. We never sell your information. Practitioners only learn what you choose to share.",
  },
];

function PinnedHeadline({
  eyebrow,
  children,
  body,
  align = "left",
  isFirst = false,
}: {
  eyebrow: string;
  children: React.ReactNode;
  body?: React.ReactNode;
  align?: "left" | "right" | "center";
  /** First chapter is on screen at page load — render visible from first paint, no fade-in. */
  isFirst?: boolean;
}) {
  const justify =
    align === "right" ? "items-end text-right" : align === "center" ? "items-center text-center" : "items-start text-left";
  const maxW = align === "center" ? "max-w-3xl" : "max-w-2xl";
  return (
    <motion.div
      className={`flex flex-col ${justify} ${maxW}`}
      initial={isFirst ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.5 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="meta text-seafoam/90">{eyebrow}</span>
      <h2 className="font-display mt-6 text-[clamp(40px,7vw,96px)] leading-[0.92] tracking-[-0.035em] text-sand">
        {children}
      </h2>
      {body ? (
        <p className="mt-8 max-w-xl text-[17px] leading-[1.7] text-sand/85 md:text-lg">
          {body}
        </p>
      ) : null}
    </motion.div>
  );
}

function ChapterPhoto({
  photoKey,
  i,
  total,
  progress,
  priority = false,
}: {
  photoKey: PhotoKey;
  i: number;
  total: number;
  progress: MotionValue<number>;
  priority?: boolean;
}) {
  const photo = photos[photoKey];
  const opacity = useTransform(progress, (v) => {
    const center = i / (total - 1);
    const window = 1 / (total - 1);
    const distance = Math.abs(v - center);
    if (distance >= window) return 0;
    const t = 1 - distance / window;
    return Math.pow(t, 1.4);
  });
  const scale = useTransform(progress, (v) => {
    const center = i / (total - 1);
    const distance = Math.abs(v - center);
    return 1.05 - Math.min(0.05, distance * 0.5);
  });
  return (
    <motion.div
      className="absolute inset-0 will-change-[opacity,transform]"
      style={{ opacity, scale }}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-charcoal/55" />
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(80% 60% at 50% 100%, rgba(31,58,95,0.35) 0%, transparent 60%)",
        }}
      />
    </motion.div>
  );
}

function ChapterIndexRow({
  chapter,
  i,
  active,
}: {
  chapter: Chapter;
  i: number;
  active: MotionValue<number>;
}) {
  const dotOpacity = useTransform(active, (v) => {
    const distance = Math.abs(v - i);
    return Math.max(0.18, 1 - distance * 0.7);
  });
  const dotScale = useTransform(active, (v) => {
    const distance = Math.abs(v - i);
    return distance < 0.5 ? 1 : 0.55;
  });
  return (
    <li className="flex items-center" aria-label={`${chapter.index} / ${chapter.label}`}>
      <motion.span
        className="block h-[8px] w-[8px] rounded-full bg-sand"
        style={{ opacity: dotOpacity, scale: dotScale }}
      />
    </li>
  );
}

function ChapterIndex({ active }: { active: MotionValue<number> }) {
  return (
    <div className="pointer-events-none fixed left-5 top-1/2 z-30 hidden -translate-y-1/2 md:block">
      <ul className="flex flex-col gap-5">
        {chapters.map((c, i) => (
          <ChapterIndexRow key={c.label} chapter={c} i={i} active={active} />
        ))}
      </ul>
    </div>
  );
}

function ChapterBadge({ active }: { active: MotionValue<number> }) {
  const total = chapters.length;
  const badgeOpacity = useTransform(active, (v) => 0.6 + (v / (total - 1)) * 0.4);
  return (
    <div className="pointer-events-none fixed right-6 top-6 z-30 hidden md:block">
      <div className="flex items-baseline gap-3 rounded-full border border-sand/20 bg-charcoal/40 px-4 py-2 backdrop-blur-md">
        <motion.span
          className="font-display text-sand text-lg leading-none"
          style={{ opacity: badgeOpacity }}
        >
          <ChapterReadout active={active} />
        </motion.span>
      </div>
    </div>
  );
}

function ChapterReadout({ active }: { active: MotionValue<number> }) {
  const total = chapters.length;
  const indexLabel = useTransform(active, (v) => {
    const i = Math.min(total - 1, Math.max(0, Math.round(v)));
    return `${chapters[i].index} / ${total.toString().padStart(2, "0")}  ${chapters[i].label}`;
  });
  return <motion.span>{indexLabel}</motion.span>;
}

function ProgressBar({ progress }: { progress: MotionValue<number> }) {
  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-40 h-[2px] origin-left bg-seafoam/80"
      style={{ scaleX: progress }}
    />
  );
}

export default function ImmersiveScrollDesign() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const modalitiesRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.4,
  });

  const total = chapters.length;
  const active = useTransform(smoothProgress, (v) => v * (total - 1));

  const { scrollYProgress: modProgress } = useScroll({
    target: modalitiesRef,
    offset: ["start end", "end start"],
  });
  const modX = useTransform(modProgress, [0.0, 1.0], ["6%", "-58%"]);

  return (
    <MotionConfig reducedMotion="user">
      <ProgressBar progress={smoothProgress} />
      <ChapterIndex active={active} />
      <ChapterBadge active={active} />

      <a
        href="#begin"
        className="meta fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-full bg-sand/95 px-5 py-3 text-charcoal shadow-[0_18px_40px_-20px_rgba(0,0,0,0.6)] transition-colors hover:bg-seafoam"
      >
        Begin <span aria-hidden>→</span>
      </a>

      <main
        ref={containerRef}
        className="relative bg-charcoal text-sand"
      >
        {/* Sticky photo stack — one fixed canvas, photos crossfade by scroll progress */}
        <div className="pointer-events-none sticky top-0 h-[100dvh] w-full overflow-hidden">
          {chapters.map((c, i) => (
            <ChapterPhoto
              key={c.photoKey}
              photoKey={c.photoKey}
              i={i}
              total={total}
              progress={smoothProgress}
              priority={i === 0}
            />
          ))}
          {/* Persistent vignette + grain */}
          <div
            className="absolute inset-0"
            aria-hidden
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 30%, transparent 65%, rgba(0,0,0,0.55) 100%)",
            }}
          />
        </div>

        {/* Content panels — stacked above the sticky background, each pulls itself up by 100dvh */}
        <div className="relative z-10 -mt-[100dvh]">
          {/* Chapter 01 — Mission */}
          <section
            id="mission"
            className="relative flex min-h-[100dvh] items-center px-6 py-24 md:px-16"
          >
            <div className="mx-auto w-full max-w-[1400px]">
              <PinnedHeadline
                eyebrow={`${chapters[0].index} / ${chapters[0].label}`}
                body={
                  <>
                    A guided care-matching service that replaces overwhelming directories with a shortlist
                    written by a person. Therapy, acupuncture, reiki, movement-based care, and
                    trauma-informed support. Held side by side, without a hierarchy.
                  </>
                }
                align={chapters[0].align}
                isFirst
              >
                Less searching.
                <br />
                <span className="italic text-seafoam">More healing.</span>
              </PinnedHeadline>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="mt-16 flex flex-wrap items-center gap-x-6 gap-y-3"
              >
                {modalityCards.map((m) => (
                  <span
                    key={m.name}
                    className="rounded-full border border-sand/25 bg-charcoal/30 px-4 py-2 text-sm text-sand backdrop-blur-md"
                  >
                    {m.name}
                  </span>
                ))}
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 1.4, delay: 0.5 }}
                className="meta mt-24 text-sand/70"
              >
                Scroll to continue ↓
              </motion.p>
            </div>
          </section>

          {/* Chapter 02 — Modalities (horizontal slide) */}
          <section
            ref={modalitiesRef}
            className="relative min-h-[180vh] px-6 md:px-16"
          >
            <div className="sticky top-0 flex h-[100dvh] flex-col justify-center">
              <div className="mx-auto w-full max-w-[1400px]">
                <PinnedHeadline
                  eyebrow={`${chapters[1].index} / ${chapters[1].label}`}
                  align={chapters[1].align}
                  body="Five forms of care, held in one collective. None ranked above the other. The right one is the one that breathes right for you."
                >
                  Care, held
                  <br />
                  <span className="italic text-seafoam">side by side.</span>
                </PinnedHeadline>

                <div className="mt-14 overflow-hidden">
                  <motion.ul
                    style={{ x: modX }}
                    className="flex w-max gap-6 will-change-transform"
                  >
                    {modalityCards.map((m, i) => (
                      <li
                        key={m.name}
                        className="w-[78vw] max-w-[380px] shrink-0 rounded-3xl border border-sand/15 bg-charcoal/45 p-8 backdrop-blur-md md:w-[34vw]"
                      >
                        <span className="meta text-seafoam">
                          {String(i + 1).padStart(2, "0")} / Modality
                        </span>
                        <h3 className="font-display mt-6 text-3xl leading-tight text-sand">
                          {m.name}
                        </h3>
                        <p className="mt-4 text-[15px] leading-[1.7] text-sand/80">{m.line}</p>
                      </li>
                    ))}
                  </motion.ul>
                </div>
              </div>
            </div>
          </section>

          {/* Chapter 03 — How it works */}
          <section
            id="how"
            className="relative flex min-h-[100dvh] items-center px-6 py-24 md:px-16"
          >
            <div className="mx-auto w-full max-w-[1400px]">
              <div className="ml-auto">
                <PinnedHeadline
                  eyebrow={`${chapters[2].index} / ${chapters[2].label}`}
                  align={chapters[2].align}
                  body="No forms. No theatre. No algorithm pretending to know you."
                >
                  Three steps.
                  <br />
                  <span className="italic text-seafoam">No theatre.</span>
                </PinnedHeadline>
              </div>

              <ol className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3">
                {steps.map((s, i) => (
                  <motion.li
                    key={s.n}
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.4 }}
                    transition={{
                      duration: 0.8,
                      delay: 0.15 * i,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="rounded-3xl border border-sand/15 bg-charcoal/40 p-8 backdrop-blur-md md:p-10"
                  >
                    <span className="font-display text-5xl leading-none text-seafoam md:text-6xl">
                      {s.n}
                    </span>
                    <h3 className="font-display mt-8 text-2xl leading-tight text-sand md:text-[28px]">
                      {s.title}
                    </h3>
                    <p className="mt-4 text-[15px] leading-[1.7] text-sand/80">{s.body}</p>
                  </motion.li>
                ))}
              </ol>
            </div>
          </section>

          {/* Chapter 04 — Practitioners */}
          <section
            id="practitioners"
            className="relative flex min-h-[100dvh] items-center px-6 py-24 md:px-16"
          >
            <div className="mx-auto w-full max-w-[1400px]">
              <PinnedHeadline
                eyebrow={`${chapters[3].index} / ${chapters[3].label}`}
                align={chapters[3].align}
                body="A streamlined referral pipeline. Each introduction arrives with context: what the seeker is working on, what they have tried, why we picked you. Aligned clients, not lead lists."
              >
                Fewer leads.
                <br />
                <span className="italic text-seafoam">Better fits.</span>
              </PinnedHeadline>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="mt-12 grid max-w-3xl grid-cols-3 gap-4"
              >
                {[
                  { n: "1:1", l: "Every introduction reviewed by a person" },
                  { n: "0%", l: "Per-lead fees, ever" },
                  { n: "5d", l: "Median time to first reply" },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="rounded-2xl border border-sand/15 bg-charcoal/40 p-5 backdrop-blur-md"
                  >
                    <p className="font-display text-3xl text-seafoam md:text-4xl">{s.n}</p>
                    <p className="mt-3 text-xs leading-snug text-sand/75">{s.l}</p>
                  </div>
                ))}
              </motion.div>

              <motion.a
                href="mailto:practitioners@healingtides.co"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="meta mt-10 inline-flex items-center gap-2 border border-sand/40 px-6 py-4 text-sand transition-colors hover:bg-sand hover:text-charcoal"
              >
                Apply to join the collective →
              </motion.a>
            </div>
          </section>

          {/* Chapter 05 — FAQ */}
          <section
            id="faq"
            className="relative flex min-h-[100dvh] items-center px-6 py-24 md:px-16"
          >
            <div className="mx-auto w-full max-w-[1400px]">
              <div className="ml-auto max-w-2xl">
                <PinnedHeadline
                  eyebrow={`${chapters[4].index} / ${chapters[4].label}`}
                  align={chapters[4].align}
                >
                  Things to ask
                  <br />
                  <span className="italic text-seafoam">before you write.</span>
                </PinnedHeadline>
              </div>

              <ul className="mt-12 ml-auto max-w-2xl divide-y divide-sand/15 border-t border-sand/15">
                {faqs.map((f, i) => (
                  <motion.li
                    key={f.q}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{
                      duration: 0.7,
                      delay: 0.1 * i,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="py-6"
                  >
                    <h3 className="font-display text-xl leading-snug text-sand md:text-2xl">
                      {f.q}
                    </h3>
                    <p className="mt-3 text-[15px] leading-[1.7] text-sand/80">{f.a}</p>
                  </motion.li>
                ))}
              </ul>
            </div>
          </section>

          {/* Chapter 06 — Begin */}
          <section
            id="begin"
            className="relative flex min-h-[100dvh] items-center px-6 py-24 md:px-16"
          >
            <div
              className="absolute inset-0 -z-0"
              aria-hidden
              style={{
                background:
                  "radial-gradient(50% 60% at 50% 60%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.85) 100%)",
              }}
            />
            <div className="relative mx-auto w-full max-w-[900px] text-center">
              <PinnedHeadline
                eyebrow={`${chapters[5].index} / ${chapters[5].label}`}
                align="center"
                body="Tell us where you are. We answer with names, by name, within five business days. The first match is free."
              >
                Two paragraphs.
                <br />
                <span className="italic text-seafoam">A real reply.</span>
              </PinnedHeadline>

              <motion.form
                action="mailto:hello@healingtides.co"
                method="post"
                encType="text/plain"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto mt-12 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
              >
                <label htmlFor="email" className="sr-only">
                  Your email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@somewhere.com"
                  className="flex-1 rounded-full border border-sand/30 bg-charcoal/40 px-6 py-4 text-base text-sand placeholder:text-sand/45 backdrop-blur-md outline-none transition-colors focus:border-seafoam"
                />
                <button
                  type="submit"
                  className="meta inline-flex items-center justify-center gap-2 rounded-full bg-seafoam px-6 py-4 text-charcoal transition-colors hover:bg-sand"
                >
                  Begin →
                </button>
              </motion.form>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 1.2, delay: 0.6 }}
                className="meta mt-8 text-sand/65"
              >
                or write directly to{" "}
                <a
                  href="mailto:hello@healingtides.co"
                  className="text-seafoam underline-offset-4 hover:underline"
                >
                  hello@healingtides.co
                </a>
              </motion.p>
            </div>
          </section>

          <footer className="relative border-t border-sand/15 bg-charcoal/80 px-6 py-10 backdrop-blur-md md:px-16">
            <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-6">
              <p className="font-display text-base text-sand">Healing Tides Collective</p>
              <p className="meta text-sand/60">© 2026 / Care, matched. By a person.</p>
            </div>
          </footer>
        </div>
      </main>
    </MotionConfig>
  );
}
