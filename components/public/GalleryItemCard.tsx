import type { GalleryItem } from "@prisma/client";

function Media({ item }: { item: GalleryItem }) {
  if ((item.mediaType === "EMBED" || item.mediaType === "VIDEO_UPLOAD") && item.mediaUrl) {
    return (
      <div className="aspect-video w-full overflow-hidden bg-foreground/5">
        <iframe
          src={item.mediaUrl}
          title={item.title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (item.mediaType === "AUDIO" && item.mediaUrl) {
    return <audio src={item.mediaUrl} controls className="w-full" />;
  }

  if (item.mediaType === "LINK" && item.mediaUrl) {
    return (
      <a
        href={item.mediaUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-block text-xs uppercase tracking-[0.18em] text-muted underline underline-offset-4 transition-colors hover:text-foreground"
      >
        Read article →
      </a>
    );
  }

  if (item.mediaType === "VIDEO_UPLOAD" && item.streamVideoId) {
    return (
      <div className="flex aspect-video w-full items-center justify-center bg-foreground/5 text-xs uppercase tracking-[0.18em] text-muted">
        Video processing
      </div>
    );
  }

  return null;
}

export default function GalleryItemCard({ item }: { item: GalleryItem }) {
  return (
    <article className="flex flex-col gap-4">
      <div>
        <h3 className="font-display text-xl text-foreground">{item.title}</h3>
        {item.roleLabel && (
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
            {item.roleLabel}
          </p>
        )}
      </div>
      <p className="max-w-2xl text-sm leading-relaxed text-foreground/80">
        {item.description}
      </p>
      <Media item={item} />
    </article>
  );
}
