import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [sectionCount, messageCount] = await Promise.all([
    prisma.section.count(),
    prisma.contactSubmission.count({ where: { read: false } }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl text-foreground">Dashboard</h1>
      <div className="flex flex-wrap gap-6">
        <div className="border border-rule px-6 py-4">
          <p className="text-2xl text-foreground">{sectionCount}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            Sections
          </p>
        </div>
        <div className="border border-rule px-6 py-4">
          <p className="text-2xl text-foreground">{messageCount}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            Unread messages
          </p>
        </div>
      </div>
      <div className="flex gap-6 text-xs uppercase tracking-[0.18em] text-muted underline underline-offset-4">
        <Link href="/admin/home" className="hover:text-foreground">
          Edit home
        </Link>
        <Link href="/admin/sections" className="hover:text-foreground">
          Manage sections
        </Link>
      </div>
    </div>
  );
}
