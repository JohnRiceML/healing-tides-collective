"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  MotionConfig,
  type MotionValue,
} from "framer-motion";
import { photos, type PhotoKey } from "@/app/_lib/images";

type ChapterDef = {
  numeral: string;
  title: string;
  statement: string;
  photoKey: PhotoKey;
};

const modalities = [
  "Therapy",
  "Acupuncture",
  "Reiki",
  "Movement-based care",
  "Trauma-informed support",
];

const steps = [
  {
    n: "01",
    title: "Tell us where you are.",
    body: "A short, plain conversation. Not an intake form. We ask what you are working on, what you have tried, what feels close to right.",
  },
  {
    n: "02",
    title: "Read the shortlist.",
    body: "Three to five practitioners chosen by a person, not a search index. Each pick comes with a sentence on why they fit you, specifically.",
  },
  {
    n: "03",
    title: "Begin with the one that breathes right.",
    body: "You introduce yourself by reply or by booking. Your relationship is yours from the first message onward.",
  },
];

function FilmCard({
  numeral,
  title,
  statement,
  progress,
  cardStart = 0.05,
  cardHold = 0.55,
}: {
  numeral: string;
  title: string;
  statement: string;
  progress: MotionValue<number>;
  cardStart?: number;
  cardHold?: number;
}) {
  const fadeInEnd = cardStart + 0.08;
  const fadeOutStart = cardStart + cardHold;
  const fadeOutEnd = fadeOutStart + 0.1;

  const opacity = useTransform(
    progress,
    [cardStart, fadeInEnd, fadeOutStart, fadeOutEnd],
    [0, 1, 1, 0],
  );
  const y = useTransform(
    progress,
    [cardStart, fadeInEnd, fadeOutStart, fadeOutEnd],
    [16, 0, 0, -16],
  );

  return (
    <motion.div
      style={{ opacity, y }}
      className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center text-sand"
    >
      <p className="font-display italic text-sand/80 text-base md:text-lg tracking-[0.04em]">
        Chapter {numeral}
      </p>
      <h2
        className="font-display mt-6 leading-[0.92] tracking-[-0.035em]"
        style={{ fontSize: "clamp(44px, 8vw, 132px)" }}
      >
        {title}
      </h2>
      <p
        className="font-display mt-8 max-w-2xl italic text-sand/85 leading-tight"
        style={{ fontSize: "clamp(18px, 2vw, 28px)" }}
      >
        {statement}
      </p>
    </motion.div>
  );
}

function ChapterPhoto({
  chapter,
  progress,
  scrimOpacity,
  priority = false,
}: {
  chapter: ChapterDef;
  progress: MotionValue<number>;
  scrimOpacity: MotionValue<number>;
  priority?: boolean;
}) {
  const photo = photos[chapter.photoKey];
  const scale = useTransform(progress, [0, 1], [1.05, 1.18]);
  const y = useTransform(progress, [0, 1], ["0%", "-4%"]);

  return (
    <div className="sticky top-0 z-0 h-screen w-full overflow-hidden bg-charcoal">
      <motion.div style={{ scale, y }} className="absolute inset-0">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          priority={priority}
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>
      <motion.div
        style={{ opacity: scrimOpacity }}
        className="absolute inset-0 bg-charcoal"
      />
      <div className="pointer-events-none absolute left-6 top-10 z-10 md:left-10 md:top-14">
        <p className="font-display italic text-sand/70 text-sm md:text-base tracking-[0.06em]">
          {chapter.numeral}
        </p>
      </div>
      <div className="pointer-events-none absolute bottom-10 right-6 z-10 md:bottom-14 md:right-10">
        <p className="meta text-sand/60">Reel {chapter.numeral} / {photo.alt.split(",")[0]}</p>
      </div>
    </div>
  );
}

