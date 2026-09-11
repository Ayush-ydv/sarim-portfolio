import Image from "next/image";
import Link from "next/link";
import type { GalleryItem } from "@prisma/client";
import Reveal from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/Stagger";
import { splitTitle, videoThumbnail } from "@/lib/media";

const tints = ["bg-lavender", "bg-mint", "bg-blush"];

export default function FeaturedWork({
  href,
  items,
}: {
  href: string;
  items: GalleryItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <Reveal>
          <p className="label-caps text-muted">Selected work</p>
          <h2 className="mt-4 font-display text-h1 text-foreground">Recent cuts</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <Link
            href={href}
            className="link-sweep text-[0.72rem] font-medium uppercase tracking-[0.2em] text-foreground"
          >
            View all work →
          </Link>
        </Reveal>
      </div>

      <StaggerGroup className="mt-14 grid gap-x-6 gap-y-14 md:grid-cols-3">
        {items.map((item, index) => {
          const { client, project, year } = splitTitle(item.title);
          const thumbnail = videoThumbnail(item);
          return (
            <StaggerItem
              key={item.id}
              className={index === 1 ? "md:mt-16" : undefined}
            >
              <Link href={`${href}#${item.id}`} className="group block">
                <div
                  className={`relative aspect-[4/5] overflow-hidden rounded-2xl ${tints[index % tints.length]}`}
                >
                  {thumbnail ? (
                    <Image
                      src={thumbnail}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 30vw, 90vw"
                      className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.06]"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col justify-between p-7">
                      <span className="font-display text-sm text-foreground/60">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-4xl italic leading-none text-foreground transition-transform duration-700 ease-out-expo group-hover:-translate-y-2">
                        {client ?? project}
                      </span>
                    </div>
                  )}
                  {item.roleLabel && (
                    <span className="absolute right-4 top-4 rounded-full bg-background/90 px-3 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.18em] text-foreground backdrop-blur">
                      {item.roleLabel}
                    </span>
                  )}
                </div>
                <div className="mt-5 flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-2xl leading-tight text-foreground">
                    {project}
                  </h3>
                  {year && <span className="label-caps shrink-0 text-muted">{year}</span>}
                </div>
                {client && <p className="mt-1 text-sm text-muted">{client}</p>}
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </section>
  );
}
