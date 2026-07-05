import readingTime from "reading-time";
import { ArticleKindBadge } from "@/components/article-kind-badge";
import { ArticleCover } from "@/components/article-cover";
import { KIND_LABELS } from "@/lib/admin-constants";
import type { LocaleCode, PostFrontmatter } from "@/lib/types";

type Props = {
  slug: string;
  locale: LocaleCode;
  frontmatter: PostFrontmatter;
  body: React.ReactNode;
  rawContent: string;
};

export function ArticlePreviewContent({
  slug,
  locale,
  frontmatter,
  body,
  rawContent,
}: Props) {
  const stats = readingTime(rawContent);
  const kindLabel = KIND_LABELS[locale][frontmatter.kind];

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/20">
      <div className="border-b border-[var(--border-subtle)] bg-amber-500/10 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-amber-200/90">
        Preview — unsaved changes
      </div>
      <header className="px-4 py-8 sm:px-8 sm:py-10">
        <div className="max-w-4xl">
          <ArticleCover
            slug={slug}
            cover={frontmatter.cover}
            title={frontmatter.title || "Untitled"}
            priority
          />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <ArticleKindBadge kind={frontmatter.kind} label={kindLabel} />
          {frontmatter.publishedAt && (
            <time
              dateTime={frontmatter.publishedAt}
              className="font-mono text-xs text-[var(--text-muted)]"
            >
              {formatDate(frontmatter.publishedAt)}
            </time>
          )}
          <span className="text-xs text-[var(--text-muted)]">
            · {stats.text}
          </span>
          {frontmatter.draft && (
            <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200/95">
              Draft
            </span>
          )}
        </div>
        <h1 className="mt-5 max-w-3xl text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          {frontmatter.title || "Untitled article"}
        </h1>
        {frontmatter.excerpt && (
          <p className="mt-3 max-w-2xl text-base text-[var(--text-secondary)] sm:text-lg">
            {frontmatter.excerpt}
          </p>
        )}
      </header>
      <div className="border-t border-[var(--border-subtle)] px-4 pb-10 sm:px-8">
        <div className="prose-article max-w-3xl pt-8">{body}</div>
      </div>
    </article>
  );
}
