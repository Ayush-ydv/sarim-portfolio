"use client";

import { MotionConfig } from "motion/react";

// reducedMotion="user" makes every Framer animation drop its transforms when
// the visitor has "reduce motion" turned on, leaving only gentle fades.
export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
