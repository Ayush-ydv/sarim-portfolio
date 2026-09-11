import Link from "next/link";

// Pill switcher between Work categories (Films · Reels · AI Films …).
export default function CategoryNav({
  categories,
  current,
}: {
  categories: { slug: string; navLabel: string }[];
  current: string;
}) {
  if (categories.length < 2) return null;

  return (
    <nav aria-label="Work categories" className="mt-8 flex flex-wrap gap-2">
      {categories.map((category) => {
        const active = category.slug === current;
        return (
          <Link
            key={category.slug}
            href={`/${category.slug}`}
            aria-current={active ? "page" : undefined}
            className={`rounded-full border px-4 py-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] transition-colors duration-300 ${
              active
                ? "border-foreground bg-foreground text-background"
                : "border-rule text-foreground/70 hover:border-foreground hover:text-foreground"
            }`}
          >
            {category.navLabel}
          </Link>
        );
      })}
    </nav>
  );
}
