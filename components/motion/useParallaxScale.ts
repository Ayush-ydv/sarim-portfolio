"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

// How strong parallax should be on this device: full on larger screens,
// `phoneFactor` on phones (0 turns it off there, e.g. where stacked items
// could overlap), and zero when the visitor prefers reduced motion. Starts
// at 0 so server and first client render match; motion begins after hydration.
export function useParallaxScale(phoneFactor = 0.5) {
  const reduceMotion = useReducedMotion();
  const [scale, setScale] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const phone = window.matchMedia("(max-width: 767px)");
    const update = () => setScale(phone.matches ? phoneFactor : 1);
    update();
    phone.addEventListener("change", update);
    return () => phone.removeEventListener("change", update);
  }, [reduceMotion, phoneFactor]);

  return reduceMotion ? 0 : scale;
}
