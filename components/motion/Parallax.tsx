"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useParallaxScale } from "@/components/motion/useParallaxScale";

// Moves its content at a different speed from the page as it scrolls past.
// `speed` is the travel in pixels over the element's whole pass through the
// viewport: positive drifts down (lags behind, feels far away), negative
// rises faster (feels close). Transform-only, so it never triggers layout.
// `mobile={false}` turns it off on phones, where stacked neighbours could
// otherwise overlap.
export default function Parallax({
  children,
  speed = 120,
  axis = "y",
  mobile = true,
  className,
}: {
  children: React.ReactNode;
  speed?: number;
  axis?: "x" | "y";
  mobile?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = useParallaxScale(mobile ? 0.5 : 0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const travel = speed * scale;
  const offset = useTransform(scrollYProgress, [0, 1], [-travel / 2, travel / 2]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={axis === "y" ? { y: offset } : { x: offset }}
    >
      {children}
    </motion.div>
  );
}
