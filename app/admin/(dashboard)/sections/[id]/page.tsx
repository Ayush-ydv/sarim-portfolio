import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function SectionEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const section = await prisma.section.findUnique({ where: { id } });
  if (!section) notFound();

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Link
        href="/admin/sections"
        className="text-xs uppercase tracking-[0.18em] text-muted hover:text-foreground"
      >
        ← Back to sections
      </Link>
      <h1 className="font-display text-2xl text-foreground">
        {section.navLabel}
      </h1>
      <p className="text-sm text-muted">
        {section.type} editor coming next.
      </p>
    </div>
  );
}
