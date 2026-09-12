import Parallax from "@/components/motion/Parallax";

// Soft pastel light behind a section, in layers that scroll at very
// different speeds: the content's depth becomes visible against them.
// Radial gradients, not blur filters, so moving them costs almost nothing.
// Place inside a `relative isolate` section.
type Orb = { position: string; color: string; speed: number };

const PRESETS: Record<"hero" | "work" | "services" | "hub", Orb[]> = {
  hero: [
    { position: "-left-24 top-[10%] size-[26rem] md:size-[34rem]", color: "var(--lavender)", speed: -380 },
    { position: "right-[8%] bottom-[-8%] size-[20rem] md:size-[28rem]", color: "var(--sun)", speed: 300 },
  ],
  work: [
    { position: "-left-32 top-[4%] size-[28rem] md:size-[38rem]", color: "var(--lavender)", speed: -420 },
    { position: "-right-28 top-[38%] size-[24rem] md:size-[32rem]", color: "var(--mint)", speed: 360 },
    { position: "left-[28%] bottom-[-6%] size-[20rem] md:size-[26rem]", color: "var(--blush)", speed: -260 },
  ],
  services: [
    { position: "-right-24 top-[6%] size-[24rem] md:size-[32rem]", color: "var(--blush)", speed: -360 },
    { position: "-left-24 bottom-[-4%] size-[22rem] md:size-[28rem]", color: "var(--sun)", speed: 300 },
  ],
  hub: [
    { position: "-right-32 top-[10%] size-[26rem] md:size-[36rem]", color: "var(--mint)", speed: -380 },
    { position: "-left-28 bottom-[0%] size-[24rem] md:size-[30rem]", color: "var(--lavender)", speed: 320 },
  ],
};

export default function ParallaxOrbs({ preset }: { preset: keyof typeof PRESETS }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {PRESETS[preset].map((orb, index) => (
        <Parallax key={index} speed={orb.speed} className={`absolute ${orb.position}`}>
          <div
            className="size-full rounded-full"
            style={{ background: `radial-gradient(circle, ${orb.color} 0%, transparent 68%)` }}
          />
        </Parallax>
      ))}
    </div>
  );
}
