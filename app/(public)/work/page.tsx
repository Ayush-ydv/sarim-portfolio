import type { Metadata } from "next";
import Link from "next/link";
import { getWorkCategories } from "@/lib/sections";
import { videoThumbnail } from "@/lib/media";
import ParallaxMedia from "@/components/motion/ParallaxMedia";
import Parallax from "@/components/motion/Parallax";
import ParallaxOrbs from "@/components/motion/ParallaxOrbs";
import OutlineBand from "@/components/motion/OutlineBand";
import EditDecor from "@/components/decor/EditDecor";
import Reveal from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";

export const metadata: Metadata = { title: "Work" };

// The hub behind the homepage "More work" button: one card per visible
// gallery section, so a new category added in admin appears here on its own.
export default async function WorkPage() {
  const categories = await getWorkCategories();

  return (
    <div className="relative isolate">
    <ParallaxOrbs preset="hub" />
    <EditDecor preset="hub" />
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 md:pb-32 md:pt-24">
      <Reveal className="relative isolate border-b border-foreground pb-10">
        <OutlineBand
          text={["Work", ...categories.map((category) => category.navLabel)].join(" · ")}
          className="top-2"
        />
        <p className="label-caps text-muted">Portfolio</p>
        <h1 className="mt-4 font-display text-h1 text-foreground">Work</h1>
      </Reveal>

      {categories.length === 0 ? (
        <p className="mt-16 font-display text-lg text-muted">
          No work categories yet.
        </p>
      ) : (
        <StaggerGroup className="mt-14 grid gap-5 md:mt-24 md:grid-cols-3 md:pb-16">
          {categories.map((category, index) => {
            const firstItem = category.galleryItems[0];
            const cover =
              category.coverUrl || (firstItem ? videoThumbnail(firstItem) : null);
            const count = category._count.galleryItems;

            return (
              <StaggerItem key={category.id}>
                {/* The middle card rises faster; each cover drifts inside its card. */}
                <Parallax speed={index % 3 === 1 ? -180 : 80} mobile={false}>
                <Link
                  href={`/${category.slug}`}
                  className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-foreground"
                >
                  {cover && (
                    <ParallaxMedia
                      src={cover}
                      alt=""
                      sizes="(min-width: 768px) 32vw, 100vw"
                      mediaClassName="object-cover opacity-85 transition duration-[1.2s] ease-out-expo group-hover:scale-[1.05] group-hover:opacity-100"
                      className="h-full w-full"
                    />
                  )}
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-linear-to-t from-foreground/85 via-foreground/15 to-transparent"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-7 text-background md:p-8">
                    <span className="label-caps text-background/70">
                      {String(index + 1).padStart(2, "0")} · {count}{" "}
                      {count === 1 ? "project" : "projects"}
                    </span>
                    <h2 className="mt-3 font-display text-h2 text-background">
                      {category.navLabel}
                    </h2>
                    {category.summary && (
                      <p className="mt-3 text-sm leading-relaxed text-background/80">
                        {category.summary}
                      </p>
                    )}
                    <span className="mt-6 inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-background">
                      View projects
                      <span
                        aria-hidden
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </span>
                  </div>
                </Link>
                </Parallax>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      )}
    </div>
    </div>
  );
}
