"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

type Parsed = {
  prefix: string;
  suffix: string;
  target: number;
  decimals: number;
  grouped: boolean;
};

// Stats are free text ("6+", "1,200", "$2.5M"), so only the numeric run
// animates and whatever surrounds it is kept as-is.
function parse(value: string): Parsed | null {
  const match = value.match(/^(\D*)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  const [, prefix, raw, suffix] = match;
  return {
    prefix,
    suffix,
    target: parseFloat(raw.replace(/,/g, "")),
    decimals: raw.includes(".") ? raw.split(".")[1].length : 0,
    grouped: raw.includes(","),
  };
}

function format(parsed: Parsed, n: number) {
  const number = parsed.decimals
    ? n.toFixed(parsed.decimals)
    : parsed.grouped
      ? Math.round(n).toLocaleString("en-US")
      : String(Math.round(n));
  return `${parsed.prefix}${number}${parsed.suffix}`;
}

export default function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const parsed = parse(value);
    const el = ref.current;
    if (!parsed || !el || reduceMotion) return;

    // Write to the existing text node so React keeps owning it.
    const write = (text: string) => {
      if (el.firstChild) el.firstChild.nodeValue = text;
      else el.textContent = text;
    };

    // The server-rendered final value stays until hydration; reset to zero
    // while still offscreen, then count up once scrolled into view.
    if (!inView) {
      write(format(parsed, 0));
      return;
    }
    const controls = animate(0, parsed.target, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (n) => write(format(parsed, n)),
    });
    return () => controls.stop();
  }, [value, inView, reduceMotion]);

  return <span ref={ref}>{value}</span>;
}
