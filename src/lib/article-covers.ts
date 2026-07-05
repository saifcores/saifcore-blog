/**
 * Resolves article cover image path.
 * Frontmatter `cover` overrides; otherwise defaults to slug-based asset.
 */
export function getArticleCover(slug: string, cover?: string): string {
  if (cover?.startsWith("/")) return cover;
  return `/images/articles/${slug}.svg`;
}
