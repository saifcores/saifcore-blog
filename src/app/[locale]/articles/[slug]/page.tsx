import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleKindBadge } from "@/components/article-kind-badge";
import { ArticleCover } from "@/components/article-cover";
import { Link } from "@/i18n/navigation";
import { getPostBySlug } from "@/lib/posts";
import { renderMdx } from "@/lib/mdx";
import { buildArticleJsonLd, buildPageMetadata } from "@/seo";
import { getPortfolioUrl } from "@/site";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const loc = locale === "fr" ? "fr" : "en";
  const post = await getPostBySlug(loc, slug);
  if (!post || post.meta.draft) return {};

  return buildPageMetadata({
    locale,
    path: `/articles/${slug}`,
    title: `${post.meta.title} | SAIFCORE Blog`,
    description: post.meta.excerpt,
    openGraphType: "article",
    publishedTime: `${post.meta.publishedAt}T12:00:00.000Z`,
    image: post.meta.coverImage,
  });
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);
  const loc = locale === "fr" ? "fr" : "en";
  const post = await getPostBySlug(loc, slug);

  if (!post || post.meta.draft) {
    notFound();
  }

  const t = await getTranslations("articles");
  const portfolioUrl = getPortfolioUrl();

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(loc === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));

  const content = await renderMdx(post.content, {
    statusLabel: t("adrStatus"),
    contextLabel: t("adrContext"),
    decisionLabel: t("adrDecision"),
    consequencesLabel: t("adrConsequences"),
  });

  const articleJsonLd = buildArticleJsonLd({
    locale: loc,
    slug: post.meta.slug,
    title: post.meta.title,
    excerpt: post.meta.excerpt,
    publishedAt: post.meta.publishedAt,
    coverImage: post.meta.coverImage,
  });

  return (
    <main
      id="main-content"
      className="flex-1 pb-16 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
      tabIndex={-1}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <article className="border-b border-[var(--border-subtle)]">
        <header className="page-container py-12 sm:py-16">
          <Link
            href="/"
            className="text-sm font-medium text-[var(--text-muted)] transition hover:text-[var(--text-primary)]"
          >
            {t("backToArticles")}
          </Link>
          <div className="mt-8 max-w-4xl">
            <ArticleCover
              slug={post.meta.slug}
              cover={post.meta.cover}
              title={post.meta.title}
              priority
            />
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <ArticleKindBadge
              kind={post.meta.kind}
              label={t(`kinds.${post.meta.kind}`)}
            />
            <time
              dateTime={post.meta.publishedAt}
              className="font-mono text-xs text-[var(--text-muted)]"
            >
              {formatDate(post.meta.publishedAt)}
            </time>
            <span className="text-xs text-[var(--text-muted)]">
              · {post.meta.readingTime}
            </span>
          </div>
          <h1 className="mt-6 max-w-3xl text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            {post.meta.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-[var(--text-secondary)]">
            {post.meta.excerpt}
          </p>
        </header>

        <div className="page-container max-w-3xl pb-16">
          <div className="prose-article">{content}</div>
        </div>
      </article>

      <section className="page-container py-12">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/30 p-8 sm:p-10">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            {t("endCtaTitle")}
          </h2>
          <p className="mt-3 max-w-xl text-[var(--text-secondary)]">
            {t("endCtaSubtitle")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`${portfolioUrl}/${loc}#contact`}
              className="btn-primary inline-flex px-4 py-2.5 text-sm"
            >
              {t("endCtaButton")}
            </a>
            <a
              href={portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline inline-flex rounded-xl px-4 py-2.5 text-sm font-semibold"
            >
              {t("endCtaPortfolio")} ↗
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
