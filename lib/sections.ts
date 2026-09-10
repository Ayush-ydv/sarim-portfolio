import { prisma } from "@/lib/prisma";

export function getVisibleSections() {
  return prisma.section.findMany({
    where: { isVisible: true },
    orderBy: { order: "asc" },
  });
}

export function getSectionBySlug(slug: string) {
  return prisma.section.findUnique({
    where: { slug },
    include: {
      content: true,
      resume: { include: { entries: { orderBy: { order: "asc" } } } },
      galleryItems: { orderBy: { order: "asc" }, where: { published: true } },
    },
  });
}

export function getSiteSettings() {
  return prisma.siteSettings.findUniqueOrThrow({
    where: { id: "singleton" },
    include: { quickLinks: { orderBy: { order: "asc" } } },
  });
}
