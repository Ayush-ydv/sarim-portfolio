"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { optimizedVideoUrl, videoPosterUrl } from "@/lib/media";

// A muted, looping clip standing in for an image. It plays only while on
// screen, so a grid of clips never decodes all at once, and stays on its
// first frame for visitors who prefer reduced motion.
export default function LoopVideo({
  src,
  className = "",
  eager = false,
}: {
  src: string;
  className?: string;
  eager?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();
  const optimized = optimizedVideoUrl(src);
  const poster = videoPosterUrl(src);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // React sets `muted` as a property only; set it explicitly before play()
    // since browsers allow autoplay just for muted media.
    video.muted = true;
    if (reduceMotion) {
      video.pause();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Autoplay can still be refused (e.g. battery saver); the poster
          // or first frame simply stays up.
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduceMotion]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload={eager ? "auto" : "metadata"}
      poster={poster ?? undefined}
      aria-hidden
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
    >
      {/* If Cloudinary hasn't finished transcoding the optimized version,
          the browser falls through to the original upload. */}
      {optimized && <source src={optimized} type="video/mp4" />}
      <source src={src} />
    </video>
  );
}
