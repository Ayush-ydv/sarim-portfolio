import Link from "next/link";
import type { getSectionBySlug } from "@/lib/sections";
import Reveal from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import CategoryNav from "@/components/public/CategoryNav";
import GalleryItemCard from "@/components/public/GalleryItemCard";
import ReelCard from "@/components/public/ReelCard";

type Section = NonNullable<Awaited<ReturnType<typeof getSectionBySlug>>>;

export default function GalleryTemplate({
  section,
  categories,
}: {
  section: Section;
  categories: { slug: string; navLabel: string }[];
}) {
  const items = section.galleryItems;
  const count = items.length;

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 md:pb-32 md:pt-24">
      <Reveal className="border-b border-foreground pb-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Link
              href="/work"
              className="label-caps link-sweep text-muted transition-colors hover:text-foreground"
            >
              ← Work
            </Link>
            <h1 className="mt-4 font-display text-h1 text-foreground">
              {section.navLabel}
            </h1>
            {section.summary && (
              <p className="mt-4 max-w-xl font-display text-lg text-foreground/75">
                {section.summary}
              </p>
            )}
          </div>
          {count > 0 && (
            <p className="label-caps text-muted">
              {count} {count === 1 ? "project" : "projects"}
            </p>
          )}
        </div>
        <CategoryNav categories={categories} current={section.slug} />
      </Reveal>

      {count === 0 ? (
        <p className="mt-16 font-display text-lg text-muted">
          No projects in this category yet.
        </p>
      ) : section.galleryLayout === "VERTICAL" ? (
        <StaggerGroup
          stagger={0.08}
          className="mt-16 grid grid-cols-2 gap-x-4 gap-y-12 md:mt-20 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4"
        >
          {items.map((item, index) => (
            <StaggerItem key={item.id}>
              <ReelCard item={item} index={index} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      ) : (
        <div className="mt-16 flex flex-col gap-24 md:mt-24 md:gap-36">
          {items.map((item, index) => (
            <GalleryItemCard key={item.id} item={item} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
