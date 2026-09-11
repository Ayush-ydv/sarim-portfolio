"use client";

import { useState, useTransition } from "react";
import type { GalleryLayout } from "@prisma/client";
import { updateCategorySettings } from "@/lib/actions/sections";
import FileUploadField from "@/components/admin/FileUploadField";

const inputClass =
  "border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground";

const layoutOptions: { value: GalleryLayout; label: string }[] = [
  { value: "LANDSCAPE", label: "Landscape — wide rows (films)" },
  { value: "VERTICAL", label: "Vertical — 9:16 grid (reels)" },
];

// How a gallery section appears as a card on /work and lays out its page.
export default function CategorySettingsForm({
  sectionId,
  summary: initialSummary,
  coverUrl: initialCoverUrl,
  galleryLayout: initialLayout,
}: {
  sectionId: string;
  summary: string;
  coverUrl: string;
  galleryLayout: GalleryLayout;
}) {
  const [summary, setSummary] = useState(initialSummary);
  const [coverUrl, setCoverUrl] = useState(initialCoverUrl);
  const [galleryLayout, setGalleryLayout] = useState(initialLayout);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(false);
        startTransition(async () => {
          await updateCategorySettings(sectionId, { summary, coverUrl, galleryLayout });
          setSaved(true);
        });
      }}
      className="flex max-w-xl flex-col gap-5 border border-rule p-5"
    >
      <div>
        <h2 className="font-display text-xl text-foreground">Category settings</h2>
        <p className="mt-1 text-sm text-muted">
          How this category appears as a card on the Work page, and how its
          projects are laid out.
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-[0.18em] text-muted">
          Short description
        </label>
        <input
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="e.g. Short-form vertical edits built for social."
          className={inputClass}
        />
      </div>
      <FileUploadField
        label="Card cover (image, video, or YouTube/Vimeo link)"
        value={coverUrl}
        onChange={setCoverUrl}
        resourceType="auto"
        accept="image/*,video/*"
        hint="Leave empty to use the first project's thumbnail."
      />
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-[0.18em] text-muted">
          Layout
        </label>
        <select
          value={galleryLayout}
          onChange={(e) => setGalleryLayout(e.target.value as GalleryLayout)}
          className={inputClass}
        >
          {layoutOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="bg-foreground px-4 py-2 text-xs uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        {saved && !isPending && <span className="text-xs text-muted">Saved.</span>}
      </div>
    </form>
  );
}
