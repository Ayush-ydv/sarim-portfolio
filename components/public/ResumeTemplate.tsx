import type { getSectionBySlug } from "@/lib/sections";

type Section = NonNullable<Awaited<ReturnType<typeof getSectionBySlug>>>;

export default function ResumeTemplate({ section }: { section: Section }) {
  const resume = section.resume;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16">
      <div className="flex items-baseline justify-between gap-6">
        <h1 className="font-display text-3xl text-foreground">
          {section.navLabel}
        </h1>
        {resume?.resumeFileUrl && (
          <a
            href={resume.resumeFileUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs uppercase tracking-[0.18em] text-muted underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Download PDF
          </a>
        )}
      </div>
      {!resume || resume.entries.length === 0 ? (
        <p className="text-sm text-muted">No resume entries yet.</p>
      ) : (
        <div className="flex flex-col gap-10">
          {resume.entries.map((entry) => (
            <div key={entry.id}>
              <h2 className="text-xs uppercase tracking-[0.2em] text-muted">
                {entry.heading}
              </h2>
              <div className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                {entry.body}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
