import { PrismaClient, SectionType, MediaType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: { email: adminEmail, passwordHash },
    });
  }

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      heroNameLine1: "Your",
      heroNameLine2: "Name",
      heroTagline: "Editor · Voiceover Artist",
      bioText:
        "Write a short bio here — a couple of sentences about who you are and what you do. Edit this from /admin/home.",
      philosophyText:
        "Write your creative philosophy or approach here. Edit this from /admin/home.",
      ctaText: "Let's make something together!",
      email: "hello@example.com",
      phone: "+1 (555) 000-0000",
    },
  });

  const editing = await prisma.section.upsert({
    where: { slug: "editing-portfolio" },
    update: {},
    create: {
      slug: "editing-portfolio",
      navLabel: "Editing portfolio",
      type: SectionType.GALLERY,
      order: 1,
      isVisible: true,
    },
  });

  const existingGalleryItems = await prisma.galleryItem.count({
    where: { sectionId: editing.id },
  });
  if (existingGalleryItems === 0) {
    await prisma.galleryItem.createMany({
      data: [
        {
          sectionId: editing.id,
          title: "Client // Project One // 2025",
          roleLabel: "Editor",
          description: "Placeholder description for this project. Edit from /admin/sections.",
          mediaType: MediaType.EMBED,
          mediaUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          order: 1,
        },
        {
          sectionId: editing.id,
          title: "Client // Project Two // 2025",
          roleLabel: "Editor",
          description: "Placeholder description for this project. Edit from /admin/sections.",
          mediaType: MediaType.EMBED,
          mediaUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          order: 2,
        },
      ],
    });
  }

  const resumeSection = await prisma.section.upsert({
    where: { slug: "resume" },
    update: {},
    create: {
      slug: "resume",
      navLabel: "Resume",
      type: SectionType.RESUME,
      order: 2,
      isVisible: true,
    },
  });

  const resumeData = await prisma.resumeData.upsert({
    where: { sectionId: resumeSection.id },
    update: {},
    create: { sectionId: resumeSection.id },
  });

  const existingResumeEntries = await prisma.resumeEntry.count({
    where: { resumeDataId: resumeData.id },
  });
  if (existingResumeEntries === 0) {
    await prisma.resumeEntry.createMany({
      data: [
        {
          resumeDataId: resumeData.id,
          heading: "Experience",
          body: "Placeholder experience entry. Edit from /admin/sections.",
          order: 1,
        },
        {
          resumeDataId: resumeData.id,
          heading: "Education",
          body: "Placeholder education entry. Edit from /admin/sections.",
          order: 2,
        },
        {
          resumeDataId: resumeData.id,
          heading: "Skills",
          body: "Placeholder skills entry. Edit from /admin/sections.",
          order: 3,
        },
      ],
    });
  }

  const about = await prisma.section.upsert({
    where: { slug: "about" },
    update: {},
    create: {
      slug: "about",
      navLabel: "About",
      type: SectionType.CONTENT,
      order: 3,
      isVisible: true,
    },
  });

  await prisma.sectionContent.upsert({
    where: { sectionId: about.id },
    update: {},
    create: {
      sectionId: about.id,
      heading: "About",
      bodyText: "Placeholder about text. Edit this from /admin/sections.",
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
