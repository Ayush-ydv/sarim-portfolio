"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import type Hls from "hls.js";

const CLIP_SECONDS = 8;

// Loops a short muted window of a Cloudflare Stream video, for collage tiles.
// Stream serves HLS, which only Safari plays natively, so elsewhere hls.js is
// loaded on demand and capped to the tile's size — a grid of tiles then pulls
// small renditions instead of full 1080p. Like LoopVideo, it only plays while
// on screen and stays on its poster for visitors who prefer reduced motion.
export default function StreamLoop({
  src,
  poster,
  start = 0,
  className = "",
}: {
  src: string;
  poster: string | null;
  start?: number;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video || reduceMotion) return;
    // React sets `muted` as a property only; browsers autoplay muted media only.
    video.muted = true;

    let hls: Hls | null = null;
    let attached = false;
    let cancelled = false;

    const attach = async () => {
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        return;
      }
      const { default: HlsClass } = await import("hls.js");
      if (cancelled || !HlsClass.isSupported()) return;
      const player = new HlsClass({
        // Loading starts manually below, once the rendition has been chosen.
        autoStartLoad: false,
        capLevelToPlayerSize: true,
        ignoreDevicePixelRatio: true,
        testBandwidth: false,
        maxBufferLength: CLIP_SECONDS + 4,
        maxMaxBufferLength: CLIP_SECONDS + 8,
      });
      // Left alone, hls.js starts on the lowest rendition and ramps up, but a
      // looping clip replays from its buffer and never ramps — tiles stayed
      // blurry, or with a high estimate stuck at 1080p. Pick the smallest
      // rendition that covers the tile, then start loading from the clip start.
      player.on(HlsClass.Events.MANIFEST_PARSED, () => {
        const fits = player.levels.findIndex(
          (level) => level.width >= video.clientWidth && level.height >= video.clientHeight,
        );
        const level = fits === -1 ? player.levels.length - 1 : fits;
        player.autoLevelCapping = level;
        player.startLevel = level;
        player.startLoad(start);
      });
      player.loadSource(src);
      player.attachMedia(video);
      hls = player;
    };

    const toStart = () => {
      if (Math.abs(video.currentTime - start) > 0.25) video.currentTime = start;
    };
    const onTimeUpdate = () => {
      if (video.currentTime >= start + CLIP_SECONDS) video.currentTime = start;
    };
    const onEnded = () => {
      video.currentTime = start;
      video.play().catch(() => {});
    };
    video.addEventListener("loadedmetadata", toStart);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting) {
          if (!attached) await attach();
          // Autoplay can still be refused (e.g. battery saver); the poster stays up.
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(video);

    return () => {
      cancelled = true;
      observer.disconnect();
      video.removeEventListener("loadedmetadata", toStart);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
      hls?.destroy();
    };
  }, [src, start, reduceMotion]);

  return (
    <video
      ref={ref}
      muted
      playsInline
      preload="none"
      poster={poster ?? undefined}
      aria-hidden
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
    />
  );
}
