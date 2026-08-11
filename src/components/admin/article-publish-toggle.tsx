"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  slug: string;
  isDraft: boolean;
};

export function ArticlePublishToggle({ slug, isDraft }: Props) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleToggle() {
    const nextDraft = !isDraft;
    const label = nextDraft ? "unpublish" : "publish";
    const title = `${label[0].toUpperCase()}${label.slice(1)} "${slug}"?`;
    if (!window.confirm(title)) {
      return;
    }

    setIsPending(true);
    try {
      const response = await fetch(`/api/admin/posts/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: nextDraft }),
      });

      if (!response.ok) {
        const data = (await response.json()) as {
          error?: string;
          errors?: { message: string }[];
        };
        window.alert(
          data.errors?.[0]?.message ?? data.error ?? `Failed to ${label}.`,
        );
        return;
      }

      router.refresh();
    } catch {
      window.alert(`Network error while trying to ${label}.`);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className="text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] hover:underline disabled:opacity-50"
    >
      {isPending ? "…" : isDraft ? "Publish" : "Unpublish"}
    </button>
  );
}
