"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArticlePreviewPanel } from "@/components/admin/article-preview-panel";
import {
  ARTICLE_KINDS,
  MDX_COMPONENTS_HELP,
  RELATED_PROJECTS,
} from "@/lib/admin-constants";
import { slugifyTitle } from "@/lib/post-validation";
import type {
  AdminPostPair,
  ArticleKind,
  LocaleCode,
  PostFrontmatter,
} from "@/lib/types";

type EditorView = "edit" | "preview";

type LocaleFormState = {
  enabled: boolean;
  frontmatter: PostFrontmatter;
  content: string;
};

type Props = {
  mode: "create" | "edit";
  initialSlug?: string;
  initialPair?: AdminPostPair;
};

const EMPTY_LOCALE = (): LocaleFormState => ({
  enabled: true,
  frontmatter: {
    title: "",
    excerpt: "",
    kind: "writing",
    publishedAt: new Date().toISOString().slice(0, 10),
    draft: false,
    tags: [],
    relatedProjects: [],
  },
  content: "",
});

const DEFAULT_BODY = `Write your article in MDX.

<Callout variant="info">
  Use components from the cheat sheet on the right.
</Callout>
`;

function localeFromPair(
  pair: AdminPostPair | undefined,
  locale: LocaleCode,
): LocaleFormState {
  const existing = pair?.locales[locale];
  if (!existing) {
    return { ...EMPTY_LOCALE(), enabled: false };
  }

  return {
    enabled: true,
    frontmatter: existing.frontmatter,
    content: existing.content,
  };
}

