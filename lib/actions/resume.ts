"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

async function revalidateSection(sectionId: string) {
  const section = await prisma.section.findUniqueOrThrow({
    where: { id: sectionId },
  });
  revalidatePath(`/${section.slug}`);
  revalidatePath("/", "layout");
}

export async function updateResumeFile(sectionId: string, resumeFileUrl: string) {
  await requireAdmin();
  await prisma.section.update({
    where: { id: sectionId },
    data: {
      resume: {
        upsert: {
          create: { resumeFileUrl: resumeFileUrl || null },
          update: { resumeFileUrl: resumeFileUrl || null },
        },
      },
    },
  });
  await revalidateSection(sectionId);
}

export async function createResumeEntry(
  resumeDataId: string,
  sectionId: string,
  data: { heading: string; body: string },
) {
  await requireAdmin();
  if (!data.heading.trim()) throw new Error("Heading is required");

  const maxOrder = await prisma.resumeEntry.aggregate({
    where: { resumeDataId },
    _max: { order: true },
  });

  await prisma.resumeEntry.create({
    data: {
      resumeDataId,
      heading: data.heading,
      body: data.body,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });

  await revalidateSection(sectionId);
}

export async function updateResumeEntry(
  id: string,
  sectionId: string,
  data: { heading: string; body: string },
) {
  await requireAdmin();
  if (!data.heading.trim()) throw new Error("Heading is required");

  await prisma.resumeEntry.update({
    where: { id },
    data: { heading: data.heading, body: data.body },
  });

  await revalidateSection(sectionId);
}

export async function deleteResumeEntry(id: string, sectionId: string) {
  await requireAdmin();
  await prisma.resumeEntry.delete({ where: { id } });
  await revalidateSection(sectionId);
}

export async function reorderResumeEntries(
  resumeDataId: string,
  sectionId: string,
  orderedIds: string[],
) {
  await requireAdmin();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.resumeEntry.update({ where: { id }, data: { order: index + 1 } }),
    ),
  );
  await revalidateSection(sectionId);
}
