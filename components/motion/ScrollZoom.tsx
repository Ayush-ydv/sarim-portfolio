"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useParallaxScale } from "@/components/motion/useParallaxScale";

// Media that starts slightly zoomed in and settles to full frame as it
// scrolls into place. Larger screens only; fills its positioned parent.
export default function ScrollZoom({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = useParallaxScale(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const zoom = useTransform(scrollYProgress, [0, 1], [1 + 0.22 * scale, 1]);

  return (
    <motion.div ref={ref} className="absolute inset-0" style={{ scale: zoom }}>
      {children}
    </motion.div>
  );
}
