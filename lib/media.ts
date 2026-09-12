export function youtubeId(url: string | null | undefined) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:embed\/|shorts\/|live\/|watch\?(?:.*&)?v=)|youtu\.be\/)([\w-]{11})/,
  );
  return match ? match[1] : null;
}

export function vimeoId(url: string | null | undefined) {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(?:[^?#]*\/)?(\d+)/);
  return match ? match[1] : null;
}

// Clients paste whatever link they have (watch page, share link, embed), so
// normalize to an autoplaying embed for the click-to-play player.
export function toEmbedUrl(url: string) {
  const youtube = youtubeId(url);
  if (youtube) {
    return `https://www.youtube-nocookie.com/embed/${youtube}?autoplay=1&rel=0`;
  }
  const vimeo = vimeoId(url);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo}?autoplay=1`;
  // Bunny's player assumes a 16:9 box unless told to fit its frame, which
  // cropped vertical reels and shifted them off-centre.
  if (url.includes("mediadelivery.net")) {
    return `${url}${url.includes("?") ? "&" : "?"}autoplay=true&responsive=true&preload=true`;
  }
  if (url.includes("cloudflarestream.com") || url.includes("videodelivery.net")) {
    return `${url}${url.includes("?") ? "&" : "?"}autoplay=true`;
  }
  return url;
}

export function videoThumbnail(item: {
  thumbnailUrl: string | null;
  mediaUrl: string | null;
}) {
  if (item.thumbnailUrl) return item.thumbnailUrl;
  const youtube = youtubeId(item.mediaUrl);
  return youtube ? `https://i.ytimg.com/vi/${youtube}/hqdefault.jpg` : null;
}

// Gallery titles follow "Client // Project // Year".
export function splitTitle(title: string) {
  const parts = title
    .split("//")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length >= 3) {
    return {
      client: parts[0],
      project: parts.slice(1, -1).join(" // "),
      year: parts[parts.length - 1],
    };
  }
  if (parts.length === 2) return { client: parts[0], project: parts[1], year: null };
  return { client: null, project: title, year: null };
}

export function paragraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

const CLOUDINARY_VIDEO = /res\.cloudinary\.com\/[^/]+\/video\/upload\//;
const VIDEO_EXTENSION = /\.(mp4|webm|mov|m4v|ogv)(?=$|[?#])/i;
// Cloudinary files audio under /video/upload/ too, so exclude it explicitly.
const AUDIO_EXTENSION = /\.(mp3|wav|m4a|aac|ogg|oga|flac)(?=$|[?#])/i;
const FILE_EXTENSION = /\.[a-z0-9]+(?=$|[?#])/i;

// Media fields store a bare URL, so the kind is inferred from the link.
export function isVideoUrl(url: string | null | undefined) {
  if (!url || AUDIO_EXTENSION.test(url)) return false;
  return CLOUDINARY_VIDEO.test(url) || VIDEO_EXTENSION.test(url);
}

// Loops always play muted, so drop the audio track and cap the width;
// forcing .mp4 makes Cloudinary transcode .mov uploads to H.264.
export function optimizedVideoUrl(url: string) {
  if (!CLOUDINARY_VIDEO.test(url)) return null;
  return url
    .replace("/video/upload/", "/video/upload/ac_none,q_auto,w_1600,c_limit/")
    .replace(FILE_EXTENSION, ".mp4");
}

// Requesting a Cloudinary video as .jpg returns a still of the given frame.
export function videoPosterUrl(url: string) {
  if (!CLOUDINARY_VIDEO.test(url)) return null;
  return url
    .replace("/video/upload/", "/video/upload/so_0,q_auto,w_1600,c_limit/")
    .replace(FILE_EXTENSION, ".jpg");
}

const BUNNY_HOST = /https:\/\/(vz-[a-z0-9-]+\.b-cdn\.net)\//;
const BUNNY_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Legacy Cloudflare Stream videos, readable until every item has moved to Bunny.
const STREAM_HOST = /https:\/\/(customer-[a-z0-9]+\.cloudflarestream\.com)\//;

// HLS stream for an uploaded video. Bunny ids are UUIDs; the CDN host comes
// from the stored poster URL, or the env var when that poster was replaced.
export function streamHlsUrl(item: {
  streamVideoId: string | null;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
}) {
  const id = item.streamVideoId;
  if (!id) return null;
  if (BUNNY_ID.test(id)) {
    const host =
      item.thumbnailUrl?.match(BUNNY_HOST)?.[1] ?? process.env.BUNNY_STREAM_CDN_HOST;
    return host ? `https://${host}/${id}/playlist.m3u8` : null;
  }
  const host =
    item.mediaUrl?.match(STREAM_HOST)?.[1] ?? item.thumbnailUrl?.match(STREAM_HOST)?.[1];
  return host ? `https://${host}/${id}/manifest/video.m3u8` : null;
}

// The poster's moment in the video, which is also where a homepage loop
// starts, so the clip opens on the poster frame. Bunny posters carry it as
// #t=N (Bunny renders that frame itself); old Stream posters as ?time=Ns.
export function thumbnailTime(url: string | null | undefined) {
  const match = url?.match(/(?:[?&]time=|#t=)(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

// Tall or wide: the video's own proportions when known (stored on upload),
// otherwise the category's layout — so a vertical film in Films still shows tall.
export function isVertical(
  item: { aspectRatio: number | null },
  layout: "LANDSCAPE" | "VERTICAL",
) {
  return item.aspectRatio != null ? item.aspectRatio < 1 : layout === "VERTICAL";
}

export type BackgroundEmbed = {
  kind: "youtube" | "vimeo";
  embedUrl: string;
  posterUrl: string | null;
};

// Turns a pasted YouTube/Vimeo link (watch page, share link, or embed link —
// youtubeId/vimeoId above already accept all three) into a background-loop
// embed: autoplaying, muted, no controls, looping a single video.
export function backgroundEmbedUrl(url: string): BackgroundEmbed | null {
  const yt = youtubeId(url);
  if (yt) {
    return {
      kind: "youtube",
      embedUrl:
        `https://www.youtube-nocookie.com/embed/${yt}` +
        `?autoplay=1&mute=1&loop=1&playlist=${yt}&controls=0` +
        `&modestbranding=1&playsinline=1&rel=0&iv_load_policy=3`,
      posterUrl: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
    };
  }

  const vm = vimeoId(url);
  if (vm) {
    // Vimeo's background=1 param does the cover-crop + mute + loop itself,
    // so no CSS overscale is needed for this branch.
    return {
      kind: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vm}?background=1&autoplay=1&loop=1&muted=1`,
      posterUrl: null,
    };
  }

  return null;
}
