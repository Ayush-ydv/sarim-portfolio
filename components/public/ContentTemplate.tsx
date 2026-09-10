import Image from "next/image";
import type { getSectionBySlug } from "@/lib/sections";

type Section = NonNullable<Awaited<ReturnType<typeof getSectionBySlug>>>;

export default function ContentTemplate({ section }: { section: Section }) {
  const content = section.content;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16">
      <h1 className="font-display text-3xl text-foreground">
        {content?.heading || section.navLabel}
      </h1>
      {content?.imageUrl && (
        <div className="relative aspect-[4/3] w-full max-w-md overflow-hidden">
          <Image
            src={content.imageUrl}
            alt={content.heading || section.navLabel}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="max-w-2xl whitespace-pre-line text-sm leading-relaxed text-foreground/80">
        {content?.bodyText || "No content yet."}
      </div>
    </div>
  );
}
