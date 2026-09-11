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
      <Reveal className="grid gap-8 border-y border-foreground py-10 md:grid-cols-12 md:gap-12 md:py-14">
        <div className="md:col-span-3">
          <p className="label-caps text-muted">Summary</p>
          {bioImageUrl && (
            <div className="relative mt-6 aspect-[4/5] overflow-hidden rounded-xl">
              <SmartMedia
                src={bioImageUrl}
                alt={name}
                sizes="(min-width: 768px) 20vw, 90vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
        <p className="whitespace-pre-line font-display text-lede text-foreground md:col-span-9">
          {bioText}
        </p>
      </Reveal>
    </section>
  );
}
