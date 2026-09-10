const CF_API_BASE = "https://api.cloudflare.com/client/v4";

function cfHeaders() {
  return {
    Authorization: `Bearer ${process.env.CLOUDFLARE_STREAM_API_TOKEN}`,
    "Content-Type": "application/json",
  };
}

export async function createDirectUploadUrl(maxDurationSeconds = 3600) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const res = await fetch(
    `${CF_API_BASE}/accounts/${accountId}/stream/direct_upload`,
    {
      method: "POST",
      headers: cfHeaders(),
      body: JSON.stringify({ maxDurationSeconds, requireSignedURLs: false }),
    },
  );
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.errors?.[0]?.message ?? "Failed to create upload URL");
  }
  return { uploadURL: data.result.uploadURL as string, uid: data.result.uid as string };
}

export type StreamVideoStatus = {
  readyToStream: boolean;
  thumbnail: string | null;
  iframeUrl: string | null;
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
  };
}
