import type { getSectionBySlug } from "@/lib/sections";
import Reveal from "@/components/motion/Reveal";
import ParallaxMedia from "@/components/motion/ParallaxMedia";
import Parallax from "@/components/motion/Parallax";
import OutlineBand from "@/components/motion/OutlineBand";
import { paragraphs } from "@/lib/media";

type Section = NonNullable<Awaited<ReturnType<typeof getSectionBySlug>>>;

export default function ContentTemplate({ section }: { section: Section }) {
  const content = section.content;
  const heading = content?.heading || section.navLabel;
  const body = paragraphs(content?.bodyText ?? "");

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 md:pb-32 md:pt-24">
      <Reveal className="relative isolate border-b border-foreground pb-10">
        <OutlineBand text={section.navLabel} className="top-0" />
        {heading !== section.navLabel && (
          <p className="label-caps text-muted">{section.navLabel}</p>
        )}
        <Parallax speed={-160} axis="x">
          <h1 className="mt-4 font-display text-h1 text-foreground">{heading}</h1>
        </Parallax>
      </Reveal>

      <div className="mt-16 grid gap-12 md:mt-20 md:grid-cols-12 md:gap-16">
        {content?.imageUrl && (
          <Reveal className="md:col-span-5">
            {/* The photo lags behind the text; its colour card behind it
                moves the other way, pulling the two layers apart. */}
            <Parallax speed={140} mobile={false}>
              <div className="relative">
                <Parallax
                  speed={-120}
                  mobile={false}
                  className="absolute -bottom-4 -right-4 h-full w-full"
                >
                  <div aria-hidden className="h-full w-full rounded-2xl bg-mint" />
                </Parallax>
                <ParallaxMedia
                  src={content.imageUrl}
                  alt={heading}
                  sizes="(min-width: 768px) 38vw, 90vw"
                  className="aspect-[4/5] rounded-2xl"
                />
              </div>
            </Parallax>
          </Reveal>
        )}

        <Reveal
          delay={0.1}
          className={content?.imageUrl ? "md:col-span-7" : "md:col-span-9"}
        >
          {body.length === 0 ? (
            <p className="font-display text-lg text-muted">No content yet.</p>
          ) : (
            <div className="space-y-6 font-display text-lg leading-relaxed text-foreground/85 md:text-xl">
              {body.map((paragraph, index) => (
                <p
                  key={index}
                  className={
                    index === 0
                      ? "text-lede text-foreground first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[4.2em] first-letter:leading-[0.78] first-letter:italic"
                      : undefined
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </div>
  );
}
