"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import type Hls from "hls.js";
import { registerLoop } from "@/components/motion/playbackCoordinator";

const CLIP_SECONDS = 8;
const MP4_QUALITIES = [360, 480, 720];

// Loops a short muted window of an uploaded video, for collage tiles.
// Bunny videos play their plain MP4 copy in a native <video>: no player
// script, no per-tile streaming buffers, just the browser's own optimized
// media engine. The quality is the smallest that covers the tile, with
// lower ones as fallbacks. Other videos fall back to HLS via hls.js.
// The playback coordinator decides when each tile plays (only the few
// nearest the middle of the screen), and nothing loads until a tile first
// plays. Reduced motion keeps the poster.
export default function StreamLoop({
  mp4Base,
  hlsSrc,
  poster,
  start = 0,
  className = "",
}: {
  /** e.g. https://vz-….b-cdn.net/<id>/play_ — quality + ".mp4" is appended. */
  mp4Base: string | null;
  hlsSrc: string | null;
  poster: string | null;
  start?: number;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video || reduceMotion || (!mp4Base && !hlsSrc)) return;
    // React sets `muted` as a property only; browsers autoplay muted media only.
    video.muted = true;

    let hls: Hls | null = null;
    let attaching: Promise<void> | null = null;
    let cancelled = false;

    const attachMp4 = (base: string) => {
      // The tile's short side decides the quality ("360p" = 360px short side).
      const shortSide = Math.min(video.clientWidth, video.clientHeight);
      const best = MP4_QUALITIES.findIndex((q) => q >= shortSide);
      const picked = best === -1 ? MP4_QUALITIES.length - 1 : best;
      // Preferred quality first, then lower ones in case a small upload
      // never got the higher copy.
      for (const q of MP4_QUALITIES.slice(0, picked + 1).reverse()) {
        const source = document.createElement("source");
        source.src = `${base}${q}p.mp4#t=${start}`;
        source.type = "video/mp4";
        video.appendChild(source);
      }
      video.load();
    };

    const attachHls = async (src: string) => {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        return;
      }
      const { default: HlsClass } = await import("hls.js");
      if (cancelled || !HlsClass.isSupported()) return;
      const player = new HlsClass({
        autoStartLoad: false,
        capLevelToPlayerSize: true,
        ignoreDevicePixelRatio: true,
        testBandwidth: false,
        maxBufferLength: CLIP_SECONDS + 4,
        maxMaxBufferLength: CLIP_SECONDS + 8,
        backBufferLength: CLIP_SECONDS + 4,
      });
      // Pick the smallest rendition that covers the tile, then load from the
      // clip start (left alone, a looping clip never ramps up in quality).
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

    const attach = async () => {
      if (mp4Base) attachMp4(mp4Base);
      else if (hlsSrc) await attachHls(hlsSrc);
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
  }, [mp4Base, hlsSrc, start, reduceMotion]);

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
