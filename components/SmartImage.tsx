import NextImage, { type ImageProps } from "next/image";
import { isOptimizedImageHost } from "@/lib/imageHosts";

// Admins can paste any image link. next/image throws on a host outside the
// optimizer allowlist or on a malformed src, which takes the whole page down.
// Instead: allowlisted hosts are optimized, other valid links load directly,
// and anything unparseable renders nothing.
function resolve(src: string) {
  const value = src.trim();
  if (value.startsWith("/") && !value.startsWith("//")) {
    return { src: value, unoptimized: false };
  }
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return { src: value, unoptimized: !isOptimizedImageHost(url.hostname) };
  } catch {
    return null;
  }
}

export default function SmartImage({
  src,
  ...props
}: Omit<ImageProps, "src"> & { src: string }) {
  const resolved = resolve(src);
  if (!resolved) return null;

  return (
    <NextImage
      {...props}
      src={resolved.src}
      unoptimized={props.unoptimized || resolved.unoptimized}
    />
  );
}
