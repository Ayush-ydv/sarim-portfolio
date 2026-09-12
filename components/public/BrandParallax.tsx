"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";
import { useParallaxScale } from "@/components/motion/useParallaxScale";

// Keeps a value inside [min, max) — the two identical copies of the row make
// -50%…0% a seamless loop.
function wrap(min: number, max: number, value: number) {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

// The logos drift left forever. Scrolling makes them race (the faster the
// scroll, the faster the drift) but never reverses them.
function DriftRow({
  children,
  speed,
  boost,
  active,
  paused,
}: {
  children: ReactNode;
  /** Share of one copy's width travelled per second, in %. */
  speed: number;
  boost: MotionValue<number>;
  active: boolean;
  paused: React.RefObject<boolean>;
}) {
  const base = useMotionValue(0);
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (!active || paused.current) return;
    base.set(base.get() - speed * (delta / 1000) * (1 + boost.get()));
  });

  return (
    <motion.div className="flex w-max" style={{ x }}>
      {children}
      {children}
    </motion.div>
  );
}

// One row of colour logos over a large outlined "Brands" word. The word
// slides the opposite way as the page scrolls, and a fast scroll makes the
// logos race and lean into the motion.
export default function BrandParallax({ label, logos }: { label: string; logos: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const scale = useParallaxScale();
  // Only animate while the strip is on (or near) screen.
  const inView = useInView(ref, { margin: "200px 0px" });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, (v) => Math.min(Math.abs(v) / 300, 8));
  const skew = useTransform(velocity, [-2500, 2500], [-6 * scale, 6 * scale], { clamp: true });
  const wordX = useTransform(scrollYProgress, [0, 1], [`${10 * scale}%`, `${-22 * scale}%`]);
  const rowY = useTransform(scrollYProgress, [0, 1], [30 * scale, -30 * scale]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="relative isolate overflow-hidden py-12 md:py-16"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center">
        <motion.p
          style={{ x: wordX }}
          className="whitespace-nowrap font-display text-[clamp(4.5rem,13vw,11rem)] leading-none text-transparent [-webkit-text-stroke:1px_rgb(23_22_20/0.1)]"
        >
          Brands · Brands · Brands · Brands
        </motion.p>
      </div>

      <p className="label-caps text-center text-muted">{label}</p>

      <div className="mt-8 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] md:mt-10">
        <motion.div style={{ skewX: skew, y: rowY }}>
          <DriftRow speed={scale ? 1.6 : 0} boost={boost} active={inView && scale > 0} paused={paused}>
            {logos}
          </DriftRow>
        </motion.div>
      </div>
    </div>
  );
}
