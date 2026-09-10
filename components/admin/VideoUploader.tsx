"use client";

import { useRef, useState } from "react";

type UploadState = "idle" | "uploading" | "processing" | "ready" | "error";

export default function VideoUploader({
  streamVideoId,
  thumbnailUrl,
  onUploaded,
}: {
  streamVideoId?: string;
  thumbnailUrl?: string;
  onUploaded: (data: { streamVideoId: string; mediaUrl: string; thumbnailUrl: string }) => void;
}) {
  const [status, setStatus] = useState<UploadState>(streamVideoId ? "ready" : "idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function pollUntilReady(uid: string) {
    for (let attempt = 0; attempt < 60; attempt += 1) {
      const res = await fetch(`/api/upload/stream/status?uid=${uid}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Status check failed");

      if (data.readyToStream && data.iframeUrl) {
        onUploaded({
          streamVideoId: uid,
          mediaUrl: data.iframeUrl,
          thumbnailUrl: data.thumbnail ?? "",
        });
        setStatus("ready");
        return;
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    throw new Error("Video is still processing — check back shortly.");
  }

  async function handleFile(file: File) {
    setError(null);
    setStatus("uploading");
    try {
      const createRes = await fetch("/api/upload/stream", { method: "POST" });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.error ?? "Could not start upload");

      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch(createData.uploadURL, {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("Upload to Cloudflare Stream failed");

      setStatus("processing");
      await pollUntilReady(createData.uid);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="text-sm text-foreground"
      />
      {status === "uploading" && (
        <p className="text-xs text-muted">Uploading…</p>
      )}
      {status === "processing" && (
        <p className="text-xs text-muted">Processing on Cloudflare Stream…</p>
      )}
      {status === "ready" && (
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted">Video ready.</p>
          {thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnailUrl} alt="" className="h-12 w-20 object-cover" />
          )}
        </div>
      )}
      {status === "error" && (
        <p className="text-xs text-red-700">{error}</p>
      )}
    </div>
  );
}
