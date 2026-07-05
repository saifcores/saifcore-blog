import type { MetadataRoute } from "next";
import { getAllPostParams } from "@/lib/posts";
import { getSiteUrl } from "@/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/fr`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  for (const { locale, slug } of await getAllPostParams()) {
    const prefix = locale === "en" ? "" : `/${locale}`;
    entries.push({
      url: `${siteUrl}${prefix}/articles/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  return entries;
}