function ChapterOne() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const scrim = useTransform(
    scrollYProgress,
    [0, 0.55, 0.7, 1],
    [0.5, 0.5, 0.7, 0.78],
  );
  const contentOpacity = useTransform(scrollYProgress, [0.62, 0.78], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0.62, 0.82], [40, 0]);

  return (
    <section ref={ref} className="relative h-[220vh]">
      <ChapterPhoto
        chapter={{
          numeral: "I.",
          title: "The Arrival",
          statement: "She arrives at the tide. The looking is over.",
          photoKey: "threshold",
        }}
        progress={scrollYProgress}
        scrimOpacity={scrim}
        priority
      />
      <FilmCard
        numeral="I."
        title="The Arrival"
        statement="She arrives at the tide. The looking is over."
        progress={scrollYProgress}
      />
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-screen"
      >
        <div className="pointer-events-auto mx-auto flex h-full max-w-[1100px] flex-col justify-end px-6 pb-24 text-sand md:px-10 md:pb-32">
          <p className="meta text-sand/70">The mission</p>
          <h3
            className="font-display mt-6 max-w-3xl leading-[0.95] tracking-[-0.03em]"
            style={{ fontSize: "clamp(34px, 5.5vw, 76px)" }}
          >
            Less searching.
            <br />
            More <span className="text-seafoam">healing.</span>
          </h3>
          <p className="mt-8 max-w-xl text-[15px] leading-[1.75] text-sand/85 md:text-[16px]">
            A guided care-matching service that replaces overwhelming directories with a shortlist
            written by a person. Therapy, acupuncture, reiki, movement-based care, and
            trauma-informed support, held side by side.
          </p>
        </div>
      </motion.div>
    </section>
  );
}

