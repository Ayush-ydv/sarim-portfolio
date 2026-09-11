import type { Brand } from "@prisma/client";
import SmartImage from "@/components/SmartImage";

// CSS-driven, no JS. Two identical copies slide left by half their combined
// width for a seamless loop, so the strip keeps moving to the left. Each copy
// repeats the brands enough to be wider than any viewport.
export default function BrandMarquee({ brands }: { brands: Brand[] }) {
  if (brands.length === 0) return null;
  const repeated = Array.from(
    { length: Math.max(2, Math.ceil(10 / brands.length)) },
    () => brands,
  ).flat();

  return (
    <section
      aria-labelledby="brands-heading"
      className="border-b border-rule bg-surface py-12 md:py-16"
    >
      <p id="brands-heading" className="label-caps text-center text-muted">
        Brands I&apos;ve worked with
      </p>
      <ul className="sr-only">
        {brands.map((brand) => (
          <li key={brand.id}>{brand.name}</li>
        ))}
      </ul>
      <div
        aria-hidden
        className="group mt-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      >
        <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0 items-center">
              {repeated.map((brand, index) => (
                <li key={index} className="flex h-16 items-center px-10 md:px-14">
                  {brand.logoUrl ? (
                    <span className="relative block h-12 w-36 md:h-14 md:w-40">
                      <SmartImage
                        src={brand.logoUrl}
                        alt=""
                        fill
                        sizes="160px"
                        className="object-contain opacity-70 grayscale transition duration-500 hover:opacity-100 hover:grayscale-0"
                      />
                    </span>
                  ) : (
                    <span className="whitespace-nowrap font-display text-3xl italic text-foreground/80 md:text-4xl">
                      {brand.name}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
