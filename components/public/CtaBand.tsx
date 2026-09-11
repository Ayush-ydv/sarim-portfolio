import Reveal from "@/components/motion/Reveal";

export default function CtaBand({
  text,
  email,
  buttonLabel,
}: {
  text: string;
  email: string;
  buttonLabel: string;
}) {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="scroll-mt-24 px-3 pb-3 md:px-6 md:pb-6"
    >
      <div className="wash-mint relative overflow-hidden rounded-[2rem] px-6 py-24 text-center md:py-36">
        <Reveal>
          <p className="label-caps text-foreground/70">Let&apos;s work together</p>
          <h2
            id="contact-heading"
            className="mx-auto mt-6 max-w-4xl font-display text-h1 text-balance text-foreground"
          >
            {text}
          </h2>
          <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <a
              href={`mailto:${email}`}
              className="btn-pill bg-foreground px-8 py-4 text-background hover:bg-transparent hover:text-foreground"
            >
              {buttonLabel} →
            </a>
            <a
              href={`mailto:${email}`}
              className="link-sweep font-display text-xl text-foreground"
            >
              {email}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