function ChapterTwo() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const scrim = useTransform(
    scrollYProgress,
    [0, 0.55, 0.78, 1],
    [0.45, 0.5, 0.65, 0.72],
  );
  const contentOpacity = useTransform(scrollYProgress, [0.62, 0.78], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0.62, 0.82], [40, 0]);

  return (
    <section ref={ref} className="relative h-[220vh]">
      <ChapterPhoto
        chapter={{
          numeral: "II.",
          title: "The Room",
          statement: "Many practices. One quiet room.",
          photoKey: "studio",
        }}
        progress={scrollYProgress}
        scrimOpacity={scrim}
      />
      <FilmCard
        numeral="II."
        title="The Room"
        statement="Many practices. One quiet room."
        progress={scrollYProgress}
      />
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-screen"
      >
        <div className="pointer-events-auto mx-auto flex h-full max-w-[1100px] flex-col justify-end px-6 pb-24 text-sand md:px-10 md:pb-32">
          <p className="meta text-sand/70">The modalities</p>
          <h3
            className="font-display mt-6 max-w-3xl leading-[0.95] tracking-[-0.03em]"
            style={{ fontSize: "clamp(30px, 4.5vw, 60px)" }}
          >
            Care, held side by side, without a hierarchy.
          </h3>
          <ul className="mt-10 flex flex-wrap gap-x-10 gap-y-3 font-display leading-tight text-sand">
            {modalities.map((m, i) => (
              <li
                key={m}
                className={`text-2xl md:text-4xl ${i % 2 === 1 ? "italic text-seafoam" : ""}`}
              >
                {m}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  );
}

function ChapterThree() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const scrim = useTransform(
    scrollYProgress,
    [0, 0.55, 0.78, 1],
    [0.5, 0.55, 0.7, 0.78],
  );
  const contentOpacity = useTransform(scrollYProgress, [0.6, 0.78], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0.6, 0.82], [40, 0]);

  return (
    <section ref={ref} className="relative h-[260vh]">
      <ChapterPhoto
        chapter={{
          numeral: "III.",
          title: "The Practice",
          statement: "Three steps. No theatre.",
          photoKey: "practice",
        }}
        progress={scrollYProgress}
        scrimOpacity={scrim}
      />
      <FilmCard
        numeral="III."
        title="The Practice"
        statement="Three steps. No theatre."
        progress={scrollYProgress}
      />
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-screen"
      >
        <div className="pointer-events-auto mx-auto flex h-full max-w-[1100px] flex-col justify-end px-6 pb-20 text-sand md:px-10 md:pb-28">
          <p className="meta text-sand/70">How it works</p>
          <ol className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
            {steps.map((s) => (
              <li key={s.n} className="border-t border-sand/30 pt-5">
                <span className="font-display italic text-seafoam text-lg">{s.n}</span>
                <h4 className="font-display mt-3 text-xl leading-[1.15] md:text-2xl">{s.title}</h4>
                <p className="mt-3 text-[14px] leading-[1.7] text-sand/80">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </motion.div>
    </section>
  );
}

function ChapterFour() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const scrim = useTransform(
    scrollYProgress,
    [0, 0.55, 0.78, 1],
    [0.5, 0.55, 0.7, 0.78],
  );
  const contentOpacity = useTransform(scrollYProgress, [0.62, 0.78], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0.62, 0.82], [40, 0]);

  return (
    <section ref={ref} className="relative h-[220vh]">
      <ChapterPhoto
        chapter={{
          numeral: "IV.",
          title: "The Hands",
          statement: "Real practice. Real hands. Real work.",
          photoKey: "acupuncture",
        }}
        progress={scrollYProgress}
        scrimOpacity={scrim}
      />
      <FilmCard
        numeral="IV."
        title="The Hands"
        statement="Real practice. Real hands. Real work."
        progress={scrollYProgress}
      />
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-screen"
      >
        <div className="pointer-events-auto mx-auto flex h-full max-w-[1100px] flex-col justify-end px-6 pb-24 text-sand md:px-10 md:pb-32">
          <p className="meta text-sand/70">For practitioners</p>
          <h3
            className="font-display mt-6 max-w-3xl leading-[0.95] tracking-[-0.03em]"
            style={{ fontSize: "clamp(32px, 5vw, 68px)" }}
          >
            Fewer leads.
            <span className="italic text-seafoam"> Better fits.</span>
          </h3>
          <p className="mt-8 max-w-xl text-[15px] leading-[1.75] text-sand/85 md:text-[16px]">
            Each introduction arrives with context. What the seeker is working on, what they have
            tried, why we picked you. You decide whether to take the consultation. We never charge
            per lead. We never sell your information.
          </p>
          <a
            href="mailto:practitioners@healingtides.co"
            className="meta mt-10 inline-flex w-fit items-center gap-2 border border-sand/70 px-5 py-3 text-sand transition-colors hover:bg-sand hover:text-charcoal"
          >
            Apply to join the collective
          </a>
        </div>
      </motion.div>
    </section>
  );
}

function Intermission({
  sectionRef,
}: {
  sectionRef: React.RefObject<HTMLElement | null>;
}) {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const lineOpacity = useTransform(scrollYProgress, [0.32, 0.45, 0.65, 0.78], [0, 1, 1, 0]);
  const lineY = useTransform(scrollYProgress, [0.32, 0.45], [12, 0]);
  const numeralOpacity = useTransform(scrollYProgress, [0.36, 0.5], [0, 1]);
  const captionOpacity = useTransform(scrollYProgress, [0.5, 0.62], [0, 1]);

  return (
    <section
      ref={sectionRef}
      id="intermission"
      className="relative flex h-[160vh] flex-col items-center justify-start bg-sand text-charcoal"
    >
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center px-6">
        <motion.p
          style={{ opacity: numeralOpacity }}
          className="font-display italic text-ink-muted text-sm md:text-base tracking-[0.08em]"
        >
          Chapter V.
        </motion.p>
        <motion.div
          style={{ opacity: lineOpacity, y: lineY }}
          className="font-display mt-12 max-w-3xl text-center leading-[1.05] tracking-[-0.025em]"
        >
          <p style={{ fontSize: "clamp(34px, 5.5vw, 76px)" }}>A short pause.</p>
          <p
            className="mt-3 italic text-ocean"
            style={{ fontSize: "clamp(34px, 5.5vw, 76px)" }}
          >
            Then we begin.
          </p>
        </motion.div>
        <motion.p
          style={{ opacity: captionOpacity }}
          className="meta mt-16 text-ink-muted"
        >
          Intermission
        </motion.p>
      </div>
    </section>
  );
}

function ChapterSix() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const scrim = useTransform(
    scrollYProgress,
    [0, 0.55, 0.85, 1],
    [0.4, 0.5, 0.7, 0.82],
  );
  const cardOpacity = useTransform(scrollYProgress, [0.05, 0.13, 0.5, 0.6], [0, 1, 1, 0]);
  const cardY = useTransform(scrollYProgress, [0.05, 0.13, 0.5, 0.6], [16, 0, 0, -16]);
  const ctaOpacity = useTransform(scrollYProgress, [0.55, 0.72], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.55, 0.75], [40, 0]);
  const creditsOpacity = useTransform(scrollYProgress, [0.85, 0.96], [0, 1]);
  const creditsY = useTransform(scrollYProgress, [0.85, 0.98], [24, 0]);

  return (
    <section ref={ref} className="relative h-[260vh]">
      <ChapterPhoto
        chapter={{
          numeral: "VI.",
          title: "The Tide",
          statement: "The light goes soft. The work begins.",
          photoKey: "sunsetGather",
        }}
        progress={scrollYProgress}
        scrimOpacity={scrim}
      />
      <motion.div
        style={{ opacity: cardOpacity, y: cardY }}
        className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center text-sand"
      >
        <p className="font-display italic text-sand/80 text-base md:text-lg tracking-[0.04em]">
          Chapter VI.
        </p>
        <h2
          className="font-display mt-6 leading-[0.92] tracking-[-0.035em]"
          style={{ fontSize: "clamp(44px, 8vw, 132px)" }}
        >
          The Tide
        </h2>
        <p
          className="font-display mt-8 max-w-2xl italic text-sand/85 leading-tight"
          style={{ fontSize: "clamp(18px, 2vw, 28px)" }}
        >
          The light goes soft. The work begins.
        </p>
      </motion.div>
      <motion.div
        style={{ opacity: ctaOpacity, y: ctaY }}
        className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6"
      >
        <div className="pointer-events-auto max-w-2xl text-center text-sand">
          <p className="meta text-sand/70">Begin here</p>
          <h3
            className="font-display mt-6 leading-[0.95] tracking-[-0.03em]"
            style={{ fontSize: "clamp(36px, 6vw, 88px)" }}
          >
            Send a paragraph.
            <br />
            We answer with names.
          </h3>
          <a
            href="mailto:hello@healingtides.co?subject=Begin"
            className="meta mt-10 inline-flex items-center gap-2 bg-seafoam px-6 py-4 text-charcoal transition-colors hover:bg-sand"
          >
            hello@healingtides.co
          </a>
          <p className="mt-8 text-[14px] leading-[1.75] text-sand/75">
            Two paragraphs is plenty. We answer within five business days, by name.
          </p>
        </div>
      </motion.div>
      <motion.div
        style={{ opacity: creditsOpacity, y: creditsY }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
      >
        <div className="pointer-events-auto mx-auto flex max-w-[1100px] flex-col gap-3 border-t border-sand/30 px-6 pb-12 pt-8 text-sand md:flex-row md:items-baseline md:justify-between md:px-10">
          <p className="font-display italic text-sand/85 text-lg">Healing Tides Collective / 2026</p>
          <p className="meta text-sand/60">A film in six chapters / Set in Fraunces and Inter</p>
          <p className="meta text-sand/60">Care, matched. By a person.</p>
        </div>
      </motion.div>
    </section>
  );
}

