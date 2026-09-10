"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SectionType } from "@prisma/client";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string) {
  const slugBase = slugify(base) || "section";
  let slug = slugBase;
  let suffix = 2;
  while (await prisma.section.findUnique({ where: { slug } })) {
    slug = `${slugBase}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

export async function createSection(navLabel: string, type: SectionType) {
  const trimmed = navLabel.trim();
  if (!trimmed) throw new Error("Section name is required");

  const slug = await uniqueSlug(trimmed);
  const maxOrder = await prisma.section.aggregate({ _max: { order: true } });
  const order = (maxOrder._max.order ?? 0) + 1;

  const section = await prisma.section.create({
    data: {
      navLabel: trimmed,
      slug,
      type,
      order,
      ...(type === SectionType.CONTENT
        ? { content: { create: { bodyText: "" } } }
        : {}),
      ...(type === SectionType.RESUME ? { resume: { create: {} } } : {}),
    },
  });

  revalidatePath("/", "layout");
  return section;
}

export async function deleteSection(id: string) {
  await prisma.section.delete({ where: { id } });
  revalidatePath("/", "layout");
}

export async function setSectionVisibility(id: string, isVisible: boolean) {
  await prisma.section.update({ where: { id }, data: { isVisible } });
  revalidatePath("/", "layout");
}

export async function reorderSections(orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.section.update({ where: { id }, data: { order: index + 1 } }),
    ),
  );
  revalidatePath("/", "layout");
}
