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

type SignedUpload = {
  endpoint: string;
  libraryId: string;
  videoId: string;
  expires: number;
  signature: string;
  predicted: { mediaUrl: string; thumbnailUrl: string };
};

// 50 MiB keeps the request count low while a dropped connection only costs
// one chunk.
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
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const uploadRef = useRef<Upload | null>(null);

  async function pollUntilReady(signed: SignedUpload) {
    // Long 4K films can take a while for Bunny to transcode.
    for (let attempt = 0; attempt < 180; attempt += 1) {
      const res = await fetch(`/api/upload/stream/status?uid=${signed.videoId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Status check failed");
      if (data.failed) throw new Error("Bunny couldn't process this video. Try exporting it as MP4 (H.264).");

      if (data.readyToStream) {
        onUploaded({
          streamVideoId: signed.videoId,
          mediaUrl: data.iframeUrl,
          thumbnailUrl: data.thumbnail,
          // Lets the site lay the video out tall or wide, whatever category it's in.
          aspectRatio: data.width && data.height ? data.width / data.height : null,
        });
        setStatus("ready");
        return;
      }
      setProgress(data.encodeProgress ?? 0);
      await new Promise((r) => setTimeout(r, 5000));
    }

    // Still transcoding after 15 minutes: the video's address is already
    // known, so let the admin save now; it appears on the site once ready.
    onUploaded({
      streamVideoId: signed.videoId,
      mediaUrl: signed.predicted.mediaUrl,
      thumbnailUrl: signed.predicted.thumbnailUrl,
      aspectRatio: null,
    });
    setNotice("Still processing on Bunny. You can save now; it will appear on the site once ready.");
    setStatus("ready");
  }

  async function handleFile(file: File) {
    setError(null);
    setNotice(null);
    setProgress(0);
    setStatus("uploading");

    let signed: SignedUpload;
    try {
      const res = await fetch("/api/upload/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: file.name.replace(/\.[^.]+$/, "") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(res.status === 401 ? "Please sign in again." : data.error);
      signed = data;
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error && err.message ? err.message : "Could not start upload");
      return;
    }

    const upload = new Upload(file, {
      endpoint: signed.endpoint,
      chunkSize: CHUNK_SIZE,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        AuthorizationSignature: signed.signature,
        AuthorizationExpire: String(signed.expires),
        VideoId: signed.videoId,
        LibraryId: String(signed.libraryId),
      },
      metadata: { filetype: file.type, title: file.name },
      storeFingerprintForResuming: false,
      onProgress(sent, total) {
        setProgress(Math.round((sent / total) * 100));
      },
      onError() {
        setStatus("error");
        setError("Upload failed — check your connection and try again.");
      },
      onSuccess() {
        uploadRef.current = null;
        setProgress(0);
        setStatus("processing");
        pollUntilReady(signed).catch((err) => {
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
        disabled={status === "uploading" || status === "processing"}
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
        <p className="text-xs text-muted">
          Processing on Bunny… {progress > 0 ? `${progress}%` : ""} (large videos can take a few minutes)
        </p>
      )}
      {status === "ready" && (
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted">{notice ?? "Video ready."}</p>
          {thumbnailUrl && !notice && (
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
