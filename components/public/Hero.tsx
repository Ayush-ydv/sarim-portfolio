import Link from "next/link";
import HeroStage, { type HeroShape } from "@/components/public/HeroStage";
import ParallaxOrbs from "@/components/motion/ParallaxOrbs";
import { backgroundEmbedUrl, isVideoUrl } from "@/lib/media";

// The entrance is CSS keyframes rather than Framer so the name (the likely
// LCP element) animates on first paint instead of waiting for hydration.
export default function Hero({
  nameLine1,
  nameLine2,
  tagline,
  imageUrl,
  workHref,
  ctaLabel,
}: {
  nameLine1: string;
  nameLine2: string;
  tagline: string;
  imageUrl: string | null;
  workHref: string;
  ctaLabel: string;
}) {
  const fullName = [nameLine1, nameLine2].filter(Boolean).join(" ");
  const initials = `${nameLine1.charAt(0)}${nameLine2.charAt(0)}`.toUpperCase();

  // First guess at the media's shape, before the browser can measure it:
  // platform links are 16:9 unless they're Shorts, uploaded clips are
  // usually showreels, and stills are usually portraits.
  const src = imageUrl?.trim() || null;
  const embed = src ? backgroundEmbedUrl(src) : null;
  const isVideo = Boolean(src && !embed && isVideoUrl(src));
  const initialShape: HeroShape = embed
    ? /\/shorts\//.test(src ?? "") ? "portrait" : "landscape"
    : isVideo ? "landscape" : "portrait";

  return (
    <section className="wash-hero relative isolate overflow-hidden border-b border-rule">
      <ParallaxOrbs preset="hero" />
      <div className="mx-auto flex max-w-[92rem] flex-col justify-center px-6 pb-20 pt-12 md:min-h-[calc(100svh-5.5rem)] md:px-12 md:py-20 lg:px-20">
        <HeroStage
          src={src}
          alt={fullName}
          initialShape={initialShape}
          lockShape={Boolean(embed)}
          // Keep faces in frame when a portrait is cropped to the card.
          mediaClassName={embed || isVideo ? "object-cover" : "object-cover object-[50%_28%]"}
          fallback={
            <div className="wash-blush flex h-full w-full items-center justify-center font-display text-[clamp(5rem,14vw,12rem)] italic text-foreground/80">
              {initials}
            </div>
          }
        >
          <h1 className="font-display text-hero text-foreground [overflow-wrap:anywhere]">
            <span className="block overflow-hidden pb-[0.12em] pr-[0.1em]">
              <span
                className="block animate-line-up"
                style={{ animationDelay: "120ms" }}
              >
                {nameLine1}
              </span>
            </span>
            {nameLine2 && (
              <span className="block overflow-hidden pb-[0.12em] pr-[0.1em]">
                <span
                  className="block animate-line-up pl-[0.45em] italic"
                  style={{ animationDelay: "260ms" }}
                >
                  {nameLine2}
                </span>
              </span>
            )}
          </h1>

          {tagline && (
            <div
              className="mt-8 flex max-w-md items-center gap-4 animate-rise md:mt-10"
              style={{ animationDelay: "480ms" }}
            >
              <span aria-hidden className="h-px w-12 shrink-0 bg-foreground" />
              <p className="text-[0.78rem] font-medium uppercase leading-relaxed tracking-[0.24em] text-foreground">
                {tagline}
              </p>
            </div>
          )}

          <div
            className="mt-10 flex flex-wrap gap-3 animate-rise"
            style={{ animationDelay: "620ms" }}
          >
            <Link
              href={workHref}
              className="btn-pill bg-foreground px-7 py-4 text-background hover:bg-transparent hover:text-foreground"
            >
              View work
            </Link>
            <Link
              href="#contact"
              className="btn-pill bg-background/50 px-7 py-4 backdrop-blur-sm hover:bg-foreground hover:text-background"
            >
              {ctaLabel}
            </Link>
          </div>
        </HeroStage>
      </div>

      <a
        href="#explore"
        className="label-caps absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-muted animate-rise hover:text-foreground md:flex"
        style={{ animationDelay: "900ms" }}
      >
        Scroll
        <span aria-hidden className="block h-8 w-px overflow-hidden bg-foreground/15">
          <span className="block h-1/2 w-px animate-bob bg-foreground/60" />
        </span>
      </a>
    </section>
  );
}
