// Small hand-drawn editing illustrations, as inline SVG in the site's
// palette. Decorative only: every piece is aria-hidden and scales to the
// width of its container.

const INK = "var(--foreground)";
const PAPER = "var(--background)";

/** A dark strip of film with pastel frames. */
export function FilmStrip({ className = "" }: { className?: string }) {
  const holes = Array.from({ length: 15 }, (_, i) => 6 + i * 16);
  const frames = ["var(--lavender)", "var(--mint)", "var(--blush)"];
  return (
    <svg viewBox="0 0 240 90" aria-hidden className={`h-auto w-full ${className}`}>
      <rect width="240" height="90" rx="6" fill={INK} />
      {holes.map((x) => (
        <g key={x} fill={PAPER} opacity="0.85">
          <rect x={x} y="6" width="8" height="7" rx="1.5" />
          <rect x={x} y="77" width="8" height="7" rx="1.5" />
        </g>
      ))}
      {frames.map((fill, i) => (
        <rect key={i} x={12 + i * 76} y="20" width="64" height="50" rx="3" fill={fill} />
      ))}
    </svg>
  );
}

/** A clapperboard: dark slate, striped clapper tilted open. */
export function Clapperboard({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 112" aria-hidden className={`h-auto w-full ${className}`}>
      <rect x="6" y="36" width="108" height="70" rx="6" fill={INK} />
      <g stroke={PAPER} strokeOpacity="0.35" strokeWidth="1.2">
        <line x1="14" y1="62" x2="106" y2="62" />
        <line x1="14" y1="82" x2="106" y2="82" />
        <line x1="60" y1="62" x2="60" y2="98" />
      </g>
      <g fill={PAPER} fontFamily="ui-monospace, monospace" fontSize="8" opacity="0.8">
        <text x="16" y="54">SCENE 12</text>
        <text x="16" y="76">TAKE 3</text>
        <text x="66" y="76">ROLL A</text>
      </g>
      <g transform="rotate(-14 6 32)">
        <rect x="6" y="16" width="108" height="16" rx="3" fill={PAPER} stroke={INK} strokeWidth="2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${14 + i * 22} 16 h10 l-8 16 h-10 z`} fill={INK} />
        ))}
      </g>
      <circle cx="10" cy="34" r="3.5" fill={PAPER} stroke={INK} strokeWidth="1.5" />
    </svg>
  );
}

/** Scissors: the cut. */
export function Scissors({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      aria-hidden
      fill="none"
      stroke={INK}
      strokeWidth="3"
      strokeLinecap="round"
      className={`h-auto w-full ${className}`}
    >
      <path d="M29 50 62 8M51 50 18 8" />
      <circle cx="22" cy="60" r="11" fill="var(--sun)" />
      <circle cx="58" cy="60" r="11" fill="var(--sun)" />
      <circle cx="40" cy="31" r="2.5" fill={INK} />
    </svg>
  );
}

/** A colour-grading wheel in the site's pastels. */
export function ColorWheel({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`relative aspect-square ${className}`}>
      <div
        className="absolute inset-0 rounded-full border-2 border-foreground"
        style={{
          background:
            "conic-gradient(var(--blush), var(--sun), var(--mint), var(--lavender), var(--blush))",
        }}
      />
      <div className="absolute inset-[18%] rounded-full bg-background/35" />
      <div className="absolute left-1/2 top-[12%] h-[76%] w-px -translate-x-1/2 bg-foreground/50" />
      <div className="absolute left-[12%] top-1/2 h-px w-[76%] -translate-y-1/2 bg-foreground/50" />
      <div className="absolute left-[58%] top-[34%] size-[12%] rounded-full border-2 border-foreground bg-background" />
    </div>
  );
}

/** An audio waveform. */
export function Waveform({ className = "" }: { className?: string }) {
  // Fixed heights (not random) so server and client render the same.
  const heights = [8, 16, 26, 14, 34, 22, 44, 30, 18, 38, 50, 28, 16, 36, 24, 42, 20, 12, 30, 46, 26, 14, 32, 18, 10];
  return (
    <svg viewBox="0 0 200 60" aria-hidden className={`h-auto w-full ${className}`}>
      {heights.map((h, i) => (
        <rect key={i} x={i * 8} y={30 - h / 2} width="4.5" height={h} rx="2.25" fill={INK} />
      ))}
    </svg>
  );
}

/** A recording timecode readout. */
export function TimecodeChip({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`inline-flex items-center gap-2 rounded-full bg-foreground px-3.5 py-2 font-mono text-[0.7rem] tracking-[0.12em] text-background shadow-lg md:text-xs ${className}`}
    >
      <span className="size-2 rounded-full bg-[#ff5a4e]" />
      REC <span className="text-background/70">00:01:24:12</span>
    </div>
  );
}

/** The red scrub line of an editing timeline. */
export function Playhead({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 140" aria-hidden className={`h-auto w-full ${className}`}>
      <path d="M2 2h16v10l-8 8-8-8z" fill="#ff5a4e" />
      <rect x="9" y="18" width="2" height="122" fill="#ff5a4e" />
    </svg>
  );
}

/** Crop marks with a centre cross: the edge of a frame. */
export function FrameCorners({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 80"
      aria-hidden
      fill="none"
      stroke={INK}
      strokeWidth="2.5"
      strokeLinecap="round"
      className={`h-auto w-full ${className}`}
    >
      <path d="M4 20V4h16M100 4h16v16M116 60v16h-16M20 76H4V60" />
      <path d="M60 32v16M52 40h16" strokeWidth="2" />
    </svg>
  );
}
