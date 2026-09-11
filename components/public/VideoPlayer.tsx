"use client";

import Image from "next/image";
import { useState } from "react";

// Shows a poster until clicked, so a gallery page loads no third-party video
// iframes up front; the embed URL already carries its autoplay flag.
export default function VideoPlayer({
  embedUrl,
  thumbnail,
  title,
}: {
  embedUrl: string;
  thumbnail: string | null;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-foreground">
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
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${title}`}
      className="group relative block aspect-video w-full overflow-hidden rounded-2xl bg-foreground text-left"
    >
      {thumbnail ? (
        <Image
          src={thumbnail}
          alt=""
          fill
          sizes="(min-width: 768px) 58vw, 100vw"
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
        className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background shadow-lg transition-transform duration-500 ease-out-expo group-hover:scale-110 md:h-24 md:w-24"
      >
        <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-foreground">
          <path d="M8 5.5v13l11-6.5z" />
        </svg>
      </span>
      <span
        aria-hidden
        className="absolute bottom-5 left-5 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-background"
      >
        Watch
      </span>
    </button>
  );
}