export function ArticleEditor({ mode, initialSlug, initialPair }: Props) {
  const router = useRouter();
  const [slug, setSlug] = useState(initialSlug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initialSlug));
  const [activeLocale, setActiveLocale] = useState<LocaleCode>("en");
  const [locales, setLocales] = useState<Record<LocaleCode, LocaleFormState>>({
    en: localeFromPair(initialPair, "en"),
    fr: localeFromPair(initialPair, "fr"),
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState<EditorView>("edit");

  const active = locales[activeLocale];

  function updateLocale(
    locale: LocaleCode,
    updater: (current: LocaleFormState) => LocaleFormState,
  ) {
    setLocales((current) => ({
      ...current,
      [locale]: updater(current[locale]),
    }));
  }

  function updateFrontmatter(
    field: keyof PostFrontmatter,
    value: string | boolean | string[],
  ) {
    updateLocale(activeLocale, (current) => ({
      ...current,
      frontmatter: { ...current.frontmatter, [field]: value },
    }));

    if (
      mode === "create" &&
      field === "title" &&
      typeof value === "string" &&
      !slugTouched
    ) {
      setSlug(slugifyTitle(value));
    }
  }

  async function handleSave() {
    setErrors([]);
    setIsSaving(true);

    const payload = {
      slug,
      locales: {
        en: locales.en,
        fr: locales.fr,
      },
    };

    try {
      const url =
        mode === "create" ? "/api/admin/posts" : `/api/admin/posts/${slug}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        errors?: { field: string; message: string }[];
        error?: string;
      };

      if (!response.ok) {
        setErrors(
          data.errors?.map((item) => `${item.field}: ${item.message}`) ?? [
            data.error ?? "Save failed.",
          ],
        );
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setErrors(["Network error while saving."]);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!initialSlug) return;
    if (!window.confirm(`Delete "${initialSlug}" in all locales?`)) return;

    setIsSaving(true);
    try {
      await fetch(`/api/admin/posts/${initialSlug}`, { method: "DELETE" });
      router.push("/admin");
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  const projectsValue = useMemo(
    () => active.frontmatter.relatedProjects?.join(", ") ?? "",
    [active.frontmatter.relatedProjects],
  );

  const previewSlug = slug || initialSlug || "preview-draft";
  const previewContent =
    active.content || (mode === "create" ? DEFAULT_BODY : "");

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-6">
        {mode === "create" && (
          <label className="block">
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              Slug
            </span>
            <input
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              className="mt-1.5 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] px-3 py-2.5 font-mono text-sm"
              placeholder="my-article-slug"
            />
          </label>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {(["en", "fr"] as const).map((locale) => (
            <button
              key={locale}
              type="button"
              onClick={() => setActiveLocale(locale)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold uppercase transition ${
                activeLocale === locale
                  ? "bg-[var(--accent-blue)] text-white"
                  : "border border-[var(--border-subtle)] text-[var(--text-secondary)]"
              }`}
            >
              {locale}
              {!locales[locale].enabled && (
                <span className="ml-1 opacity-60">off</span>
              )}
            </button>
          ))}

          <div className="ml-auto flex rounded-lg border border-[var(--border-subtle)] p-0.5">
            {(["edit", "preview"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                disabled={mode === "preview" && !active.enabled}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold capitalize transition disabled:opacity-40 ${
                  view === mode
                    ? "bg-[var(--accent-blue)] text-white"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {!active.enabled && view === "preview" && (
          <p className="text-sm text-[var(--text-muted)]">
            Enable {activeLocale.toUpperCase()} to preview this locale.
          </p>
        )}

        {view === "preview" && active.enabled && (
          <ArticlePreviewPanel
            slug={previewSlug}
            locale={activeLocale}
            frontmatter={active.frontmatter}
            content={previewContent}
          />
        )}

        {view === "edit" && active.enabled && (
          <div className="space-y-4 rounded-2xl border border-[var(--border-subtle)] p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  Title
                </span>
                <input
                  value={active.frontmatter.title}
                  onChange={(event) =>
                    updateFrontmatter("title", event.target.value)
                  }
                  className="mt-1.5 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] px-3 py-2.5 text-sm"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  Excerpt
                </span>
                <textarea
                  value={active.frontmatter.excerpt}
                  onChange={(event) =>
                    updateFrontmatter("excerpt", event.target.value)
                  }
                  rows={2}
                  className="mt-1.5 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] px-3 py-2.5 text-sm"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  Kind
                </span>
                <select
                  value={active.frontmatter.kind}
                  onChange={(event) =>
                    updateFrontmatter("kind", event.target.value as ArticleKind)
                  }
                  className="mt-1.5 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] px-3 py-2.5 text-sm"
                >
                  {ARTICLE_KINDS.map((kind) => (
                    <option key={kind} value={kind}>
                      {kind}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  Published date
                </span>
                <input
                  type="date"
                  value={active.frontmatter.publishedAt}
                  onChange={(event) =>
                    updateFrontmatter("publishedAt", event.target.value)
                  }
                  className="mt-1.5 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] px-3 py-2.5 text-sm"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  Tags (comma-separated)
                </span>
                <input
                  value={tagsValue}
                  onChange={(event) =>
                    updateFrontmatter(
                      "tags",
                      event.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    )
                  }
                  className="mt-1.5 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] px-3 py-2.5 text-sm"
                  placeholder="payments, fintech, africa"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  Related projects
                </span>
                <input
                  value={projectsValue}
                  onChange={(event) =>
                    updateFrontmatter(
                      "relatedProjects",
                      event.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    )
                  }
                  list="related-projects"
                  className="mt-1.5 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] px-3 py-2.5 text-sm"
                  placeholder="pan-african-payment-sdk"
                />
                <datalist id="related-projects">
                  {RELATED_PROJECTS.map((project) => (
                    <option key={project} value={project} />
                  ))}
                </datalist>
              </label>

              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  Cover path (optional)
                </span>
                <input
                  value={active.frontmatter.cover ?? ""}
                  onChange={(event) =>
                    updateFrontmatter("cover", event.target.value)
                  }
                  className="mt-1.5 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)] px-3 py-2.5 font-mono text-sm"
                  placeholder="/images/articles/custom.svg"
                />
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Leave empty to use /images/articles/{"{slug}"}.svg
                </p>
              </label>

              <label className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={active.frontmatter.draft ?? false}
                  onChange={(event) =>
                    updateFrontmatter("draft", event.target.checked)
                  }
                />
                <span className="text-sm text-[var(--text-secondary)]">
                  Save as draft (hidden from site, RSS, and sitemap)
                </span>
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                MDX body ({activeLocale.toUpperCase()})
              </span>
              <textarea
                value={
                  active.content || (mode === "create" ? DEFAULT_BODY : "")
                }
                onChange={(event) =>
                  updateLocale(activeLocale, (current) => ({
                    ...current,
                    content: event.target.value,
                  }))
                }
                rows={22}
                className="mt-1.5 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-code)] px-3 py-3 font-mono text-sm leading-relaxed text-[var(--text-primary)]"
                spellCheck={false}
              />
            </label>
          </div>
        )}

        {view === "edit" && (
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <input
              type="checkbox"
              checked={active.enabled}
              onChange={(event) =>
                updateLocale(activeLocale, (current) => ({
                  ...current,
                  enabled: event.target.checked,
                }))
              }
            />
            Enable {activeLocale.toUpperCase()}
          </label>
        )}

        {view === "edit" && !active.enabled && (
          <p className="text-sm text-[var(--text-muted)]">
            Enable {activeLocale.toUpperCase()} to edit content for this locale.
          </p>
        )}

        {errors.length > 0 && (
          <div className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <ul className="list-disc space-y-1 pl-4">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {view === "edit" && (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              {isSaving ? "Saving…" : "Save article"}
            </button>
            {mode === "edit" && initialSlug && !locales.en.frontmatter.draft && (
              <a
                href={`/articles/${initialSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-[var(--border-subtle)] px-5 py-2.5 text-sm font-semibold text-[var(--text-secondary)]"
              >
                View live ↗
              </a>
            )}
            {mode === "edit" && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                className="ml-auto rounded-xl border border-red-500/35 px-5 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      <aside className="hidden xl:block">
        <div className="sticky top-8 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            MDX cheat sheet
          </h2>
          <pre className="mt-3 max-h-[70vh] overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-[var(--text-muted)]">
            {MDX_COMPONENTS_HELP}
          </pre>
        </div>
      </aside>
    </div>
  );
}
