import Parallax from "@/components/motion/Parallax";

// A giant outlined line of words sliding sideways behind a heading as the
// page scrolls. Decorative only. Place inside a `relative isolate` block.
export default function OutlineBand({
  text,
  className = "top-0",
  speed = -700,
}: {
  text: string;
  /** Vertical placement within the parent, e.g. "top-0" or "top-1/3". */
  className?: string;
  speed?: number;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 -z-10 overflow-hidden ${className}`}
    >
      <Parallax axis="x" speed={speed} className="w-max">
        <p className="whitespace-nowrap font-display text-[clamp(5rem,17vw,15rem)] leading-none text-transparent [-webkit-text-stroke:1px_rgb(23_22_20/0.12)]">
          {Array.from({ length: 4 }, () => text).join(" · ")}
        </p>
      </Parallax>
    </div>
  );
}
