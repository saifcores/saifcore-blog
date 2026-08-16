import { GENERATED_COVER_SLUGS } from "./generated-covers";

const COVER_DIR = "/images/articles";

/**
 * Resolves article cover image path.
 * Frontmatter `cover` overrides; otherwise defaults to slug-based asset.
 */
export function getArticleCover(slug: string, cover?: string): string {
  if (cover?.startsWith("/")) return cover;
  return `${COVER_DIR}/${slug}.svg`;
}

/**
 * Display variants for a cover. Generated SVG artwork ships a light-mode
 * sibling; hand-authored raster covers do not, and render unchanged in both
 * themes. `dark` stays the canonical path used for OG images and feeds.
 */
export function getArticleCoverVariants(
  slug: string,
  cover?: string,
): { dark: string; light: string | null } {
  const dark = getArticleCover(slug, cover);
  const hasLightVariant =
    dark === `${COVER_DIR}/${slug}.svg` && GENERATED_COVER_SLUGS.has(slug);

  return {
    dark,
    light: hasLightVariant ? `${COVER_DIR}/${slug}-light.svg` : null,
  };
}
