const CF_API_BASE = "https://api.cloudflare.com/client/v4";

function cfHeaders() {
  return {
    Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_API_TOKEN}`,
    "Content-Type": "application/json",
  };
}

// Creates a resumable upload (no size limit) that the browser can send
// chunks to directly. Returns the one-time tus URL and the new video's id.
export async function createTusUpload(uploadLength: string, uploadMetadata: string | null) {
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
