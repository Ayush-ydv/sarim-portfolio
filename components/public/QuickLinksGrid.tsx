import Image from "@/components/SmartImage";
import type { QuickLink } from "@prisma/client";
import Reveal from "@/components/motion/Reveal";

// Thumbnails have no stored dimensions, so varied aspect ratios on a CSS
// column layout give the reference's masonry rhythm.
const aspects = [
  "aspect-[4/3]",
  "aspect-[3/4]",
  "aspect-square",
  "aspect-[4/5]",
  "aspect-video",
  "aspect-[3/4]",
];

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function QuickLinksGrid({ links }: { links: QuickLink[] }) {
  if (links.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="text-center">
        <h2 className="font-display text-h2 text-foreground">Quick links</h2>
      </Reveal>
      <div className="mt-12 columns-2 gap-4 md:columns-3">
        {links.map((link, index) => (
          <Reveal
            key={link.id}
            delay={(index % 3) * 0.08}
            className="mb-4 break-inside-avoid"
          >
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${hostname(link.url)}`}
              className={`group relative block overflow-hidden rounded-xl bg-lavender ${aspects[index % aspects.length]}`}
            >
              {link.thumbnailUrl && (
                <Image
                  src={link.thumbnailUrl}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 30vw, 45vw"
                  className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.07]"
                />
              )}
              <span
                aria-hidden
                className="absolute inset-0 bg-foreground/0 transition-colors duration-500 group-hover:bg-foreground/25"
              />
              <span
                aria-hidden
                className="absolute bottom-3 left-3 translate-y-2 rounded-full bg-background px-3 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.18em] text-foreground opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100"
              >
                Open ↗
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
