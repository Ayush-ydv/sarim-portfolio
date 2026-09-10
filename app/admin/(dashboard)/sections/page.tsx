import { prisma } from "@/lib/prisma";
import AddSectionForm from "@/components/admin/AddSectionForm";
import SectionList from "@/components/admin/SectionList";

export default async function ManageSectionsPage() {
  const sections = await prisma.section.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl text-foreground">
          Manage sections
        </h1>
        <p className="mt-1 text-sm text-muted">
          Add, remove, reorder, and toggle the pages in your site nav.
        </p>
      </div>
      <AddSectionForm />
      <SectionList sections={sections} />
    </div>
  );
}
