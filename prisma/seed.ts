import {
  PrismaClient,
  SectionType,
  MediaType,
  GalleryLayout,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type SeedProject = {
  title: string;
  roleLabel: string;
  description: string;
  featured?: boolean;
};

// Placeholder draft content — the client replaces all of it in admin.
const FILMS: SeedProject[] = [
  {
    title: "Northwind Outfitters // Fall Campaign Film // 2025",
    roleLabel: "Lead Editor",
    description:
      "A 90-second brand film for Northwind's fall collection launch. Cut for pace and texture — matching the edit rhythm to a driving score while keeping the product moments clean and confident.",
    featured: true,
  },
  {
    title: "The Long Way Home // Documentary Short // 2024",
    roleLabel: "Editor & Colorist",
    description:
      "A 12-minute character-driven documentary following a former long-haul trucker's cross-country return home. Structured the story from 40+ hours of interview and verite footage, and handled the full color grade.",
  },
  {
    title: 'Nadia Ray // "Static" Music Video // 2024',
    roleLabel: "Editor",
    description:
      "Performance-driven music video cut to hit every beat of the track. Intercut three performance takes and one narrative thread to build momentum toward the final chorus.",
  },
];

const REELS: SeedProject[] = [
  {
    title: "Lumen Coffee // Morning Ritual Reel // 2025",
    roleLabel: "Editor",
    description:
      "A 30-second vertical reel for Lumen's seasonal launch — fast cuts timed to the pour, built for sound-off viewing with on-screen type.",
    featured: true,
  },
  {
    title: "Atlas Motors // Road Trip Series // 2025",
    roleLabel: "Editor & Motion",
    description:
      "A four-part vertical series for Instagram and TikTok. Hook in the first second, payoff by fifteen.",
  },
  {
    title: "Kinfolk Records // Tour Diary // 2024",
    roleLabel: "Editor",
    description:
      "Behind-the-scenes tour reels cut overnight between shows, turning phone footage into a consistent visual diary.",
  },
];

const AI_FILMS: SeedProject[] = [
  {
    title: "Personal Project // Paper Cities // 2025",
    roleLabel: "Director & Editor",
    description:
      "A two-minute short built from AI-generated stills and motion, edited to an original score. Generation made the images; the story lives in the cut.",
    featured: true,
  },
  {
    title: "Northwind Outfitters // Future Collection Teaser // 2025",
    roleLabel: "Editor",
    description:
      "A concept teaser mixing live-action product shots with AI-generated environments, cut for a 20-second launch slot.",
  },
];

const BRANDS = [
  "Northwind Outfitters",
  "Bright Field Studios",
  "Lumen Coffee",
  "Atlas Motors",
  "Kinfolk Records",
  "Nadia Ray",
];

// A gallery section is a Work category; create it with placeholder projects
// unless it already exists.
async function seedCategory(
  slug: string,
  navLabel: string,
  order: number,
  summary: string,
  galleryLayout: GalleryLayout,
  projects: SeedProject[],
) {
  const section = await prisma.section.upsert({
    where: { slug },
    update: {},
    create: {
      slug,
      navLabel,
      type: SectionType.GALLERY,
      order,
      isVisible: true,
      summary,
      galleryLayout,
    },
  });

  if ((await prisma.galleryItem.count({ where: { sectionId: section.id } })) === 0) {
    await prisma.galleryItem.createMany({
      data: projects.map((project, index) => ({
        sectionId: section.id,
        title: project.title,
        roleLabel: project.roleLabel,
        description: project.description,
        mediaType: MediaType.EMBED,
        featured: project.featured ?? false,
        order: index + 1,
      })),
    });
  }
}

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
      servicesHeading: "Editing for brands, artists, and storytellers.",
    },
  });

  if ((await prisma.stat.count()) === 0) {
    await prisma.stat.createMany({
      data: [
        { value: "6+", label: "Years editing", order: 1 },
        { value: "120+", label: "Projects delivered", order: 2 },
        { value: "40+", label: "Brands & artists", order: 3 },
        { value: "15M+", label: "Views across platforms", order: 4 },
      ],
    });
  }

  if ((await prisma.service.count()) === 0) {
    await prisma.service.createMany({
      data: [
        {
          title: "Commercial & Brand",
          description:
            "Launch films, product spots, and social cutdowns built for pace — every frame earning its place in 15, 30, or 90 seconds.",
          order: 1,
        },
        {
          title: "Documentary",
          description:
            "Finding the story in hours of interviews and verité footage, then shaping it into something with structure, tension, and heart.",
          order: 2,
        },
        {
          title: "Music Videos",
          description:
            "Cutting on the beat and against it — performance and narrative intercut to build momentum all the way to the final chorus.",
          order: 3,
        },
      ],
    });
  }

  if ((await prisma.brand.count()) === 0) {
    await prisma.brand.createMany({
      data: BRANDS.map((name, index) => ({ name, order: index + 1 })),
    });
  }

  await seedCategory(
    "films",
    "Films",
    1,
    "Brand films, documentaries and music videos.",
    GalleryLayout.LANDSCAPE,
    FILMS,
  );
  await seedCategory(
    "reels",
    "Reels",
    2,
    "Short-form vertical edits built for social.",
    GalleryLayout.VERTICAL,
    REELS,
  );
  await seedCategory(
    "ai-films",
    "AI Films",
    3,
    "Films made with generative AI — edited like any other story.",
    GalleryLayout.LANDSCAPE,
    AI_FILMS,
  );

  const resumeSection = await prisma.section.upsert({
    where: { slug: "resume" },
    update: {},
    create: {
      slug: "resume",
      navLabel: "Resume",
      type: SectionType.RESUME,
      order: 4,
      isVisible: true,
    },
  });

  const resumeData = await prisma.resumeData.upsert({
    where: { sectionId: resumeSection.id },
    update: {},
    create: { sectionId: resumeSection.id },
  });

  if ((await prisma.resumeEntry.count({ where: { resumeDataId: resumeData.id } })) === 0) {
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
      order: 5,
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
