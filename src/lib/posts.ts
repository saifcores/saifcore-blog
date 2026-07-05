import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { getArticleCover } from "./article-covers";
import type { Post, PostMeta } from "./types";

const contentRoot = path.join(process.cwd(), "content");

function localeDir(locale: string): string {
  return path.join(contentRoot, locale);
}

export function getPostSlugs(locale: string): string[] {
  const dir = localeDir(locale);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export function getPostBySlug(locale: string, slug: string): Post | null {
  const filePath = path.join(localeDir(locale), `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const stats = readingTime(content);

  return {
    meta: {
      slug,
      title: data.title,
      excerpt: data.excerpt,
      kind: data.kind,
      publishedAt: data.publishedAt,
      draft: data.draft === true,
      cover: data.cover,
      coverImage: getArticleCover(slug, data.cover),
      tags: data.tags ?? [],
      relatedProjects: data.relatedProjects ?? [],
      readingTime: stats.text,
    },
    content,
  };
}

export function getAllPosts(locale: string): PostMeta[] {
  return getPostSlugs(locale)
    .map((slug) => getPostBySlug(locale, slug))
    .filter((post): post is Post => post !== null)
    .map((post) => post.meta)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** Published posts only — excludes drafts from public listings. */
export function getPublishedPosts(locale: string): PostMeta[] {
  return getAllPosts(locale).filter((post) => !post.draft);
}

export function getAllPostParams(): { locale: string; slug: string }[] {
  const locales = ["en", "fr"] as const;
  const params: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    for (const slug of getPostSlugs(locale)) {
      const post = getPostBySlug(locale, slug);
      if (post && !post.meta.draft) {
        params.push({ locale, slug });
      }
    }
  }

  return params;
}
