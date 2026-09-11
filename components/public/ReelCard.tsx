import type { GalleryItem } from "@prisma/client";
import { GalleryMedia } from "@/components/public/GalleryItemCard";
import { splitTitle } from "@/lib/media";

// Vertical layout: a 9:16 tile with a compact caption, for reels.
export default function ReelCard({
  item,
  index,
}: {
  item: GalleryItem;
  index: number;
}) {
  const { client, project, year } = splitTitle(item.title);
  const meta = [item.roleLabel, year].filter(Boolean).join(" · ");

  return (
    <article id={item.id} className="scroll-mt-28">
      <GalleryMedia
        item={item}
        index={index}
        client={client}
        project={project}
        vertical
      />
      {client && <p className="label-caps mt-5 text-muted">{client}</p>}
      <h2 className="mt-2 font-display text-xl leading-tight text-foreground">
        {project}
      </h2>
      {meta && (
        <p className="mt-2 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-foreground/60">
          {meta}
        </p>
      )}
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground/70">
        {item.description}
      </p>
    </article>
  );
}
