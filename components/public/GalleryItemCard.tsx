import type { GalleryItem } from "@prisma/client";
import Reveal from "@/components/motion/Reveal";
import Parallax from "@/components/motion/Parallax";
import VideoPlayer from "@/components/public/VideoPlayer";
import {
  isVertical,
  paragraphs,
  splitTitle,
  toEmbedUrl,
  videoThumbnail,
} from "@/lib/media";

const tints = ["bg-lavender", "bg-mint", "bg-blush", "bg-sun"];

// A project's media at a fixed frame: 16:9 for films, 9:16 for reels.
export function GalleryMedia({
  item,
  index,
  client,
  project,
  vertical = false,
}: {
  item: GalleryItem;
  index: number;
  client: string | null;
  project: string;
  vertical?: boolean;
}) {
  const tint = tints[index % tints.length];
  const aspect = vertical ? "aspect-[9/16]" : "aspect-video";
  const titleSize = vertical
    ? "text-[clamp(1.5rem,3vw,2.25rem)]"
    : "text-[clamp(2rem,4.5vw,3.75rem)]";
  const padding = vertical ? "p-6" : "p-8 md:p-10";

  if (
    (item.mediaType === "EMBED" || item.mediaType === "VIDEO_UPLOAD") &&
    item.mediaUrl
  ) {
    return (
      <VideoPlayer
        embedUrl={toEmbedUrl(item.mediaUrl)}
        thumbnail={videoThumbnail(item)}
        title={item.title}
        vertical={vertical}
      />
    );
  }

  if (item.mediaType === "AUDIO" && item.mediaUrl) {
    return (
      <div
        className={`flex ${aspect} w-full flex-col justify-end gap-6 rounded-2xl ${padding} ${tint}`}
      >
        <span className={`font-display ${titleSize} italic leading-tight text-foreground`}>
          {project}
        </span>
        <audio src={item.mediaUrl} controls className="w-full" />
      </div>
    );
  }

  if (item.mediaType === "LINK" && item.mediaUrl) {
    return (
      <a
        href={item.mediaUrl}
        target="_blank"
        rel="noreferrer"
        className={`group flex ${aspect} w-full flex-col justify-between rounded-2xl ${padding} ${tint}`}
      >
        <span className="label-caps text-foreground/70">Article</span>
        <span className={`font-display ${titleSize} italic leading-[1.02] text-foreground`}>
          {project}
        </span>
        <span className="link-sweep self-start text-[0.72rem] font-medium uppercase tracking-[0.2em] text-foreground">
          Read the article ↗
        </span>
      </a>
    );
  }

  if (item.mediaType === "VIDEO_UPLOAD" && item.streamVideoId) {
    return (
      <div
        className={`flex ${aspect} w-full items-center justify-center rounded-2xl bg-foreground/5`}
      >
        <span className="label-caps text-muted">Video processing</span>
      </div>
    );
  }

  // No media yet: a film-style title card keeps the layout intentional.
  return (
    <div
      className={`flex ${aspect} w-full flex-col justify-between rounded-2xl ${padding} ${tint}`}
    >
      <span className="label-caps text-foreground/60">{client ?? "Project"}</span>
      <span className={`font-display ${titleSize} italic leading-[1.02] text-foreground`}>
        {project}
      </span>
    </div>
  );
}

// Landscape layout: media and text in alternating wide rows. A vertical
// video in a landscape category keeps its 9:16 frame, narrowed and centered
// so it doesn't tower over the text beside it.
export default function GalleryItemCard({
  item,
  index,
}: {
  item: GalleryItem;
  index: number;
}) {
  const { client, project, year } = splitTitle(item.title);
  const meta = [item.roleLabel, year].filter(Boolean).join(" · ");
  const flip = index % 2 === 1;
  const vertical = isVertical(item, "LANDSCAPE");

  return (
    <article
      id={item.id}
      className="grid scroll-mt-28 items-center gap-8 md:grid-cols-12 md:gap-14"
    >
      <Reveal className={`md:col-span-7 ${flip ? "md:order-2" : ""}`}>
        {/* The video lags behind; the text and its big number rush past it. */}
        <Parallax speed={120} mobile={false}>
          <div className={vertical ? "mx-auto w-full max-w-[20rem] md:max-w-[22rem]" : undefined}>
            <GalleryMedia
              item={item}
              index={index}
              client={client}
              project={project}
              vertical={vertical}
            />
          </div>
        </Parallax>
      </Reveal>
      <Reveal delay={0.12} className={`md:col-span-5 ${flip ? "md:order-1" : ""}`}>
        <Parallax speed={-320} mobile={false}>
          <span className="block font-display text-6xl leading-none text-foreground/15 md:text-[9rem]">
            {String(index + 1).padStart(2, "0")}
          </span>
        </Parallax>
        {client && <p className="label-caps mt-6 text-muted">{client}</p>}
        <h2 className="mt-3 font-display text-h2 text-foreground">{project}</h2>
        {meta && (
          <p className="mt-3 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-foreground/70">
            {meta}
          </p>
        )}
        <div className="mt-6 space-y-4 font-display text-lg leading-relaxed text-foreground/80">
          {paragraphs(item.description).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </Reveal>
    </article>
  );
}
