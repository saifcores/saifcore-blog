import { notFound } from "next/navigation";
import { ArticleEditor } from "@/components/admin/article-editor";
import { getAdminPostPair } from "@/lib/posts-admin";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EditArticlePage({ params }: Props) {
  const { slug } = await params;
  const pair = getAdminPostPair(slug);

  if (!pair.locales.en && !pair.locales.fr) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        Edit article
      </h1>
      <p className="mt-1 font-mono text-sm text-[var(--text-muted)]">{slug}</p>
      <div className="mt-8">
        <ArticleEditor mode="edit" initialSlug={slug} initialPair={pair} />
      </div>
    </div>
  );
}
