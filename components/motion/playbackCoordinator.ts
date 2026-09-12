// Decides which looping collage tiles may play. Decoding several videos at
// once is what makes scrolling stutter: phones have only a few hardware
// decoders and fall back to slow software decoding for the rest. So only the
// tile nearest the middle of the screen plays on phones, while larger
// screens play every visible tile; the rest hold their poster.

type Loop = { el: Element; ratio: number; playing: boolean; play: () => void; pause: () => void };

const loops = new Map<Element, Loop>();
let observer: IntersectionObserver | null = null;
let frame = 0;

// A tile must be at least half visible to play.
const MIN_VISIBLE = 0.5;

function playLimit() {
  if (document.hidden) return 0;
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
    deviceMemory?: number;
  };
  // Data saver or a very slow connection: posters only.
  if (nav.connection?.saveData || /2g/.test(nav.connection?.effectiveType ?? "")) return 0;
  // Phones: only the centred tile. Very low-memory devices: two.
  // Laptops and tablets decode plain MP4s easily, so every visible tile plays.
  if (window.matchMedia("(max-width: 767px)").matches) return 1;
  if ((nav.deviceMemory ?? 8) <= 2) return 2;
  return Infinity;
}

function update() {
  frame = 0;
  const middle = window.innerHeight / 2;
  const distance = (loop: Loop) => {
    const rect = loop.el.getBoundingClientRect();
    return Math.abs(rect.top + rect.height / 2 - middle);
  };
  // Only visible tiles are measured, so this stays cheap while scrolling.
  const winners = new Set(
    [...loops.values()]
      .filter((loop) => loop.ratio >= MIN_VISIBLE)
      .map((loop) => ({ loop, d: distance(loop) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, playLimit())
      .map(({ loop }) => loop),
  );
  for (const loop of loops.values()) {
    const shouldPlay = winners.has(loop);
    if (shouldPlay && !loop.playing) loop.play();
    if (!shouldPlay && loop.playing) loop.pause();
    loop.playing = shouldPlay;
  }
}

// Re-rank at most once per frame; the most-centered tile changes as the
// page scrolls even when no tile crosses a visibility threshold.
function scheduleUpdate() {
  if (!frame) frame = requestAnimationFrame(update);
}

function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const loop = loops.get(entry.target);
          if (loop) loop.ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
        }
        scheduleUpdate();
      },
      { threshold: [0, 0.25, MIN_VISIBLE, 0.75, 1] },
    );
    document.addEventListener("visibilitychange", scheduleUpdate);
    window.addEventListener("scroll", () => {
      if ([...loops.values()].some((loop) => loop.ratio > 0)) scheduleUpdate();
    }, { passive: true });
  }
  return observer;
}

/** Registers a looping video; returns the cleanup function. */
export function registerLoop(el: Element, handlers: { play: () => void; pause: () => void }) {
  loops.set(el, { el, ratio: 0, playing: false, ...handlers });
  getObserver().observe(el);
  return () => {
    observer?.unobserve(el);
    loops.delete(el);
    scheduleUpdate();
  };
}
