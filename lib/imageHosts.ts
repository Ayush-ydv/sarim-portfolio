// Hosts routed through Next's image optimizer (resized, converted to modern
// formats). Images from any other host still render — they just load
// directly — so the optimizer can't be abused as an open image proxy.
// Shared by next.config.ts and SmartImage so the two never drift apart.
export const optimizedImageHosts = [
  "res.cloudinary.com",
  "images.unsplash.com",
  "i.ytimg.com",
  "**.b-cdn.net",
  "**.cloudflarestream.com",
  "videodelivery.net",
];

export function isOptimizedImageHost(hostname: string) {
  return optimizedImageHosts.some((pattern) =>
    pattern.startsWith("**.")
      ? hostname.endsWith(pattern.slice(2))
      : hostname === pattern,
  );
}
