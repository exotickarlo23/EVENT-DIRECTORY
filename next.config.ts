import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["better-sqlite3"],
  images: {
    formats: ["image/avif", "image/webp"],
    // Scrapane fotografije stižu kao vanjski URL-ovi (bilo koja https domena).
    // Next ih pri prvom pregledu dohvati, optimizira u avif/webp i kešira na
    // našoj strani — tako ostaju „samo URL u bazi", a serviraju se brzo.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
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
