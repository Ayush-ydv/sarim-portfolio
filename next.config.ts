import type { NextConfig } from "next";
import { optimizedImageHosts } from "./lib/imageHosts";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: optimizedImageHosts.map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
  },
};

export default nextConfig;
