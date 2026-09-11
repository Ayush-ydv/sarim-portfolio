import type { Section } from "@prisma/client";

export type NavLink = { href: string; label: string; match: string[] };

// Every gallery section is a category on /work, so they collapse into one
// "Work" item placed where the first gallery sits; other sections link
// directly. `match` lists the paths that mark an item as active.
export function buildNavLinks(
  sections: Pick<Section, "slug" | "navLabel" | "type">[],
): NavLink[] {
  const galleryPaths = sections
    .filter((section) => section.type === "GALLERY")
    .map((section) => `/${section.slug}`);

  const links: NavLink[] = [];
  let workAdded = false;
  for (const section of sections) {
    if (section.type === "GALLERY") {
      if (!workAdded) {
        links.push({ href: "/work", label: "Work", match: ["/work", ...galleryPaths] });
        workAdded = true;
      }
      continue;
    }
    const href = `/${section.slug}`;
    links.push({ href, label: section.navLabel, match: [href] });
  }
  return links;
}
