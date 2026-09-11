import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ContentEditor from "@/components/admin/ContentEditor";
import GalleryEditor from "@/components/admin/GalleryEditor";
import ResumeEditor from "@/components/admin/ResumeEditor";
import CategorySettingsForm from "@/components/admin/CategorySettingsForm";

export default async function SectionEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const section = await prisma.section.findUnique({
    where: { id },
    include: {
      content: true,
      galleryItems: { orderBy: { order: "asc" } },
      resume: { include: { entries: { orderBy: { order: "asc" } } } },
    },
  });
  if (!section) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/sections"
          className="text-xs uppercase tracking-[0.18em] text-muted hover:text-foreground"
        >
          ← Back to sections
        </Link>
        <h1 className="mt-2 font-display text-2xl text-foreground">
          {section.navLabel}
        </h1>
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          /{section.slug}
        </p>
      </div>

      {section.type === "CONTENT" && (
        <ContentEditor sectionId={section.id} content={section.content} />
      )}

      {section.type === "GALLERY" && (
        <>
          <CategorySettingsForm
            sectionId={section.id}
            summary={section.summary ?? ""}
            coverUrl={section.coverUrl ?? ""}
            galleryLayout={section.galleryLayout}
          />
          <div className="mt-4">
            <h2 className="font-display text-xl text-foreground">Projects</h2>
            <p className="mt-1 text-sm text-muted">
              Tick “Show on homepage” on a project to feature it in Selected work.
            </p>
          </div>
          <GalleryEditor sectionId={section.id} items={section.galleryItems} />
        </>
      )}

      {section.type === "RESUME" &&
        (section.resume ? (
          <ResumeEditor
            sectionId={section.id}
            resumeDataId={section.resume.id}
            resumeFileUrl={section.resume.resumeFileUrl}
            entries={section.resume.entries}
          />
        ) : (
          <p className="text-sm text-muted">
            This resume section is missing its data row — delete and recreate it.
          </p>
        ))}
    </div>
  );
}
