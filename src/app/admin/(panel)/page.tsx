import Link from "next/link";
import { getAllAdminPosts } from "@/lib/posts-admin";
import { ArticleKindBadge } from "@/components/article-kind-badge";

export default function AdminDashboardPage() {
  const posts = getAllAdminPosts();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Articles
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage MDX content for English and French locales.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="btn-primary inline-flex rounded-xl px-4 py-2.5 text-sm font-semibold"
        >
          New article
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/60">
            <tr>
              <th className="px-4 py-3 font-semibold text-[var(--text-muted)]">
                Title
              </th>
              <th className="hidden px-4 py-3 font-semibold text-[var(--text-muted)] md:table-cell">
                Kind
              </th>
              <th className="hidden px-4 py-3 font-semibold text-[var(--text-muted)] sm:table-cell">
                Locales
              </th>
              <th className="px-4 py-3 font-semibold text-[var(--text-muted)]">
                Date
              </th>
              <th className="px-4 py-3 font-semibold text-[var(--text-muted)]">
                Status
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr
                key={post.slug}
                className="border-b border-[var(--border-subtle)] last:border-0"
              >
                <td className="px-4 py-4">
                  <p className="font-medium text-[var(--text-primary)]">
                    {post.title}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-[var(--text-muted)]">
                    {post.slug}
                  </p>
                </td>
                <td className="hidden px-4 py-4 md:table-cell">
                  <ArticleKindBadge kind={post.kind} label={post.kind} />
                </td>
                <td className="hidden px-4 py-4 uppercase text-[var(--text-secondary)] sm:table-cell">
                  {post.locales.join(" · ")}
                </td>
                <td className="px-4 py-4 text-[var(--text-secondary)]">
                  {post.publishedAt}
                </td>
                <td className="px-4 py-4">
                  {post.isDraft ? (
                    <span className="rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-200/95">
                      Draft
                    </span>
                  ) : (
                    <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-200/95">
                      Published
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-right">
                  <Link
                    href={`/admin/posts/${post.slug}/edit`}
                    className="text-sm font-semibold text-[var(--accent-text)] transition hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && (
          <p className="px-4 py-12 text-center text-[var(--text-muted)]">
            No articles yet. Create your first one.
          </p>
        )}
      </div>
    </div>
  );
}
