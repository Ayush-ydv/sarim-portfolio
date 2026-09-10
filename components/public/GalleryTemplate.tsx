import type { getSectionBySlug } from "@/lib/sections";
import GalleryItemCard from "@/components/public/GalleryItemCard";

type Section = NonNullable<Awaited<ReturnType<typeof getSectionBySlug>>>;

export default function GalleryTemplate({ section }: { section: Section }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-16 px-6 py-16">
      <h1 className="font-display text-3xl text-foreground">
        {section.navLabel}
      </h1>
      {section.galleryItems.length === 0 ? (
        <p className="text-sm text-muted">No items in this gallery yet.</p>
      ) : (
        <div className="flex flex-col gap-16">
          {section.galleryItems.map((item, index) => (
            <div key={item.id} className={index > 0 ? "border-t border-rule pt-16" : undefined}>
              <GalleryItemCard item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
