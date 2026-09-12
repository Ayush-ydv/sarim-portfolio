import Reveal from "@/components/motion/Reveal";
import BookingForm from "@/components/public/BookingForm";

export default function CtaBand({
  text,
  email,
  projectTypes,
}: {
  text: string;
  email: string;
  projectTypes: string[];
}) {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="scroll-mt-24 p-3 md:p-6"
    >
      <div className="wash-mint relative overflow-hidden rounded-[2rem] px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className="label-caps text-foreground/70">Let&apos;s work together</p>
            <h2
              id="contact-heading"
              className="mt-6 font-display text-h1 text-balance text-foreground"
            >
              {text}
            </h2>
            <p className="mt-8 text-foreground/75">Prefer email?</p>
            <a
              href={`mailto:${email}`}
              className="link-sweep mt-1 inline-block font-display text-xl text-foreground"
            >
              {email}
            </a>
          </Reveal>
          <Reveal delay={0.1} className="relative lg:col-span-7">
            <BookingForm projectTypes={projectTypes} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
