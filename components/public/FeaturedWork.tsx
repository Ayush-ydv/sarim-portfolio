import Link from "next/link";
import SmartImage from "@/components/SmartImage";
import Reveal from "@/components/motion/Reveal";
import StreamLoop from "@/components/motion/StreamLoop";
import BackgroundEmbed from "@/components/motion/BackgroundEmbed";
import type { FeaturedItem } from "@/lib/sections";
import {
  backgroundEmbedUrl,
  isVertical,
  splitTitle,
  streamHlsUrl,
  streamMp4Base,
  thumbnailTime,
  videoThumbnail,
} from "@/lib/media";

const tints = ["bg-lavender", "bg-mint", "bg-blush", "bg-sun"];
const zoom =
  "transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.04]";

function TileMedia({ item, index }: { item: FeaturedItem; index: number }) {
  const poster = videoThumbnail(item);

  const upload = item.mediaType === "VIDEO_UPLOAD";
  const mp4Base = upload ? streamMp4Base(item) : null;
  const hls = upload ? streamHlsUrl(item) : null;
  if (mp4Base || hls) {
    return (
      <StreamLoop
        mp4Base={mp4Base}
        hlsSrc={hls}
        poster={poster}
        start={thumbnailTime(item.thumbnailUrl)}
        className={zoom}
      />
    );
  }

  const embed =
    item.mediaType === "EMBED" && item.mediaUrl ? backgroundEmbedUrl(item.mediaUrl) : null;
  if (embed) return <BackgroundEmbed {...embed} />;

  if (poster) {
    return (
      <SmartImage
        src={poster}
        alt=""
        fill
        sizes="(min-width: 768px) 30vw, (min-width: 640px) 50vw, 100vw"
        className={`object-cover ${zoom}`}
      />
    );
  }

  // No media yet: a tinted title card keeps the collage intact.
  const { client, project } = splitTitle(item.title);
  return (
    <div
      className={`absolute inset-0 flex items-end p-6 ${tints[index % tints.length]}`}
    >
      <span className="font-display text-3xl italic leading-tight text-foreground">
        {client ?? project}
      </span>
    </div>
  );
}

const tall = (item: FeaturedItem) => isVertical(item, item.section.galleryLayout);

// Spread tall reels between wide films so every column of the masonry mixes
// both shapes, like the reference collage.
function interleave(items: FeaturedItem[]) {
  const vertical = items.filter(tall);
  const horizontal = items.filter((item) => !tall(item));
  const mixed: FeaturedItem[] = [];
  while (vertical.length || horizontal.length) {
    const h = horizontal.shift();
    if (h) mixed.push(h);
    const v = vertical.shift();
    if (v) mixed.push(v);
    const h2 = horizontal.shift();
    if (h2) mixed.push(h2);
  }
  return mixed;
}

export default function FeaturedWork({ items }: { items: FeaturedItem[] }) {
  if (items.length === 0) return null;
  let wideIndex = 0;

  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <Reveal>
        <h2 className="font-display text-h1 text-foreground">Recent cuts</h2>
      </Reveal>

      {/* Phones: one video per row, so each gets the full width. */}
      <div className="mt-14 columns-1 gap-3 sm:columns-2 md:columns-3 md:gap-4">
        {interleave(items).map((item, index) => {
          // Reels keep 9:16. Films shot for the cinema (picture wider than 2:1,
          // i.e. letterboxed in a 16:9 file) get a matching wide tile so the
          // cover crop removes the bars; the rest alternate 16:9 and 4:3.
          const aspect = tall(item)
            ? "aspect-[9/16]"
            : (item.aspectRatio ?? 0) >= 2
              ? "aspect-[12/5]"
              : wideIndex++ % 2 === 0
                ? "aspect-video"
                : "aspect-[4/3]";
          const { project } = splitTitle(item.title);

          return (
            <Reveal
              key={item.id}
              delay={(index % 3) * 0.08}
              // Phones skip the fade-in, so it never competes with a video
              // starting up (the !important beats the animation's inline style).
              className="mb-3 break-inside-avoid md:mb-4 max-sm:!translate-y-0 max-sm:!opacity-100 max-sm:![transform:none]"
            >
              <Link
                href={`/${item.section.slug}#${item.id}`}
                aria-label={`${project} — ${item.section.navLabel}`}
                // Containment keeps a tile's repaints from touching the page.
                className={`group relative block overflow-hidden rounded-xl bg-foreground [contain:layout_paint] ${aspect}`}
              >
                <TileMedia item={item} index={index} />
                {/* Captions reveal on hover; touch screens can't hover, so
                    there they show all the time. */}
                <span
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-t from-foreground/75 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
                />
                <span
                  aria-hidden
                  className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.18em] text-foreground opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  {item.section.navLabel}
                </span>
                <span
                  aria-hidden
                  className="absolute inset-x-3 bottom-3 translate-y-2 font-display text-base leading-tight text-background opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 md:inset-x-4 md:bottom-4 md:text-lg [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100"
                >
                  {project}
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>

      <Reveal className="mt-16 flex justify-center md:mt-20">
        <Link
          href="/work"
          className="btn-pill group bg-foreground px-8 py-4 text-background hover:bg-transparent hover:text-foreground"
        >
          More work
          <span
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
      </Reveal>
    </section>
  );
}
