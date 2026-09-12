import Parallax from "@/components/motion/Parallax";
import {
  Clapperboard,
  ColorWheel,
  FilmStrip,
  FrameCorners,
  Playhead,
  Scissors,
  TimecodeChip,
  Waveform,
} from "@/components/decor/EditingArt";

// Editing illustrations floating at different depths around a section:
// each drifts at its own speed (and turns a little) as the page scrolls,
// which makes the parallax easy to see. Place inside a `relative isolate`
// section. "hidden md:block" pieces are left out on phones to keep small
// screens uncluttered.
type Piece = {
  art: React.ReactNode;
  /** Position and width within the section. */
  place: string;
  speed: number;
  spin?: number;
  /** Resting angle, degrees. */
  tilt?: number;
};

const PRESETS: Record<"hero" | "work" | "summary" | "services" | "cta" | "hub", Piece[]> = {
  hero: [
    // Kept clear of the sticky header at the top of the hero.
    { art: <TimecodeChip />, place: "right-[5%] top-[14%] md:top-[16%]", speed: -320 },
    { art: <FrameCorners />, place: "left-[3%] top-[12%] w-20 md:w-28", speed: -180 },
    { art: <FilmStrip />, place: "hidden md:block left-[40%] bottom-[7%] w-56", speed: 380, spin: 16, tilt: -12 },
  ],
  work: [
    { art: <Clapperboard />, place: "right-[2%] top-[22%] w-20 md:w-32", speed: -440, spin: 22, tilt: 14 },
    { art: <ColorWheel />, place: "hidden md:block -left-6 top-[48%] w-28 md:w-36", speed: 380, spin: 140 },
    { art: <Scissors />, place: "hidden md:block right-[4%] bottom-[10%] w-20", speed: -320, spin: -50, tilt: -30 },
  ],
  summary: [
    { art: <Waveform />, place: "right-[4%] top-[4%] w-32 md:w-52 opacity-80", speed: -260 },
    { art: <Scissors />, place: "hidden md:block left-[44%] bottom-[2%] w-14", speed: 320, spin: 60, tilt: 40 },
  ],
  services: [
    { art: <FilmStrip />, place: "hidden md:block -left-16 top-[26%] w-72", speed: -400, spin: -10, tilt: 82 },
    { art: <Playhead />, place: "right-[6%] top-[8%] w-4 md:w-5", speed: 320 },
    { art: <FrameCorners />, place: "hidden md:block right-[10%] bottom-[6%] w-32", speed: -240 },
  ],
  cta: [
    { art: <Clapperboard />, place: "hidden md:block right-[5%] top-[8%] w-28", speed: -280, spin: -14, tilt: -10 },
    { art: <TimecodeChip />, place: "left-[6%] bottom-[5%]", speed: 220 },
  ],
  hub: [
    { art: <ColorWheel />, place: "hidden md:block right-[3%] top-[6%] w-32", speed: -360, spin: 160 },
    { art: <FilmStrip />, place: "left-[-3%] bottom-[10%] w-44 md:w-60", speed: 340, spin: 12, tilt: -8 },
  ],
};

export default function EditDecor({ preset }: { preset: keyof typeof PRESETS }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {PRESETS[preset].map((piece, index) => (
        <Parallax
          key={index}
          speed={piece.speed}
          spin={piece.spin}
          className={`absolute ${piece.place}`}
        >
          <div style={piece.tilt ? { transform: `rotate(${piece.tilt}deg)` } : undefined}>
            {piece.art}
          </div>
        </Parallax>
      ))}
    </div>
  );
}
