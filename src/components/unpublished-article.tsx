import { getTranslations } from "next-intl/server";
import { ArticleCard } from "@/components/article-card";
import { ArticleCover } from "@/components/article-cover";
import { ArticleKindBadge } from "@/components/article-kind-badge";
import { Link } from "@/i18n/navigation";
import { getPublishedPosts } from "@/lib/posts";
import type { PostMeta } from "@/lib/types";

type Props = {
  post: PostMeta;
  locale: "en" | "fr";
};

export async function UnpublishedArticle({ post, locale }: Props) {
  const t = await getTranslations("unpublished");
  const tArticles = await getTranslations("articles");
  const published = (await getPublishedPosts(locale)).slice(0, 3);

  return (
    <main
      id="main-content"
      className="flex-1 pb-16 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
      tabIndex={-1}
    >
      <article className="border-b border-[var(--border-subtle)]">
        <header className="page-container py-12 sm:py-16">
          <Link
            href="/"
            className="text-sm font-medium text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
          >
            {tArticles("backToArticles")}
          </Link>
          <div className="mt-8 max-w-3xl">
            <ArticleCover
              slug={post.slug}
              cover={post.cover}
              title={post.title}
              priority
            />
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full border border-amber-500/35 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-200/95 [[data-theme=light]_&]:text-amber-800">
              {t("badge")}
            </span>
            <ArticleKindBadge
              kind={post.kind}
              label={tArticles(`kinds.${post.kind}`)}
            />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            {t("kicker")}
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-[var(--text-secondary)]">
            {post.excerpt}
          </p>
          <p className="mt-6 max-w-3xl text-[var(--text-muted)]">{t("body")}</p>
        </header>
      </article>

      {published.length > 0 && (
        <section className="page-container py-12 sm:py-16">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            {t("readPublished")}
          </h2>
          <div className="post-card-grid mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {published.map((item, index) => (
              <ArticleCard
                key={item.slug}
                post={item}
                locale={locale}
                priority={index === 0}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
