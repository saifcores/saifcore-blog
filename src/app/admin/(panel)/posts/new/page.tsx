import { ArticleEditor } from "@/components/admin/article-editor";

export default function NewArticlePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        New article
      </h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Create bilingual MDX content. At least one locale is required.
      </p>
      <div className="mt-8">
        <ArticleEditor mode="create" />
      </div>
    </div>
  );
}
