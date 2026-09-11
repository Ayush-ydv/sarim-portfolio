import { cache } from "react";
import { prisma } from "@/lib/prisma";

// Wrapped in cache() so the layout, header, footer, and page share one query
// per request instead of each hitting the database.

export const getVisibleSections = cache(() =>
  prisma.section.findMany({
    where: { isVisible: true },
    orderBy: { order: "asc" },
  }),
);

export const getSectionBySlug = cache((slug: string) =>
  prisma.section.findUnique({
    where: { slug },
    include: {
      content: true,
      resume: { include: { entries: { orderBy: { order: "asc" } } } },
      galleryItems: { orderBy: { order: "asc" }, where: { published: true } },
    },
  }),
);

export const getSiteSettings = cache(() =>
  prisma.siteSettings.findUniqueOrThrow({
    where: { id: "singleton" },
    include: {
      quickLinks: { orderBy: { order: "asc" } },
      stats: { orderBy: { order: "asc" } },
      services: { orderBy: { order: "asc" } },
      brands: { orderBy: { order: "asc" } },
    },
  }),
);

// Every visible gallery section is a Work category, in nav order, with its
// published-project count and first project (a fallback card cover).
export const getWorkCategories = cache(() =>
  prisma.section.findMany({
    where: { isVisible: true, type: "GALLERY" },
    orderBy: { order: "asc" },
    include: {
      _count: { select: { galleryItems: { where: { published: true } } } },
      galleryItems: {
        where: { published: true },
        orderBy: { order: "asc" },
        take: 1,
      },
    },
  }),
);

const FEATURED_LIMIT = 6;

// Homepage "Selected work": projects flagged "Show on homepage", across all
// categories. Until any are flagged, the first project of each category.
export const getFeaturedWork = cache(async () => {
  const featured = await prisma.galleryItem.findMany({
    where: {
      featured: true,
      published: true,
      section: { isVisible: true, type: "GALLERY" },
    },
    orderBy: [{ section: { order: "asc" } }, { order: "asc" }],
    take: FEATURED_LIMIT,
    include: { section: { select: { slug: true, navLabel: true } } },
  });
  if (featured.length > 0) return featured;

  const categories = await getWorkCategories();
  return categories
    .flatMap((category) =>
      category.galleryItems.map((item) => ({
        ...item,
        section: { slug: category.slug, navLabel: category.navLabel },
      })),
    )
    .slice(0, FEATURED_LIMIT);
});

export type FeaturedItem = Awaited<ReturnType<typeof getFeaturedWork>>[number];
