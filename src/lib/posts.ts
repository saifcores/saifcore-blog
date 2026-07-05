import matter from "gray-matter";
import readingTime from "reading-time";
import { getArticleCover } from "./article-covers";
import { listMdxSlugs, readMdxSource } from "./content-store";
import type { Post, PostMeta } from "./types";

function parsePost(slug: string, raw: string): Post {
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

export async function getPostSlugs(locale: string): Promise<string[]> {
  return listMdxSlugs(locale);
}

export async function getPostBySlug(
  locale: string,
  slug: string,
): Promise<Post | null> {
  const raw = await readMdxSource(locale, slug);
  if (!raw) return null;
  return parsePost(slug, raw);
}

export async function getAllPosts(locale: string): Promise<PostMeta[]> {
  const slugs = await getPostSlugs(locale);
  const posts = await Promise.all(
    slugs.map((slug) => getPostBySlug(locale, slug)),
  );

  return posts
    .filter((post): post is Post => post !== null)
    .map((post) => post.meta)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** Published posts only — excludes drafts from public listings. */
export async function getPublishedPosts(locale: string): Promise<PostMeta[]> {
  const posts = await getAllPosts(locale);
  return posts.filter((post) => !post.draft);
}

export async function getAllPostParams(): Promise<
  { locale: string; slug: string }[]
> {
  const locales = ["en", "fr"] as const;
  const params: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    const slugs = await getPostSlugs(locale);
    for (const slug of slugs) {
      const post = await getPostBySlug(locale, slug);
      if (post && !post.meta.draft) {
        params.push({ locale, slug });
      }
    }
  }

  return params;
}
