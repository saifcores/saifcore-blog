"use server";

import { redirect } from "next/navigation";
import { ArticlePreviewContent } from "@/components/admin/article-preview-content";
import { ADR_LABELS } from "@/lib/admin-constants";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { renderMdx } from "@/lib/mdx";
import type { LocaleCode, PostFrontmatter } from "@/lib/types";

const DEFAULT_PREVIEW_BODY = `Write your article in MDX.

<Callout variant="info">
  Use components from the cheat sheet.
</Callout>
`;

export type PreviewArticleInput = {
  slug?: string;
  locale: LocaleCode;
  frontmatter: PostFrontmatter;
  content: string;
};

export async function previewArticleAction(input: PreviewArticleInput) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const locale = input.locale === "fr" ? "fr" : "en";
  const rawContent = input.content.trim() || DEFAULT_PREVIEW_BODY;
  const slug = input.slug?.trim() || "preview-draft";

  const body = await renderMdx(rawContent, ADR_LABELS[locale]);

  return (
    <ArticlePreviewContent
      slug={slug}
      locale={locale}
      frontmatter={input.frontmatter}
      body={body}
      rawContent={rawContent}
    />
  );
}
