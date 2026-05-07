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
    line: "Licensed clinicians who pick up the phone before the pitch.",
  },
  {
    name: "Acupuncture",
    line: "Practitioners with a real clinical record. Not a weekend course.",
  },
  {
    name: "Reiki",
    line: "Energy work, held with care. Clear consent, no mysticism.",
  },
  {
    name: "Movement",
    line: "Teachers who work with adult bodies. Yoga, somatics, breath.",
  },
  {
    name: "Trauma-informed",
    line: "Across every modality. You set the pace. Not the practitioner.",
  },
];

const steps = [
  {
    n: "01",
    title: "Tell us where you are.",
    body: "Two paragraphs is plenty. Plain language. No forms.",
  },
  {
    n: "02",
    title: "Read the shortlist.",
    body: "Three to five practitioners, chosen by a person. Each one with a reason.",
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
    a: "No. A directory hands you a list and walks away. We hand you a shortlist with the reasoning, written by a person who read what you sent.",
  },
  {
    q: "How are practitioners vetted?",
    a: "Licensing when it applies. Training when it matters. A working relationship when neither is enough. We turn away more practitioners than we accept.",
  },
  {
    q: "Clinical or holistic?",
    a: "Both, side by side, without a hierarchy. A licensed therapist and a craniosacral practitioner can both be the right answer.",
  },
  {
    q: "What about my privacy?",
    a: "Your story is yours. We never sell it. Practitioners only learn what you decide to share.",
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
  // Center-aligned headlines need mx-auto on the flex container itself so the
  // 768px max-w-3xl box centers within its parent — without it the box pins
  // to the parent's left edge and the headline visually shifts left of any
  // sibling block-level content (e.g. the dual CTA grid in chapter 06).
  const maxW = align === "center" ? "max-w-3xl mx-auto" : "max-w-2xl";
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
  progress,
  priority = false,
}: {
  photoKey: PhotoKey;
  // Per-section scroll progress: 0 = section just entering bottom of viewport,
  // 0.5 = section centered in viewport, 1 = section just exiting top.
  // Math holds for any section height (100vh, 180vh, etc.).
  progress: MotionValue<number>;
  priority?: boolean;
}) {
  const photo = photos[photoKey];
  // Peak opacity while section straddles viewport center. The plateau between
  // 0.42 and 0.58 keeps the photo at full strength through the natural reading
  // window. Symmetric ramps make adjacent chapters crossfade evenly.
  const opacity = useTransform(progress, [0, 0.32, 0.42, 0.58, 0.68, 1], [0, 0.85, 1, 1, 0.85, 0]);
  // Subtle parallax: photo grows from 1.04 to 1.10 as the section travels through.
  const scale = useTransform(progress, [0, 1], [1.04, 1.1]);
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

/**
 * PersistentBeginCTA — a floating pill that anchors to #begin.
 * Visible only while the user is moving through chapters 01-05.
 * Hidden on the hero/chapter-00 (so the page opens clean) and on
 * the Begin chapter itself (it's already the destination).
 *
 * Reduced-motion users get a hard show/hide via display toggle.
 */
function PersistentBeginCTA({ active }: { active: MotionValue<number> }) {
  // Visible window: 0.5 ≤ active ≤ 5.5 (chapters 01..05 inclusive).
  // We bind pointer-events to opacity sign so the hidden CTA cannot steal taps.
  // Using opacity (animatable) + visibility (snap on/off) gives a calm fade
  // without ever rendering display:none mid-flight (which would break Tab focus
  // trap timing for keyboard users).
  const opacity = useTransform(active, (v) => (v < 0.5 || v > 5.5 ? 0 : 1));
  const visibility = useTransform<number, "hidden" | "visible">(active, (v) =>
    v < 0.5 || v > 5.5 ? "hidden" : "visible",
  );
  const pointerEvents = useTransform<number, "none" | "auto">(active, (v) =>
    v < 0.5 || v > 5.5 ? "none" : "auto",
  );
  return (
    <motion.a
      href="#begin"
      aria-label="Jump to Begin section"
      className="group meta fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-full bg-sand/95 px-5 py-3 text-charcoal shadow-[0_18px_40px_-20px_rgba(0,0,0,0.6)] backdrop-blur-md transition-colors hover:bg-seafoam focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-seafoam focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal sm:bottom-8 sm:right-8"
      style={{ opacity, visibility, pointerEvents }}
      transition={{ opacity: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
    >
      Begin
      <span aria-hidden className="flex h-6 w-6 items-center justify-center rounded-full bg-charcoal/10 text-[11px] transition-transform group-hover:translate-x-0.5">→</span>
    </motion.a>
  );
}

export default function ImmersiveScrollDesign() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const missionRef = useRef<HTMLElement | null>(null);
  const modalitiesRef = useRef<HTMLElement | null>(null);
  const howRef = useRef<HTMLElement | null>(null);
  const practitionersRef = useRef<HTMLElement | null>(null);
  const faqRef = useRef<HTMLElement | null>(null);
  const beginRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.4,
  });

  const total = chapters.length;
  const active = useTransform(smoothProgress, (v) => v * (total - 1));

  // Per-section scroll progress drives each ChapterPhoto crossfade so that the
  // visible chapter's photo peaks when its section is centered in the viewport,
  // regardless of section height (Modalities is 180vh, others ~100vh).
  const { scrollYProgress: missionProgress } = useScroll({
    target: missionRef,
    offset: ["start end", "end start"],
  });
  const { scrollYProgress: modProgress } = useScroll({
    target: modalitiesRef,
    offset: ["start end", "end start"],
  });
  const { scrollYProgress: howProgress } = useScroll({
    target: howRef,
    offset: ["start end", "end start"],
  });
  const { scrollYProgress: practitionersProgress } = useScroll({
    target: practitionersRef,
    offset: ["start end", "end start"],
  });
  const { scrollYProgress: faqProgress } = useScroll({
    target: faqRef,
    offset: ["start end", "end start"],
  });
  const { scrollYProgress: beginProgress } = useScroll({
    target: beginRef,
    offset: ["start end", "end start"],
  });
  const sectionProgresses = [
    missionProgress,
    modProgress,
    howProgress,
    practitionersProgress,
    faqProgress,
    beginProgress,
  ];

  // Desktop scroll-driven horizontal pan inside the Modalities section.
  // PIN-THEN-PAN UX: pan only runs while the section is sticky/pinned in the
  // viewport — i.e. from when the section top reaches the viewport top until
  // the section bottom reaches the viewport bottom. Before that, the section
  // is still scrolling INTO view (cards stay flush at start). After that,
  // the section is scrolling OUT of view (cards stay flush at end).
  //
  // Offset ["start start", "end end"] is what gives us the "while pinned"
  // semantics — distinct from modProgress (offset ["start end", "end start"])
  // which spans the entire viewport-entry-to-viewport-exit and is correct
  // for the photo crossfade above.
  const { scrollYProgress: modPanProgress } = useScroll({
    target: modalitiesRef,
    offset: ["start start", "end end"],
  });
  // Symmetric inset: at pan start, container shifted +20% right (cards 1-2
  // visible with empty space to the LEFT of card 1, mirroring the right-side
  // empty space at pan end). At pan end, container shifted -57% (cards 4-5
  // flush right with empty space on the right). This matches Greg's note
  // that the start of the cards should not hug the viewport edge.
  const modX = useTransform(modPanProgress, [0, 1], ["20%", "-57%"]);

  // Begin section overlay: darken the photo background as the section scrolls
  // into view rather than via a static semi-transparent square in the middle.
  const beginOverlayOpacity = useTransform(beginProgress, [0.15, 0.55], [0, 1]);

  return (
    <MotionConfig reducedMotion="user">
      <ProgressBar progress={smoothProgress} />
      <ChapterIndex active={active} />
      <ChapterBadge active={active} />
      <PersistentBeginCTA active={active} />

      <main
        id="main-content"
        ref={containerRef}
        className="relative bg-charcoal text-sand"
      >
        {/* Sticky photo stack — one fixed canvas, photos crossfade by scroll progress */}
        <div className="pointer-events-none sticky top-0 h-[100dvh] w-full overflow-hidden">
          {chapters.map((c, i) => (
            <ChapterPhoto
              key={c.photoKey}
              photoKey={c.photoKey}
              progress={sectionProgresses[i]}
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
            ref={missionRef}
            id="mission"
            className="relative flex min-h-[100dvh] items-center px-6 py-24 md:px-16"
          >
            <div className="mx-auto w-full max-w-[1400px]">
              <PinnedHeadline
                eyebrow={`${chapters[0].index} / ${chapters[0].label}`}
                body={
                  <>
                    Therapy, acupuncture, reiki, movement, trauma-informed care.
                    Held side by side, without a hierarchy. A person reads what you
                    sent and writes back with three to five names.
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

          {/* Chapter 02 — Modalities (horizontal slide on desktop, native snap carousel on mobile) */}
          <section
            ref={modalitiesRef}
            className="relative md:min-h-[180vh] px-0 md:px-16"
          >
            {/* Desktop: sticky scroll-driven pan. Mobile: native snap-x carousel that doesn't fight page scroll. */}
            <div className="md:sticky md:top-0 md:flex md:h-[100dvh] md:flex-col md:justify-center px-6 py-24 md:py-0">
              <div className="mx-auto w-full max-w-[1400px]">
                <PinnedHeadline
                  eyebrow={`${chapters[1].index} / ${chapters[1].label}`}
                  align={chapters[1].align}
                  body="Five forms of care in one collective. None outranks another. The right one is the one that fits when you sit with it."
                >
                  Care, held
                  <br />
                  <span className="italic text-seafoam">side by side.</span>
                </PinnedHeadline>
              </div>

              {/* Mobile: snap-x snap-mandatory horizontal scroll. Desktop: scroll-driven motion pan
                  inside an overflow-hidden viewport-width clip. No fade mask — pin-then-pan UX
                  keeps the first card flush-left at start and the last card flush-right at end,
                  so cards are fully visible at rest. Hard card edges during the active pan
                  read as intentional motion, not as truncation. */}
              <div className="mt-14 md:overflow-hidden">
                {/* Mobile carousel */}
                <ul className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {modalityCards.map((m, i) => (
                    <li
                      key={m.name}
                      className="w-[78vw] shrink-0 snap-center rounded-3xl border border-sand/15 bg-charcoal/45 p-8 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)]"
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
                </ul>
                {/* Desktop scroll-driven pan. Mask is on the wrapper above
                    (the overflow-hidden viewport-width clip), NOT on this ul,
                    so the gradient measures across the visible region rather
                    than across the 5-card-wide ul which would hide the
                    leading/trailing cards. */}
                <motion.ul
                  style={{ x: modX }}
                  className="hidden md:flex w-max gap-6 will-change-transform"
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
          </section>

          {/* Chapter 03 — How it works */}
          <section
            ref={howRef}
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
                    className="rounded-3xl border border-sand/15 bg-charcoal/40 p-8 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)] md:p-10"
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
            ref={practitionersRef}
            id="practitioners"
            className="relative flex min-h-[100dvh] items-center px-6 py-24 md:px-16"
          >
            <div className="mx-auto w-full max-w-[1400px]">
              <PinnedHeadline
                eyebrow={`${chapters[3].index} / ${chapters[3].label}`}
                align={chapters[3].align}
                body="Real referrals, not lead lists. Each introduction arrives with context — what the seeker is working on, what they have tried, why we picked you."
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
                    className="rounded-2xl border border-sand/15 bg-charcoal/40 p-5 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)]"
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
            ref={faqRef}
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

          {/* Chapter 06 — Begin (dual CTAs: client + practitioner) */}
          <section
            ref={beginRef}
            id="begin"
            className="relative flex min-h-[100dvh] items-center px-6 py-24 md:px-16"
          >
            {/* Vertical scroll-driven darkening: as the section scrolls into
                viewport the overlay opacity ramps from 0 to 1, so the photo
                background gradually deepens to charcoal as the user enters
                Begin instead of a static semi-transparent square sitting in
                the middle of the section. */}
            <motion.div
              className="absolute inset-0 -z-0 bg-gradient-to-b from-charcoal/40 via-charcoal/70 to-charcoal/95"
              style={{ opacity: beginOverlayOpacity }}
              aria-hidden
            />
            <div className="relative mx-auto w-full max-w-[900px] text-center">
              <PinnedHeadline
                eyebrow={`${chapters[5].index} / ${chapters[5].label}`}
                align="center"
              >
                Begin.
              </PinnedHeadline>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto mt-14 grid w-full max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-5"
              >
                {/* Primary — client / seeker */}
                <a
                  href="mailto:hello@healingtides.co?subject=Get%20matched"
                  className="group relative flex flex-col rounded-3xl bg-seafoam p-7 text-left text-charcoal shadow-[0_18px_40px_-20px_rgba(0,0,0,0.6)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal sm:p-8"
                >
                  <span className="meta text-charcoal/70">For seekers</span>
                  <span className="font-display mt-4 text-2xl leading-tight md:text-[26px]">
                    I&rsquo;m seeking care
                  </span>
                  <span className="mt-4 text-[14px] leading-[1.6] text-charcoal/80">
                    Two paragraphs. We choose the right person.
                  </span>
                  <span
                    aria-hidden
                    className="absolute bottom-6 right-6 flex h-9 w-9 items-center justify-center rounded-full bg-charcoal/10 text-charcoal transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:bg-charcoal/15"
                  >
                    →
                  </span>
                </a>

                {/* Secondary — practitioner */}
                <a
                  href="mailto:hello@healingtides.co?subject=Practitioner%20inquiry"
                  className="group relative flex flex-col rounded-3xl border border-sand/35 bg-charcoal/55 p-7 text-left text-sand backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.07)] transition-colors hover:border-sand/70 hover:bg-charcoal/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-seafoam focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal sm:p-8"
                >
                  <span className="meta text-sand/70">For practitioners</span>
                  <span className="font-display mt-4 text-2xl leading-tight md:text-[26px]">
                    I&rsquo;m a practitioner
                  </span>
                  <span className="mt-4 text-[14px] leading-[1.6] text-sand/80">
                    Tell us about your practice. We&rsquo;ll read it.
                  </span>
                  <span
                    aria-hidden
                    className="absolute bottom-6 right-6 flex h-9 w-9 items-center justify-center rounded-full bg-sand/10 text-sand transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:bg-sand/20"
                  >
                    →
                  </span>
                </a>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 1.2, delay: 0.6 }}
                className="meta mt-10 text-sand/65"
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
