import type { PostMeta } from "./types";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

type BuildRssInput = {
  siteUrl: string;
  locale: "en" | "fr";
  channelTitle: string;
  channelDescription: string;
  posts: PostMeta[];
};

export function buildRssFeed({
  siteUrl,
  locale,
  channelTitle,
  channelDescription,
  posts,
}: BuildRssInput): string {
  const prefix = locale === "fr" ? "/fr" : "";
  const feedUrl = `${siteUrl}${prefix}/feed.xml`;
  const homeUrl = `${siteUrl}${prefix || "/"}`;

  const items = posts
    .map((post) => {
      const link = `${siteUrl}${prefix}/articles/${post.slug}`;
      const image = `${siteUrl}${post.coverImage}`;
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(`${post.publishedAt}T12:00:00.000Z`).toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
      <enclosure url="${image}" type="image/svg+xml"/>
    </item>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${homeUrl}</link>
    <description>${escapeXml(channelDescription)}</description>
    <language>${locale === "fr" ? "fr" : "en"}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;
}
