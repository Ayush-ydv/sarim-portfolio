"use client";

import Image from "@/components/SmartImage";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Shows a poster until clicked, so a gallery page loads no third-party video
// iframes up front; the embed URL already carries its autoplay flag.
// A player squeezed into a phone-width or small tile hides its controls, so
// there it opens full-screen instead; roomy tiles (laptops) play in place.
export default function VideoPlayer({
  embedUrl,
  thumbnail,
  title,
  vertical = false,
}: {
  embedUrl: string;
  thumbnail: string | null;
  title: string;
  vertical?: boolean;
}) {
  const [mode, setMode] = useState<"poster" | "inline" | "lightbox">("poster");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const aspect = vertical ? "aspect-[9/16]" : "aspect-video";
  const close = useCallback(() => {
    setMode("poster");
    buttonRef.current?.focus();
  }, []);

  if (mode === "inline") {
    return (
      <div className={`relative ${aspect} w-full overflow-hidden rounded-2xl bg-foreground`}>
        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          const tile = buttonRef.current?.clientWidth ?? 0;
          const phone = window.matchMedia("(max-width: 767px)").matches;
          setMode(phone || tile < 360 ? "lightbox" : "inline");
        }}
        aria-label={`Play video: ${title}`}
        className={`group relative block ${aspect} w-full overflow-hidden rounded-2xl bg-foreground text-left`}
      >
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt=""
            fill
            sizes={vertical ? "(min-width: 768px) 25vw, 50vw" : "(min-width: 768px) 58vw, 100vw"}
            className="object-cover opacity-90 transition duration-[1.2s] ease-out-expo group-hover:scale-[1.04] group-hover:opacity-100"
          />
        ) : (
          <span aria-hidden className="wash-lavender absolute inset-0" />
        )}
        <span
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-foreground/45 via-transparent to-transparent"
        />
        <span
          aria-hidden
          className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background shadow-lg transition-transform duration-500 ease-out-expo group-hover:scale-110 ${
            vertical ? "h-12 w-12 md:h-14 md:w-14" : "h-16 w-16 md:h-24 md:w-24"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className={`ml-1 fill-foreground ${vertical ? "h-5 w-5" : "h-6 w-6 md:h-7 md:w-7"}`}
          >
            <path d="M8 5.5v13l11-6.5z" />
          </svg>
        </span>
        <span
          aria-hidden
          className="absolute bottom-4 left-4 text-[0.66rem] font-medium uppercase tracking-[0.22em] text-background md:bottom-5 md:left-5 md:text-[0.7rem]"
        >
          Watch
        </span>
      </button>

      {mode === "lightbox" && (
        <VideoLightbox embedUrl={embedUrl} title={title} vertical={vertical} onClose={close} />
      )}
    </>
  );
}

// Full-screen player: the video as large as the screen allows at its own
// shape (so nothing is cropped), with the player's full controls. Closes on
// the ✕, a tap outside the video, or Escape.
function VideoLightbox({
  embedUrl,
  title,
  vertical,
  onClose,
}: {
  embedUrl: string;
  title: string;
  vertical: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  // Largest frame that fits the screen (minus a small margin) at the video's
  // shape; rotating the phone recomputes it.
  const frame = vertical
    ? "aspect-[9/16] h-[min(86svh,calc((100vw_-_2rem)*16/9))]"
    : "aspect-video w-[min(calc(100vw_-_2rem),calc(80svh*16/9))]";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0b0a09]/95 p-4 animate-page-in"
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close video"
        className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 stroke-current" fill="none" strokeWidth={1.8}>
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative max-w-full overflow-hidden rounded-xl bg-black ${frame}`}
      >
        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>,
    document.body,
  );
}
