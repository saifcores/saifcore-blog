import Image from "next/image";
import { getArticleCoverVariants } from "@/lib/article-covers";

type Props = {
  slug: string;
  cover?: string;
  title: string;
  priority?: boolean;
  className?: string;
};

export function ArticleCover({
  slug,
  cover,
  title,
  priority = false,
  className = "",
}: Props) {
  const { dark, light } = getArticleCoverVariants(slug, cover);
  const sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 640px";

  return (
    <div
      className={`relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-code)] ${className}`}
    >
      <Image
        src={dark}
        alt=""
        fill
        unoptimized
        priority={priority}
        sizes={sizes}
        className={`object-cover ${light ? "cover-variant-dark" : ""}`}
      />
      {light && (
        <Image
          src={light}
          alt=""
          fill
          unoptimized
          priority={priority}
          sizes={sizes}
          className="cover-variant-light object-cover"
        />
      )}
      <span className="sr-only">{title}</span>
    </div>
  );
}
