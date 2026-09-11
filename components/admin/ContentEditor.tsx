"use client";

import { useState, useTransition } from "react";
import type { SectionContent } from "@prisma/client";
import { updateSectionContent } from "@/lib/actions/content";
import FileUploadField from "@/components/admin/FileUploadField";

export default function ContentEditor({
  sectionId,
  content,
}: {
  sectionId: string;
  content: SectionContent | null;
}) {
  const [heading, setHeading] = useState(content?.heading ?? "");
  const [bodyText, setBodyText] = useState(content?.bodyText ?? "");
  const [imageUrl, setImageUrl] = useState(content?.imageUrl ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(false);
        startTransition(async () => {
          await updateSectionContent(sectionId, { heading, bodyText, imageUrl });
          setSaved(true);
        });
      }}
      className="flex max-w-xl flex-col gap-5"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-[0.18em] text-muted">
          Heading
        </label>
        <input
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          className="border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-[0.18em] text-muted">
          Body text
        </label>
        <textarea
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          rows={8}
          className="border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>
      <FileUploadField
        label="Image or video"
        value={imageUrl}
        onChange={setImageUrl}
        resourceType="auto"
        accept="image/*,video/*"
        hint="Videos play muted on a loop — short clips (10–20s) load fastest."
      />
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="bg-foreground px-4 py-2 text-xs uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        {saved && !isPending && (
          <span className="text-xs text-muted">Saved.</span>
        )}
      </div>
    </form>
  );
}
