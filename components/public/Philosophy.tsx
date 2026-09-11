import Reveal from "@/components/motion/Reveal";

export default function Philosophy({ text }: { text: string }) {
  return (
    <section className="px-3 py-24 md:px-6 md:py-32">
      <div className="wash-blush overflow-hidden rounded-[2rem]">
        <Reveal className="mx-auto max-w-5xl px-6 py-20 md:px-12 md:py-28">
          <p className="label-caps text-foreground/60">Philosophy</p>
          <span
            aria-hidden
            className="mt-6 block font-display text-[7rem] leading-[0.6] text-foreground/20"
          >
            &ldquo;
          </span>
          <blockquote className="font-display text-quote text-balance text-foreground">
            {text}
          </blockquote>
        </Reveal>
      </div>
    </section>
  );
}
