"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type HomeContentInput = {
  heroImageUrl: string;
  heroNameLine1: string;
  heroNameLine2: string;
  heroTagline: string;
  bioImageUrl: string;
  bioText: string;
  philosophyText: string;
  ctaText: string;
};

export async function updateHomeContent(data: HomeContentInput) {
  await prisma.siteSettings.update({
    where: { id: "singleton" },
    data: {
      heroImageUrl: data.heroImageUrl || null,
      heroNameLine1: data.heroNameLine1,
      heroNameLine2: data.heroNameLine2,
      heroTagline: data.heroTagline,
      bioImageUrl: data.bioImageUrl || null,
      bioText: data.bioText,
      philosophyText: data.philosophyText,
      ctaText: data.ctaText,
    },
  });
  revalidatePath("/", "layout");
}

export type ContactSettingsInput = {
  email: string;
  phone: string;
  instagramUrl: string;
  vimeoUrl: string;
};

export async function updateContactSettings(data: ContactSettingsInput) {
  await prisma.siteSettings.update({
    where: { id: "singleton" },
    data: {
      email: data.email,
      phone: data.phone,
      instagramUrl: data.instagramUrl || null,
      vimeoUrl: data.vimeoUrl || null,
    },
  });
  revalidatePath("/", "layout");
}

export async function createQuickLink(url: string, thumbnailUrl: string) {
  const maxOrder = await prisma.quickLink.aggregate({ _max: { order: true } });
  await prisma.quickLink.create({
    data: {
      url,
      thumbnailUrl: thumbnailUrl || null,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });
  revalidatePath("/", "layout");
}

export async function updateQuickLink(
  id: string,
  url: string,
  thumbnailUrl: string,
) {
  await prisma.quickLink.update({
    where: { id },
    data: { url, thumbnailUrl: thumbnailUrl || null },
  });
  revalidatePath("/", "layout");
}

export async function deleteQuickLink(id: string) {
  await prisma.quickLink.delete({ where: { id } });
  revalidatePath("/", "layout");
}

export async function reorderQuickLinks(orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.quickLink.update({ where: { id }, data: { order: index + 1 } }),
    ),
  );
  revalidatePath("/", "layout");
}
