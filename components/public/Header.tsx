import Link from "next/link";
import { getVisibleSections } from "@/lib/sections";

export default async function Header() {
  const sections = await getVisibleSections();

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-5 sm:flex-row sm:justify-between">
        <Link
          href="/"
          className="font-display text-lg tracking-wide text-foreground"
        >
          Home
        </Link>
        <nav aria-label="Primary" className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {sections.map((section) => (
            <Link
              key={section.id}
              href={`/${section.slug}`}
              className="text-xs font-medium uppercase tracking-[0.18em] text-muted transition-colors hover:text-foreground"
            >
              {section.navLabel}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
