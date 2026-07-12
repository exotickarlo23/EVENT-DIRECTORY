import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["postgres"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      // Legacy/alias slugs → canonical routes (extend when a slug changes)
      { source: "/blog", destination: "/vodici", permanent: true },
      { source: "/blog/:slug", destination: "/vodici/:slug", permanent: true },
      { source: "/partneri", destination: "/postani-partner", permanent: true },
    ];
  },
};

export default nextConfig;
