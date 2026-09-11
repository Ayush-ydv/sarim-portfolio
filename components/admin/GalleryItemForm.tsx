"use client";

import { useState, useTransition } from "react";
import type { GalleryItem } from "@prisma/client";
import type { GalleryItemInput } from "@/lib/actions/gallery";
import VideoUploader from "@/components/admin/VideoUploader";
import FileUploadField from "@/components/admin/FileUploadField";

const mediaTypeOptions: { value: GalleryItemInput["mediaType"]; label: string }[] = [
  { value: "EMBED", label: "Embed URL (YouTube/Vimeo)" },
  { value: "VIDEO_UPLOAD", label: "Uploaded video (Cloudflare Stream)" },
  { value: "AUDIO", label: "Audio file" },
  { value: "LINK", label: "External article link" },
];

export default function GalleryItemForm({
  item,
  onSubmit,
  onCancel,
}: {
  item?: GalleryItem;
  onSubmit: (data: GalleryItemInput) => Promise<void>;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [roleLabel, setRoleLabel] = useState(item?.roleLabel ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [mediaType, setMediaType] = useState<GalleryItemInput["mediaType"]>(
    item?.mediaType ?? "EMBED",
  );
  const [mediaUrl, setMediaUrl] = useState(item?.mediaUrl ?? "");
  const [streamVideoId, setStreamVideoId] = useState(item?.streamVideoId ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(item?.thumbnailUrl ?? "");
  const [aspectRatio, setAspectRatio] = useState<number | null>(item?.aspectRatio ?? null);
  const [published, setPublished] = useState(item?.published ?? true);
  const [featured, setFeatured] = useState(item?.featured ?? false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          try {
            await onSubmit({
              title,
              roleLabel,
              description,
              mediaType,
              mediaUrl,
              streamVideoId,
              thumbnailUrl,
              aspectRatio,
              published,
              featured,
            });
          } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
          }
        });
      }}
      className="flex flex-col gap-4 border border-rule bg-background p-4"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-[0.18em] text-muted">
          Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Client // Project // Year"
          required
          className="border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-[0.18em] text-muted">
          Role label (optional)
        </label>
        <input
          value={roleLabel}
          onChange={(e) => setRoleLabel(e.target.value)}
          placeholder="e.g. Lead Editor"
          className="border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs uppercase tracking-[0.18em] text-muted">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-[0.18em] text-muted">
            Media type
          </label>
          <select
            value={mediaType}
            onChange={(e) => {
              const next = e.target.value as GalleryItemInput["mediaType"];
              setMediaType(next);
              // Proportions come from an uploaded video; drop them for other media.
              if (next !== "VIDEO_UPLOAD") setAspectRatio(null);
            }}
            className="border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
          >
            {mediaTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {(mediaType === "EMBED" || mediaType === "LINK") && (
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs uppercase tracking-[0.18em] text-muted">
              {mediaType === "LINK" ? "Article URL" : "Media URL"}
            </label>
            <input
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://…"
              className="border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>
        )}
        {mediaType === "AUDIO" && (
          <div className="flex-1">
            <FileUploadField
              label="Audio file"
              value={mediaUrl}
              onChange={setMediaUrl}
              resourceType="video"
              accept="audio/*"
            />
          </div>
        )}
      </div>
      {mediaType === "VIDEO_UPLOAD" && (
        <VideoUploader
          streamVideoId={streamVideoId}
          thumbnailUrl={thumbnailUrl}
          onUploaded={(data) => {
            setStreamVideoId(data.streamVideoId);
            setMediaUrl(data.mediaUrl);
            setThumbnailUrl(data.thumbnailUrl);
            setAspectRatio(data.aspectRatio);
          }}
        />
      )}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published
        </label>
        <label className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          Show on homepage
        </label>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-foreground px-4 py-2 text-xs uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save item"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted hover:text-foreground"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
