import type { getSectionBySlug } from "@/lib/sections";
import Reveal from "@/components/motion/Reveal";
import { paragraphs } from "@/lib/media";

type Section = NonNullable<Awaited<ReturnType<typeof getSectionBySlug>>>;

// "Role, Company (years) — what I did" renders the part before the dash as a
// bold lead line.
function splitLead(paragraph: string): [string | null, string] {
  const index = paragraph.indexOf(" — ");
  return index > 0
    ? [paragraph.slice(0, index), paragraph.slice(index + 3)]
    : [null, paragraph];
}

// A comma-separated run of short terms (a skills list) reads better as chips.
function asChips(paragraph: string) {
  const items = paragraph.replace(/\.$/, "").split(/,\s*/);
  return items.length >= 4 && items.every((item) => item.length <= 40)
    ? items
    : null;
}

export default function ResumeTemplate({ section }: { section: Section }) {
  const resume = section.resume;
  const entries = resume?.entries ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-16 md:pb-32 md:pt-24">
      <Reveal className="flex flex-wrap items-end justify-between gap-6 border-b border-foreground pb-10">
        <div>
          <p className="label-caps text-muted">Curriculum vitae</p>
          <h1 className="mt-4 font-display text-h1 text-foreground">
            {section.navLabel}
          </h1>
        </div>
        {resume?.resumeFileUrl && (
          <a
            href={resume.resumeFileUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-pill px-6 py-3.5 hover:bg-foreground hover:text-background"
          >
            Download PDF ↓
          </a>
        )}
      </Reveal>

      {entries.length === 0 ? (
        <p className="mt-16 font-display text-lg text-muted">
          No resume entries yet.
        </p>
      ) : (
        <div>
          {entries.map((entry, index) => (
            <Reveal
              key={entry.id}
              className="grid gap-6 border-b border-rule py-12 md:grid-cols-12 md:gap-12"
            >
              <div className="md:col-span-4">
                <span className="font-display text-sm text-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-3 font-display text-3xl text-foreground">
                  {entry.heading}
                </h2>
              </div>
              <div className="space-y-6 md:col-span-8">
                {paragraphs(entry.body).map((paragraph, i) => {
                  const chips = asChips(paragraph);
                  if (chips) {
                    return (
                      <ul key={i} className="flex flex-wrap gap-2">
                        {chips.map((chip) => (
                          <li
                            key={chip}
                            className="rounded-full border border-rule bg-surface px-4 py-2 text-sm text-foreground"
                          >
                            {chip}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  const [lead, rest] = splitLead(paragraph);
                  return (
                    <p
                      key={i}
                      className="font-display text-lg leading-relaxed text-foreground/80"
                    >
                      {lead && (
                        <span className="mb-1 block text-foreground">{lead}</span>
                      )}
                      {rest}
                    </p>
                  );
                })}
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
