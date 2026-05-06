"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { photos, type PhotoKey } from "@/app/_lib/images";

export type VideoWellProps = {
  keys: PhotoKey[];
  interval?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
};

export default function VideoWell({
  keys,
  interval = 5500,
  priority = false,
  className = "",
  sizes = "50vw",
}: VideoWellProps) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const t = setInterval(() => setI((prev) => (prev + 1) % keys.length), interval);
    return () => clearInterval(t);
  }, [keys.length, interval]);

  return (
    <div className={`relative h-full w-full overflow-hidden bg-charcoal ${className}`}>
      <AnimatePresence>
        <motion.div
          key={keys[i]}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1.1 }}
          exit={{ opacity: 0, scale: 1.16 }}
          transition={{
            opacity: { duration: 1.6, ease: [0.22, 1, 0.36, 1] },
            scale: { duration: interval / 1000 + 1.6, ease: "linear" },
          }}
          className="absolute inset-0"
        >
          <Image
            src={photos[keys[i]].src}
            alt={photos[keys[i]].alt}
            fill
            priority={priority && i === 0}
            className="object-cover"
            sizes={sizes}
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/10 via-transparent to-charcoal/40" />
    </div>
  );
}
