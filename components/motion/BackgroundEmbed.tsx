"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { BackgroundEmbed as BackgroundEmbedData } from "@/lib/media";

// A YouTube/Vimeo link used as a decorative loop, matching LoopVideo's
// contract: mounts only near the viewport, and shows a still instead of
// autoplaying when the visitor prefers reduced motion.
export default function BackgroundEmbed({
  kind,
  embedUrl,
  posterUrl,
  className = "",
}: BackgroundEmbedData & { className?: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNearViewport(true);
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (reduceMotion || !nearViewport) {
    return (
      <div ref={wrapperRef} className={`absolute inset-0 ${className}`}>
        {posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={posterUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div aria-hidden className="wash-lavender h-full w-full" />
        )}
      </div>
    );
  }

  // YouTube has no native "cover" mode, so the iframe is oversized and
  // centered to crop like object-cover would on a real <video>. Vimeo's
  // background=1 already fills/crops its box, so it renders at 100%.
  const oversize = kind === "youtube";

  return (
    <div ref={wrapperRef} className={`absolute inset-0 overflow-hidden ${className}`}>
      <iframe
        src={embedUrl}
        title=""
        aria-hidden
        tabIndex={-1}
        allow="autoplay; encrypted-media"
        className={
          oversize
            ? "pointer-events-none absolute left-1/2 top-1/2 h-[200%] w-[200%] -translate-x-1/2 -translate-y-1/2"
            : "pointer-events-none absolute inset-0 h-full w-full"
        }
      />
    </div>
  );
}
