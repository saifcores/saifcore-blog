import { revalidatePath, revalidateTag } from "next/cache";

/** Invalidate public blog caches after CMS writes. */
export function revalidateBlogContent(slug: string): void {
  revalidateTag("github-mdx", "max");
  revalidateTag("github-mdx-list", "max");
  revalidatePath("/", "layout");
  revalidatePath("/fr", "layout");
  revalidatePath(`/articles/${slug}`);
  revalidatePath(`/fr/articles/${slug}`);
  revalidatePath("/feed.xml");
  revalidatePath("/fr/feed.xml");
  revalidatePath("/sitemap.xml");
}
