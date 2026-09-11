"use client";

import { useState } from "react";
import { backgroundEmbedUrl, isVideoUrl } from "@/lib/media";

// Cloudinary free-plan per-file limits (audio counts as video).
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

type ResourceType = "image" | "raw" | "video" | "auto";

// XHR rather than fetch: only XHR reports upload progress, which matters
// once videos are in play.
function uploadWithProgress(
  url: string,
  body: FormData,
  onProgress: (percent: number) => void,
) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let data: { secure_url?: string; error?: { message?: string } } = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // Non-JSON error page; fall through to the generic message.
      }
      if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
        resolve(data.secure_url);
      } else {
        reject(new Error(data.error?.message ?? "Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(body);
  });
}

function Preview({ value, resourceType }: { value: string; resourceType: ResourceType }) {
  const src = value.trim();
  const className = "h-28 w-auto max-w-full rounded border border-rule object-cover";

  const embed = backgroundEmbedUrl(src);
  if (embed) {
    // A plain iframe preview (no overscale/lazy-mount needed at this size).
    return (
      <iframe
        src={embed.embedUrl}
        title=""
        aria-hidden
        tabIndex={-1}
        allow="autoplay; encrypted-media"
        className={`${className} aspect-video h-28 w-auto`}
      />
    );
  }

  if (!/^(https?:\/\/|\/(?!\/))/i.test(src)) return null;

  if (isVideoUrl(src)) {
    return <video src={src} muted loop autoPlay playsInline className={className} />;
  }
  if (resourceType === "image" || resourceType === "auto") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={className} />;
  }
  return null;
}

export default function FileUploadField({
  label,
  value,
  onChange,
  resourceType,
  accept,
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  resourceType: ResourceType;
  accept: string;
  hint?: string;
}) {
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    const isImage = file.type.startsWith("image/");
    if (isImage && file.size > MAX_IMAGE_BYTES) {
      setStatus("error");
      setError("Images must be under 10 MB.");
      return;
    }
    if (!isImage && file.size > MAX_VIDEO_BYTES) {
      setStatus("error");
      setError(
        "Files must be under 100 MB — trim or compress the clip first (10–20 seconds is plenty for a loop).",
      );
      return;
    }

    setStatus("uploading");
    setProgress(0);
    try {
      const signRes = await fetch("/api/upload/cloudinary", { method: "POST" });
      const signData = await signRes.json();
      if (!signRes.ok) throw new Error(signData.error ?? "Could not sign upload");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signData.apiKey);
      formData.append("timestamp", String(signData.timestamp));
      formData.append("signature", signData.signature);

      const secureUrl = await uploadWithProgress(
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/${resourceType}/upload`,
        formData,
        setProgress,
      );
      onChange(secureUrl);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs uppercase tracking-[0.18em] text-muted">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste a YouTube/Vimeo link, an image/video URL, or upload below"
        className="border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
      />
      <input
        type="file"
        accept={accept}
        disabled={status === "uploading"}
        onChange={(e) => {
          const file = e.target.files?.[0];
          // Reset so picking the same file again still triggers a change.
          e.target.value = "";
          if (file) handleFile(file);
        }}
        className="text-sm text-foreground disabled:opacity-50"
      />
      {hint && <p className="text-xs text-muted">{hint}</p>}
      {status === "uploading" && (
        <div className="flex items-center gap-3">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-rule">
            <div
              className="h-full bg-foreground transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-muted">
            {progress < 100 ? `Uploading… ${progress}%` : "Processing…"}
          </span>
        </div>
      )}
      {status === "error" && <p className="text-xs text-red-700">{error}</p>}
      {status !== "uploading" && value && (
        <div className="mt-1">
          <Preview value={value} resourceType={resourceType} />
        </div>
      )}
    </div>
  );
}
