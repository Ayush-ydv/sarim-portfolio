"use client";

import { useRef, useState } from "react";
import { Upload } from "tus-js-client";

type UploadState = "idle" | "uploading" | "processing" | "ready" | "error";

export type UploadedVideo = {
  streamVideoId: string;
  mediaUrl: string;
  thumbnailUrl: string;
  aspectRatio: number | null;
};

// Cloudflare needs chunks in multiples of 256 KiB; 50 MiB keeps the request
// count low while a dropped connection only costs one chunk.
const CHUNK_SIZE = 50 * 1024 * 1024;

export default function VideoUploader({
  streamVideoId,
  thumbnailUrl,
  onUploaded,
}: {
  streamVideoId?: string;
  thumbnailUrl?: string;
  onUploaded: (data: UploadedVideo) => void;
}) {
  const [status, setStatus] = useState<UploadState>(streamVideoId ? "ready" : "idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const uploadRef = useRef<Upload | null>(null);

  async function pollUntilReady(uid: string) {
    // Long films can take several minutes for Cloudflare to process.
    for (let attempt = 0; attempt < 180; attempt += 1) {
      const res = await fetch(`/api/upload/stream/status?uid=${uid}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Status check failed");

      if (data.readyToStream && data.iframeUrl) {
        onUploaded({
          streamVideoId: uid,
          mediaUrl: data.iframeUrl,
          thumbnailUrl: data.thumbnail ?? "",
          // Lets the site lay the video out tall or wide, whatever category it's in.
          aspectRatio: data.width && data.height ? data.width / data.height : null,
        });
        setStatus("ready");
        return;
      }
      await new Promise((r) => setTimeout(r, 5000));
    }
    throw new Error("Video is still processing — save, then check back shortly.");
  }

  function handleFile(file: File) {
    setError(null);
    setProgress(0);
    setStatus("uploading");

    let uid: string | null = null;
    const upload = new Upload(file, {
      endpoint: "/api/upload/stream",
      chunkSize: CHUNK_SIZE,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      metadata: { name: file.name, filetype: file.type },
      storeFingerprintForResuming: false,
      onAfterResponse(req, res) {
        const id = res.getHeader("stream-media-id");
        if (req.getMethod() === "POST" && id) uid = id;
      },
      onProgress(sent, total) {
        setProgress(Math.round((sent / total) * 100));
      },
      onError(err) {
        setStatus("error");
        setError(err.message.includes("Unauthorized") ? "Please sign in again." : "Upload failed — check your connection and try again.");
      },
      onSuccess() {
        uploadRef.current = null;
        const id = uid ?? upload.url?.split("/").pop()?.split("?")[0];
        if (!id) {
          setStatus("error");
          setError("Upload finished but Cloudflare didn't return a video id.");
          return;
        }
        setStatus("processing");
        pollUntilReady(id).catch((err) => {
          setStatus("error");
          setError(err instanceof Error ? err.message : "Processing failed");
        });
      },
    });
    uploadRef.current = upload;
    upload.start();
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="file"
        accept="video/*"
        disabled={status === "uploading"}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="text-sm text-foreground"
      />
      {status === "uploading" && (
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-48 overflow-hidden bg-rule">
            <div className="h-full bg-foreground transition-[width]" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted">Uploading… {progress}%</p>
          <button
            type="button"
            onClick={() => {
              uploadRef.current?.abort(true);
              uploadRef.current = null;
              setStatus("idle");
            }}
            className="text-xs uppercase tracking-[0.18em] text-muted hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      )}
      {status === "processing" && (
        <p className="text-xs text-muted">Processing on Cloudflare Stream… (large videos can take a few minutes)</p>
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
