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
    },
  }),
);

// The first visible gallery section, with its first few items, for the
// homepage "Selected work" teaser.
export const getFeaturedWork = cache(() =>
  prisma.section.findFirst({
    where: { isVisible: true, type: "GALLERY" },
    orderBy: { order: "asc" },
    include: {
      galleryItems: {
        where: { published: true },
        orderBy: { order: "asc" },
        take: 3,
      },
    },
  }),
);
