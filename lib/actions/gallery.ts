"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { MediaType } from "@prisma/client";

export type GalleryItemInput = {
  title: string;
  roleLabel: string;
  description: string;
  mediaType: MediaType;
  mediaUrl: string;
  streamVideoId?: string;
  thumbnailUrl?: string;
  published: boolean;
};

async function revalidateSection(sectionId: string) {
  const section = await prisma.section.findUniqueOrThrow({
    where: { id: sectionId },
  });
  revalidatePath(`/${section.slug}`);
  revalidatePath("/", "layout");
}

export async function createGalleryItem(
  sectionId: string,
  data: GalleryItemInput,
) {
  await requireAdmin();
  if (!data.title.trim()) throw new Error("Title is required");

  const maxOrder = await prisma.galleryItem.aggregate({
    where: { sectionId },
    _max: { order: true },
  });

  await prisma.galleryItem.create({
    data: {
      sectionId,
      title: data.title,
      roleLabel: data.roleLabel || null,
      description: data.description,
      mediaType: data.mediaType,
      mediaUrl: data.mediaUrl || null,
      streamVideoId: data.streamVideoId || null,
      thumbnailUrl: data.thumbnailUrl || null,
      published: data.published,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  await revalidateSection(sectionId);
}

export async function updateGalleryItem(
  id: string,
  data: GalleryItemInput,
) {
  await requireAdmin();
  if (!data.title.trim()) throw new Error("Title is required");

  const item = await prisma.galleryItem.update({
    where: { id },
    data: {
      title: data.title,
      roleLabel: data.roleLabel || null,
      description: data.description,
      mediaType: data.mediaType,
      mediaUrl: data.mediaUrl || null,
      streamVideoId: data.streamVideoId || null,
      thumbnailUrl: data.thumbnailUrl || null,
      published: data.published,
    },
  });

  await revalidateSection(item.sectionId);
}

export async function deleteGalleryItem(id: string) {
  await requireAdmin();
  const item = await prisma.galleryItem.delete({ where: { id } });
  await revalidateSection(item.sectionId);
}

export async function reorderGalleryItems(
  sectionId: string,
  orderedIds: string[],
) {
  await requireAdmin();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.galleryItem.update({ where: { id }, data: { order: index + 1 } }),
    ),
  );
  await revalidateSection(sectionId);
}
