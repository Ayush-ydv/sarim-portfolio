"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import type Hls from "hls.js";
import { registerLoop } from "@/components/motion/playbackCoordinator";

const CLIP_SECONDS = 8;

// Loops a short muted window of an uploaded video, for collage tiles.
// The stream is HLS, which only Safari plays natively, so elsewhere hls.js is
// loaded on demand and capped to the tile's size — a grid of tiles then pulls
// small renditions instead of full 1080p. The playback coordinator decides
// when each tile plays (only the few most visible at once), and the player
// isn't created until a tile first plays. Reduced motion keeps the poster.
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
    let attaching: Promise<void> | null = null;
    let cancelled = false;

    const attach = async () => {
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
        // Keep the whole clip buffered so each loop replays from memory
        // instead of downloading it again.
        backBufferLength: CLIP_SECONDS + 4,
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

    const unregister = registerLoop(video, {
      play: async () => {
        attaching ??= attach();
        await attaching;
        // Autoplay can still be refused (e.g. battery saver); the poster stays up.
        if (!cancelled) video.play().catch(() => {});
      },
      pause: () => video.pause(),
    });

    return () => {
      cancelled = true;
      unregister();
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
