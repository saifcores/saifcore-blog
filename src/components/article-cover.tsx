import Image from "next/image";
import { getArticleCover } from "@/lib/article-covers";

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
  const src = getArticleCover(slug, cover);

  return (
    <div
      className={`relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-code)] ${className}`}
    >
      <Image
        src={src}
        alt=""
        fill
        unoptimized
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 640px"
        className="object-cover"
      />
      <span className="sr-only">{title}</span>
    </div>
  );
}
