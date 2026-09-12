import SmartMedia from "@/components/SmartMedia";
import Reveal from "@/components/motion/Reveal";

export default function Summary({
  name,
  bioText,
  bioImageUrl,
}: {
  name: string;
  bioText: string;
  bioImageUrl: string | null;
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <Reveal className="border-y border-foreground py-10 md:py-14">
        {/* Label on its own row so the photo and text start on the same line. */}
        <p className="label-caps text-muted">Summary</p>
        <div className="mt-8 grid gap-8 md:grid-cols-12 md:items-center md:gap-12">
          {bioImageUrl && (
            <div className="relative aspect-[4/5] max-w-xs overflow-hidden rounded-xl md:col-span-3 md:max-w-none">
              <SmartMedia
                src={bioImageUrl}
                alt={name}
                sizes="(min-width: 768px) 20vw, 90vw"
                className="object-cover"
              />
            </div>
          )}
          <p
            className={`whitespace-pre-line font-display text-lede text-foreground ${bioImageUrl ? "md:col-span-9" : "md:col-span-12"}`}
          >
            {bioText}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
