import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { ArticleCard } from "@/components/article-card";
import { getPublishedPosts } from "@/lib/posts";
import { buildPageMetadata } from "@/seo";
import { getPortfolioUrl } from "@/site";

type Props = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });

  return buildPageMetadata({
    locale,
    path: "/",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("home");
  const loc = locale === "fr" ? "fr" : "en";
  const posts = getPublishedPosts(loc);
  const portfolioUrl = getPortfolioUrl();

  return (
    <main
      id="main-content"
      className="flex-1 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
      tabIndex={-1}
    >
      <section className="relative border-b border-[var(--border-subtle)] bg-grid">
        <div className="page-container section-y">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            SAIFCORE
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-2xl text-base text-[var(--text-secondary)] sm:text-lg">
            {t("subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline inline-flex rounded-xl px-4 py-2.5 text-sm font-semibold"
            >
              {t("portfolioCta")} ↗
            </a>
            <p className="text-sm text-[var(--text-muted)]">
              {t("portfolioHint")}
            </p>
          </div>
        </div>
      </section>

      <section className="page-container py-16 sm:py-20">
        <div className="post-card-grid grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <ArticleCard
              key={post.slug}
              post={post}
              locale={loc}
              priority={index < 3}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
