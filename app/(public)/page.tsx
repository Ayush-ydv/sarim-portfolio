import Image from "next/image";
import { getFeaturedWork, getSiteSettings } from "@/lib/sections";
import Reveal from "@/components/motion/Reveal";
import Hero from "@/components/public/Hero";
import Marquee from "@/components/public/Marquee";
import FeaturedWork from "@/components/public/FeaturedWork";
import QuickLinksGrid from "@/components/public/QuickLinksGrid";
import StatsBand from "@/components/public/StatsBand";
import ServicesGrid from "@/components/public/ServicesGrid";
import CtaBand from "@/components/public/CtaBand";

export default async function HomePage() {
  const [settings, featured] = await Promise.all([
    getSiteSettings(),
    getFeaturedWork(),
  ]);
  const name = [settings.heroNameLine1, settings.heroNameLine2]
    .filter(Boolean)
    .join(" ");
  const workHref = featured ? `/${featured.slug}` : "#about";

  return (
    <>
      <Hero
        nameLine1={settings.heroNameLine1}
        nameLine2={settings.heroNameLine2}
        tagline={settings.heroTagline}
        imageUrl={settings.heroImageUrl}
        workHref={workHref}
        ctaLabel={settings.ctaButtonLabel}
      />

      <Marquee items={settings.services.map((service) => service.title)} />

      <section id="about" className="mx-auto max-w-6xl scroll-mt-24 px-6 pt-24 md:pt-32">
        <Reveal className="grid gap-8 border-y border-foreground py-10 md:grid-cols-12 md:gap-12 md:py-14">
          <div className="md:col-span-3">
            <p className="label-caps text-muted">Summary</p>
            {settings.bioImageUrl && (
              <div className="relative mt-6 aspect-[4/5] overflow-hidden rounded-xl">
                <Image
                  src={settings.bioImageUrl}
                  alt={name}
                  fill
                  sizes="(min-width: 768px) 20vw, 90vw"
                  className="object-cover"
                />
              </div>
            )}
          </div>
          <p className="whitespace-pre-line font-display text-lede text-foreground md:col-span-9">
            {settings.bioText}
          </p>
        </Reveal>
      </section>

      {featured && (
        <FeaturedWork href={`/${featured.slug}`} items={featured.galleryItems} />
      )}

      <QuickLinksGrid links={settings.quickLinks} />

      <StatsBand stats={settings.stats} />

      <section className="px-3 py-24 md:px-6 md:py-32">
        <div className="wash-blush overflow-hidden rounded-[2rem]">
          <Reveal className="mx-auto max-w-5xl px-6 py-20 md:px-12 md:py-28">
            <p className="label-caps text-foreground/60">Philosophy</p>
            <span
              aria-hidden
              className="mt-6 block font-display text-[7rem] leading-[0.6] text-foreground/20"
            >
              &ldquo;
            </span>
            <blockquote className="font-display text-quote text-balance text-foreground">
              {settings.philosophyText}
            </blockquote>
          </Reveal>
        </div>
      </section>

      <ServicesGrid heading={settings.servicesHeading} services={settings.services} />

      <CtaBand
        text={settings.ctaText}
        email={settings.email}
        buttonLabel={settings.ctaButtonLabel}
      />
    </>
  );
}
