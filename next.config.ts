import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "**.cloudflarestream.com" },
      { protocol: "https", hostname: "videodelivery.net" },
    ],
  },
};

export default nextConfig;
