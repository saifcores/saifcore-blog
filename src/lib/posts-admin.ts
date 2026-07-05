import matter from "gray-matter";
import { ADMIN_LOCALES } from "./admin-constants";
import { getArticleCover } from "./article-covers";
import {
  listMdxSlugs,
  persistMdxSource,
  readMdxSource,
  removeMdxSource,
} from "./content-store";
import { getPostSlugs } from "./posts";
import type {
  AdminLocalePost,
  AdminPostPair,
  LocaleCode,
  PostFrontmatter,
  PostMeta,
} from "./types";

function parseFrontmatter(
  slug: string,
  data: Record<string, unknown>,
): PostFrontmatter {
  return {
    title: String(data.title ?? ""),
    excerpt: String(data.excerpt ?? ""),
    kind: data.kind as PostFrontmatter["kind"],
    publishedAt: String(data.publishedAt ?? ""),
    draft: data.draft === true,
    cover: data.cover ? String(data.cover) : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    relatedProjects: Array.isArray(data.relatedProjects)
      ? data.relatedProjects.map(String)
      : [],
  };
}

async function readLocalePost(
  locale: LocaleCode,
  slug: string,
): Promise<AdminLocalePost | null> {
  const raw = await readMdxSource(locale, slug);
  if (!raw) return null;

  const { data, content } = matter(raw);

  return {
    frontmatter: parseFrontmatter(slug, data),
    content,
    exists: true,
  };
}

export function serializePost(
  frontmatter: PostFrontmatter,
  content: string,
): string {
  const payload: Record<string, unknown> = {
    title: frontmatter.title,
    excerpt: frontmatter.excerpt,
    kind: frontmatter.kind,
    publishedAt: frontmatter.publishedAt,
    tags: frontmatter.tags ?? [],
    relatedProjects: frontmatter.relatedProjects ?? [],
  };

  if (frontmatter.draft) payload.draft = true;
  if (frontmatter.cover) payload.cover = frontmatter.cover;

  return matter.stringify(content.trimEnd() + "\n", payload);
}

export async function getAdminPostPair(slug: string): Promise<AdminPostPair> {
  const locales = {} as Record<LocaleCode, AdminLocalePost | null>;

  for (const locale of ADMIN_LOCALES) {
    locales[locale] = await readLocalePost(locale, slug);
  }

  return { slug, locales };
}

export async function getAllAdminSlugs(): Promise<string[]> {
  const slugs = new Set<string>();

  for (const locale of ADMIN_LOCALES) {
    for (const slug of await listMdxSlugs(locale)) {
      slugs.add(slug);
    }
  }

  return [...slugs].sort((a, b) => a.localeCompare(b));
}

export type AdminPostSummary = PostMeta & {
  locales: LocaleCode[];
  isDraft: boolean;
};

export async function getAllAdminPosts(): Promise<AdminPostSummary[]> {
  const slugs = await getAllAdminSlugs();
  const posts: AdminPostSummary[] = [];

  for (const slug of slugs) {
    const pair = await getAdminPostPair(slug);
    const locales = ADMIN_LOCALES.filter((locale) => pair.locales[locale]);

    const primary =
      pair.locales.en ??
      pair.locales.fr ??
      locales.map((locale) => pair.locales[locale]).find(Boolean);

    if (!primary) continue;

    const isDraft = locales.some(
      (locale) => pair.locales[locale]?.frontmatter.draft,
    );

    const latestDate = locales.reduce((max, locale) => {
      const date = pair.locales[locale]?.frontmatter.publishedAt ?? "";
      return date > max ? date : max;
    }, "");

    posts.push({
      slug,
      title: primary.frontmatter.title,
      excerpt: primary.frontmatter.excerpt,
      kind: primary.frontmatter.kind,
      publishedAt: latestDate || primary.frontmatter.publishedAt,
      draft: isDraft,
      cover: primary.frontmatter.cover,
      tags: primary.frontmatter.tags ?? [],
      relatedProjects: primary.frontmatter.relatedProjects ?? [],
      coverImage: getArticleCover(slug, primary.frontmatter.cover),
      readingTime: "",
      locales,
      isDraft,
    });
  }

  return posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function writeLocalePost(
  locale: LocaleCode,
  slug: string,
  frontmatter: PostFrontmatter,
  content: string,
): Promise<void> {
  const raw = serializePost(frontmatter, content);
  await persistMdxSource(locale, slug, raw, `cms: update ${slug} (${locale})`);
}

export async function deleteLocalePost(
  locale: LocaleCode,
  slug: string,
): Promise<boolean> {
  return removeMdxSource(locale, slug, `cms: delete ${slug} (${locale})`);
}

export async function deleteAdminPost(slug: string): Promise<void> {
  for (const locale of ADMIN_LOCALES) {
    await deleteLocalePost(locale, slug);
  }
}

export async function saveAdminPostPair(
  slug: string,
  locales: Partial<
    Record<LocaleCode, { frontmatter: PostFrontmatter; content: string }>
  >,
): Promise<void> {
  for (const locale of ADMIN_LOCALES) {
    const payload = locales[locale];
    if (payload) {
      await writeLocalePost(locale, slug, payload.frontmatter, payload.content);
    }
  }
}

export async function slugExists(slug: string): Promise<boolean> {
  for (const locale of ADMIN_LOCALES) {
    const slugs = await getPostSlugs(locale);
    if (slugs.includes(slug)) return true;
  }
  return false;
}
