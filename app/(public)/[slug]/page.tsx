import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSectionBySlug } from "@/lib/sections";
import GalleryTemplate from "@/components/public/GalleryTemplate";
import ContentTemplate from "@/components/public/ContentTemplate";
import ResumeTemplate from "@/components/public/ResumeTemplate";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const section = await getSectionBySlug(slug);
  if (!section || !section.isVisible) return {};
  return { title: section.navLabel };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = await getSectionBySlug(slug);

  if (!section || !section.isVisible) {
    notFound();
  }

  switch (section.type) {
    case "GALLERY":
      return <GalleryTemplate section={section} />;
    case "CONTENT":
      return <ContentTemplate section={section} />;
    case "RESUME":
      return <ResumeTemplate section={section} />;
    default:
      notFound();
  }
}
