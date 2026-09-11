import type { getSectionBySlug } from "@/lib/sections";
import Reveal from "@/components/motion/Reveal";
import GalleryItemCard from "@/components/public/GalleryItemCard";

type Section = NonNullable<Awaited<ReturnType<typeof getSectionBySlug>>>;

export default function GalleryTemplate({ section }: { section: Section }) {
  const count = section.galleryItems.length;

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 md:pb-32 md:pt-24">
      <Reveal className="flex flex-wrap items-end justify-between gap-6 border-b border-foreground pb-10">
        <div>
          <p className="label-caps text-muted">Portfolio</p>
          <h1 className="mt-4 font-display text-h1 text-foreground">
            {section.navLabel}
          </h1>
        </div>
        {count > 0 && (
          <p className="label-caps text-muted">
            {count} {count === 1 ? "project" : "projects"}
          </p>
        )}
      </Reveal>

      {count === 0 ? (
        <p className="mt-16 font-display text-lg text-muted">
          No items in this gallery yet.
        </p>
      ) : (
        <div className="mt-16 flex flex-col gap-24 md:mt-24 md:gap-36">
          {section.galleryItems.map((item, index) => (
            <GalleryItemCard key={item.id} item={item} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
