// Decides which looping collage tiles may play. Decoding many videos at once
// is what makes a page stutter: phones have only a few hardware decoders and
// fall back to slow software decoding for the rest. So only the most-visible
// few tiles play; the others hold their poster or last frame.

type Loop = { ratio: number; playing: boolean; play: () => void; pause: () => void };

const loops = new Map<Element, Loop>();
let observer: IntersectionObserver | null = null;

// A tile must be at least this visible to play.
const MIN_VISIBLE = 0.35;

function playLimit() {
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
  ).connection;
  // Data saver or a very slow connection: posters only.
  if (connection?.saveData || /2g/.test(connection?.effectiveType ?? "")) return 0;
  return window.matchMedia("(max-width: 767px)").matches ? 2 : 4;
}

function update() {
  const limit = document.hidden ? 0 : playLimit();
  // Most visible first; ties keep page order, since Map keeps insertion order.
  const winners = new Set(
    [...loops.values()]
      .filter((loop) => loop.ratio >= MIN_VISIBLE)
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, limit),
  );
  for (const loop of loops.values()) {
    const shouldPlay = winners.has(loop);
    if (shouldPlay && !loop.playing) loop.play();
    if (!shouldPlay && loop.playing) loop.pause();
    loop.playing = shouldPlay;
  }
}

function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const loop = loops.get(entry.target);
          if (loop) loop.ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
        }
        update();
      },
      { threshold: [0, MIN_VISIBLE, 0.6, 0.85, 1] },
    );
    document.addEventListener("visibilitychange", update);
  }
  return observer;
}

/** Registers a looping video; returns the cleanup function. */
export function registerLoop(el: Element, handlers: { play: () => void; pause: () => void }) {
  loops.set(el, { ratio: 0, playing: false, ...handlers });
  getObserver().observe(el);
  return () => {
    observer?.unobserve(el);
    loops.delete(el);
    update();
  };
}
