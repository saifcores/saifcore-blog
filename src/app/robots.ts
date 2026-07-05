import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/admin"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
