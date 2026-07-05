import { getTranslations } from "next-intl/server";
import { getPublishedPosts } from "@/lib/posts";
import { buildRssFeed } from "@/lib/rss";
import { getSiteUrl } from "@/site";

export async function GET() {
  const posts = await getPublishedPosts("fr");
  const t = await getTranslations({ locale: "fr", namespace: "home" });
  const siteUrl = getSiteUrl();

  const xml = buildRssFeed({
    siteUrl,
    locale: "fr",
    channelTitle: t("metaTitle"),
    channelDescription: t("metaDescription"),
    posts,
  });

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
