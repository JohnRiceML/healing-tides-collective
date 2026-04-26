"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  MotionConfig,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { photos } from "@/app/_lib/images";

const TIDE_EASE = [0.22, 1, 0.36, 1] as const;

const personas = [
  {
    label: "Reader / 01",
    name: "The Overwhelmed Optimizer",
    line: "You have read the studies. You own the spreadsheet. You still do not know who to call.",
  },
  {
    label: "Reader / 02",
    name: "The Practical Seeker",
    line: "You are not interested in vibes. You want a person whose work checks out.",
  },
  {
    label: "Reader / 03",
    name: "The Curious Seeker",
    line: "You are open. You are uncertain. You want a guide, not a gauntlet.",
  },
];

const modalities = [
  { name: "Therapy", note: "Licensed, considered, present." },
  { name: "Acupuncture", note: "Clinical record, careful hands." },
  { name: "Reiki", note: "Held space, no theatre." },
  { name: "Movement-based care", note: "For adult bodies, gently." },
  { name: "Trauma-informed support", note: "Across modalities, always." },
];

const steps = [
  {
    mark: "1m",
    title: "Tell us where you are.",
    detail:
      "A short, plain conversation. Not an intake form. We ask what you are working on, what you have tried, what feels close to right.",
  },
  {
    mark: "2m",
    title: "Read the shortlist.",
    detail:
      "Three to five practitioners chosen by a person, not a search index. Each pick comes with a sentence on why they fit you, specifically.",
  },
  {
    mark: "3m",
    title: "Begin in your own time.",
    detail:
      "You introduce yourself by reply or by booking. Your relationship is yours from the first message onward.",
  },
];

const faqs = [
  {
    q: "Are you a directory?",
    a: "No. A directory hands you a list and walks away. We hand you a shortlist with the reasoning, and a real person on the other end of an email if you have a follow-up.",
  },
  {
    q: "How are practitioners vetted?",
    a: "License where applicable, training where it matters, references where we can ask, and a working relationship where we cannot. We turn away more than we accept.",
  },
  {
    q: "Clinical or holistic?",
    a: "Both, side by side, without a hierarchy. A licensed therapist and a craniosacral practitioner can both be the right answer.",
  },
  {
    q: "Will you sell my information?",
    a: "No. Your story and your contact details belong to you until you decide to share them with a practitioner.",
  },
];

