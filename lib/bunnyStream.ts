import { createHash } from "node:crypto";

// Bunny Stream hosts the uploaded videos: it transcodes them to adaptive HLS
// and serves them from its CDN. Server-only — the API key never reaches the
// browser; uploads get a short-lived signature instead.
const API_BASE = "https://video.bunnycdn.com";
export const BUNNY_TUS_ENDPOINT = `${API_BASE}/tusupload`;

function config() {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const apiKey = process.env.BUNNY_STREAM_API_KEY;
  const cdnHost = process.env.BUNNY_STREAM_CDN_HOST;
  if (!libraryId || !apiKey || !cdnHost) {
    throw new Error("Bunny Stream is not configured (BUNNY_STREAM_* env vars).");
  }
  return { libraryId, apiKey, cdnHost };
}

async function bunnyFetch(path: string, init: RequestInit = {}) {
  const { libraryId, apiKey } = config();
  const res = await fetch(`${API_BASE}/library/${libraryId}${path}`, {
    ...init,
    headers: { AccessKey: apiKey, "Content-Type": "application/json", ...init.headers },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Bunny ${res.status}: ${body.slice(0, 200) || res.statusText}`);
  }
  return res.status === 204 ? null : res.json();
}

// Public URLs for a video: the click-to-play player, the HLS stream used by
// the homepage loops, and the poster.
export function bunnyUrls(videoId: string, thumbnailFileName = "thumbnail.jpg") {
  const { libraryId, cdnHost } = config();
  return {
    embedUrl: `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`,
    hlsUrl: `https://${cdnHost}/${videoId}/playlist.m3u8`,
    thumbnailUrl: `https://${cdnHost}/${videoId}/${thumbnailFileName}`,
  };
}

/** Creates an empty video to upload into. `thumbnailSeconds` picks the poster frame. */
export async function createBunnyVideo(title: string, thumbnailSeconds?: number) {
  const data = await bunnyFetch("/videos", {
    method: "POST",
    body: JSON.stringify({
      title,
      ...(thumbnailSeconds ? { thumbnailTime: Math.round(thumbnailSeconds * 1000) } : {}),
    }),
  });
  return data.guid as string;
}

export async function updateBunnyVideo(
  videoId: string,
  { title, description }: { title?: string; description?: string },
) {
  await bunnyFetch(`/videos/${videoId}`, {
    method: "POST",
    body: JSON.stringify({
      ...(title ? { title } : {}),
      ...(description ? { metaTags: [{ property: "description", value: description }] } : {}),
    }),
  });
}

// Lets the browser upload one file straight to Bunny with tus (resumable, no
// size limit). The signature covers only this video and expires in a day.
export function signTusUpload(videoId: string) {
  const { libraryId, apiKey } = config();
  const expires = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
  const signature = createHash("sha256")
    .update(`${libraryId}${apiKey}${expires}${videoId}`)
    .digest("hex");
  return { endpoint: BUNNY_TUS_ENDPOINT, libraryId, videoId, expires, signature };
}

export type BunnyVideoStatus = {
  readyToStream: boolean;
  failed: boolean;
  encodeProgress: number;
  iframeUrl: string;
  thumbnail: string;
  width: number | null;
  height: number | null;
};

// Bunny status codes: 0 created, 1 uploaded, 2 processing, 3 transcoding,
// 4 finished, 5 error, 6 upload failed.
export async function getBunnyVideoStatus(videoId: string): Promise<BunnyVideoStatus> {
  const video = await bunnyFetch(`/videos/${videoId}`);
  const urls = bunnyUrls(videoId, video.thumbnailFileName || "thumbnail.jpg");
  return {
    readyToStream: video.status === 4,
    failed: video.status === 5 || video.status === 6,
    encodeProgress: video.encodeProgress ?? 0,
    iframeUrl: urls.embedUrl,
    thumbnail: urls.thumbnailUrl,
    width: video.width || null,
    height: video.height || null,
  };
}
