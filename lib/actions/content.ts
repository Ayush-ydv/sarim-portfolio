"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function updateSectionContent(
  sectionId: string,
  data: { heading: string; bodyText: string; imageUrl: string },
) {
  await requireAdmin();
  const section = await prisma.section.update({
    where: { id: sectionId },
    data: {
      content: {
        upsert: {
          create: {
            heading: data.heading || null,
            bodyText: data.bodyText,
            imageUrl: data.imageUrl || null,
          },
          update: {
            heading: data.heading || null,
            bodyText: data.bodyText,
            imageUrl: data.imageUrl || null,
          },
        },
      },
    },
  });

  revalidatePath(`/${section.slug}`);
  revalidatePath("/", "layout");
}