function WaveDivider({
  fill = "var(--color-sand-deep)",
  flip = false,
  height = 120,
  speed = 1,
}: {
  fill?: string;
  flip?: boolean;
  height?: number;
  speed?: number;
}) {
  const dPaths = [
    "M0,60 Q150,10 300,60 T600,60 T900,60 T1200,60 V120 H0 Z",
    "M0,60 Q150,100 300,60 T600,60 T900,60 T1200,60 V120 H0 Z",
    "M0,60 Q150,30 300,80 T600,40 T900,70 T1200,50 V120 H0 Z",
    "M0,60 Q150,90 300,40 T600,80 T900,30 T1200,70 V120 H0 Z",
  ];
  return (
    <div
      aria-hidden
      className="pointer-events-none w-full overflow-hidden"
      style={{ transform: flip ? "scaleY(-1)" : undefined, height }}
    >
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="block h-full w-full"
      >
        <motion.path
          fill={fill}
          initial={{ d: dPaths[0] }}
          animate={{ d: dPaths }}
          transition={{
            duration: 9 / speed,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
      </svg>
    </div>
  );
}

function TideLine() {
  const dPaths = [
    "M0,8 Q40,0 80,8 T160,8 T240,8 T320,8",
    "M0,8 Q40,16 80,8 T160,8 T240,8 T320,8",
    "M0,8 Q40,4 80,12 T160,6 T240,10 T320,8",
  ];
  return (
    <svg
      aria-hidden
      viewBox="0 0 320 16"
      preserveAspectRatio="none"
      className="mt-3 h-3 w-40 opacity-70"
    >
      <motion.path
        d={dPaths[0]}
        fill="none"
        stroke="var(--color-teal)"
        strokeWidth={1.25}
        strokeLinecap="round"
        animate={{ d: dPaths }}
        transition={{
          duration: 6,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        }}
      />
    </svg>
  );
}

function SectionHeading({
  eyebrow,
  children,
  align = "left",
  dark = false,
}: {
  eyebrow: string;
  children: React.ReactNode;
  align?: "left" | "center";
  dark?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.2, ease: TIDE_EASE }}
      className={align === "center" ? "text-center" : ""}
    >
      <p
        className={`meta ${dark ? "text-seafoam/80" : "text-ink-muted"} ${
          align === "center" ? "mx-auto" : ""
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`font-display mt-6 text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.04] tracking-[-0.02em] ${
          dark ? "text-sand" : "text-charcoal"
        }`}
      >
        {children}
      </h2>
      <div className={align === "center" ? "flex justify-center" : ""}>
        <TideLine />
      </div>
    </motion.div>
  );
}

export default function ImmersiveTidesDesign() {
  const pageRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const practitionerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: pageRef });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 24,
    mass: 0.7,
  });

  const bgHueShift = useTransform(
    smoothProgress,
    [0, 0.35, 0.7, 1],
    [
      "linear-gradient(180deg, #f7f5f2 0%, #efeae1 100%)",
      "linear-gradient(180deg, #efeae1 0%, #e6efe9 100%)",
      "linear-gradient(180deg, #e6efe9 0%, #d7e2dc 100%)",
      "linear-gradient(180deg, #d7e2dc 0%, #1f3a5f 100%)",
    ],
  );

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroPhotoY = useTransform(heroProgress, [0, 1], ["0%", "18%"]);
  const heroPhotoScale = useTransform(heroProgress, [0, 1], [1.05, 1.18]);
  const heroForegroundY = useTransform(heroProgress, [0, 1], ["0%", "-8%"]);

  const { scrollYProgress: pracProgress } = useScroll({
    target: practitionerRef,
    offset: ["start end", "end start"],
  });
  const pracPhotoY = useTransform(pracProgress, [0, 1], ["-12%", "12%"]);

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: bgHueShift }}
      />

      <main
        ref={pageRef}
        className="relative min-h-screen text-charcoal"
      >
        <header className="relative z-20 border-b border-rule/60 backdrop-blur-sm">
          <div className="mx-auto flex max-w-[72rem] items-center justify-between px-6 py-6">
            <p className="font-display text-base italic">Healing Tides Collective</p>
            <nav className="hidden gap-7 md:flex">
              {["Mission", "Modalities", "How", "FAQ", "Begin"].map((l) => (
                <a
                  key={l}
                  className="meta text-ink-muted transition-colors hover:text-ocean"
                  href={`#${l.toLowerCase()}`}
                >
                  {l}
                </a>
              ))}
            </nav>
          </div>
        </header>

        {/* Hero — wave-clipped photo */}
        <section ref={heroRef} className="relative overflow-hidden">
          <svg width="0" height="0" className="absolute">
            <defs>
              <clipPath id="tide-hero-clip" clipPathUnits="objectBoundingBox">
                <path d="M0,0 L1,0 L1,0.86 C0.83,0.96 0.66,0.78 0.5,0.88 C0.34,0.98 0.17,0.82 0,0.92 Z" />
              </clipPath>
              <clipPath id="tide-soft-clip" clipPathUnits="objectBoundingBox">
                <path d="M0,0.08 C0.18,0 0.32,0.16 0.5,0.06 C0.66,-0.02 0.82,0.14 1,0.04 L1,1 L0,1 Z" />
              </clipPath>
            </defs>
          </svg>

          <div className="relative h-[92vh] min-h-[640px] w-full">
            <motion.div
              className="absolute inset-0"
              style={{
                y: heroPhotoY,
                scale: heroPhotoScale,
                clipPath: "url(#tide-hero-clip)",
              }}
            >
              <Image
                src={photos.sunsetGather.src}
                alt={photos.sunsetGather.alt}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-charcoal/10 via-charcoal/20 to-sand/0" />
            </motion.div>

            <motion.div
              className="absolute inset-0 flex flex-col justify-end px-6 pb-32 md:pb-40"
              style={{ y: heroForegroundY }}
            >
              <div className="mx-auto w-full max-w-[72rem]">
                <motion.p
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.4, ease: TIDE_EASE, delay: 0.2 }}
                  className="meta text-sand/80"
                >
                  Healing Tides Collective / 2026
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 64 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.6, ease: TIDE_EASE, delay: 0.35 }}
                  className="font-display mt-6 max-w-4xl text-[clamp(3rem,8vw,7rem)] leading-[0.92] tracking-[-0.03em] text-sand"
                >
                  Find your fit.
                  <br />
                  <span className="italic text-seafoam">Like a tide returning.</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.4, ease: TIDE_EASE, delay: 0.55 }}
                  className="mt-8 max-w-[36rem] text-base leading-[1.7] text-sand/85 md:text-lg"
                >
                  A guided care-matching service that replaces overwhelming directories
                  with a shortlist written by a person. Therapy, acupuncture, reiki,
                  movement, and trauma-informed support, held side by side.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.4, ease: TIDE_EASE, delay: 0.75 }}
                  className="mt-10 flex flex-wrap items-center gap-5"
                >
                  <Link
                    href="#begin"
                    className="meta inline-flex items-center gap-3 bg-seafoam px-7 py-4 text-charcoal transition-colors hover:bg-sand"
                  >
                    Get matched
                    <span aria-hidden>→</span>
                  </Link>
                  <a
                    href="#how"
                    className="meta text-sand/80 transition-colors hover:text-seafoam"
                  >
                    Read how it works
                  </a>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Mission — washed in */}
        <section
          id="mission"
          className="relative bg-sand-deep/60 pb-28 pt-20 md:pt-28"
        >
          <div className="absolute inset-x-0 -top-px">
            <WaveDivider fill="var(--color-sand-deep)" speed={0.8} height={140} />
          </div>

          <div className="relative mx-auto max-w-[52rem] px-6">
            <SectionHeading eyebrow="The mission">
              We do not believe wellness is a maze.
              <br />
              <span className="italic text-ocean">
                We believe it has been built like one.
              </span>
            </SectionHeading>

            <motion.div
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.4, ease: TIDE_EASE, delay: 0.15 }}
              className="mt-12 space-y-6 text-[1.075rem] leading-[1.75] text-ink-soft"
            >
              <p>
                The promise of digital care has been a wall of practitioners listed
                alphabetically with star ratings and no theory of fit. The cost of that
                wall is a quiet one. People do not give up on wellness. They give up on
                choosing.
              </p>
              <p>
                We replace the wall with a shortlist. We replace the rating with a
                paragraph. We replace the algorithm with a person who reads what you
                wrote and picks three to five practitioners by name.
              </p>
              <blockquote className="border-l-2 border-ocean pl-6 text-[1.2rem] italic leading-snug text-charcoal">
                The right practitioner is not the most decorated one. It is the one who
                feels right after the first reply.
              </blockquote>
            </motion.div>
          </div>

          <div className="absolute inset-x-0 -bottom-px">
            <WaveDivider fill="var(--color-sand)" flip speed={1.1} height={140} />
          </div>
        </section>

        {/* Modalities — rising from the wave */}
        <section id="modalities" className="relative bg-sand py-28 md:py-36">
          <div className="mx-auto max-w-[68rem] px-6">
            <SectionHeading eyebrow="Care, side by side">
              Five modalities.
              <br />
              <span className="italic text-ocean">No hierarchy.</span>
            </SectionHeading>

            <ul className="mt-16 space-y-1">
              {modalities.map((m, i) => (
                <motion.li
                  key={m.name}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 1.3,
                    ease: TIDE_EASE,
                    delay: i * 0.12,
                  }}
                  className="grid grid-cols-12 items-baseline gap-6 border-b border-rule py-7"
                >
                  <span className="meta col-span-2 text-ocean">
                    /{String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display col-span-12 text-[clamp(1.6rem,3.4vw,2.6rem)] leading-tight md:col-span-7">
                    {m.name}
                  </h3>
                  <p className="col-span-12 text-[1rem] italic leading-[1.65] text-ink-soft md:col-span-3 md:text-right">
                    {m.note}
                  </p>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        {/* Atmospheric tide photo — wave-clipped */}
        <section className="relative overflow-hidden">
          <div
            className="relative h-[60vh] min-h-[380px] w-full"
            style={{ clipPath: "url(#tide-soft-clip)" }}
          >
            <motion.div
              initial={{ scale: 1.08 }}
              whileInView={{ scale: 1.0 }}
              viewport={{ once: true }}
              transition={{ duration: 2.4, ease: TIDE_EASE }}
              className="absolute inset-0"
            >
              <Image
                src={photos.poolMountain.src}
                alt={photos.poolMountain.alt}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </motion.div>
            <div className="absolute inset-0 bg-ocean/25" />
            <div className="absolute inset-0 flex items-end px-6 py-14 text-sand md:px-10">
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 1.4, ease: TIDE_EASE }}
                className="font-display mx-auto max-w-[68rem] text-[clamp(1.4rem,3.2vw,2.4rem)] italic leading-tight"
              >
                Care that meets you where you are. Not where the directory thought you
                might be.
              </motion.p>
            </div>
          </div>
        </section>

        {/* How it works — depth marks */}
        <section
          id="how"
          className="relative bg-sand-deep/50 py-28 md:py-36"
        >
          <div className="absolute inset-x-0 -top-px">
            <WaveDivider fill="var(--color-sand-deep)" speed={0.9} height={120} />
          </div>

          <div className="relative mx-auto max-w-[68rem] px-6">
            <SectionHeading eyebrow="How it works">
              Three fathoms,
              <br />
              <span className="italic text-ocean">from surface to depth.</span>
            </SectionHeading>

            <ol className="mt-20 space-y-16">
              {steps.map((s, i) => (
                <motion.li
                  key={s.mark}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{
                    duration: 1.4,
                    ease: TIDE_EASE,
                    delay: i * 0.15,
                  }}
                  className="grid grid-cols-12 items-baseline gap-6"
                >
                  <div className="col-span-12 md:col-span-3">
                    <p className="font-display text-[clamp(3rem,6vw,5rem)] italic leading-none text-ocean">
                      {s.mark}
                    </p>
                    <p className="meta mt-2 text-ink-muted">depth mark</p>
                  </div>
                  <div className="col-span-12 md:col-span-9">
                    <h3 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-tight">
                      {s.title}
                    </h3>
                    <p className="mt-4 max-w-[42rem] text-[1.05rem] leading-[1.75] text-ink-soft">
                      {s.detail}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>

          <div className="absolute inset-x-0 -bottom-px">
            <WaveDivider fill="var(--color-sand)" flip speed={1.0} height={120} />
          </div>
        </section>

        {/* Personas */}
        <section className="relative bg-sand py-28 md:py-32">
          <div className="mx-auto max-w-[68rem] px-6">
            <SectionHeading eyebrow="Who this is for">
              Three seekers.
              <br />
              <span className="italic text-ocean">One quiet door.</span>
            </SectionHeading>

            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
              {personas.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: 1.3,
                    ease: TIDE_EASE,
                    delay: i * 0.12,
                  }}
                  className="border-t border-rule pt-8"
                >
                  <p className="meta text-ocean">{p.label}</p>
                  <h3 className="font-display mt-5 text-[1.6rem] leading-[1.15]">
                    {p.name}
                  </h3>
                  <p className="mt-4 text-[15px] leading-[1.7] text-ink-soft">
                    {p.line}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* For practitioners — parallax water photo backdrop */}
        <section ref={practitionerRef} className="relative overflow-hidden bg-charcoal">
          <motion.div className="absolute inset-0" style={{ y: pracPhotoY }}>
            <Image
              src={photos.sunsetWalk.src}
              alt={photos.sunsetWalk.alt}
              fill
              className="object-cover opacity-50"
              sizes="100vw"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/55 to-charcoal/85" />

          <div className="relative mx-auto max-w-[68rem] px-6 py-32 md:py-40">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.4, ease: TIDE_EASE }}
            >
              <p className="meta text-seafoam/80">For practitioners</p>
              <h2 className="font-display mt-6 max-w-3xl text-[clamp(2.2rem,5vw,4.2rem)] leading-[1.02] tracking-[-0.02em] text-sand">
                Fewer leads.
                <br />
                <span className="italic text-seafoam">Better fits.</span>
              </h2>
              <div className="flex">
                <TideLine />
              </div>
              <p className="mt-8 max-w-[40rem] text-[1.05rem] leading-[1.7] text-sand/80">
                We streamline your referral pipeline. Each introduction arrives with
                context. What the seeker is working on, what they have tried, why we
                picked you. You decide whether to take the consultation. We never charge
                per lead. We never sell your information.
              </p>
              <a
                href="mailto:practitioners@healingtides.co?subject=Practitioner%20introduction"
                className="meta mt-10 inline-flex items-center gap-3 border border-seafoam/60 px-6 py-4 text-seafoam transition-colors hover:bg-seafoam hover:text-charcoal"
              >
                Apply to join the collective
                <span aria-hidden>→</span>
              </a>
            </motion.div>
          </div>
        </section>

        {/* FAQ — ripple on hover */}
        <section id="faq" className="relative bg-sand py-28 md:py-32">
          <div className="mx-auto max-w-[60rem] px-6">
            <SectionHeading eyebrow="Things you might be wondering">
              Quiet questions,
              <br />
              <span className="italic text-ocean">plain answers.</span>
            </SectionHeading>

            <ul className="mt-16 divide-y divide-rule border-t border-rule">
              {faqs.map((f, i) => (
                <motion.li
                  key={f.q}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 1.2,
                    ease: TIDE_EASE,
                    delay: i * 0.08,
                  }}
                  whileHover={{ x: 6 }}
                  className="group grid cursor-default grid-cols-12 gap-6 py-8 transition-colors"
                >
                  <p className="meta col-span-12 text-ink-muted md:col-span-2">
                    Q / {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-display col-span-12 text-xl leading-[1.25] md:col-span-4 md:text-2xl">
                    {f.q}
                  </h3>
                  <div className="col-span-12 md:col-span-6">
                    <p className="text-[15px] leading-[1.75] text-ink-soft">{f.a}</p>
                    <div className="mt-3 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                      <TideLine />
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        {/* Begin — submerged CTA */}
        <section
          id="begin"
          className="relative overflow-hidden bg-ocean text-sand"
        >
          <div className="absolute inset-x-0 -top-px rotate-180">
            <WaveDivider fill="var(--color-ocean)" speed={0.7} height={140} />
          </div>

          <div className="absolute inset-0 opacity-30">
            <svg
              viewBox="0 0 1200 800"
              preserveAspectRatio="none"
              className="h-full w-full"
            >
              <motion.path
                fill="none"
                stroke="var(--color-seafoam)"
                strokeWidth={1}
                strokeOpacity={0.4}
                initial={{
                  d: "M0,400 Q300,300 600,400 T1200,400",
                }}
                animate={{
                  d: [
                    "M0,400 Q300,300 600,400 T1200,400",
                    "M0,400 Q300,500 600,400 T1200,400",
                    "M0,400 Q300,350 600,450 T1200,400",
                  ],
                }}
                transition={{
                  duration: 11,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "mirror",
                }}
              />
              <motion.path
                fill="none"
                stroke="var(--color-seafoam)"
                strokeWidth={1}
                strokeOpacity={0.25}
                initial={{
                  d: "M0,500 Q300,420 600,520 T1200,500",
                }}
                animate={{
                  d: [
                    "M0,500 Q300,420 600,520 T1200,500",
                    "M0,500 Q300,560 600,460 T1200,500",
                    "M0,500 Q300,480 600,540 T1200,500",
                  ],
                }}
                transition={{
                  duration: 13,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "mirror",
                }}
              />
            </svg>
          </div>

          <div className="relative mx-auto max-w-[60rem] px-6 py-36 text-center md:py-48">
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.4, ease: TIDE_EASE }}
              className="meta text-seafoam/80"
            >
              To begin
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.8, ease: TIDE_EASE, delay: 0.15 }}
              className="font-display mt-8 text-[clamp(2.6rem,6vw,5rem)] leading-[0.98] tracking-[-0.02em] text-sand"
            >
              Begin in your own time.
              <br />
              <span className="italic text-seafoam">We will be here.</span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.4, ease: TIDE_EASE, delay: 0.45 }}
            >
              <p className="mx-auto mt-10 max-w-[36rem] text-[1.05rem] leading-[1.75] text-sand/80">
                Two paragraphs is plenty. Tell us what feels close to right and what does
                not. A person will write back, by name, within five business days.
              </p>

              <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
                <a
                  href="mailto:hello@healingtides.co?subject=Begin"
                  className="meta inline-flex items-center gap-3 bg-seafoam px-8 py-4 text-charcoal transition-colors hover:bg-sand"
                >
                  Send us a letter
                  <span aria-hidden>→</span>
                </a>
                <a
                  href="#how"
                  className="meta text-sand/70 transition-colors hover:text-seafoam"
                >
                  Or read how it works
                </a>
              </div>

              <p className="font-display mt-12 text-sm italic text-sand/60">
                Your story belongs to you until you decide otherwise.
              </p>
            </motion.div>
          </div>
        </section>

        <footer className="relative bg-ocean text-sand/70">
          <div className="mx-auto flex max-w-[72rem] flex-wrap items-center justify-between gap-4 border-t border-seafoam/15 px-6 py-10">
            <p className="font-display text-base italic">
              Healing Tides Collective / 2026
            </p>
            <p className="meta">All rights, quietly reserved</p>
          </div>
        </footer>
      </main>
    </MotionConfig>
  );
}
