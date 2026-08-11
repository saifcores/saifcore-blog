import type { ArticleKind } from "@/lib/types";

/** Pastel text for dark; darker solid for light (parent `[data-theme]`). */
const kindClass: Record<ArticleKind, string> = {
  writing:
    "border-[var(--border-subtle)] bg-[var(--bg-elevated)]/80 text-[var(--text-muted)]",
  code: "border-emerald-500/35 bg-emerald-500/10 text-emerald-300/95 [[data-theme=light]_&]:text-emerald-700",
  design:
    "border-violet-500/35 bg-violet-500/10 text-violet-200/95 [[data-theme=light]_&]:text-violet-700",
  adr: "border-amber-500/35 bg-amber-500/10 text-amber-200/95 [[data-theme=light]_&]:text-amber-800",
  document:
    "border-sky-500/35 bg-sky-500/10 text-sky-200/95 [[data-theme=light]_&]:text-sky-800",
  reflection:
    "border-rose-500/35 bg-rose-500/10 text-rose-200/95 [[data-theme=light]_&]:text-rose-700",
};

export function ArticleKindBadge({
  kind,
  label,
}: {
  kind: ArticleKind;
  label: string;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${kindClass[kind]}`}
    >
      {label}
    </span>
  );
}
