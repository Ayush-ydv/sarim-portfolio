"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useReducedMotion } from "motion/react";

// Weighted, inertial scrolling for mouse and trackpad — what makes the
// parallax feel heavy. Touch screens keep native scrolling (smoother and
// what people expect on a phone), and reduced motion turns it off.
export default function SmoothScroll() {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || window.matchMedia("(pointer: coarse)").matches) return;

    const lenis = new Lenis({ lerp: 0.08, anchors: true, autoRaf: true });

    // The mobile menu and video lightbox lock the page by hiding body
    // overflow; pause smooth scrolling while they're open.
    const observer = new MutationObserver(() => {
      if (document.body.style.overflow === "hidden") lenis.stop();
      else lenis.start();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });

    return () => {
      observer.disconnect();
      lenis.destroy();
    };
  }, [reduceMotion]);

  return null;
}
