"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import SmartMedia from "@/components/SmartMedia";

// The media is oversized by 9% top and bottom so a ±7% drift never exposes
// the frame's edges. Percentages keep that true at any frame size.
export default function ParallaxMedia({
  src,
  alt,
  sizes,
  preload = false,
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  preload?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-x-0 -inset-y-[9%]"
        style={reduceMotion ? undefined : { y }}
      >
        <SmartMedia
          src={src}
          alt={alt}
          sizes={sizes}
          preload={preload}
          className="object-cover"
        />
      </motion.div>
    </div>
  );
}
