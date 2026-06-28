"use client";

// Fluid orb visualizer for the voice agent — ported from counsel-post's voice-lab (itself a port
// of locala's fluid-visualizer), re-keyed to the Healing Tides palette (tide-pool teal / sage /
// seafoam — NOT the YPC product blue) and simplified to the single circular orb treatment.
//
// 4 orbs orbit the center, breathing with audio intensity:
//   - User speaking: real-time frequency analysis from the mic AnalyserNode.
//   - Assistant speaking: a simulated wave (WebRTC remote-stream analysis is unreliable).
//   - Idle: a gentle ambient sway.

import { useCallback, useEffect, useRef, useState } from "react";

type SpeakerSide = "user" | "ai" | "none";

interface Props {
  isActive: boolean;
  speaker: SpeakerSide;
  userAnalyser?: AnalyserNode | null;
}

// Healing Tides — sea glass / tide pool. Teal → soft teal → sage → seafoam, glowing light to dark
// so the "lighter" composite reads as moving light in calm water.
const PALETTE = [
  { r: 79, g: 143, b: 138 }, // deep teal (#4f8f8a-ish)
  { r: 130, g: 184, b: 170 }, // soft teal
  { r: 168, g: 191, b: 163 }, // sage
  { r: 214, g: 237, b: 232 }, // seafoam shimmer
] as const;

const ORB_COUNT = 4;

interface Orb {
  x: number;
  y: number;
  baseRadius: number;
  radius: number;
  colorRGB: { r: number; g: number; b: number };
  orbitRadius: number;
  phase: number;
  speed: number;
}

function createOrb(width: number, height: number, index: number): Orb {
  const baseRadius = Math.min(width, height) * 0.3;
  return {
    x: width / 2,
    y: height / 2,
    baseRadius,
    radius: baseRadius,
    colorRGB: PALETTE[index % PALETTE.length],
    orbitRadius: baseRadius * (0.3 + ((index * 0.17) % 0.4)),
    phase: (index / ORB_COUNT) * Math.PI * 2,
    speed: 0.003 + (index % 3) * 0.0007,
  };
}

function updateOrb(orb: Orb, width: number, height: number, intensity: number, time: number) {
  const speedMult = 1 + intensity * 2;
  const orbitJitter = orb.baseRadius * 0.7;
  const offsetX = Math.sin(time * orb.speed * 10 * speedMult + orb.phase) * (orb.orbitRadius + intensity * orbitJitter);
  const offsetY = Math.cos(time * orb.speed * 8 * speedMult + orb.phase) * (orb.orbitRadius + intensity * orbitJitter);
  orb.x = width / 2 + offsetX;
  orb.y = height / 2 + offsetY;
  const breath = Math.sin(time * 2 + orb.phase) * (orb.baseRadius * 0.22);
  const expansion = intensity * orb.baseRadius * 1.3;
  orb.radius = orb.baseRadius + breath + expansion;
}

function drawOrb(ctx: CanvasRenderingContext2D, orb: Orb) {
  const r1 = Math.max(1, orb.radius);
  const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r1);
  const { r, g, b } = orb.colorRGB;
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.95)`);
  gradient.addColorStop(0.2, `rgba(${r}, ${g}, ${b}, 0.7)`);
  gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.35)`);
  gradient.addColorStop(0.8, `rgba(${r}, ${g}, ${b}, 0.1)`);
  gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(orb.x, orb.y, r1, 0, Math.PI * 2);
  ctx.fill();
}

export function FluidVisualizer({ isActive, speaker, userAnalyser }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbsRef = useRef<Orb[]>([]);
  const timeRef = useRef(0);
  const currentVolRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const simulatedVolumeRef = useRef(0);
  const talkingRef = useRef(false);
  const [size, setSize] = useState(128);

  const initOrbs = useCallback((w: number, h: number) => {
    orbsRef.current = [];
    for (let i = 0; i < ORB_COUNT; i++) orbsRef.current.push(createOrb(w, h, i));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w === 0 || h === 0) return;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.getContext("2d")?.scale(dpr, dpr);
      initOrbs(w, h);
      setSize(Math.min(w, h));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    window.addEventListener("resize", resize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [initOrbs]);

  // Simulated volume for assistant + idle states.
  useEffect(() => {
    if (!isActive) {
      simulatedVolumeRef.current = 0;
      talkingRef.current = false;
      return;
    }
    if (speaker === "ai") {
      talkingRef.current = true;
      simulatedVolumeRef.current = 150;
      const interval = window.setInterval(() => {
        if (Math.random() > 0.95) talkingRef.current = !talkingRef.current;
        simulatedVolumeRef.current = talkingRef.current
          ? 140 + Math.sin(Date.now() / 120) * 50 + Math.random() * 30
          : 40 + Math.random() * 20;
      }, 40);
      return () => {
        window.clearInterval(interval);
        talkingRef.current = false;
      };
    }
    if (speaker === "user") {
      simulatedVolumeRef.current = 0; // driven by the real analyser below
      return;
    }
    simulatedVolumeRef.current = 18; // connected + silent → gentle ambient
    talkingRef.current = false;
  }, [isActive, speaker]);

  // Animation loop.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    const draw = () => {
      const cssW = canvas.width / dpr;
      const cssH = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      let targetVol = 0;
      if (isActive) {
        if (userAnalyser && speaker === "user") {
          const buf = new Uint8Array(userAnalyser.frequencyBinCount);
          userAnalyser.getByteFrequencyData(buf);
          const start = Math.floor(buf.length * 0.1);
          const end = Math.floor(buf.length * 0.5);
          let sum = 0;
          for (let i = start; i < end; i++) sum += buf[i];
          targetVol = Math.max(sum / Math.max(1, end - start), 18); // floor so it never goes flat
        } else {
          targetVol = simulatedVolumeRef.current;
        }
      }

      currentVolRef.current += (targetVol - currentVolRef.current) * 0.1;
      const intensity = Math.min(1, currentVolRef.current / 200);
      timeRef.current += 0.016;

      ctx.globalCompositeOperation = "lighter";
      for (const orb of orbsRef.current) {
        updateOrb(orb, cssW, cssH, intensity, timeRef.current);
        drawOrb(ctx, orb);
      }
      ctx.globalCompositeOperation = "source-over";

      animationRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      if (animationRef.current != null) cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, speaker, userAnalyser]);

  const blurPx = Math.max(4, Math.round(size * 0.1));

  return (
    <div className="absolute inset-0 overflow-hidden rounded-full">
      {/* Soft tide-pool base so the orbs read as light in calm water on the sand page. */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(47,79,76,0.20), rgba(95,143,139,0.10) 55%, transparent 75%)",
          opacity: isActive ? 1 : 0.5,
        }}
      />
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          filter: `blur(${blurPx}px) saturate(1.25)`,
          transform: "translate3d(0,0,0)",
          opacity: isActive ? 1 : 0.6,
        }}
      >
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
    </div>
  );
}
