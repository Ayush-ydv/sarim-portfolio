import SmartImage from "@/components/SmartImage";
import LoopVideo from "@/components/motion/LoopVideo";
import BackgroundEmbed from "@/components/motion/BackgroundEmbed";
import { backgroundEmbedUrl, isVideoUrl } from "@/lib/media";

// Admin media fields accept either a still or a short clip. Videos become
// muted loops; everything else goes through SmartImage. Always fills its
// (positioned) parent.
export default function SmartMedia({
  src,
  alt,
  sizes,
  preload = false,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  preload?: boolean;
  className?: string;
}) {
  const value = src.trim();

  const embed = backgroundEmbedUrl(value);
  if (embed) {
    return <BackgroundEmbed {...embed} className={className} />;
  }

  if (isVideoUrl(value)) {
    if (!/^(https?:\/\/|\/(?!\/))/i.test(value)) return null;
    return <LoopVideo src={value} eager={preload} className={className} />;
  }

  return (
    <SmartImage
      src={value}
      alt={alt}
      fill
      sizes={sizes}
      preload={preload}
      className={className}
    />
  );
}
