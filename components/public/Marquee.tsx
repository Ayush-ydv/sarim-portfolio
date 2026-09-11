// CSS-driven so it costs no JS. Two identical copies slide by exactly half
// their combined width, which makes the loop seamless; each copy repeats the
// items enough to be wider than any viewport.
export default function Marquee({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  const repeated = Array.from(
    { length: Math.max(2, Math.ceil(8 / items.length)) },
    () => items,
  ).flat();

  return (
    <section className="group overflow-hidden border-b border-rule bg-surface py-6 md:py-8">
      <ul className="sr-only">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div
        aria-hidden
        className="flex w-max animate-marquee group-hover:[animation-play-state:paused]"
      >
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center">
            {repeated.map((item, index) => (
              <li
                key={index}
                className="flex items-center font-display text-h2 italic text-foreground"
              >
                <span className="px-8">{item}</span>
                <span className="text-2xl not-italic text-muted">✦</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
