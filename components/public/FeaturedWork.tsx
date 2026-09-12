import Link from "next/link";
import SmartImage from "@/components/SmartImage";
import Reveal from "@/components/motion/Reveal";
import Parallax from "@/components/motion/Parallax";
import ParallaxOrbs from "@/components/motion/ParallaxOrbs";
import OutlineBand from "@/components/motion/OutlineBand";
import ScrollZoom from "@/components/motion/ScrollZoom";
import EditDecor from "@/components/decor/EditDecor";
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
        sizes="(min-width: 768px) 30vw, 100vw"
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

// Spread tall reels between wide films so every column mixes both shapes,
// like the reference collage.
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

type Tile = { item: FeaturedItem; aspect: string; height: number };

// Reels keep 9:16. Films shot for the cinema (picture wider than 2:1, i.e.
// letterboxed in a 16:9 file) get a matching wide tile so the cover crop
// removes the bars; the rest alternate 16:9 and 4:3. `height` is relative
// to the tile's width, used to balance the columns.
function toTiles(items: FeaturedItem[]): Tile[] {
  let wideIndex = 0;
  return interleave(items).map((item) => {
    if (tall(item)) return { item, aspect: "aspect-[9/16]", height: 16 / 9 };
    if ((item.aspectRatio ?? 0) >= 2) return { item, aspect: "aspect-[12/5]", height: 5 / 12 };
    return wideIndex++ % 2 === 0
      ? { item, aspect: "aspect-video", height: 9 / 16 }
      : { item, aspect: "aspect-[4/3]", height: 3 / 4 };
  });
}

// Three explicit columns (each tile goes to the currently shortest one), so
// each column can scroll at its own speed on larger screens. Phones stack
// the columns into one.
function toColumns(tiles: Tile[], count = 3) {
  const columns = Array.from({ length: count }, () => ({ tiles: [] as Tile[], height: 0 }));
  for (const tile of tiles) {
    const shortest = columns.reduce((a, b) => (b.height < a.height ? b : a));
    shortest.tiles.push(tile);
    shortest.height += tile.height;
  }
  return columns.map((column) => column.tiles);
}

// Travel per column: the middle one rises fastest, the outer ones lag.
const COLUMN_SPEEDS = [120, -220, 160];

export default function FeaturedWork({ items }: { items: FeaturedItem[] }) {
  if (items.length === 0) return null;
  const columns = toColumns(toTiles(items)).filter((column) => column.length > 0);

  return (
    <section className="relative isolate">
      <ParallaxOrbs preset="work" />
      <EditDecor preset="work" />
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <div className="relative isolate">
        <OutlineBand text="Recent cuts" className="-top-6 md:-top-12" />
        <Parallax speed={-140} axis="x">
          <Reveal>
            <h2 className="font-display text-h1 text-foreground">Recent cuts</h2>
          </Reveal>
        </Parallax>
      </div>

      <div className="mt-14 flex flex-col gap-3 md:mt-20 md:flex-row md:items-start md:gap-4 md:py-12">
        {columns.map((column, c) => (
          <Parallax
            key={c}
            speed={COLUMN_SPEEDS[c % COLUMN_SPEEDS.length]}
            mobile={false}
            className="flex min-w-0 flex-1 flex-col gap-3 md:gap-4"
          >
            {column.map(({ item, aspect }, index) => {
              const { project } = splitTitle(item.title);
              return (
                <Reveal
                  key={item.id}
                  delay={c * 0.08}
                  // Phones skip the fade-in, so it never competes with a video
                  // starting up (the !important beats the animation's inline style).
                  className="max-sm:!opacity-100 max-sm:![transform:none]"
                >
                  <Link
                    href={`/${item.section.slug}#${item.id}`}
                    aria-label={`${project} — ${item.section.navLabel}`}
                    // Containment keeps a tile's repaints from touching the page.
                    className={`group relative block overflow-hidden rounded-xl bg-foreground [contain:layout_paint] ${aspect}`}
                  >
                    <ScrollZoom>
                      <TileMedia item={item} index={c * 10 + index} />
                    </ScrollZoom>
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
          </Parallax>
        ))}
      </div>

      <Reveal className="mt-16 flex justify-center md:mt-24">
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
      </div>
    </section>
  );
}
