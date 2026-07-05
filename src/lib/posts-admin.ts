import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { ADMIN_LOCALES } from "./admin-constants";
import { getArticleCover } from "./article-covers";
import { getPostBySlug, getPostSlugs } from "./posts";
import type {
  AdminLocalePost,
  AdminPostPair,
  LocaleCode,
  Post,
  PostFrontmatter,
  PostMeta,
} from "./types";

const contentRoot = path.join(process.cwd(), "content");

function localeDir(locale: string): string {
  return path.join(contentRoot, locale);
}

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

function readLocalePost(
  locale: LocaleCode,
  slug: string,
): AdminLocalePost | null {
  const filePath = path.join(localeDir(locale), `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
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

export function getAdminPostPair(slug: string): AdminPostPair {
  const locales = {} as Record<LocaleCode, AdminLocalePost | null>;

  for (const locale of ADMIN_LOCALES) {
    locales[locale] = readLocalePost(locale, slug);
  }

  return { slug, locales };
}

export function getAllAdminSlugs(): string[] {
  const slugs = new Set<string>();

  for (const locale of ADMIN_LOCALES) {
    for (const slug of getPostSlugs(locale)) {
      slugs.add(slug);
    }
  }

  return [...slugs].sort((a, b) => a.localeCompare(b));
}

export type AdminPostSummary = PostMeta & {
  locales: LocaleCode[];
  isDraft: boolean;
};

export function getAllAdminPosts(): AdminPostSummary[] {
  const slugs = getAllAdminSlugs();
  const posts: AdminPostSummary[] = [];

  for (const slug of slugs) {
    const pair = getAdminPostPair(slug);
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

export function writeLocalePost(
  locale: LocaleCode,
  slug: string,
  frontmatter: PostFrontmatter,
  content: string,
): void {
  const dir = localeDir(locale);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${slug}.mdx`);
  fs.writeFileSync(filePath, serializePost(frontmatter, content), "utf8");
}

export function deleteLocalePost(locale: LocaleCode, slug: string): boolean {
  const filePath = path.join(localeDir(locale), `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  return true;
}

export function deleteAdminPost(slug: string): void {
  for (const locale of ADMIN_LOCALES) {
    deleteLocalePost(locale, slug);
  }
}

export function saveAdminPostPair(
  slug: string,
  locales: Partial<
    Record<LocaleCode, { frontmatter: PostFrontmatter; content: string }>
  >,
): void {
  for (const locale of ADMIN_LOCALES) {
    const payload = locales[locale];
    if (payload) {
      writeLocalePost(locale, slug, payload.frontmatter, payload.content);
    }
  }
}
