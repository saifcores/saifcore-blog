"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { previewArticleAction } from "@/app/admin/actions.tsx";
import { ThemeProvider } from "@/components/theme-provider";
import type { LocaleCode, PostFrontmatter } from "@/lib/types";

type Props = {
  slug: string;
  locale: LocaleCode;
  frontmatter: PostFrontmatter;
  content: string;
};

export function ArticlePreviewPanel({
  slug,
  locale,
  frontmatter,
  content,
}: Props) {
  const [preview, setPreview] = useState<React.ReactNode>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadPreview = useCallback(() => {
    setError("");
    startTransition(async () => {
      try {
        const rendered = await previewArticleAction({
          slug,
          locale,
          frontmatter,
          content,
        });
        setPreview(rendered);
      } catch (err) {
        setPreview(null);
        setError(
          err instanceof Error ? err.message : "Preview failed to render.",
        );
      }
    });
  }, [slug, locale, frontmatter, content]);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  return (
    <ThemeProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[var(--text-muted)]">
            Renders with the same MDX components and styles as the public blog.
          </p>
          <button
            type="button"
            onClick={loadPreview}
            disabled={isPending}
            className="shrink-0 rounded-lg border border-[var(--border-subtle)] px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-hover)] disabled:opacity-50"
          >
            {isPending ? "Rendering…" : "Refresh preview"}
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {isPending && !preview && !error && (
          <div className="rounded-2xl border border-[var(--border-subtle)] px-6 py-16 text-center text-sm text-[var(--text-muted)]">
            Rendering preview…
          </div>
        )}

        {preview}
      </div>
    </ThemeProvider>
  );
}
