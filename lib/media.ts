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
