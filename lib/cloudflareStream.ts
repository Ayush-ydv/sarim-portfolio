const CF_API_BASE = "https://api.cloudflare.com/client/v4";

function cfHeaders() {
  return {
    Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_API_TOKEN}`,
    "Content-Type": "application/json",
  };
}

// Sites allowed to play our videos, e.g. "sarim-portfolio-five.vercel.app,
// localhost:3000". Stops other websites embedding them and spending our
// Stream minutes. Empty means Cloudflare's default: playable anywhere.
export function streamAllowedOrigins() {
  return (process.env.STREAM_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

// Applies the allowed origins to an existing video (see
// scripts/stream-allowed-origins.ts for applying them to every video).
export async function setStreamAllowedOrigins(uid: string, origins: string[]) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const res = await fetch(`${CF_API_BASE}/accounts/${accountId}/stream/${uid}`, {
    method: "POST",
    headers: cfHeaders(),
    body: JSON.stringify({ allowedOrigins: origins }),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.errors?.[0]?.message ?? `Failed to update ${uid}`);
  }
}

// Creates a resumable upload (no size limit) that the browser can send
// chunks to directly. Returns the one-time tus URL and the new video's id.
export async function createTusUpload(uploadLength: string, uploadMetadata: string | null) {
  // New uploads are locked to our sites from the start.
  const origins = streamAllowedOrigins();
  if (origins.length > 0) {
    const entry = `allowedorigins ${Buffer.from(origins.join(",")).toString("base64")}`;
    uploadMetadata = uploadMetadata ? `${uploadMetadata},${entry}` : entry;
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const res = await fetch(`${CF_API_BASE}/accounts/${accountId}/stream?direct_user=true`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_API_TOKEN}`,
      "Tus-Resumable": "1.0.0",
      "Upload-Length": uploadLength,
      ...(uploadMetadata ? { "Upload-Metadata": uploadMetadata } : {}),
    },
  });
  const location = res.headers.get("Location");
  const uid = res.headers.get("stream-media-id");
  if (!res.ok || !location || !uid) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.errors?.[0]?.message ?? `Failed to create upload (${res.status})`);
  }
  return { location, uid };
}

export type StreamVideoStatus = {
  readyToStream: boolean;
  thumbnail: string | null;
  iframeUrl: string | null;
  width: number | null;
  height: number | null;
};

export async function getStreamVideoStatus(uid: string): Promise<StreamVideoStatus> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const res = await fetch(`${CF_API_BASE}/accounts/${accountId}/stream/${uid}`, {
    headers: cfHeaders(),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.errors?.[0]?.message ?? "Failed to fetch video status");
  }

  const preview = data.result.preview as string | undefined;
  return {
    readyToStream: Boolean(data.result.readyToStream),
    thumbnail: data.result.thumbnail ?? null,
    iframeUrl: preview ? preview.replace(/\/watch$/, "/iframe") : null,
    width: data.result.input?.width ?? null,
    height: data.result.input?.height ?? null,
  };
}
