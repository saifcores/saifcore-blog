import { ARTICLE_KINDS } from "./admin-constants";
import type { ArticleKind, PostFrontmatter } from "./types";

export type ValidationError = {
  field: string;
  message: string;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function validateSlug(slug: string): ValidationError | null {
  if (!slug.trim()) {
    return { field: "slug", message: "Slug is required." };
  }
  if (!SLUG_PATTERN.test(slug)) {
    return {
      field: "slug",
      message: "Use lowercase letters, numbers, and hyphens only.",
    };
  }
  return null;
}

export function validateFrontmatter(
  data: Partial<PostFrontmatter>,
  prefix = "",
): ValidationError[] {
  const errors: ValidationError[] = [];
  const field = (name: string) => (prefix ? `${prefix}.${name}` : name);

  if (!data.title?.trim()) {
    errors.push({ field: field("title"), message: "Title is required." });
  }
  if (!data.excerpt?.trim()) {
    errors.push({ field: field("excerpt"), message: "Excerpt is required." });
  }
  if (!data.kind || !ARTICLE_KINDS.includes(data.kind as ArticleKind)) {
    errors.push({ field: field("kind"), message: "Select a valid kind." });
  }
  if (!data.publishedAt || !DATE_PATTERN.test(data.publishedAt)) {
    errors.push({
      field: field("publishedAt"),
      message: "Use YYYY-MM-DD format.",
    });
  }
  if (data.cover && !data.cover.startsWith("/")) {
    errors.push({
      field: field("cover"),
      message: "Cover path must start with /.",
    });
  }

  return errors;
}

export function parseListInput(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
