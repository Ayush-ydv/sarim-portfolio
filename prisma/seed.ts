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
      heroNameLine1: "Sarim",
      heroNameLine2: "Khan",
      heroTagline: "Video Editor & Storyteller",
      bioText:
        "I'm a video editor with 6+ years of experience cutting commercials, brand documentaries, and music videos for clients ranging from independent artists to global brands. I specialize in narrative pacing, color grading, and sound design — turning raw footage into stories that hold attention from the first frame to the last.",
      philosophyText:
        "Great editing is invisible. My job isn't to show off a cut — it's to serve the story, the rhythm, and the emotion the footage is already carrying. I obsess over pacing, breathe with the music, and never let a transition call attention to itself unless the story asks for it. Every project starts with one question: what does this need to feel like?",
      ctaText: "Have a project in mind? Let's cut something great together.",
      email: "hello@sarimkhan.com",
      phone: "+1 (415) 555-0148",
      instagramUrl: "https://instagram.com/sarimkhan.edits",
      vimeoUrl: "https://vimeo.com/sarimkhan",
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
          title: "Northwind Outfitters // Fall Campaign Film // 2025",
          roleLabel: "Lead Editor",
          description:
            "A 90-second brand film for Northwind's fall collection launch. Cut for pace and texture — matching the edit rhythm to a driving score while keeping the product moments clean and confident.",
          mediaType: MediaType.EMBED,
          order: 1,
        },
        {
          sectionId: editing.id,
          title: "The Long Way Home // Documentary Short // 2024",
          roleLabel: "Editor & Colorist",
          description:
            "A 12-minute character-driven documentary following a former long-haul trucker's cross-country return home. Structured the story from 40+ hours of interview and verite footage, and handled the full color grade.",
          mediaType: MediaType.EMBED,
          order: 2,
        },
        {
          sectionId: editing.id,
          title: 'Nadia Ray // "Static" Music Video // 2024',
          roleLabel: "Editor",
          description:
            "Performance-driven music video cut to hit every beat of the track. Intercut three performance takes and one narrative thread to build momentum toward the final chorus.",
          mediaType: MediaType.EMBED,
          order: 3,
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
          body:
            "Senior Video Editor, Freelance (2021–Present) — Cut commercial, documentary, and branded content for clients including Northwind Outfitters, independent musicians, and regional agencies. Lead editor on projects from concept through final color and delivery.\n\nVideo Editor, Bright Field Studios (2018–2021) — Edited social and broadcast spots for a mid-size production studio, working across a fast-turnaround client roster of 15+ brands.",
          order: 1,
        },
        {
          resumeDataId: resumeData.id,
          heading: "Education",
          body:
            "B.F.A. in Film & Television Production, San Francisco State University (2014–2018) — Focused on narrative editing and post-production workflow.",
          order: 2,
        },
        {
          resumeDataId: resumeData.id,
          heading: "Skills",
          body:
            "Adobe Premiere Pro, DaVinci Resolve, After Effects, Avid Media Composer, color grading, sound design, motion graphics, story structure, client collaboration.",
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
      bodyText:
        "I'm Sarim, a video editor based in San Francisco. Over the past six years I've cut everything from 30-second social spots to feature-length documentaries, working with agencies, independent filmmakers, and musicians who need someone to shape their footage into something that actually lands. I trained in narrative film editing before moving into commercial and branded work, and I still approach every project — no matter how short — like it's telling a story. When I'm not in the timeline, I'm usually shooting film photography or chasing down a new documentary to watch.",
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
