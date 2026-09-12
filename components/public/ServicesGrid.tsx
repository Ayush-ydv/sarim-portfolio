import type { Service } from "@prisma/client";
import Reveal from "@/components/motion/Reveal";
import Parallax from "@/components/motion/Parallax";
import ParallaxOrbs from "@/components/motion/ParallaxOrbs";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";

const tints = ["bg-lavender", "bg-mint", "bg-blush", "bg-sun"];

export default function ServicesGrid({
  heading,
  services,
}: {
  heading: string;
  services: Service[];
}) {
  if (services.length === 0) return null;

  return (
    <section className="relative isolate">
      <ParallaxOrbs preset="services" />
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <Reveal>
        <p className="label-caps text-muted">Services</p>
        <h2 className="mt-4 max-w-3xl font-display text-h1 text-balance text-foreground">
          {heading}
        </h2>
      </Reveal>

      <StaggerGroup className="mt-14 grid gap-5 md:grid-cols-3">
        {services.map((service, index) => (
          <StaggerItem key={service.id} className="h-full">
            {/* The middle card of each row rises faster than its neighbours. */}
            <Parallax speed={index % 3 === 1 ? -140 : 60} mobile={false} className="h-full">
            <article className="group relative isolate flex h-full flex-col overflow-hidden rounded-2xl border border-rule bg-surface p-8 transition-[transform,box-shadow] duration-500 ease-out-expo hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-32px_rgb(23_22_20/0.45)] md:p-10">
              <span
                aria-hidden
                className={`absolute inset-0 -z-10 origin-bottom scale-y-0 transition-transform duration-700 ease-out-expo group-hover:scale-y-100 ${tints[index % tints.length]}`}
              />
              <span className="font-display text-sm text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-12 font-display text-3xl leading-tight text-foreground">
                {service.title}
              </h3>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-foreground/75">
                {service.description}
              </p>
            </article>
            </Parallax>
          </StaggerItem>
        ))}
      </StaggerGroup>
      </div>
    </section>
  );
}
