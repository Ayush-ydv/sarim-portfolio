"use client";

import { useState } from "react";

export default function FileUploadField({
  label,
  value,
  onChange,
  resourceType,
  accept,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  resourceType: "image" | "raw" | "video";
  accept: string;
}) {
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setStatus("uploading");
    setError(null);
    try {
      const signRes = await fetch("/api/upload/cloudinary", { method: "POST" });
      const signData = await signRes.json();
      if (!signRes.ok) throw new Error(signData.error ?? "Could not sign upload");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signData.apiKey);
      formData.append("timestamp", String(signData.timestamp));
      formData.append("signature", signData.signature);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/${resourceType}/upload`,
        { method: "POST", body: formData },
      );
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.error?.message ?? "Upload failed");
      }

      onChange(uploadData.secure_url);
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
        placeholder="https://… or upload a file below"
        className="border border-rule bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
      />
      <input
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        className="text-sm text-foreground"
      />
      {status === "uploading" && (
        <p className="text-xs text-muted">Uploading…</p>
      )}
      {status === "error" && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
