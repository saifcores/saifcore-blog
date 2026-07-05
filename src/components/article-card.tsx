import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getArticleCover } from "@/lib/article-covers";
import type { PostMeta } from "@/lib/types";

type Props = {
  post: PostMeta;
  locale: "en" | "fr";
};

export async function ArticleCard({ post, locale }: Props) {
  const t = await getTranslations("articles");
  const href = `/articles/${post.slug}`;
  const coverSrc = getArticleCover(post.slug, post.cover);
  const tagLabel = t(`kinds.${post.kind}`);

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));

  return (
    <article className="post-card group flex h-full flex-col">
      <Link
        href={href}
        className="post-card-image-link relative block aspect-[16/10] overflow-hidden rounded-xl bg-[var(--bg-code)]"
        tabIndex={-1}
        aria-hidden
      >
        <Image
          src={coverSrc}
          alt=""
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="post-card-image object-cover"
        />
      </Link>

      <div className="mt-5 flex flex-1 flex-col">
        <Link
          href={href}
          className="inline-flex w-fit text-[11px] font-bold uppercase tracking-[0.16em] text-accent transition hover:text-[var(--accent-blue-light)]"
        >
          {tagLabel}
        </Link>

        <h2 className="post-card-title mt-3 text-xl font-bold leading-snug tracking-tight text-[var(--text-primary)] sm:text-[1.35rem]">
          <Link href={href} className="transition group-hover:text-accent">
            {post.title}
          </Link>
        </h2>

        <p className="post-card-excerpt mt-3 flex-1 text-[15px] leading-relaxed text-[var(--text-secondary)] line-clamp-3">
          {post.excerpt}
        </p>

        <footer className="post-card-meta mt-5 flex items-center justify-between gap-4 border-t border-[var(--border-subtle)] pt-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
              {t("author")}
            </p>
            <time
              dateTime={post.publishedAt}
              className="text-xs text-[var(--text-muted)]"
            >
              {formatDate(post.publishedAt)}
              <span aria-hidden> · </span>
              {post.readingTime}
            </time>
          </div>
          <Link
            href={href}
            className="shrink-0 text-sm font-semibold text-accent transition hover:text-[var(--accent-blue-light)]"
          >
            {t("readMore")}
          </Link>
        </footer>
      </div>
    </article>
  );
}