export default function ImmersiveCinema() {
  const intermissionRef = useRef<HTMLElement>(null);
  const { scrollYProgress: intermissionProgress } = useScroll({
    target: intermissionRef,
    offset: ["start end", "end start"],
  });
  const letterbox = useTransform(
    intermissionProgress,
    [0.18, 0.32, 0.7, 0.84],
    [1, 0, 0, 1],
  );

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative bg-charcoal text-sand">
        <motion.div
          style={{ opacity: letterbox }}
          className="pointer-events-none fixed inset-x-0 top-0 z-50 h-10 bg-charcoal"
        />
        <motion.div
          style={{ opacity: letterbox }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-50 h-10 bg-charcoal"
        />
        <header className="pointer-events-none fixed left-0 right-0 top-0 z-40 px-6 pt-3 md:px-10">
          <div className="pointer-events-auto mx-auto flex max-w-[1500px] items-baseline justify-between text-sand">
            <p className="meta text-sand/70">Healing Tides Collective</p>
            <p className="meta hidden text-sand/60 md:block">A film in six chapters</p>
            <a
              href="mailto:hello@healingtides.co?subject=Begin"
              className="meta link-underline text-sand/80"
            >
              Begin
            </a>
          </div>
        </header>

        <ChapterOne />
        <ChapterTwo />
        <ChapterThree />
        <ChapterFour />
        <Intermission sectionRef={intermissionRef} />
        <ChapterSix />
      </main>
    </MotionConfig>
  );
}
