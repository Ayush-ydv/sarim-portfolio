"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import ParallaxMedia from "@/components/motion/ParallaxMedia";

export type HeroShape = "portrait" | "square" | "landscape";

function shapeOf(width: number, height: number): HeroShape {
  const ratio = width / height;
  if (ratio < 0.9) return "portrait";
  if (ratio > 1.25) return "landscape";
  return "square";
}

// Text column vs. media column, and the media card's shape. A tall portrait
// gets a narrow tall card beside a wide name; a wide showreel gets a wide
// cinematic card. Each card's width is also capped by the viewport height so
// it never runs past the fold. Written out in full so Tailwind sees them.
const LAYOUT: Record<HeroShape, { grid: string; frame: string }> = {
  portrait: {
    grid: "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]",
    frame: "aspect-[4/5] max-w-[min(100%,calc(74svh*0.8))]",
  },
  square: {
    grid: "lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)]",
    frame: "aspect-square max-w-[min(100%,68svh)]",
  },
  landscape: {
    grid: "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]",
    frame: "aspect-[16/10] max-w-[min(100%,calc(66svh*1.6))]",
  },
};

// Lays the hero out around whatever the admin uploaded. The server makes a
// first guess from the URL; once the image or video loads, its real
// proportions decide the final layout.
export default function HeroStage({
  src,
  alt,
  initialShape,
  lockShape,
  isMotion,
  mediaClassName,
  fallback,
  children,
}: {
  src: string | null;
  alt: string;
  initialShape: HeroShape;
  /** YouTube/Vimeo iframes can't be measured, so their guess is final. */
  lockShape: boolean;
  isMotion: boolean;
  mediaClassName: string;
  fallback: ReactNode;
  children: ReactNode;
}) {
  const [shape, setShape] = useState<HeroShape>(initialShape);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !src || lockShape) return;

    const measure = (el: EventTarget | Element | null) => {
      if (el instanceof HTMLImageElement && el.naturalWidth) {
        setShape(shapeOf(el.naturalWidth, el.naturalHeight));
      } else if (el instanceof HTMLVideoElement && el.videoWidth) {
        setShape(shapeOf(el.videoWidth, el.videoHeight));
      }
    };
    const onLoad = (event: Event) => measure(event.target);

    // load / loadedmetadata don't bubble, so listen in the capture phase.
    frame.addEventListener("load", onLoad, true);
    frame.addEventListener("loadedmetadata", onLoad, true);
    // The media may have finished loading before hydration (e.g. cached).
    const raf = requestAnimationFrame(() => measure(frame.querySelector("img, video")));

    return () => {
      frame.removeEventListener("load", onLoad, true);
      frame.removeEventListener("loadedmetadata", onLoad, true);
      cancelAnimationFrame(raf);
    };
  }, [src, lockShape]);

  const layout = LAYOUT[shape];

  return (
    <div
      className={`grid items-center gap-14 transition-[grid-template-columns] duration-700 ease-out-expo lg:gap-16 ${layout.grid}`}
    >
      <div className="min-w-0">{children}</div>

      <div className="min-w-0">
        <div
          className={`relative mx-auto w-full transition-[max-width] duration-700 ease-out-expo lg:mr-0 ${layout.frame}`}
        >
          {/* Offset outline behind the card, an editorial print detail. */}
          <div
            aria-hidden
            className="absolute inset-0 translate-x-3 translate-y-3 rounded-[2rem] border border-foreground/25 md:translate-x-4 md:translate-y-4"
          />
          <div
            ref={frameRef}
            className="relative h-full w-full overflow-hidden rounded-[2rem] bg-lavender shadow-[0_40px_90px_-40px_rgb(23_22_20/0.45)] animate-zoom-settle"
            style={{ animationDelay: "150ms" }}
          >
            {src ? (
              <ParallaxMedia
                src={src}
                alt={alt}
                sizes="(min-width: 1024px) 45vw, 92vw"
                preload
                mediaClassName={mediaClassName}
                className="h-full w-full"
              />
            ) : (
              fallback
            )}

            {isMotion && (
              <span className="label-caps absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-background/85 px-3.5 py-2 text-foreground backdrop-blur-sm md:bottom-5 md:left-5">
                <span aria-hidden className="relative flex h-1.5 w-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-red-500/60" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-red-500" />
                </span>
                Showreel
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
