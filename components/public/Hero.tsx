import Link from "next/link";
import ParallaxMedia from "@/components/motion/ParallaxMedia";

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

  return (
    <section className="relative border-b border-rule">
      <div className="grid md:min-h-[calc(100svh-5.5rem)] md:grid-cols-2">
        <div className="relative isolate flex flex-col justify-center overflow-hidden px-6 pb-20 pt-16 md:px-12 md:py-24 lg:px-20">
          <div aria-hidden className="wash-lavender absolute inset-0 -z-10" />

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
              className="mt-10 flex items-center gap-4 animate-rise"
              style={{ animationDelay: "480ms" }}
            >
              <span aria-hidden className="h-px w-12 shrink-0 bg-foreground" />
              <p className="text-[0.78rem] font-medium uppercase tracking-[0.24em] text-foreground">
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
              className="btn-pill bg-foreground px-6 py-3.5 text-background hover:bg-transparent hover:text-foreground"
            >
              View work
            </Link>
            <Link
              href="#contact"
              className="btn-pill px-6 py-3.5 hover:bg-foreground hover:text-background"
            >
              {ctaLabel}
            </Link>
          </div>

          <a
            href="#about"
            className="label-caps absolute bottom-8 left-6 hidden items-center gap-3 text-muted animate-rise md:left-12 md:flex lg:left-20"
            style={{ animationDelay: "900ms" }}
          >
            <span aria-hidden className="inline-block animate-bob">
              ↓
            </span>
            Scroll
          </a>
        </div>

        <div className="relative isolate h-[72svh] overflow-hidden bg-mint md:h-auto">
          <div
            aria-hidden
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sun/60 blur-3xl"
          />
          <div className="hero-chevron absolute inset-y-0 left-1/2 w-[64%] -translate-x-1/2 md:w-[58%]">
            <div
              className="h-full w-full animate-zoom-settle"
              style={{ animationDelay: "150ms" }}
            >
              {imageUrl ? (
                <ParallaxMedia
                  src={imageUrl}
                  alt={fullName}
                  sizes="(min-width: 768px) 30vw, 64vw"
                  preload
                  className="h-full w-full"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-lavender font-display text-[clamp(5rem,14vw,12rem)] italic text-foreground/80">
                  {initials}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
