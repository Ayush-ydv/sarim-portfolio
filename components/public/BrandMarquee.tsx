import type { Brand } from "@prisma/client";
import SmartImage from "@/components/SmartImage";
import BrandParallax from "@/components/public/BrandParallax";

// The logos are laid out here on the server; BrandParallax moves them. The
// row repeats the brands enough to be wider than any viewport.
export default function BrandMarquee({ brands }: { brands: Brand[] }) {
  if (brands.length === 0) return null;
  const repeated = Array.from(
    { length: Math.max(2, Math.ceil(10 / brands.length)) },
    () => brands,
  ).flat();

  return (
    <section aria-labelledby="brands-heading" className="border-b border-rule bg-surface">
      <p id="brands-heading" className="sr-only">
        Brands I&apos;ve worked with
      </p>
      <ul className="sr-only">
        {brands.map((brand) => (
          <li key={brand.id}>{brand.name}</li>
        ))}
      </ul>
      <BrandParallax
        label="Brands I've worked with"
        logos={
          <ul className="flex shrink-0 items-center">
            {repeated.map((brand, index) => (
              <li key={index} className="flex h-16 items-center px-10 md:h-20 md:px-14">
                {brand.logoUrl ? (
                  <span className="relative block h-12 w-36 md:h-16 md:w-44">
                    <SmartImage
                      src={brand.logoUrl}
                      alt=""
                      fill
                      sizes="176px"
                      className="object-contain"
                    />
                  </span>
                ) : (
                  <span className="whitespace-nowrap font-display text-3xl italic text-foreground md:text-5xl">
                    {brand.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        }
      />
    </section>
  );
}
