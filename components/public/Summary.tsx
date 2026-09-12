import ParallaxMedia from "@/components/motion/ParallaxMedia";
import Parallax from "@/components/motion/Parallax";
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
        <div className="grid gap-8 md:grid-cols-12 md:items-center md:gap-12">
          {bioImageUrl && (
            // The photo lags behind the text, and drifts inside its frame.
            <Parallax speed={120} mobile={false} className="md:col-span-3">
              <ParallaxMedia
                src={bioImageUrl}
                alt={name}
                sizes="(min-width: 768px) 20vw, 90vw"
                className="aspect-[4/5] max-w-xs rounded-xl md:max-w-none"
              />
            </Parallax>
          )}
          <Parallax
            speed={-90}
            mobile={false}
            className={bioImageUrl ? "md:col-span-9" : "md:col-span-12"}
          >
            <p className="whitespace-pre-line font-display text-lede text-foreground">
              {bioText}
            </p>
          </Parallax>
        </div>
      </Reveal>
    </section>
  );
}
