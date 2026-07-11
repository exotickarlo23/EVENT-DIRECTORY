import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/pretraga", "/favoriti", "/usporedi", "/preuzmi-oglas"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
