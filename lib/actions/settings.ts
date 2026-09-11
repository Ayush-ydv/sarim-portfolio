"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { cleanHomeBlocks } from "@/lib/homeBlocks";

function revalidateSite() {
  revalidatePath("/", "layout");
}

export type HomeContentInput = {
  heroImageUrl: string;
  heroNameLine1: string;
  heroNameLine2: string;
  heroTagline: string;
  bioImageUrl: string;
  bioText: string;
  philosophyText: string;
  ctaText: string;
  ctaButtonLabel: string;
  servicesHeading: string;
};

export async function updateHomeContent(data: HomeContentInput) {
  await requireAdmin();
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
      ctaButtonLabel: data.ctaButtonLabel.trim() || "Book Me",
      servicesHeading: data.servicesHeading.trim() || "What I do",
    },
  });
  revalidateSite();
}

// Enabled homepage blocks, in display order.
export async function updateHomeBlocks(keys: string[]) {
  await requireAdmin();
  await prisma.siteSettings.update({
    where: { id: "singleton" },
    data: { homeBlocks: cleanHomeBlocks(keys) },
  });
  revalidateSite();
}

export type ContactSettingsInput = {
  email: string;
  phone: string;
  instagramUrl: string;
  vimeoUrl: string;
};

export async function updateContactSettings(data: ContactSettingsInput) {
  await requireAdmin();
  await prisma.siteSettings.update({
    where: { id: "singleton" },
    data: {
      email: data.email,
      phone: data.phone,
      instagramUrl: data.instagramUrl || null,
      vimeoUrl: data.vimeoUrl || null,
    },
  });
  revalidateSite();
}

export async function createQuickLink(url: string, thumbnailUrl: string) {
  await requireAdmin();
  const maxOrder = await prisma.quickLink.aggregate({ _max: { order: true } });
  await prisma.quickLink.create({
    data: {
      url,
      thumbnailUrl: thumbnailUrl || null,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });
  revalidateSite();
}

export async function updateQuickLink(
  id: string,
  url: string,
  thumbnailUrl: string,
) {
  await requireAdmin();
  await prisma.quickLink.update({
    where: { id },
    data: { url, thumbnailUrl: thumbnailUrl || null },
  });
  revalidateSite();
}

export async function deleteQuickLink(id: string) {
  await requireAdmin();
  await prisma.quickLink.delete({ where: { id } });
  revalidateSite();
}

export async function reorderQuickLinks(orderedIds: string[]) {
  await requireAdmin();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.quickLink.update({ where: { id }, data: { order: index + 1 } }),
    ),
  );
  revalidateSite();
}

export async function createStat(value: string, label: string) {
  await requireAdmin();
  const maxOrder = await prisma.stat.aggregate({ _max: { order: true } });
  await prisma.stat.create({
    data: { value, label, order: (maxOrder._max.order ?? 0) + 1 },
  });
  revalidateSite();
}

export async function updateStat(id: string, value: string, label: string) {
  await requireAdmin();
  await prisma.stat.update({ where: { id }, data: { value, label } });
  revalidateSite();
}

export async function deleteStat(id: string) {
  await requireAdmin();
  await prisma.stat.delete({ where: { id } });
  revalidateSite();
}

export async function reorderStats(orderedIds: string[]) {
  await requireAdmin();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.stat.update({ where: { id }, data: { order: index + 1 } }),
    ),
  );
  revalidateSite();
}

export async function createService(title: string, description: string) {
  await requireAdmin();
  const maxOrder = await prisma.service.aggregate({ _max: { order: true } });
  await prisma.service.create({
    data: { title, description, order: (maxOrder._max.order ?? 0) + 1 },
  });
  revalidateSite();
}

export async function updateService(
  id: string,
  title: string,
  description: string,
) {
  await requireAdmin();
  await prisma.service.update({ where: { id }, data: { title, description } });
  revalidateSite();
}

export async function deleteService(id: string) {
  await requireAdmin();
  await prisma.service.delete({ where: { id } });
  revalidateSite();
}

export async function reorderServices(orderedIds: string[]) {
  await requireAdmin();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.service.update({ where: { id }, data: { order: index + 1 } }),
    ),
  );
  revalidateSite();
}

export async function createBrand(name: string, logoUrl: string) {
  await requireAdmin();
  const maxOrder = await prisma.brand.aggregate({ _max: { order: true } });
  await prisma.brand.create({
    data: {
      name,
      logoUrl: logoUrl || null,
      order: (maxOrder._max.order ?? 0) + 1,
    },
  });
  revalidateSite();
}

export async function updateBrand(id: string, name: string, logoUrl: string) {
  await requireAdmin();
  if (!name.trim()) throw new Error("Brand name is required");
  await prisma.brand.update({
    where: { id },
    data: { name: name.trim(), logoUrl: logoUrl.trim() || null },
  });
  revalidateSite();
}

export async function deleteBrand(id: string) {
  await requireAdmin();
  await prisma.brand.delete({ where: { id } });
  revalidateSite();
}

export async function reorderBrands(orderedIds: string[]) {
  await requireAdmin();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.brand.update({ where: { id }, data: { order: index + 1 } }),
    ),
  );
  revalidateSite();
}
