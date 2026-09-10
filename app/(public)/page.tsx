import Image from "next/image";
import { getSiteSettings } from "@/lib/sections";
import SectionDivider from "@/components/public/SectionDivider";

export default async function HomePage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-20 px-6 py-16">
      <section className="flex flex-col items-center gap-6 text-center">
        {settings.heroImageUrl && (
          <div className="relative aspect-[3/4] w-full max-w-xs overflow-hidden">
            <Image
              src={settings.heroImageUrl}
              alt={`${settings.heroNameLine1} ${settings.heroNameLine2}`}
              fill
              priority
              className="object-cover"
            />
          </div>
        )}
        <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
          {settings.heroNameLine1}
          <br />
          {settings.heroNameLine2}
        </h1>
        {settings.heroTagline && (
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {settings.heroTagline}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-6">
        <SectionDivider label="About" />
        <p className="max-w-2xl whitespace-pre-line text-sm leading-relaxed text-foreground/80">
          {settings.bioText}
        </p>
      </section>

      {settings.quickLinks.length > 0 && (
        <section className="flex flex-col gap-6">
          <SectionDivider label="Quick links" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {settings.quickLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-square overflow-hidden bg-foreground/5"
              >
                {link.thumbnailUrl && (
                  <Image
                    src={link.thumbnailUrl}
                    alt=""
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-6">
        <SectionDivider label="Philosophy" />
        <p className="max-w-2xl whitespace-pre-line text-sm leading-relaxed text-foreground/80">
          {settings.philosophyText}
        </p>
      </section>

      <section className="flex flex-col items-center gap-4 text-center">
        <p className="font-display text-2xl text-foreground">
          {settings.ctaText}
        </p>
        <a
          href={`mailto:${settings.email}`}
          className="text-xs uppercase tracking-[0.2em] text-muted underline underline-offset-4 transition-colors hover:text-foreground"
        >
          Book Me
        </a>
      </section>
    </div>
  );
}
